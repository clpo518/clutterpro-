import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, Copy, Check, Sparkles, ChevronDown, ArrowRight, CreditCard, UserPlus, PartyPopper, Loader2, TicketCheck } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { copyToClipboard } from "@/lib/clipboard";

interface ReferralStats {
  referralCode: string | null;
  totalReferrals: number;
  completedReferrals: number;
  bonusMonths: number;
}

const ReferralCard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [referrerCodeInput, setReferrerCodeInput] = useState("");
  const [applyingCode, setApplyingCode] = useState(false);
  const [hasExistingReferral, setHasExistingReferral] = useState(false);

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

        // Check if this user was already referred by someone
        const { data: existingReferral } = await supabase
          .from("referrals")
          .select("id")
          .eq("referred_id", user.id)
          .maybeSingle();

        setHasExistingReferral(!!existingReferral);

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

    const referralLink = `https://www.clutterpro.com/auth?ref=${stats.referralCode}`;
    const success = await copyToClipboard(referralLink);

    if (success) {
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 3000);
    } else {
      toast.error("Error copying");
    }
  };

  const handleCopyMessage = async () => {
    if (!stats?.referralCode) return;

    const referralLink = `https://www.clutterpro.com/auth?ref=${stats.referralCode}`;
    const message = `Hey! I recommend ClutterPro, a great tool for monitoring patients in speech rate therapy.

By signing up with my link, we both get 1 free month!

${referralLink}

It's simple: create your account through this link, try it free for 30 days, and if you subscribe, we each get 1 free month!`;

    const success = await copyToClipboard(message);
    if (success) {
      toast.success("Message copied! Ready to send to a colleague");
    } else {
      toast.error("Error copying");
    }
  };

  const handleApplyReferralCode = async () => {
    if (!user || !referrerCodeInput.trim()) return;
    setApplyingCode(true);

    try {
      const code = referrerCodeInput.trim().toUpperCase();

      // Don't allow self-referral
      if (stats?.referralCode && code === stats.referralCode) {
        toast.error("You cannot use your own code");
        setApplyingCode(false);
        return;
      }

      // Find the referrer by their referral code
      const { data: referrerProfile, error: findError } = await supabase
        .from("profiles")
        .select("id")
        .eq("referral_code", code)
        .maybeSingle();

      if (findError) throw findError;

      if (!referrerProfile) {
        toast.error("Invalid referral code");
        setApplyingCode(false);
        return;
      }

      // Create the referral record
      const { error: insertError } = await supabase
        .from("referrals")
        .insert({
          referrer_id: referrerProfile.id,
          referred_id: user.id,
          status: "pending",
        });

      if (insertError) {
        if (insertError.code === "23505") {
          toast.error("You have already used a referral code");
        } else {
          throw insertError;
        }
        setApplyingCode(false);
        return;
      }

      setHasExistingReferral(true);
      setReferrerCodeInput("");
      toast.success("Referral code applied! The bonus will be activated with your first payment.");
    } catch (error) {
      console.error("Error applying referral code:", error);
      toast.error("Error applying code");
    } finally {
      setApplyingCode(false);
    }
  };

  if (loading || !stats?.referralCode) return null;

  return (
    <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-background to-chart-2/5">
      <CardHeader 
        className="cursor-pointer select-none pb-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Gift className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                Refer & earn 1 free month
              </CardTitle>
              <CardDescription className="text-sm">
                1 free month for you, 1 free month for your referral
              </CardDescription>
            </div>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
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
            <CardContent className="pt-0 space-y-5">
              {/* Stats if any */}
              {stats.completedReferrals > 0 && (
                <div className="flex gap-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stats.completedReferrals}</div>
                    <div className="text-xs text-muted-foreground">Successful referrals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.bonusMonths}</div>
                    <div className="text-xs text-muted-foreground">Months earned</div>
                  </div>
                </div>
              )}

              {/* Enter a referral code received from someone */}
              {!hasExistingReferral && (
                <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <TicketCheck className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium">Have a referral code?</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    A colleague shared a code with you? Enter it here to get 1 free month with your first payment.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="REF-XXXXXX"
                      value={referrerCodeInput}
                      onChange={(e) => setReferrerCodeInput(e.target.value.toUpperCase())}
                      className="font-mono"
                    />
                    <Button
                      onClick={handleApplyReferralCode}
                      disabled={applyingCode || !referrerCodeInput.trim()}
                      size="sm"
                    >
                      {applyingCode ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {hasExistingReferral && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Referral code applied — the bonus will be activated with your first payment.
                  </p>
                </div>
              )}

              {/* How it works - Step by step */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                  How does it work?
                </h4>
                
                <div className="space-y-2">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Share your link or code</p>
                      <p className="text-xs text-muted-foreground">
                        Send the link or code below to an SLP colleague
                      </p>
                    </div>
                    <UserPlus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Your colleague signs up and tries it</p>
                      <p className="text-xs text-muted-foreground">
                        They get 30 days of free trial, no commitment
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">They subscribe</p>
                      <p className="text-xs text-muted-foreground">
                        When your referral subscribes to a paid plan, the reward is triggered
                      </p>
                    </div>
                    <CreditCard className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>

                  {/* Step 4 - Reward */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      ✓
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">1 free month for each!</p>
                      <p className="text-xs text-muted-foreground">
                        You automatically receive 1 free month, and your referral does too
                      </p>
                    </div>
                    <PartyPopper className="w-4 h-4 text-green-500 flex-shrink-0" />
                  </div>
                </div>
              </div>

              {/* FAQ inline */}
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <strong>FAQ:</strong>
                </p>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                  <li>- <strong>Link or code?</strong> The link does everything automatically. Otherwise, your referral can enter the code in their settings.</li>
                  <li>- <strong>Do I need to pay?</strong> No, the trial is free. The reward is only activated if your referral subscribes.</li>
                  <li>- <strong>How many referrals?</strong> Unlimited! The more you refer, the more you earn.</li>
                </ul>
              </div>

              {/* Referral Code Display */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Your referral code</p>
                <code className="text-lg font-mono font-bold text-primary">
                  {stats.referralCode}
                </code>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleCopyLink}
                  variant="default"
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
                      Copy invite link
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleCopyMessage}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Sparkles className="w-4 h-4" />
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

export default ReferralCard;
