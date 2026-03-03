import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Activity,
  Loader2,
  BarChart3,
  Heart,
  CreditCard
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface TherapistStats {
  activePatients: number;
  totalSessions: number;
  subscriptionPlan: string | null;
}

const ProSubscriptionManage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TherapistStats | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: { returnUrl: `${window.location.origin}/pro/subscription/manage` },
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
        // Fetch therapist profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_plan")
          .eq("id", user.id)
          .maybeSingle();

        // Count active patients
        const { data: patients } = await supabase
          .from("profiles")
          .select("id")
          .eq("linked_therapist_id", user.id)
          .eq("is_archived", false);

        // Count total sessions from patients
        let totalSessions = 0;
        if (patients && patients.length > 0) {
          const patientIds = patients.map(p => p.id);
          const { count } = await supabase
            .from("sessions")
            .select("*", { count: "exact", head: true })
            .in("user_id", patientIds);
          totalSessions = count || 0;
        }

        setStats({
          activePatients: patients?.length || 0,
          totalSessions,
          subscriptionPlan: profile?.subscription_plan || null,
        });
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
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/30">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/patient/list" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-display font-bold">Gestion abonnement</span>
          </div>
          <div className="w-20" />
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
              Manage your Pro subscription
            </h1>
            <p className="text-muted-foreground">
              {stats?.subscriptionPlan === "trial"
                ? "You are on a trial period"
                : "You are subscribed to ClutterPro"
              }
            </p>
          </div>

          {/* Active Patients Card */}
          {stats && stats.activePatients > 0 && (
            <Card className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-foreground">
                    Your patients are counting on you
                  </h2>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">{stats.activePatients} patient{stats.activePatients > 1 ? 's' : ''}</strong> {stats.activePatients > 1 ? 'are' : 'is'} actively using ClutterPro under your supervision.
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    {stats.activePatients > 1 ? 'They would' : 'They would'} lose access to exercises if you cancel.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Sessions Data Card */}
          {stats && stats.totalSessions > 0 && (
            <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-foreground">
                    Accumulated clinical data
                  </h2>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">{stats.totalSessions} session{stats.totalSessions > 1 ? 's' : ''}</strong> recorded with rate curves, analyses, and complete history.
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    This data would become inaccessible without an active subscription.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Clinical Continuity Card */}
          <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground">
                  Continuity of care
                </h2>
                <p className="text-muted-foreground">
                  Speech rate therapy requires regular monitoring over several months. Without ClutterPro, you won't be able to objectively measure speech rate in sessions or track your patients' progress.
                </p>
              </div>
            </div>
          </Card>

          {/* Warning Card */}
          <Card className="p-6 bg-amber-500/10 border-amber-500/30">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">
                  If you cancel...
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <Clock className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <span>Your patients lose access to exercises.</span>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <BarChart3 className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <span>You won't be able to view new sessions.</span>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <Heart className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <span>The digital therapeutic link is suspended.</span>
                  </li>
                </ul>
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
                onClick={() => navigate("/patient/list")}
                size="lg"
                className="w-full h-14 text-lg shadow-lg shadow-primary/25 hover:shadow-xl transition-all"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Keep my subscription
              </Button>
            </motion.div>

            {/* Secondary - Cancel link (de-emphasized) */}
            <div className="text-center pt-4">
              <button
                onClick={() => {
                  const subject = encodeURIComponent("[Pro Cancellation] Subscription cancellation request");
                  const body = encodeURIComponent(`Hello,\n\nI would like to cancel my Pro subscription.\n\nMy account email: ${user?.email || ""}\nNumber of active patients: ${stats?.activePatients || 0}\n\nPlease process my request.\n\nBest regards`);
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
            If you cancel, your access remains active until the end of your billing period. 
            Your data is retained for 30 days.
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default ProSubscriptionManage;
