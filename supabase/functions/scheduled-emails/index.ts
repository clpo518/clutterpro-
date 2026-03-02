import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to send emails via the send-email edge function
async function sendEmail(
  type: string,
  to: string,
  data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        },
        body: JSON.stringify({ type, to, data }),
      }
    );
    const result = await response.json();
    if (!response.ok) {
      console.error(`Failed to send ${type} email to ${to}:`, result);
      return { success: false, error: result.error };
    }
    console.log(`Successfully sent ${type} email to ${to}`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error sending ${type} email:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const results = {
      inactivityReminders: { sent: 0, skipped: 0, errors: 0 },
      weeklyReports: { sent: 0, errors: 0 },
      trialExpiring: { sent: 0, errors: 0 },
      b2cTrialExpiring: { sent: 0, errors: 0 },
      adminDigest: { sent: 0, errors: 0 },
      therapistExpiringPatient: { sent: 0, errors: 0 },
      therapistNoPatient: { sent: 0, errors: 0 },
    };

    // Get current day of week (0 = Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const isSunday = dayOfWeek === 0;

    console.log(`Running scheduled emails - Day: ${dayOfWeek}, isSunday: ${isSunday}`);

    // ============================================
    // 1. INACTIVITY REMINDERS (with 7-day cooldown)
    // Find patients who:
    // - Haven't practiced in 3+ days
    // - AND haven't received an engagement email in the last 7 days
    // ============================================
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const threeDaysAgoStr = threeDaysAgo.toISOString().split("T")[0];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString();

    // Get patients with cooldown check
    const { data: inactivePatients, error: inactiveError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, current_streak, last_activity_date, last_engagement_email_at")
      .eq("is_therapist", false)
      .not("last_activity_date", "is", null)
      .lt("last_activity_date", threeDaysAgoStr)
      .or(`last_engagement_email_at.is.null,last_engagement_email_at.lt.${sevenDaysAgoStr}`);

    if (inactiveError) {
      console.error("Error fetching inactive patients:", inactiveError);
    } else if (inactivePatients && inactivePatients.length > 0) {
      console.log(`Found ${inactivePatients.length} inactive patients eligible for reminder (after cooldown check)`);

      for (const patient of inactivePatients) {
        // Get user email from auth
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(patient.id);
        
        if (authUser?.user?.email) {
          const lastActivityDate = new Date(patient.last_activity_date!);
          const daysSinceLastSession = Math.floor(
            (now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          const emailResult = await sendEmail("inactivity_reminder", authUser.user.email, {
            userName: patient.full_name || authUser.user.email.split("@")[0],
            daysSinceLastSession,
            currentStreak: patient.current_streak || 0,
            practiceUrl: "https://www.parlermoinsvite.fr/practice",
          });

          if (emailResult.success) {
            results.inactivityReminders.sent++;
            
            // Update last_engagement_email_at to implement cooldown
            await supabaseAdmin
              .from("profiles")
              .update({ last_engagement_email_at: new Date().toISOString() })
              .eq("id", patient.id);
              
            console.log(`Updated cooldown timestamp for patient ${patient.id}`);
          } else {
            results.inactivityReminders.errors++;
          }
        }
      }
    } else {
      console.log("No inactive patients found (or all in cooldown period)");
    }

    // ============================================
    // 2. WEEKLY REPORTS (Sunday only)
    // Skip users who:
    // - Are archived by their therapist (is_archived = true)
    // - Have no activity in the past 7 days (already covered by session query)
    // ============================================
    if (isSunday) {
      // Get week boundaries
      const weekEnd = new Date();
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);

      // Get active patients (had at least one session this week)
      const { data: activeSessions, error: sessionsError } = await supabaseAdmin
        .from("sessions")
        .select("user_id, avg_wpm, duration_seconds, created_at")
        .gte("created_at", weekStart.toISOString())
        .lte("created_at", weekEnd.toISOString());

      if (sessionsError) {
        console.error("Error fetching weekly sessions:", sessionsError);
      } else if (activeSessions && activeSessions.length > 0) {
        // Group sessions by user
        const userSessions = new Map<string, typeof activeSessions>();
        for (const session of activeSessions) {
          const existing = userSessions.get(session.user_id) || [];
          existing.push(session);
          userSessions.set(session.user_id, existing);
        }

        console.log(`Found ${userSessions.size} active users this week`);

        for (const [userId, sessions] of userSessions) {
          // Get user profile and email
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("full_name, current_streak, target_wpm, is_archived, last_activity_date")
            .eq("id", userId)
            .single();

          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);

          // Skip archived users or users inactive for 7+ days
          if (authUser?.user?.email && profile && !profile.is_archived) {
            // Extra check: skip if last_activity_date is more than 7 days ago
            if (profile.last_activity_date) {
              const lastActivity = new Date(profile.last_activity_date);
              const daysSinceActivity = Math.floor(
                (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
              );
              if (daysSinceActivity >= 7) {
                console.log(`Skipping weekly report for ${userId}: inactive for ${daysSinceActivity} days`);
                continue;
              }
            }

            const totalSessions = sessions.length;
            const totalMinutes = Math.round(
              sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / 60
            );
            const averageWpmRaw = 
              sessions.reduce((acc, s) => acc + (s.avg_wpm || 0), 0) / sessions.length;
            
            // Convert WPM to SPS: SPS = (WPM * 1.8) / 60
            const averageSps = parseFloat(((averageWpmRaw * 1.8) / 60).toFixed(1));
            const targetWpmRaw = profile.target_wpm || 150;
            const targetSps = parseFloat(((targetWpmRaw * 1.8) / 60).toFixed(1));

            // Calculate improvement (compare to previous week would require more queries)
            // For now, just show if under target
            const improvement = 0;

            const emailResult = await sendEmail("weekly_report", authUser.user.email, {
              userName: profile.full_name || authUser.user.email.split("@")[0],
              weekStartDate: weekStart.toLocaleDateString("fr-FR"),
              weekEndDate: weekEnd.toLocaleDateString("fr-FR"),
              totalSessions,
              totalMinutes,
              averageSps,
              targetSps,
              currentStreak: profile.current_streak || 0,
              improvement,
              practiceUrl: "https://www.parlermoinsvite.fr/practice",
            });

            if (emailResult.success) {
              results.weeklyReports.sent++;
            } else {
              results.weeklyReports.errors++;
            }
          }
        }
      }


      // ============================================
      // 2b. ADMIN WEEKLY DIGEST (Sunday only)
      // Send a summary email to admin(s)
      // ============================================
      const adminIds = (Deno.env.get("ADMIN_USER_IDS") || "")
        .split(",")
        .map((id: string) => id.trim())
        .filter((id: string) => id.length > 0);

      if (adminIds.length > 0) {
        console.log(`Sending admin digest to ${adminIds.length} admin(s)`);

        // Gather stats
        const { data: allProfiles } = await supabaseAdmin
          .from("profiles")
          .select("id, full_name, is_therapist, subscription_status, subscription_plan, trial_start_date, trial_end_date, created_at, linked_therapist_id");

        const { data: allSessions } = await supabaseAdmin
          .from("sessions")
          .select("id, duration_seconds, created_at");

        const { data: activeProfiles } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .gte("last_activity_date", weekStart.toISOString());

        const profiles = allProfiles || [];
        const sessionsAll = allSessions || [];

        const totalUsers = profiles.length;
        const newThisWeekProfiles = profiles.filter((p) => new Date(p.created_at) >= weekStart);
        const newTherapists = newThisWeekProfiles.filter((p) => p.is_therapist).length;
        const newPatients = newThisWeekProfiles.filter((p) => !p.is_therapist).length;
        const activeUsers = (activeProfiles || []).length;
        const totalSessions = sessionsAll.length;
        const sessionsThisWeekCount = sessionsAll.filter((s) => new Date(s.created_at) >= weekStart).length;

        const payingCount = profiles.filter((p) => p.subscription_status === "active").length;
        const canceledCount = profiles.filter((p) => p.subscription_status === "canceled").length;
        const totalTrials = profiles.filter((p) =>
          p.subscription_plan === "trial" || p.subscription_status === "trial"
        ).length;

        const in7days = new Date(Date.now() + 7 * 86400000);
        const trialsExpiringSoon = profiles.filter((p) => {
          if (p.subscription_plan !== "trial" && p.subscription_status !== "trial") return false;
          const endDate = p.trial_end_date
            ? new Date(p.trial_end_date)
            : p.trial_start_date
              ? new Date(new Date(p.trial_start_date).getTime() + 30 * 86400000)
              : null;
          if (!endDate) return false;
          return endDate > now && endDate <= in7days;
        }).length;

        // Deepgram costs
        const DEEPGRAM_COST_PER_MIN = 0.0043;
        const totalMinutes = sessionsAll.reduce((s, x) => s + (x.duration_seconds || 0), 0) / 60;
        const deepgramCostTotal = Number((totalMinutes * DEEPGRAM_COST_PER_MIN).toFixed(2));
        const weekMinutes = sessionsAll
          .filter((s) => new Date(s.created_at) >= weekStart)
          .reduce((s, x) => s + (x.duration_seconds || 0), 0) / 60;
        const deepgramCostWeek = Number((weekMinutes * DEEPGRAM_COST_PER_MIN).toFixed(2));
        const monthStartDate = new Date();
        monthStartDate.setDate(1);
        monthStartDate.setHours(0, 0, 0, 0);
        const monthMinutes = sessionsAll
          .filter((s) => new Date(s.created_at) >= monthStartDate)
          .reduce((s, x) => s + (x.duration_seconds || 0), 0) / 60;
        const deepgramCostMonth = Number((monthMinutes * DEEPGRAM_COST_PER_MIN).toFixed(2));

        for (const adminId of adminIds) {
          const { data: adminUser } = await supabaseAdmin.auth.admin.getUserById(adminId);
          if (adminUser?.user?.email) {
            const emailResult = await sendEmail("admin_weekly_digest", adminUser.user.email, {
              weekStartDate: weekStart.toLocaleDateString("fr-FR"),
              weekEndDate: weekEnd.toLocaleDateString("fr-FR"),
              totalUsers,
              newTherapists,
              newPatients,
              activeUsers,
              totalSessions,
              sessionsThisWeek: sessionsThisWeekCount,
              payingCount,
              canceledCount,
              trialsExpiringSoon,
              totalTrials,
              deepgramCostWeek,
              deepgramCostMonth,
              deepgramCostTotal,
              dashboardUrl: "https://www.parlermoinsvite.fr/admin",
            });

            if (emailResult.success) {
              results.adminDigest.sent++;
            } else {
              results.adminDigest.errors++;
            }
          }
        }
      }
    }

    // ============================================
    // 3. TRIAL EXPIRING REMINDERS (daily)
    // Find therapists whose trial expires in 3 days
    // ============================================
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // Trial lasts 30 days from trial_start_date
    const { data: expiringTrials, error: trialsError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, trial_start_date, referral_code")
      .eq("is_therapist", true)
      .eq("subscription_plan", "trial")
      .not("trial_start_date", "is", null);

    if (trialsError) {
      console.error("Error fetching expiring trials:", trialsError);
    } else if (expiringTrials && expiringTrials.length > 0) {
      for (const therapist of expiringTrials) {
        const trialStart = new Date(therapist.trial_start_date!);
        const trialEnd = new Date(trialStart);
        trialEnd.setDate(trialEnd.getDate() + 30);
        
        const daysRemaining = Math.ceil(
          (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Only send if 3 days remaining (±1 day buffer for cron timing)
        if (daysRemaining >= 2 && daysRemaining <= 4) {
          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(therapist.id);
          
          if (authUser?.user?.email) {
            // Count patients
            const { count: patientsCount } = await supabaseAdmin
              .from("profiles")
              .select("id", { count: "exact", head: true })
              .eq("linked_therapist_id", therapist.id)
              .eq("is_archived", false);

            const emailResult = await sendEmail("trial_expiring", authUser.user.email, {
              therapistName: therapist.full_name || authUser.user.email.split("@")[0],
              daysRemaining,
              patientsCount: patientsCount || 0,
              subscribeUrl: "https://www.parlermoinsvite.fr/pro/subscription",
              referralCode: therapist.referral_code || null,
            });

            if (emailResult.success) {
              results.trialExpiring.sent++;
            } else {
              results.trialExpiring.errors++;
            }
          }
        }
      }
    }

    // ============================================
    // 4. B2C PATIENT TRIAL EXPIRING (7-day trial)
    // Find solo patients whose trial_end_date is 2 days from now (±1 day buffer)
    // ============================================
    const { data: expiringB2CTrials, error: b2cTrialsError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, trial_end_date")
      .eq("is_therapist", false)
      .is("linked_therapist_id", null)
      .eq("is_premium", false)
      .not("trial_end_date", "is", null);

    if (b2cTrialsError) {
      console.error("Error fetching B2C expiring trials:", b2cTrialsError);
    } else if (expiringB2CTrials && expiringB2CTrials.length > 0) {
      for (const patient of expiringB2CTrials) {
        const trialEnd = new Date(patient.trial_end_date!);
        const daysRemaining = Math.ceil(
          (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Send at 2 days remaining (±1 day buffer for cron timing)
        if (daysRemaining >= 1 && daysRemaining <= 3) {
          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(patient.id);

          if (authUser?.user?.email) {
            const emailResult = await sendEmail("b2c_trial_expiring", authUser.user.email, {
              patientName: patient.full_name || authUser.user.email.split("@")[0],
              daysRemaining,
              subscribeUrl: "https://www.parlermoinsvite.fr/dashboard",
            });

            if (emailResult.success) {
              results.b2cTrialExpiring.sent++;
            } else {
              results.b2cTrialExpiring.errors++;
            }
          }
        }
      }
    }

    // ============================================
    // 5. THERAPIST EXPIRING → NOTIFY PATIENTS (daily)
    // Find therapists whose trial/subscription expires in ≤3 days
    // and email their linked patients to encourage renewal
    // ============================================
    const { data: expiringTherapists, error: expiringTherapistsError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, trial_end_date, subscription_status, subscription_plan")
      .eq("is_therapist", true)
      .not("trial_end_date", "is", null);

    if (expiringTherapistsError) {
      console.error("Error fetching expiring therapists for patient notification:", expiringTherapistsError);
    } else if (expiringTherapists && expiringTherapists.length > 0) {
      for (const therapist of expiringTherapists) {
        // Skip therapists with active paid subscriptions
        if (therapist.subscription_status === "active" && therapist.subscription_plan !== "trial") {
          continue;
        }

        const trialEnd = new Date(therapist.trial_end_date!);
        const daysRemaining = Math.ceil(
          (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Send when 2-3 days remaining
        if (daysRemaining >= 2 && daysRemaining <= 3) {
          // Find all active patients linked to this therapist
          const { data: linkedPatients } = await supabaseAdmin
            .from("profiles")
            .select("id, full_name")
            .eq("linked_therapist_id", therapist.id)
            .eq("is_archived", false);

          if (linkedPatients && linkedPatients.length > 0) {
            console.log(`Notifying ${linkedPatients.length} patients of therapist ${therapist.id} expiring in ${daysRemaining} days`);

            for (const patient of linkedPatients) {
              const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(patient.id);

              if (authUser?.user?.email) {
                const emailResult = await sendEmail("therapist_expiring_patient", authUser.user.email, {
                  patientName: patient.full_name || authUser.user.email.split("@")[0],
                  therapistName: therapist.full_name || "votre orthophoniste",
                  daysRemaining,
                });

                if (emailResult.success) {
                  results.therapistExpiringPatient.sent++;
                } else {
                  results.therapistExpiringPatient.errors++;
                }
              }
            }
          }
        }
      }
    }

    // ============================================
    // 6. THERAPIST NO-PATIENT REMINDER (daily)
    // Find therapists who signed up 7+ days ago, still have 0 patients,
    // and haven't received this email yet (cooldown via last_engagement_email_at)
    // ============================================
    const sevenDaysAgoDate = new Date();
    sevenDaysAgoDate.setDate(sevenDaysAgoDate.getDate() - 7);
    const sevenDaysAgoDateStr = sevenDaysAgoDate.toISOString();

    const { data: noPatientTherapists, error: noPatientError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, therapist_code, created_at, last_engagement_email_at")
      .eq("is_therapist", true)
      .lt("created_at", sevenDaysAgoDateStr);

    if (noPatientError) {
      console.error("Error fetching no-patient therapists:", noPatientError);
    } else if (noPatientTherapists && noPatientTherapists.length > 0) {
      for (const therapist of noPatientTherapists) {
        // Skip if already received an engagement email in the last 30 days
        if (therapist.last_engagement_email_at) {
          const lastEmail = new Date(therapist.last_engagement_email_at);
          const daysSinceEmail = Math.floor(
            (now.getTime() - lastEmail.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysSinceEmail < 30) {
            continue;
          }
        }

        // Check if therapist has 0 active patients
        const { count: patientsCount } = await supabaseAdmin
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("linked_therapist_id", therapist.id)
          .eq("is_archived", false);

        if ((patientsCount ?? 0) > 0) {
          continue;
        }

        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(therapist.id);

        if (authUser?.user?.email) {
          const emailResult = await sendEmail("therapist_no_patient", authUser.user.email, {
            therapistName: therapist.full_name || authUser.user.email.split("@")[0],
            therapistCode: therapist.therapist_code || null,
            dashboardUrl: "https://www.parlermoinsvite.fr/dashboard/therapist",
            sessionLiveUrl: "https://www.parlermoinsvite.fr/session-live",
          });

          if (emailResult.success) {
            results.therapistNoPatient.sent++;
            // Set cooldown
            await supabaseAdmin
              .from("profiles")
              .update({ last_engagement_email_at: new Date().toISOString() })
              .eq("id", therapist.id);
          } else {
            results.therapistNoPatient.errors++;
          }
        }
      }
      console.log(`Therapist no-patient reminders: ${results.therapistNoPatient.sent} sent, ${results.therapistNoPatient.errors} errors`);
    }

    console.log("Scheduled emails completed:", results);

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Scheduled emails error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
