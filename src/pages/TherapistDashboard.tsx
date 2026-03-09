import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Settings, LogOut, Users, UserPlus, Copy, Check, AlertCircle, Eye, Mail, ExternalLink, Flame, Archive, RotateCcw, CheckCircle, Lightbulb, FlaskConical, Gauge } from "lucide-react";
import { wpmToSps } from "@/lib/spsUtils";
import { copyToClipboard } from "@/lib/clipboard";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { MetricsInfoCard } from "@/components/pro/MetricsInfoCard";
import { getDaysSinceActivity, getRetentionStatus, type RetentionStatus } from "@/hooks/useGamification";
import { Badge } from "@/components/ui/badge";
import TrialBanner from "@/components/pro/TrialBanner";
import ExpiredOverlay from "@/components/pro/ExpiredOverlay";
import WelcomeTourModal from "@/components/pro/WelcomeTourModal";
import SeatCounter from "@/components/pro/SeatCounter";
import ReferralCard from "@/components/pro/ReferralCard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Patient {
  id: string;
  full_name: string | null;
  last_session_date: string | null;
  last_activity_date: string | null;
  avg_wpm: number | null;
  sessions_this_week: number;
  has_unread_comments: boolean;
  current_streak: number;
  is_archived: boolean;
  // Calculated
  daysSinceActivity: number;
  retentionStatus: RetentionStatus;
}

interface Profile {
  full_name: string | null;
  therapist_code: string | null;
  trial_start_date: string | null;
  trial_end_date: string | null;
  subscription_plan: string | null;
  subscription_status: string | null;
  is_premium: boolean;
  seats_limit: number;
}

interface TherapistStatus {
  isValid: boolean;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  daysRemaining: number;
}

const TherapistDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);
  const [therapistStatus, setTherapistStatus] = useState<TherapistStatus | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [archivingPatient, setArchivingPatient] = useState<string | null>(null);

  // Show payment success toast
  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      toast.success("Subscription activated!", {
        description: "Thank you for your trust. Your seats are now unlocked.",
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        duration: 8000,
      });
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch therapist profile with B2B fields
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, therapist_code, trial_start_date, trial_end_date, subscription_plan, subscription_status, is_premium, seats_limit, onboarding_completed_at, created_at")
          .eq("id", user.id)
          .maybeSingle();

        if (profileData) {
          setProfile(profileData);

          // Calculate therapist status
          const now = new Date();
          const trialEndDate = profileData.trial_end_date ? new Date(profileData.trial_end_date) : null;
          const trialStartDate = profileData.trial_start_date ? new Date(profileData.trial_start_date) : null;
          const fallbackDaysSinceStart = trialStartDate
            ? Math.floor((now.getTime() - trialStartDate.getTime()) / (1000 * 60 * 60 * 24))
            : 0;

          const isTrialExpired = trialEndDate
            ? trialEndDate <= now
            : trialStartDate
              ? fallbackDaysSinceStart >= 30
              : false;

          const daysRemaining = trialEndDate
            ? Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
            : trialStartDate
              ? Math.max(0, 30 - fallbackDaysSinceStart)
              : 30;

          const isSubscriptionActive = profileData.subscription_status === 'active' || profileData.is_premium === true;
          const isTrialActive = profileData.subscription_plan === 'trial' && !isTrialExpired;

          setTherapistStatus({
            isValid: !isTrialExpired || isSubscriptionActive,
            isTrialActive,
            isTrialExpired: isTrialExpired && !isSubscriptionActive,
            daysRemaining,
          });

          // Show welcome tour only if never completed AND account is fresh (< 10 min old)
          const accountAgeMs = Date.now() - new Date(profileData.created_at || 0).getTime();
          const isNewAccount = accountAgeMs < 10 * 60 * 1000;
          if (!profileData.onboarding_completed_at && trialStartDate && isNewAccount) {
            setShowWelcomeTour(true);
          }
        }

        // Fetch linked patients including archived ones
        const { data: patientsData } = await supabase
          .from("profiles")
          .select("id, full_name, last_activity_date, current_streak, is_archived")
          .eq("linked_therapist_id", user.id);

        if (patientsData && patientsData.length > 0) {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);

          // Get stats for each patient
          const patientsWithStats = await Promise.all(
            patientsData.map(async (patient) => {
              const { data: sessions } = await supabase
                .from("sessions")
                .select("id, created_at, avg_wpm")
                .eq("user_id", patient.id)
                .order("created_at", { ascending: false })
                .limit(10);

              const lastSession = sessions?.[0];
              const sessionsThisWeek = sessions?.filter(s => 
                new Date(s.created_at) > weekAgo
              ).length || 0;
              const avgWpm = sessions && sessions.length > 0
                ? Math.round(sessions.reduce((acc, s) => acc + s.avg_wpm, 0) / sessions.length)
                : null;

              // Calculate retention metrics
              const daysSinceActivity = getDaysSinceActivity(patient.last_activity_date);
              const retentionStatus = getRetentionStatus(daysSinceActivity);

              return {
                ...patient,
                last_session_date: lastSession?.created_at || null,
                avg_wpm: avgWpm,
                sessions_this_week: sessionsThisWeek,
                has_unread_comments: false,
                current_streak: patient.current_streak || 0,
                is_archived: patient.is_archived || false,
                daysSinceActivity,
                retentionStatus,
              };
            })
          );
          
          // Sort by retention risk (dropouts first, then slipping, then active)
          const sortedPatients = patientsWithStats.sort((a, b) => {
            const statusOrder: Record<RetentionStatus, number> = { dropout: 0, slipping: 1, new: 2, active: 3 };
            return statusOrder[a.retentionStatus] - statusOrder[b.retentionStatus];
          });
          
          setPatients(sortedPatients);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const copyInviteCode = async () => {
    if (!profile?.therapist_code) {
      toast.error("No invite code available");
      return;
    }

    const success = await copyToClipboard(profile.therapist_code);
    if (success) {
      setCopied(true);
      toast.success("Code copied!");
      setTimeout(() => setCopied(false), 3000);
    } else {
      toast.error("Error copying");
    }
  };

  const copyEmailTemplate = async () => {
    if (!profile?.therapist_code) {
      toast.error("No invite code available");
      return;
    }

    const emailTemplate = `Subject: Invitation: Your at-home training tool

Hello,

To complement our sessions and accelerate your progress, I invite you to use the ClutterPro app.

It's an interactive tool designed to help you daily:

- Guided Mode: A highlighter guides you word by word at the ideal pace to build good habits.

- Waveform Analysis: After each exercise, visualize your pauses and accelerations to understand your speech rate.

- Guided Exercises: Access a library of texts (slow reading, articulation) directly on your phone.

- Remote Monitoring: By linking your account to mine, I can listen to your exercises and advise you between appointments.

Getting started is easy:

1. Go to https://www.clutterpro.com
2. Create your free account with my Pro Code: ${profile.therapist_code}

See you soon!`;

    const success = await copyToClipboard(emailTemplate);
    if (success) {
      setEmailCopied(true);
      toast.success("Email template copied!");
      setTimeout(() => setEmailCopied(false), 3000);
    } else {
      toast.error("Error copying");
    }
  };

  const openMailClient = () => {
    if (!profile?.therapist_code) {
      toast.error("No invite code available");
      return;
    }

    const subject = encodeURIComponent("Your at-home training tool");
    const body = encodeURIComponent(`Hello,

To complement our sessions and accelerate your progress, I invite you to use the ClutterPro app.

It's an interactive tool designed to help you daily:

- Guided Mode: A highlighter guides you word by word at the ideal pace.
- Audio Analysis: Visualize your pauses and accelerations after each exercise.
- Guided Exercises: Access a library of texts directly on your phone.
- Remote Monitoring: By linking your account to mine, I can track your exercises.

Getting started:

1. Go to https://www.clutterpro.com
2. Create your free account with my Pro Code: ${profile.therapist_code}

See you soon!`);

    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    toast.success("Email client opened!");
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  };

  const getDaysSinceLastSession = (dateString: string | null) => {
    if (!dateString) return Infinity;
    const diff = Date.now() - new Date(dateString).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusIndicator = (patient: Patient) => {
    const status = patient.retentionStatus;
    if (status === "new") return { color: "bg-blue-500", label: "New" };
    if (status === "dropout") return { color: "bg-red-500", label: "Inactive" };
    if (status === "slipping") return { color: "bg-orange-500", label: "At risk" };
    return { color: "bg-green-500", label: "Active" };
  };

  // Format relative time for "last activity"
  const formatRelativeTime = (daysSince: number): { text: string; isNever: boolean } => {
    if (daysSince < 0) return { text: "No exercises yet", isNever: true };
    if (daysSince === 0) return { text: "Today", isNever: false };
    if (daysSince === 1) return { text: "Yesterday", isNever: false };
    return { text: `${daysSince}d ago`, isNever: false };
  };

  // Filter patients by archived status
  const activePatients = patients.filter(p => !p.is_archived);
  const archivedPatients = patients.filter(p => p.is_archived);
  const activePatientCount = activePatients.length;
  const seatsLimit = profile?.seats_limit || 3;
  const isAtSeatLimit = activePatientCount >= seatsLimit;

  // Count patients by risk level (only active ones, exclude "new" patients)
  const dropoutCount = activePatients.filter(p => p.retentionStatus === "dropout").length;
  const slippingCount = activePatients.filter(p => p.retentionStatus === "slipping").length;

  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Doctor";
  const fullName = profile?.full_name || firstName;

  // Contextual greeting with variety
  const getGreeting = () => {
    const hour = new Date().getHours();
    const day = new Date().getDay(); // 0=Sun ... 6=Sat
    const variants = hour < 12
      ? ["Good morning", "Welcome back", "Hello"]
      : hour < 18
        ? ["Good afternoon", "Welcome back", "Hello"]
        : ["Good evening", "Welcome back", "Hello"];
    // Pick variant based on day of week for consistency within a day
    return variants[day % variants.length];
  };

  // Contextual subtitle with rotating positive messages
  const getSubtitle = () => {
    if (patients.length === 0) return "Your workspace is ready, invite your first patient";
    if (dropoutCount > 0) return `${dropoutCount} patient${dropoutCount > 1 ? 's' : ''} need${dropoutCount > 1 ? '' : 's'} your attention`;
    if (slippingCount > 0) return `${slippingCount} patient${slippingCount > 1 ? 's' : ''} to follow up with this week`;

    const positiveMessages = [
      `${activePatientCount} active patient${activePatientCount > 1 ? 's' : ''} — all on track!`,
      `${activePatientCount} patient${activePatientCount > 1 ? 's' : ''} doing well — great job!`,
      `All your patients are active — excellent work!`,
      `${activePatientCount} motivated patient${activePatientCount > 1 ? 's' : ''} — great momentum!`,
      `Your patients are progressing well — keep it up!`,
    ];
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return positiveMessages[dayOfYear % positiveMessages.length];
  };

  // Archive/Restore patient
  const handleArchivePatient = async (patientId: string, archive: boolean) => {
    setArchivingPatient(patientId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_archived: archive })
        .eq("id", patientId);

      if (error) throw error;

      setPatients(prev => prev.map(p => 
        p.id === patientId ? { ...p, is_archived: archive } : p
      ));

      toast.success(archive
        ? "Patient archived. A seat has been freed."
        : "Patient restored successfully."
      );
    } catch (error) {
      console.error("Error updating patient:", error);
      toast.error("Error updating patient");
    } finally {
      setArchivingPatient(null);
    }
  };

  // Empty state for onboarding
  const renderEmptyState = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/5 to-chart-2/5 border-primary/20">
        <CardHeader className="text-center pb-2">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            Your Pro workspace is ready!
          </CardTitle>
          <CardDescription className="text-base mt-2">
            All that's left is to invite your patient. Once they create their account, they will appear here automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {/* Step 1 */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <p className="font-medium mb-2">Here is your unique Pro Code:</p>
              <div className="flex items-center gap-2">
                <code className="text-2xl font-mono font-bold text-primary bg-primary/10 px-4 py-2 rounded-lg">
                  {profile?.therapist_code || "PRO-XXXXXX"}
                </code>
                <Button onClick={copyInviteCode} size="sm" variant="outline" className="gap-2">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This code is the same for all your patients — share it as many times as needed.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div className="flex-1">
              <p className="font-medium mb-2">Send this code to your patient by email</p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={openMailClient} variant="default" className="gap-2">
                  <Mail className="w-4 h-4" />
                  Send by email
                </Button>
                <Button onClick={copyEmailTemplate} variant="outline" className="gap-2">
                  {emailCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {emailCopied ? "Copied!" : "Copy template"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                A personalized email explaining the app's benefits
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-medium mb-1">The patient creates their account with your Pro Code</p>
              <p className="text-sm text-muted-foreground">
                Everything is explained in the email, they just need to follow the steps.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
              4
            </div>
            <div>
              <p className="font-medium mb-1">That's it! The patient will appear here automatically</p>
              <p className="text-sm text-muted-foreground">
                No action needed on your part: as soon as they create their account, you'll see their sessions and progress.
              </p>
            </div>
          </div>

          {/* En attendant block */}
          <div className="p-4 rounded-xl bg-chart-2/10 border border-chart-2/30">
            <p className="font-medium text-sm mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-chart-2" />
              In the meantime, you already have access to the full platform:
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link to="/library">
                  Browse exercises
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link to="/settings">
                  <Settings className="w-4 h-4" />
                  Customize my profile
                </Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Sessions you launch from your account are in <span className="font-medium">discovery mode</span> (personal testing). For a session to be recorded in a patient's file, they must log in with their own account.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <>
      {/* Welcome Tour Modal */}
      <WelcomeTourModal 
        open={showWelcomeTour} 
        onClose={() => {
          setShowWelcomeTour(false);
          if (user) {
            supabase
              .from("profiles")
              .update({ onboarding_completed_at: new Date().toISOString() })
              .eq("id", user.id)
              .then();
          }
        }} 
      />

      {/* Expired Overlay - Blocks access when trial expired */}
      {therapistStatus?.isTrialExpired && <ExpiredOverlay />}

    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/30">
      {/* Trial Banner */}
      {therapistStatus?.isTrialActive && (
        <TrialBanner daysRemaining={therapistStatus.daysRemaining} />
      )}

      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/patient/list" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl hidden sm:inline">ClutterPro</span>
            <span className="text-xs bg-chart-2/20 text-chart-2 px-2 py-0.5 rounded-full font-medium hidden sm:inline">PRO</span>
          </Link>
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <span>Practice of <span className="font-medium text-foreground">{fullName}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={() => navigate("/library")}>
              <FlaskConical className="w-4 h-4" />
              <span className="hidden sm:inline">Test exercises</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome + inline stats */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-display font-bold mb-1">
                {getGreeting()}, {firstName} 👋
              </h1>
              <p className="text-muted-foreground">
                {getSubtitle()}
              </p>
            </div>
            <Button
              onClick={() => navigate("/session-live")}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md whitespace-nowrap"
            >
              <Gauge className="w-4 h-4" />
              In-session rate meter
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : patients.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              {/* Alert Banner for At-Risk Patients - compact */}
              {(dropoutCount > 0 || slippingCount > 0) && (
                <div className={`mb-4 p-3 rounded-lg flex items-center gap-3 text-sm ${dropoutCount > 0 ? 'bg-red-500/10 border border-red-500/30' : 'bg-orange-500/10 border border-orange-500/30'}`}>
                  <AlertCircle className={`w-4 h-4 flex-shrink-0 ${dropoutCount > 0 ? 'text-red-500' : 'text-orange-500'}`} />
                  <span>
                    {dropoutCount > 0 && (
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        {dropoutCount} inactive (5d+)
                      </span>
                    )}
                    {dropoutCount > 0 && slippingCount > 0 && <span className="mx-1.5 text-muted-foreground">·</span>}
                    {slippingCount > 0 && (
                      <span className="text-orange-600 dark:text-orange-400 font-medium">
                        {slippingCount} at risk
                      </span>
                    )}
                    <span className="text-muted-foreground ml-2">— consider following up</span>
                  </span>
                </div>
              )}

              {/* Seat Counter - compact */}
              <div className="mb-4">
                <SeatCounter activePatients={activePatientCount} seatsLimit={seatsLimit} />
              </div>

              {/* Patients Table with integrated invite */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Patients of {fullName}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span>{activePatientCount} active · {archivedPatients.length} archived</span>
                        <span className="text-muted-foreground/50">|</span>
                        <span className="font-mono text-xs font-medium text-foreground">{profile?.therapist_code || "N/A"}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); copyInviteCode(); }}>
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="gap-2"
                                disabled={isAtSeatLimit}
                                onClick={openMailClient}
                              >
                                <UserPlus className="w-4 h-4" />
                                Invite
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {isAtSeatLimit && (
                            <TooltipContent>
                              <p>Limit reached. Archive a patient or upgrade your plan.</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "active" | "archived")}>
                        <TabsList>
                          <TabsTrigger value="active" className="gap-1.5 text-xs">
                            <Users className="w-3.5 h-3.5" />
                            Active ({activePatientCount})
                          </TabsTrigger>
                          <TabsTrigger value="archived" className="gap-1.5 text-xs">
                            <Archive className="w-3.5 h-3.5" />
                            Archived ({archivedPatients.length})
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Flame className="w-4 h-4 text-orange-500" />
                              Streak
                            </div>
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Last activity</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Sessions/wk</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Avg. rate</th>
                          <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(activeTab === "active" ? activePatients : archivedPatients).map((patient) => {
                          const status = getStatusIndicator(patient);
                          return (
                            <tr 
                              key={patient.id} 
                              className={`border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors ${
                                activeTab === "active" && patient.retentionStatus === 'dropout' ? 'bg-red-500/5' : 
                                activeTab === "active" && patient.retentionStatus === 'slipping' ? 'bg-orange-500/5' : ''
                              }`}
                              onClick={() => navigate(`/patient/${patient.id}`)}
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${activeTab === "archived" ? 'bg-muted-foreground' : status.color} ${
                                    activeTab === "active" && patient.retentionStatus === 'dropout' ? 'animate-pulse' : ''
                                  }`} />
                                  <span className={`text-xs font-medium ${
                                    activeTab === "archived" ? 'text-muted-foreground' :
                                    patient.retentionStatus === 'dropout' ? 'text-red-600' :
                                    patient.retentionStatus === 'slipping' ? 'text-orange-600' : 'text-muted-foreground'
                                  }`}>{activeTab === "archived" ? "Archived" : status.label}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 font-medium">{patient.full_name || "Patient"}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5">
                                  <Flame className={`w-4 h-4 ${patient.current_streak > 0 ? 'text-orange-500 fill-orange-500/30' : 'text-muted-foreground/50'}`} />
                                  <span className={`font-bold tabular-nums ${patient.current_streak > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {patient.current_streak}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                {(() => {
                                  const activity = formatRelativeTime(patient.daysSinceActivity);
                                  if (activity.isNever) {
                                    return (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="text-sm text-amber-600 font-medium cursor-help flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            Follow up
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-[200px]">
                                          <p className="text-xs">This patient signed up but hasn't completed any exercises yet. Consider following up!</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    );
                                  }
                                  return (
                                    <span className={`text-sm ${
                                      activeTab === "archived" ? 'text-muted-foreground' :
                                      patient.retentionStatus === 'dropout' ? 'text-red-600 font-medium' :
                                      patient.retentionStatus === 'slipping' ? 'text-orange-600' : 'text-muted-foreground'
                                    }`}>
                                      {activity.text}
                                    </span>
                                  );
                                })()}
                              </td>
                              <td className="py-3 px-4">
                                <span className={patient.sessions_this_week >= 3 ? "text-green-600 font-medium" : "text-muted-foreground"}>
                                  {patient.sessions_this_week}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                {(() => {
                                  const sps = patient.avg_wpm ? wpmToSps(patient.avg_wpm) : null;
                                  return (
                                    <span className={`font-medium ${
                                      sps ? (
                                        sps <= 4.0 ? "text-green-600" :
                                        sps <= 5.0 ? "text-yellow-600" : "text-red-600"
                                      ) : "text-muted-foreground"
                                    }`}>
                                      {sps ? `${sps} SPS` : "-"}
                                    </span>
                                  );
                                })()}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/patient/${patient.id}`);
                                    }}
                                    className="gap-1"
                                  >
                                    <Eye className="w-4 h-4" />
                                    View
                                  </Button>
                                  {activeTab === "active" ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleArchivePatient(patient.id, true);
                                          }}
                                          disabled={archivingPatient === patient.id}
                                          className="text-muted-foreground hover:text-foreground"
                                        >
                                          <Archive className="w-4 h-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Archive this patient</TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span>
                                          <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleArchivePatient(patient.id, false);
                                            }}
                                            disabled={archivingPatient === patient.id || isAtSeatLimit}
                                            className="text-primary hover:text-primary"
                                          >
                                            <RotateCcw className="w-4 h-4" />
                                          </Button>
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {isAtSeatLimit
                                          ? "Seat limit reached"
                                          : "Restore this patient"
                                        }
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {(activeTab === "active" ? activePatients : archivedPatients).length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-muted-foreground">
                              {activeTab === "active"
                                ? "No active patients"
                                : "No archived patients"
                              }
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Collapsible Referral & Metrics Cards */}
              <div className="mt-8 space-y-4">
                <ReferralCard />
                <MetricsInfoCard />
              </div>
            </>
          )}
        </motion.div>
      </main>
    </div>
    </>
  );
};

export default TherapistDashboard;
