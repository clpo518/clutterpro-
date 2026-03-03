import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Copy, Check, ChevronDown, Gift, CreditCard, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { copyToClipboard } from "@/lib/clipboard";

interface ReferralStats {
  referralCode: string | null;
  totalReferrals: number;
  completedReferrals: number;
  bonusMonths: number;
}

const PatientReferralCard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchReferralData = async () => {
      if (!user) return;

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("referral_code, referral_bonus_months")
          .eq("id", user.id)
          .maybeSingle();

        const { data: referrals } = await supabase
          .from("referrals")
          .select("status")
          .eq("referrer_id", user.id);

        const totalReferrals = referrals?.length || 0;
        const completedReferrals = referrals?.filter(r => r.status === "completed" || r.status === "rewarded").length || 0;

        setStats({
          referralCode: profile?.referral_code || null,
          totalReferrals,
          completedReferrals,
          bonusMonths: profile?.referral_bonus_months || 0,
        });
      } catch (error) {
        console.error("Error fetching referral data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, [user]);

  const handleCopyLink = async () => {
    if (!stats?.referralCode) return;

    const referralLink = `https://www.clutterpro.com/auth?tab=signup&ref=${stats.referralCode}`;
    const success = await copyToClipboard(referralLink);

    if (success) {
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 3000);
    } else {
      toast.error("Failed to copy");
    }
  };

  const handleCopyMessage = async () => {
    if (!stats?.referralCode) return;

    const referralLink = `https://www.clutterpro.com/auth?tab=signup&ref=${stats.referralCode}`;
    const message = `Hey! I've been training my speech rate with ClutterPro, and it's really well made

If you want to try it, sign up with my link and we both get 1 free month when you subscribe!

${referralLink}

It's free for 7 days, no commitment!`;

    const success = await copyToClipboard(message);
    if (success) {
      toast.success("Message copied! Ready to send");
    } else {
      toast.error("Failed to copy");
    }
  };

  if (loading || !stats?.referralCode) return null;

  return (
    <Card className="border border-border/60 bg-gradient-to-br from-accent/30 via-background to-primary/5">
      <CardHeader
        className="cursor-pointer select-none pb-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm">
                Help a friend, earn 1 month
              </CardTitle>
              <CardDescription className="text-xs">
                Spread the word, it's a win-win
              </CardDescription>
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </CardHeader>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <CardContent className="pt-0 space-y-4">
              {/* Stats if any */}
              {stats.completedReferrals > 0 && (
                <div className="flex gap-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">{stats.completedReferrals}</div>
                    <div className="text-[10px] text-muted-foreground">Friends referred</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">{stats.bonusMonths}</div>
                    <div className="text-[10px] text-muted-foreground">Months earned</div>
                  </div>
                </div>
              )}

              {/* Simple explanation */}
              <div className="space-y-2">
                <div className="flex items-start gap-2.5 text-sm">
                  <Gift className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-muted-foreground">
                    Share your link. When your friend signs up and <strong className="text-foreground">subscribes</strong>, you each get <strong className="text-foreground">1 free month</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2.5 text-sm">
                  <CreditCard className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    The 7-day trial is free. The bonus activates only if your friend subscribes ($9/month).
                  </p>
                </div>
                {stats.completedReferrals === 0 && (
                  <div className="flex items-start gap-2.5 text-sm">
                    <PartyPopper className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Unlimited: the more you refer, the more you earn!
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleCopyLink}
                  variant="default"
                  size="sm"
                  className="w-full gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy my invite link
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleCopyMessage}
                  variant="ghost"
                  size="sm"
                  className="w-full gap-2 text-muted-foreground"
                >
                  Copy a ready-to-send message
                </Button>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default PatientReferralCard;
