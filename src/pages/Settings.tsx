import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, ArrowLeft, Loader2, Save, UserPlus, Check, X, Mail, Headphones, Dna, Info, Clock, CreditCard, AlertTriangle, Copy, ExternalLink } from "lucide-react";
import { SPS_TARGET_LEVELS, spsToWpm, wpmToSps } from "@/lib/spsUtils";
import { getNormSPS, getAgeGroupLabel, validateBirthYear } from "@/lib/ageNormsUtils";
import { copyToClipboard } from "@/lib/clipboard";
import { motion } from "framer-motion";
import { toast } from "sonner";

import TherapistMarketingKit from "@/components/settings/TherapistMarketingKit";
import PatientReferralCard from "@/components/referral/PatientReferralCard";

interface Profile {
  full_name: string | null;
  target_wpm: number;
  is_therapist: boolean;
  is_premium: boolean;
  therapist_code: string | null;
  linked_therapist_id: string | null;
  birth_year: number | null;
  trial_start_date: string | null;
  trial_end_date: string | null;
  subscription_plan: string | null;
  subscription_status: string | null;
}

interface TherapistInfo {
  full_name: string | null;
  therapist_code: string | null;
}

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [linkingTherapist, setLinkingTherapist] = useState(false);
  const [therapistCode, setTherapistCode] = useState("");
  const [linkedTherapist, setLinkedTherapist] = useState<TherapistInfo | null>(null);
  const [birthYearInput, setBirthYearInput] = useState("");
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    target_wpm: 150,
    is_therapist: false,
    is_premium: false,
    therapist_code: null,
    linked_therapist_id: null,
    birth_year: null,
    trial_start_date: null,
    trial_end_date: null,
    subscription_plan: null,
    subscription_status: null,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, target_wpm, is_therapist, is_premium, therapist_code, linked_therapist_id, birth_year, trial_start_date, trial_end_date, subscription_plan, subscription_status")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        toast.error("Error loading profile");
      } else if (data) {
        setProfile(data);
        if (data.birth_year) {
          setBirthYearInput(data.birth_year.toString());
        }
        
        // Fetch linked therapist info if exists (via SECURITY DEFINER RPC to avoid RLS issues)
        if (data.linked_therapist_id) {
          const { data: therapistResults, error: therapistError } = await supabase
            .rpc("get_linked_therapist_info");

          if (therapistError) {
            console.error("Error fetching linked therapist:", therapistError);
          }

          const therapistData = therapistResults?.[0];
          if (therapistData) {
            setLinkedTherapist(therapistData);
          }
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);


  const handleLinkTherapist = async () => {
    if (!user || !therapistCode.trim()) return;
    setLinkingTherapist(true);

    try {
      // Use security definer function to find therapist by code (bypasses RLS)
      const { data: therapistResults, error: findError } = await supabase
        .rpc("find_therapist_by_code", { code: therapistCode.trim() });

      const therapist = therapistResults?.[0];

      if (findError) throw findError;

      if (!therapist) {
        toast.error("Invalid therapist code");
        setLinkingTherapist(false);
        return;
      }

      // Update patient's profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ linked_therapist_id: therapist.id })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, linked_therapist_id: therapist.id }));
      setLinkedTherapist({ full_name: therapist.full_name, therapist_code: therapist.therapist_code });
      setTherapistCode("");
      toast.success(`You are now linked to ${therapist.full_name || "your speech therapist"}`);

      // Notify therapist that a new patient joined (fire and forget)
      supabase.functions.invoke('notify-patient-joined', {
        body: {
          patientId: user.id,
          therapistId: therapist.id,
        },
      }).then((result) => {
        if (result.error) {
          console.error('Failed to notify therapist:', result.error);
        } else {
          console.log('Therapist notified of new patient');
        }
      }).catch((err) => {
        console.error('Error calling notify-patient-joined:', err);
      });
    } catch (error) {
      console.error("Error linking therapist:", error);
      toast.error("Error linking speech therapist");
    } finally {
      setLinkingTherapist(false);
    }
  };

  const handleUnlinkTherapist = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ linked_therapist_id: null })
        .eq("id", user.id);

      if (error) throw error;

      setProfile(prev => ({ ...prev, linked_therapist_id: null }));
      setLinkedTherapist(null);
      toast.success("Link with speech therapist removed");
    } catch (error) {
      toast.error("Error removing link");
    }
  };

  const handleBirthYearChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "").slice(0, 4);
    setBirthYearInput(numericValue);
    
    if (numericValue.length === 4) {
      const year = parseInt(numericValue, 10);
      const validation = validateBirthYear(year);
      if (validation.valid) {
        setProfile(prev => ({ ...prev, birth_year: year }));
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // Validate birth year if provided
      let birthYearToSave = profile.birth_year;
      if (birthYearInput.length === 4) {
        const year = parseInt(birthYearInput, 10);
        const validation = validateBirthYear(year);
        if (validation.valid) {
          birthYearToSave = year;
        }
      }

      // Note: is_therapist is now fixed at signup and cannot be changed
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          target_wpm: profile.target_wpm,
          birth_year: birthYearToSave,
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile(prev => ({ ...prev, birth_year: birthYearToSave }));
      toast.success("Profile updated");
    } catch (error) {
      toast.error("Error saving changes");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/30">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-display font-bold">Settings</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <h1 className="text-3xl font-display font-bold">Account Settings</h1>

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={profile.full_name || ""}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              {/* Birth Year Field - Only for patients */}
              {!profile.is_therapist && (
                <div className="space-y-2">
                  <Label htmlFor="birth-year" className="flex items-center gap-2">
                    <Dna className="w-4 h-4 text-primary" />
                    Birth year
                  </Label>
                  <div className="flex gap-3 items-start">
                    <Input
                      id="birth-year"
                      type="text"
                      inputMode="numeric"
                      placeholder="ex: 1985"
                      value={birthYearInput}
                      onChange={(e) => handleBirthYearChange(e.target.value)}
                      className="w-32 font-mono"
                      maxLength={4}
                    />
                    {profile.birth_year && (
                      <div className="flex-1 p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <p className="text-xs text-muted-foreground">Recommended norm</p>
                        <p className="font-semibold text-primary">
                          {getNormSPS(profile.birth_year)} syll/sec 
                          <span className="text-xs font-normal text-muted-foreground ml-2">
                            ({getAgeGroupLabel(profile.birth_year)})
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <Info className="w-3 h-3 mt-0.5 shrink-0" />
                    Used to calibrate your speech rate goals based on clinical norms (Van Zaalen).
                  </p>
                </div>
              )}

              {/* Speed Target - Only for patients */}
              {!profile.is_therapist && (
                <div className="space-y-2">
                  <Label>Speed target</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {SPS_TARGET_LEVELS.map((level) => {
                      const levelWpm = spsToWpm(level.sps);
                      const isSelected = Math.abs(profile.target_wpm - levelWpm) < 15;
                      // Check if this level matches the user's age-based norm
                      const userNorm = profile.birth_year ? getNormSPS(profile.birth_year) : null;
                      const isUserNorm = userNorm && Math.abs(level.sps - userNorm) < 0.5;
                      return (
                        <button
                          key={level.level}
                          type="button"
                          onClick={() => setProfile({ ...profile, target_wpm: levelWpm })}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          <div className="text-lg font-bold">{level.sps}</div>
                          <div className="text-xs text-muted-foreground">syll/sec</div>
                          <div className={`text-[10px] mt-1 ${isUserNorm ? "text-primary font-medium" : "text-muted-foreground"}`}>
                            {level.label}
                          </div>
                          {isUserNorm && (
                            <span className="inline-block mt-1 text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                              Your norm
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This target will be used for real-time feedback during your exercises
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Link Therapist Card (Only for non-therapists) */}
          {!profile.is_therapist && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  My speech therapist
                </CardTitle>
                <CardDescription>
                  Link your account to your speech therapist so they can track your progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.linked_therapist_id ? (
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Followed by:</p>
                        <p className="text-lg font-semibold text-green-700 dark:text-green-400">
                          {linkedTherapist?.full_name || "Your speech therapist"}
                        </p>
                        {!!linkedTherapist?.therapist_code && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Code: {linkedTherapist.therapist_code}
                          </p>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleUnlinkTherapist}
                        className="text-red-600 hover:text-red-700 hover:bg-red-100"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Unlink
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                      <p className="text-sm text-muted-foreground mb-3">
                        Enter the code provided by your speech therapist:
                      </p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="PRO-XXXXXX"
                          value={therapistCode}
                          onChange={(e) => setTherapistCode(e.target.value.toUpperCase())}
                          className="font-mono"
                        />
                        <Button 
                          onClick={handleLinkTherapist} 
                          disabled={linkingTherapist || !therapistCode.trim()}
                        >
                          {linkingTherapist ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Therapist Pro Code Card - High Visibility for Therapists */}
          {profile.is_therapist && profile.therapist_code && (
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-chart-2/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <span className="text-2xl">🔑</span>
                  Your Pro Code
                </CardTitle>
                <CardDescription>
                  Share this code with your patients so they can add it to their account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <code className="flex-1 text-3xl font-mono font-bold text-primary bg-primary/10 px-6 py-4 rounded-xl text-center tracking-widest">
                    {profile.therapist_code}
                  </code>
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 shrink-0"
                    onClick={async () => {
                      if (profile.therapist_code) {
                        const success = await copyToClipboard(profile.therapist_code);
                        if (success) {
                          toast.success("Code copied!");
                        } else {
                          toast.error("Failed to copy");
                        }
                      }
                    }}
                  >
                    <Check className="w-4 h-4" />
                    Copy
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  👉 Your patients must enter this code when creating their account.
                  You will then see their results in your dashboard.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Invite Patients Card - Only for therapists */}
          {profile.is_therapist && profile.therapist_code && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Invite your patients
                </CardTitle>
                <CardDescription>
                  Send a pre-written email explaining the platform and your Pro Code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="default"
                    className="gap-2"
                    onClick={() => {
                      const subject = encodeURIComponent("Your at-home practice tool");
                      const body = encodeURIComponent(`Hello,

To complement our sessions and accelerate your progress, I'd like you to use the ClutterPro app.

It's an interactive tool designed to help you practice daily:

- Guided Mode: A highlighter guides you word by word at the ideal pace.
- Audio Analysis: Visualize your pauses and accelerations after each exercise.
- Guided Exercises: Access a library of texts directly on your phone.
- Remote Tracking: By linking your account to mine, I can monitor your exercises.

To get started:

1. Go to https://www.clutterpro.com
2. Create your free account with my Pro Code: ${profile.therapist_code}

See you soon!`);
                      window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
                      toast.success("Email client opened!");
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Mail
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={async () => {
                      const emailTemplate = `Subject: Your at-home practice tool

Hello,

To complement our sessions and accelerate your progress, I'd like you to use the ClutterPro app.

It's an interactive tool designed to help you practice daily:

- Guided Mode: A highlighter guides you word by word at the ideal pace to build good habits.

- Waveform Analysis: After each exercise, visualize your pauses and accelerations to understand your speech rate.

- Guided Exercises: Access a library of texts (slow reading, articulation) directly on your phone.

- Remote Tracking: By linking your account to mine, I can listen to your exercises and coach you between appointments.

Getting started is simple:

1. Go to https://www.clutterpro.com
2. Create your free account with my Pro Code: ${profile.therapist_code}

See you soon!`;
                      const success = await copyToClipboard(emailTemplate);
                      if (success) {
                        toast.success("Email template copied!");
                      } else {
                        toast.error("Failed to copy");
                      }
                    }}
                  >
                    <Copy className="w-4 h-4" />
                    Copy email template
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  The email contains your Pro Code and guides the patient step by step to create their account.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Role display - informational only (no toggle) */}
          {profile.is_therapist && (
            <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/10 dark:to-violet-900/10">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <span className="text-xl">🩺</span>
                  SLP Account
                </CardTitle>
                <CardDescription>
                  Your account is configured as a professional
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Subscription Status Card - Only for therapists */}
          {profile.is_therapist && (() => {
            const trialEndDate = profile.trial_end_date ? new Date(profile.trial_end_date) : null;
            const trialStartDate = profile.trial_start_date ? new Date(profile.trial_start_date) : null;
            const now = new Date();
            const fallbackDaysSinceStart = trialStartDate
              ? Math.floor((now.getTime() - trialStartDate.getTime()) / (1000 * 60 * 60 * 24))
              : 0;
            const daysRemaining = trialEndDate
              ? Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
              : trialStartDate
                ? Math.max(0, 30 - fallbackDaysSinceStart)
                : 30;
            const isTrialExpired = trialEndDate
              ? trialEndDate <= now
              : trialStartDate
                ? fallbackDaysSinceStart >= 30
                : false;
            const isSubscriptionActive = profile.subscription_status === 'active' || profile.is_premium;
            const isOnTrial = profile.subscription_plan === 'trial' && !isTrialExpired;

            if (isSubscriptionActive) {
              return (
                <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/10 dark:to-emerald-900/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <CreditCard className="w-5 h-5" />
                      Active subscription
                    </CardTitle>
                    <CardDescription>
                      Your subscription is active. Thank you for your trust!
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/pro/subscription/manage")}
                      className="w-full"
                    >
                      Manage my subscription
                    </Button>
                  </CardContent>
                </Card>
              );
            }

            if (isOnTrial) {
              return (
                <Card className={`border-2 ${daysRemaining <= 7 ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-900/10' : 'border-blue-200 bg-blue-50/50 dark:bg-blue-900/10'}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className={`flex items-center gap-2 ${daysRemaining <= 7 ? 'text-amber-700 dark:text-amber-300' : 'text-blue-700 dark:text-blue-300'}`}>
                      <Clock className="w-5 h-5" />
                      Trial period
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      {daysRemaining <= 7 ? (
                        <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                          <AlertTriangle className="w-4 h-4" />
                          Only {daysRemaining} day{daysRemaining > 1 ? 's' : ''} left in trial
                        </span>
                      ) : (
                        <span>You have <strong className="text-foreground">{daysRemaining} days</strong> left in your free trial</span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all ${daysRemaining <= 7 ? 'bg-amber-500' : 'bg-blue-500'}`}
                        style={{ width: `${((30 - daysRemaining) / 30) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      At the end of your trial, your patients will lose access to their exercises and you will no longer be able to view their data.
                    </p>
                    <Button
                      onClick={() => navigate("/pro/subscribe")}
                      className="w-full gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Subscribe now
                    </Button>
                  </CardContent>
                </Card>
              );
            }

            if (isTrialExpired && !isSubscriptionActive) {
              return (
                <Card className="border-2 border-red-400 bg-red-50/50 dark:bg-red-900/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                      <AlertTriangle className="w-5 h-5" />
                      Trial expired
                    </CardTitle>
                    <CardDescription className="text-red-600 dark:text-red-400">
                      Your trial period has ended
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Your patients no longer have access to their exercises. Reactivate your account to restore access.
                    </p>
                    <Button
                      onClick={() => navigate("/pro/subscribe")}
                      className="w-full gap-2 bg-red-600 hover:bg-red-700"
                    >
                      <CreditCard className="w-4 h-4" />
                      Reactivate my account
                    </Button>
                  </CardContent>
                </Card>
              );
            }

            return null;
          })()}

          {/* Marketing Kit - Only for therapists */}
          {profile.is_therapist && (
            <TherapistMarketingKit />
          )}

          {/* Referral Card for solo patients */}
          {!profile.is_therapist && !profile.linked_therapist_id && (
            <PatientReferralCard />
          )}

          {/* Subscription management for solo B2C patients */}
          {!profile.is_therapist && !profile.linked_therapist_id && (profile.subscription_status === 'active' || profile.subscription_plan === 'b2c') && (
            <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/10 dark:to-emerald-900/10">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CreditCard className="w-5 h-5" />
                  Solo Patient Subscription
                </CardTitle>
                <CardDescription>
                  Your subscription is active — $9/mo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/subscription/manage")}
                  className="w-full"
                >
                  Manage my subscription
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Support Card - Simplified for B2B model */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Headphones className="w-5 h-5" />
                Support
              </CardTitle>
              <CardDescription>
                Need help? Contact our team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Have a question? Our team is here to help.
                </p>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <code className="text-sm font-medium flex-1">support@clutterpro.com</code>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="shrink-0"
                    onClick={async () => {
                      const success = await copyToClipboard("support@clutterpro.com");
                      if (success) {
                        toast.success("Email copied!");
                      } else {
                        toast.error("Failed to copy");
                      }
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleSave} disabled={saving} className="flex-1 gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="flex-1">
              Sign out
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Settings;
