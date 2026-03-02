import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } =
      await anonClient.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;
    const adminIds = (Deno.env.get("ADMIN_USER_IDS") || "")
      .split(",")
      .map((id: string) => id.trim())
      .filter((id: string) => id.length > 0);

    if (!adminIds.includes(userId)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const [
      profilesRes,
      sessionsRes,
      activeRes,
      signupsRes,
      dailySessionsRes,
    ] = await Promise.all([
      supabase.from("profiles").select("id, full_name, is_therapist, linked_therapist_id, subscription_status, subscription_plan, trial_start_date, trial_end_date, created_at, stripe_customer_id"),
      supabase.from("sessions").select("id, duration_seconds, avg_wpm, exercise_type, recording_url, created_at"),
      supabase.from("profiles").select("id").gte("last_activity_date", new Date(Date.now() - 7 * 86400000).toISOString()),
      supabase.from("profiles").select("id, created_at").order("created_at", { ascending: true }),
      supabase.from("sessions").select("id, created_at").gte("created_at", new Date(Date.now() - 14 * 86400000).toISOString()),
    ]);

    const profiles = profilesRes.data || [];
    const sessions = sessionsRes.data || [];
    const activeUsers = activeRes.data || [];
    const allSignups = signupsRes.data || [];
    const recentSessions = dailySessionsRes.data || [];

    // KPIs
    const totalUsers = profiles.length;
    const therapists = profiles.filter((p) => p.is_therapist).length;
    const patients = profiles.filter((p) => !p.is_therapist).length;
    const linkedPatients = profiles.filter((p) => p.linked_therapist_id).length;
    const activeCount = activeUsers.length;
    const totalSessions = sessions.length;

    // Session metrics
    const avgDuration = totalSessions > 0
      ? Math.round(sessions.reduce((s, x) => s + x.duration_seconds, 0) / totalSessions)
      : 0;
    const avgWpm = totalSessions > 0
      ? Math.round(sessions.reduce((s, x) => s + x.avg_wpm, 0) / totalSessions)
      : 0;
    const withRecording = sessions.filter((s) => s.recording_url).length;
    const recordingRate = totalSessions > 0 ? Math.round((withRecording / totalSessions) * 100) : 0;

    // Signups per week (last 12 weeks)
    const weeklySignups: { week: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const start = new Date(Date.now() - (i + 1) * 7 * 86400000);
      const end = new Date(Date.now() - i * 7 * 86400000);
      const count = allSignups.filter((p) => {
        const d = new Date(p.created_at);
        return d >= start && d < end;
      }).length;
      const label = `${start.getDate()}/${start.getMonth() + 1}`;
      weeklySignups.push({ week: label, count });
    }

    // Sessions per day (last 14 days)
    const dailySessions: { day: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - i);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      const count = recentSessions.filter((s) => {
        const d = new Date(s.created_at);
        return d >= start && d < end;
      }).length;
      const label = `${start.getDate()}/${start.getMonth() + 1}`;
      dailySessions.push({ day: label, count });
    }

    // Exercise breakdown
    const exerciseMap: Record<string, number> = {};
    for (const s of sessions) {
      const type = s.exercise_type || "reading";
      exerciseMap[type] = (exerciseMap[type] || 0) + 1;
    }
    const exerciseBreakdown = Object.entries(exerciseMap).map(([name, value]) => ({
      name,
      value,
    }));

    // Subscription breakdown
    const subMap: Record<string, number> = {};
    for (const p of profiles) {
      const status = p.subscription_status || "none";
      subMap[status] = (subMap[status] || 0) + 1;
    }
    const subscriptionBreakdown = Object.entries(subMap).map(([status, count]) => ({
      status,
      count,
    }));

    // New signups this week
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    const dayOfWeek = weekStart.getDay(); // 0=Sun, 1=Mon, ...
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    weekStart.setDate(weekStart.getDate() - diffToMonday); // Monday
    const newThisWeek = profiles.filter((p) => new Date(p.created_at) >= weekStart);
    const newTherapistsThisWeek = newThisWeek.filter((p) => p.is_therapist).length;
    const newPatientsThisWeek = newThisWeek.filter((p) => !p.is_therapist).length;

    // === Detailed subscription lists ===
    const now = new Date();
    const in7days = new Date(Date.now() + 7 * 86400000);

    // Active paying users
    const payingUsers = profiles
      .filter((p) => p.subscription_status === "active")
      .map((p) => ({
        id: p.id,
        name: p.full_name || "Sans nom",
        plan: p.subscription_plan || "—",
        isTherapist: p.is_therapist,
      }));

    // Canceled users
    const canceledUsers = profiles
      .filter((p) => p.subscription_status === "canceled")
      .map((p) => ({
        id: p.id,
        name: p.full_name || "Sans nom",
        plan: p.subscription_plan || "—",
        isTherapist: p.is_therapist,
      }));

    // Trial expiring soon (within 7 days)
    const expiringTrials = profiles
      .filter((p) => {
        if (p.subscription_plan !== "trial" && p.subscription_status !== "trial") return false;
        const endDate = p.trial_end_date
          ? new Date(p.trial_end_date)
          : p.trial_start_date
            ? new Date(new Date(p.trial_start_date).getTime() + 30 * 86400000)
            : null;
        if (!endDate) return false;
        return endDate > now && endDate <= in7days;
      })
      .map((p) => {
        const endDate = p.trial_end_date
          ? new Date(p.trial_end_date)
          : new Date(new Date(p.trial_start_date!).getTime() + 30 * 86400000);
        const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / 86400000);
        return {
          id: p.id,
          name: p.full_name || "Sans nom",
          isTherapist: p.is_therapist,
          daysLeft,
          endDate: endDate.toISOString(),
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);

    // All trial users (for count)
    const totalTrials = profiles.filter((p) =>
      p.subscription_plan === "trial" || p.subscription_status === "trial"
    ).length;

    // === Deepgram cost estimation ===
    // Nova-2 streaming: $0.0043 per minute
    const DEEPGRAM_COST_PER_MIN = 0.0043;

    const totalMinutesAll = sessions.reduce((s, x) => s + x.duration_seconds, 0) / 60;
    const deepgramCostTotal = totalMinutesAll * DEEPGRAM_COST_PER_MIN;

    // Cost by exercise type
    const costByExercise: Record<string, { minutes: number; cost: number; sessions: number }> = {};
    for (const s of sessions) {
      const type = s.exercise_type || "reading";
      if (!costByExercise[type]) costByExercise[type] = { minutes: 0, cost: 0, sessions: 0 };
      const mins = s.duration_seconds / 60;
      costByExercise[type].minutes += mins;
      costByExercise[type].cost += mins * DEEPGRAM_COST_PER_MIN;
      costByExercise[type].sessions += 1;
    }
    const deepgramByExercise = Object.entries(costByExercise).map(([type, d]) => ({
      type,
      minutes: Math.round(d.minutes),
      cost: Number(d.cost.toFixed(2)),
      sessions: d.sessions,
    })).sort((a, b) => b.cost - a.cost);

    // Cost this week
    const sessionsThisWeek = sessions.filter((s) => new Date(s.created_at) >= weekStart);
    const minutesThisWeek = sessionsThisWeek.reduce((s, x) => s + x.duration_seconds, 0) / 60;
    const deepgramCostThisWeek = minutesThisWeek * DEEPGRAM_COST_PER_MIN;

    // Cost this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const sessionsThisMonth = sessions.filter((s) => new Date(s.created_at) >= monthStart);
    const minutesThisMonth = sessionsThisMonth.reduce((s, x) => s + x.duration_seconds, 0) / 60;
    const deepgramCostThisMonth = minutesThisMonth * DEEPGRAM_COST_PER_MIN;

    // Avg cost per session
    const deepgramAvgPerSession = totalSessions > 0 ? deepgramCostTotal / totalSessions : 0;

    const deepgramStats = {
      totalMinutes: Math.round(totalMinutesAll),
      costTotal: Number(deepgramCostTotal.toFixed(2)),
      costThisWeek: Number(deepgramCostThisWeek.toFixed(2)),
      costThisMonth: Number(deepgramCostThisMonth.toFixed(2)),
      avgPerSession: Number(deepgramAvgPerSession.toFixed(4)),
      byExercise: deepgramByExercise,
      ratePerMin: DEEPGRAM_COST_PER_MIN,
    };

    // === Therapist-Patient relationships ===
    const therapistProfiles = profiles.filter((p) => p.is_therapist);
    const therapistPatientMap = therapistProfiles.map((t) => {
      const linkedPatientsList = profiles.filter((p) => p.linked_therapist_id === t.id);
      return {
        id: t.id,
        name: t.full_name || "Sans nom",
        patientCount: linkedPatientsList.length,
        patients: linkedPatientsList.map((p) => ({
          id: p.id,
          name: p.full_name || "Sans nom",
        })),
        subscriptionStatus: t.subscription_status || "none",
        plan: t.subscription_plan || "trial",
      };
    }).sort((a, b) => b.patientCount - a.patientCount);

    const data = {
      totalUsers,
      therapists,
      patients,
      linkedPatients,
      activeCount,
      totalSessions,
      avgDuration,
      avgWpm,
      recordingRate,
      weeklySignups,
      dailySessions,
      exerciseBreakdown,
      subscriptionBreakdown,
      payingUsers,
      canceledUsers,
      expiringTrials,
      totalTrials,
      newTherapistsThisWeek,
      newPatientsThisWeek,
      deepgramStats,
      therapistPatientMap,
    };

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
