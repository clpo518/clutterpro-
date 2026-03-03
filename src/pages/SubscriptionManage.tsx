import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Stethoscope, TrendingDown, BookX, CheckCircle, ArrowLeft, Sparkles, Target, UserCheck, Calendar, Loader2, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface PatientStats {
  sessionCount: number;
  totalMinutes: number;
  daysSinceStart: number;
  daysToGoal: number;
}

interface TherapistInfo {
  full_name: string | null;
}

const GOAL_DAYS = 90; // 3 mois recommandés

const SubscriptionManage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PatientStats | null>(null);
  const [therapist, setTherapist] = useState<TherapistInfo | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: { returnUrl: `${window.location.origin}/subscription/manage` },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
      toast.error("Erreur lors de l'ouverture du portail de paiement");
    } finally {
      setPortalLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch sessions stats
        const { data: sessions } = await supabase
          .from("sessions")
          .select("duration_seconds, created_at")
          .eq("user_id", user.id);

        // Fetch profile for therapist link and creation date
        const { data: profile } = await supabase
          .from("profiles")
          .select("created_at, linked_therapist_id")
          .eq("id", user.id)
          .maybeSingle();

        if (sessions && profile) {
          const totalSeconds = sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
          const totalMinutes = Math.round(totalSeconds / 60);
          const createdAt = new Date(profile.created_at);
          const now = new Date();
          const daysSinceStart = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
          const daysToGoal = Math.max(0, GOAL_DAYS - daysSinceStart);

          setStats({
            sessionCount: sessions.length,
            totalMinutes,
            daysSinceStart,
            daysToGoal,
          });

          // Fetch therapist info if linked
          if (profile.linked_therapist_id) {
            const { data: therapistData } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", profile.linked_therapist_id)
              .maybeSingle();

            if (therapistData) {
              setTherapist(therapistData);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">P</span>
            </div>
            <span className="font-display font-bold">ClutterPro</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Title */}
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
              Manage your subscription
            </h1>
            <p className="text-muted-foreground">
              {therapist
                ? "You are currently on the Premium plan"
                : "Solo Patient Subscription - $9/month"}
            </p>
          </div>

          {/* Personalized Stats Card */}
          {stats && stats.sessionCount > 0 && (
            <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-foreground">
                    Your progress matters!
                  </h2>
                  <p className="text-muted-foreground">
                    You've already completed <strong className="text-foreground">{stats.sessionCount} session{stats.sessionCount > 1 ? 's' : ''}</strong> and
                    accumulated <strong className="text-foreground">{stats.totalMinutes >= 60 ? `${Math.floor(stats.totalMinutes / 60)}h${stats.totalMinutes % 60 > 0 ? `${stats.totalMinutes % 60}min` : ''}` : `${stats.totalMinutes} min`}</strong> of practice.
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    Don't lose all this hard work!
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Bilan Final Countdown */}
          {stats && (
            <Card className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-foreground">
                    Progress assessment goal
                  </h2>
                  <p className="text-muted-foreground">
                    SLPs recommend a minimum of <strong className="text-foreground">3 months of regular practice</strong> for a complete progress assessment.
                  </p>
                  {stats.daysToGoal > 0 ? (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10">
                      <span className="text-2xl font-bold text-green-600">{stats.daysToGoal}</span>
                      <span className="text-sm text-green-700 dark:text-green-400">
                        days remaining to reach this goal.<br/>
                        <strong>Don't stop when you're this close!</strong>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/20">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-700 dark:text-green-400 font-medium">
                        You've reached the 3-month mark! Keep going to consolidate your gains.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Therapist Connection Card - only if linked */}
          {therapist && (
            <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-6 h-6 text-purple-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-foreground">
                    Your SLP is counting on you
                  </h2>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">{therapist.full_name || "Your SLP"}</strong> is tracking your progress and using your data to adjust your therapy.
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    By canceling, you'll lose this valuable connection.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Value justification for B2C solo users */}
          {!therapist && (
            <Card className="p-6 bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-amber-500/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-amber-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-foreground">
                    Why $9/month? (less than 2 coffees)
                  </h2>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    <li>A dedicated team constantly expanding the exercise library</li>
                    <li>Secure hosting for your voice data</li>
                    <li>Continuously updated speech rate analysis</li>
                    <li>Human support via email</li>
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* Loss Aversion Warning Card */}
          <Card className="p-6 bg-amber-500/10 border-amber-500/30">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Before you change your plan...
                </h2>
                
                <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                  <Stethoscope className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">
                      Canceling your subscription will suspend SLP monitoring.
                    </p>
                  </div>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <TrendingDown className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <span>Your SLP will no longer be able to view your new charts.</span>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <span>The history needed for your <strong className="text-foreground">Final Assessment</strong> will no longer be updated.</span>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <BookX className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <span>You'll lose access to unlimited exercises and the full library.</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Stay Incentive */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  You're on a roll!
                </p>
                <p className="text-muted-foreground text-sm">
                  Consistency is the key to progress. Keep up your efforts for lasting results.
                </p>
              </div>
            </div>
          </Card>

          {/* Manage billing */}
          <Card className="p-6 border-border">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-2">
                <h2 className="text-lg font-semibold text-foreground">
                  Payment method
                </h2>
                <p className="text-sm text-muted-foreground">
                  Update your card or view your invoices.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManageBilling}
                  disabled={portalLoading}
                  className="gap-2 mt-1"
                >
                  {portalLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  Manage payment
                </Button>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Primary CTA - Keep subscription */}
            <motion.div
              animate={{ 
                scale: [1, 1.02, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Button
                onClick={() => navigate("/dashboard")}
                size="lg"
                className="w-full h-14 text-lg shadow-lg shadow-primary/25 hover:shadow-xl transition-all"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Keep my subscription (Recommended)
              </Button>
            </motion.div>

            {/* Secondary - Cancel link (de-emphasized) */}
            <div className="text-center pt-4">
              <button
                onClick={() => {
                  const subject = encodeURIComponent("[Cancellation] Subscription cancellation request");
                  const body = encodeURIComponent(`Hello,\n\nI would like to cancel my Premium subscription.\n\nMy account email: ${user?.email || ""}\n\nPlease process my request.\n\nBest regards`);
                  window.open(`mailto:support@clutterpro.com?subject=${subject}&body=${body}`, "_blank");
                }}
                className="text-sm text-muted-foreground hover:text-foreground/70 underline-offset-4 hover:underline transition-colors"
              >
                Send an email to cancel
              </button>
            </div>
          </div>

          {/* Fine print */}
          <p className="text-xs text-center text-muted-foreground">
            If you cancel, your Premium access remains active until the end of your current billing period.
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default SubscriptionManage;
