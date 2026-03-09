import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, ArrowLeft, Loader2, User, Stethoscope, KeyRound, Zap, ArrowRight, Clock, Mail, RefreshCw, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { checkEmailDomainTypo, type EmailSuggestion } from "@/lib/emailValidation";

type UserRole = "patient" | "therapist";
type PatientMode = "choose" | "code" | "solo";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab");
  const referralCode = searchParams.get("ref");
  const [isLogin, setIsLogin] = useState(initialTab !== "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [cabinetName, setCabinetName] = useState("");
  const [therapistCode, setTherapistCode] = useState("");
  const [therapistCodeError, setTherapistCodeError] = useState("");
  const [validatingCode, setValidatingCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [resendingVerification, setResendingVerification] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("patient");
  const [patientMode, setPatientMode] = useState<PatientMode>("choose");
  const [emailSuggestion, setEmailSuggestion] = useState<EmailSuggestion | null>(null);
  const [bypassSuggestion, setBypassSuggestion] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Reset patient mode when switching tabs
  useEffect(() => {
    setPatientMode("choose");
    setTherapistCode("");
    setTherapistCodeError("");
  }, [selectedRole, isLogin]);

  // Validate therapist code format
  const validateTherapistCodeFormat = (code: string): boolean => {
    return /^PRO-[A-Z0-9]{6}$/i.test(code.trim());
  };

  // Verify therapist code exists in database
  const verifyTherapistCode = async (code: string): Promise<{ valid: boolean; therapistId: string | null }> => {
    try {
      const { data, error } = await supabase
        .rpc("find_therapist_by_code", { code: code.trim() });
      
      if (error) throw error;
      
      const therapist = data?.[0];
      return {
        valid: !!therapist,
        therapistId: therapist?.id || null
      };
    } catch (error) {
      console.error("Error verifying therapist code:", error);
      return { valid: false, therapistId: null };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTherapistCodeError("");

    // Email domain typo check (only on signup, skip if user already bypassed)
    if (!isLogin && !bypassSuggestion) {
      const suggestion = checkEmailDomainTypo(email);
      if (suggestion.hasSuggestion) {
        setEmailSuggestion(suggestion);
        setLoading(false);
        return;
      }
    }
    setEmailSuggestion(null);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success("Logged in successfully!");
        navigate("/dashboard");
      } else {
        // Patient signup
        if (selectedRole === "patient") {
          if (patientMode === "code") {
            // B2B flow: validate code
            if (!therapistCode.trim()) {
              setTherapistCodeError("Pro Code is required");
              setLoading(false);
              return;
            }

            if (!validateTherapistCodeFormat(therapistCode)) {
              setTherapistCodeError("Invalid format (e.g. PRO-ABC123)");
              setLoading(false);
              return;
            }

            setValidatingCode(true);
            const { valid, therapistId } = await verifyTherapistCode(therapistCode);
            setValidatingCode(false);

            if (!valid || !therapistId) {
              setTherapistCodeError("Invalid or non-existent Pro Code");
              setLoading(false);
              return;
            }

            // B2B signup
            const { error } = await signUp(email, password, name, false, false);
            if (error) throw error;

            // Link patient to therapist
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const { data: { user: newUser } } = await supabase.auth.getUser();
            if (newUser) {
              await supabase
                .from("profiles")
                .update({ linked_therapist_id: therapistId })
                .eq("id", newUser.id);
            }

            toast.success("Account created successfully! You are now linked to your speech therapist.");
            navigate("/dashboard");
          } else if (patientMode === "solo") {
            // B2C solo signup - trial starts only after email verification
            const { error } = await signUp(email, password, name, false, true);
            if (error) throw error;

            // Handle B2C referral if present
            if (referralCode) {
              await new Promise(resolve => setTimeout(resolve, 1000));
              const { data: { user: newUser } } = await supabase.auth.getUser();
              if (newUser) {
                const { data: referrerProfile } = await supabase
                  .from("profiles")
                  .select("id")
                  .eq("referral_code", referralCode.toUpperCase())
                  .maybeSingle();
                
                if (referrerProfile) {
                  await supabase
                    .from("referrals")
                    .insert({
                      referrer_id: referrerProfile.id,
                      referred_id: newUser.id,
                      status: "pending"
                    });
                }
              }
            }

            // Send verification email
            await supabase.auth.resend({ type: 'signup', email });

            // Show verification screen instead of navigating
            setVerificationEmail(email);
            setEmailVerificationSent(true);
            setLoading(false);
            return; // Don't navigate, show verification screen
          }
        } else {
          // Therapist signup
          const { error } = await signUp(email, password, cabinetName, true);
          if (error) throw error;

          // Handle referral if present
          if (referralCode) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const { data: { user: newUser } } = await supabase.auth.getUser();
            if (newUser) {
              const { data: referrerProfile } = await supabase
                .from("profiles")
                .select("id")
                .eq("referral_code", referralCode.toUpperCase())
                .maybeSingle();
              
              if (referrerProfile) {
                await supabase
                  .from("referrals")
                  .insert({
                    referrer_id: referrerProfile.id,
                    referred_id: newUser.id,
                    status: "pending"
                  });
                
                toast.success("Pro workspace created! Your referrer and you will each receive 1 free month after your first payment.");
              } else {
                toast.success("Pro workspace created successfully!");
              }
            }
          } else {
            toast.success("Pro workspace created successfully!");
          }
          
          navigate("/patient/list");
        }
      }
    } catch (error: unknown) {
      const rawMessage = error instanceof Error ? error.message : "An error occurred";
      
      // Provide clearer French error messages for login
      if (isLogin) {
        const lower = rawMessage.toLowerCase();
        if (lower.includes("invalid login credentials") || lower.includes("invalid_credentials")) {
          toast.error("Incorrect email or password. Don't have an account? Click \"Sign up\".");
        } else if (lower.includes("email not confirmed")) {
          toast.error("Your email has not been verified yet. Check your inbox.");
        } else {
          toast.error(rawMessage);
        }
      } else {
        // Signup errors
        const lower = rawMessage.toLowerCase();
        if (lower.includes("user already registered") || lower.includes("already been registered")) {
          toast.error("An account already exists with this email. Try logging in.");
        } else {
          toast.error(rawMessage);
        }
      }
    } finally {
      setLoading(false);
      setValidatingCode(false);
    }
  };

  // Check if form can be submitted
  const canSubmit = () => {
    if (isLogin) return true;
    if (selectedRole === "therapist") return true;
    // Patient must choose a mode
    return patientMode !== "choose";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/30 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }} 
        className="w-full max-w-md"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to home
        </Link>

        {/* Demo accounts */}
        <div className="mb-4 p-3 rounded-xl border border-dashed border-amber-400 bg-amber-50 dark:bg-amber-900/20">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-2">🧪 Demo accounts</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                const { error } = await signIn("demo@patient.com", "demo123");
                if (!error) navigate("/dashboard");
                setLoading(false);
              }}
              className="flex-1 text-xs py-1.5 px-2 rounded-lg bg-white dark:bg-zinc-800 border border-amber-300 hover:bg-amber-50 dark:hover:bg-zinc-700 transition-colors font-medium"
            >
              Patient demo
            </button>
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                const { error } = await signIn("demo@slp.com", "demo123");
                if (!error) navigate("/dashboard");
                setLoading(false);
              }}
              className="flex-1 text-xs py-1.5 px-2 rounded-lg bg-white dark:bg-zinc-800 border border-amber-300 hover:bg-amber-50 dark:hover:bg-zinc-700 transition-colors font-medium"
            >
              Therapist demo
            </button>
          </div>
        </div>

        <Card className="shadow-2xl border-border/50">
          <CardHeader className="text-center pb-2">
            {!emailVerificationSent && (
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 transition-colors ${
                selectedRole === "therapist" && !isLogin 
                  ? "bg-purple-600" 
                  : "bg-primary"
              }`}>
                {selectedRole === "therapist" && !isLogin ? (
                  <Stethoscope className="w-8 h-8 text-white" />
                ) : (
                  <Activity className="w-8 h-8 text-primary-foreground" />
                )}
              </div>
            )}
            {!emailVerificationSent && (
              <>
                <CardTitle className="text-2xl">
                  {forgotPassword
                    ? "Reset password"
                    : isLogin ? "Welcome back!" : "Create account"}
                </CardTitle>
                <CardDescription>
                  {forgotPassword
                    ? "Receive a link by email to create a new password"
                    : isLogin
                      ? "Patient or therapist, same login"
                      : selectedRole === "patient"
                        ? patientMode === "solo"
                          ? "Start with a 7-day free trial"
                          : "Start your journey to better speech fluency"
                        : "Create your professional monitoring workspace"
                  }
                </CardDescription>
              </>
            )}
          </CardHeader>
          
          <CardContent className="max-h-[70vh] overflow-y-auto">
            {/* Email Verification Sent Screen (Solo only) */}
            {emailVerificationSent && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4 py-4"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Check your email</h3>
                <p className="text-sm text-muted-foreground">
                  A verification email has been sent to{" "}
                  <strong className="text-foreground">{verificationEmail}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Click the link in the email to activate your 7-day free trial.
                </p>

                <div className="pt-2 space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={resendingVerification}
                    onClick={async () => {
                      setResendingVerification(true);
                      try {
                        const { error } = await supabase.auth.resend({ type: 'signup', email: verificationEmail });
                        if (error) throw error;
                        toast.success("Email resent! Check your inbox.");
                      } catch {
                        toast.error("Unable to resend email. Please try again in a moment.");
                      } finally {
                        setResendingVerification(false);
                      }
                    }}
                  >
                    {resendingVerification ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Resend email
                      </>
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmailVerificationSent(false);
                      setIsLogin(true);
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    Back to login
                  </button>
                </div>
              </motion.div>
            )}
            {/* Role Selection Tabs (only for signup) */}
            {!isLogin && !forgotPassword && !emailVerificationSent && (
              <Tabs 
                value={selectedRole} 
                onValueChange={(v) => setSelectedRole(v as UserRole)}
                className="mb-6"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="patient" className="gap-2">
                    <User className="w-4 h-4" />
                    Patient
                  </TabsTrigger>
                  <TabsTrigger value="therapist" className="gap-2">
                    <Stethoscope className="w-4 h-4" />
                    Therapist
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {/* Patient Mode Selector (only for patient signup) */}
            {!isLogin && !forgotPassword && !emailVerificationSent && selectedRole === "patient" && patientMode === "choose" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 mb-6"
              >
                <p className="text-sm font-medium text-center text-muted-foreground mb-4">
                  How would you like to sign up?
                </p>
                
                {/* Option A: With Pro Code (B2B) */}
                <button
                  type="button"
                  onClick={() => setPatientMode("code")}
                  className="w-full p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <KeyRound className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">I have a Pro Code</h3>
                      <p className="text-xs text-muted-foreground">
                        My speech therapist gave me a code (PRO-XXXXXX) to link to their practice
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground mt-1 group-hover:text-primary transition-colors" />
                  </div>
                </button>

                {/* Option B: Solo (B2C) */}
                <button
                  type="button"
                  onClick={() => setPatientMode("solo")}
                  className="w-full p-4 rounded-xl border-2 border-border hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors">
                      <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">Sign up on my own</h3>
                      <p className="text-xs text-muted-foreground">
                        7-day free trial, then individual subscription
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground mt-1 group-hover:text-amber-500 transition-colors" />
                  </div>
                </button>
              </motion.div>
            )}

            {/* Registration Form (shown when mode is chosen or for login/therapist) */}
            {!forgotPassword && !emailVerificationSent && (isLogin || selectedRole === "therapist" || patientMode !== "choose") && (
              <motion.div
                initial={!isLogin && selectedRole === "patient" ? { opacity: 0, y: 8 } : false}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Back button to mode chooser */}
                {!isLogin && selectedRole === "patient" && patientMode !== "choose" && (
                  <button
                    type="button"
                    onClick={() => {
                      setPatientMode("choose");
                      setTherapistCode("");
                      setTherapistCodeError("");
                    }}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Change mode
                  </button>
                )}

                {/* Solo trial badge */}
                {!isLogin && selectedRole === "patient" && patientMode === "solo" && (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                        Free trial — 7 days of full access
                      </span>
                    </div>
                    <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1 ml-6">
                      You can link a speech therapist later in Settings
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {selectedRole === "therapist" ? "Practice / Clinician name" : "Full name"}
                      </Label>
                      {selectedRole === "patient" ? (
                        <Input 
                          id="name" 
                          type="text" 
                          placeholder="John Smith" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                          required={!isLogin && selectedRole === "patient"} 
                          className="h-12 rounded-xl" 
                        />
                      ) : (
                        <Input 
                          id="cabinet" 
                          type="text" 
                          placeholder="Smith Speech Therapy" 
                          value={cabinetName} 
                          onChange={(e) => setCabinetName(e.target.value)} 
                          required={!isLogin && selectedRole === "therapist"} 
                          className="h-12 rounded-xl" 
                        />
                      )}
                    </div>
                  )}

                  {/* Therapist Code Field - Only for Patient signup with code mode */}
                  {!isLogin && selectedRole === "patient" && patientMode === "code" && (
                    <div className="space-y-2">
                      <Label htmlFor="therapist-code" className="flex items-center gap-2">
                        Pro Code
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input 
                        id="therapist-code" 
                        type="text" 
                        placeholder="PRO-XXXXXX" 
                        value={therapistCode} 
                        onChange={(e) => {
                          setTherapistCode(e.target.value.toUpperCase());
                          setTherapistCodeError("");
                        }} 
                        required
                        className={`h-12 rounded-xl font-mono ${therapistCodeError ? 'border-destructive' : ''}`}
                      />
                      {therapistCodeError && (
                        <p className="text-sm text-destructive">{therapistCodeError}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Given by your speech therapist to activate your monitoring
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="john@example.com" 
                      value={email} 
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailSuggestion(null);
                        setBypassSuggestion(false);
                      }} 
                      required 
                      className="h-12 rounded-xl" 
                    />
                    {emailSuggestion?.hasSuggestion && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700"
                      >
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                          <div className="flex-1 text-sm">
                            <p className="text-amber-800 dark:text-amber-200">
                              Did you mean <strong>{emailSuggestion.suggestedDomain}</strong>?
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Button
                                type="button"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => {
                                  setEmail(emailSuggestion.suggestedEmail);
                                  setEmailSuggestion(null);
                                  setBypassSuggestion(false);
                                }}
                              >
                                Fix it
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => {
                                  setEmailSuggestion(null);
                                  setBypassSuggestion(true);
                                }}
                              >
                                Continue anyway
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      minLength={6} 
                      className="h-12 rounded-xl" 
                    />
                    {isLogin && (
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => setForgotPassword(true)}
                          className="text-xs text-primary hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    type="submit" 
                    className={`w-full h-12 rounded-xl text-base transition-colors ${
                      selectedRole === "therapist" && !isLogin 
                        ? "bg-purple-600 hover:bg-purple-700 text-white" 
                        : ""
                    }`}
                    disabled={loading || validatingCode || !canSubmit()}
                  >
                    {loading || validatingCode ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isLogin ? (
                      "Log in"
                    ) : selectedRole === "patient" ? (
                      patientMode === "solo" ? "Start my free trial" : "Create my patient account"
                    ) : (
                      "Create my Pro workspace"
                    )}
                  </Button>

                  {/* Security reassurance */}
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    Secure & confidential health data
                  </p>
                </form>
              </motion.div>
            )}
            
            {/* Therapist benefits hint */}
            {!isLogin && !emailVerificationSent && selectedRole === "therapist" && (
              <div className="mt-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <p className="text-xs text-purple-700 dark:text-purple-300 text-center">
                  Receive your <strong>unique Pro Code</strong> to link your patients and track their progress remotely.
                </p>
              </div>
            )}
            
            {/* Forgot Password Form */}
            {forgotPassword && !emailVerificationSent && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <button
                  type="button"
                  onClick={() => { setForgotPassword(false); setResetEmailSent(false); }}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back to login
                </button>

                {resetEmailSent ? (
                  <div className="text-center space-y-3 py-4">
                    <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                      <Activity className="w-7 h-7 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold">Email sent!</h3>
                    <p className="text-sm text-muted-foreground">
                      If an account exists with this address, you will receive a link to reset your password.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setLoading(true);
                    try {
                      const { error } = await supabase.auth.resetPasswordForEmail(email, {
                        redirectTo: `${window.location.origin}/auth/reset-password`,
                      });
                      if (error) throw error;
                      setResetEmailSent(true);
                    } catch (error: unknown) {
                      const message = error instanceof Error ? error.message : "An error occurred";
                      toast.error(message);
                    } finally {
                      setLoading(false);
                    }
                  }} className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Enter your email address to receive a reset link.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <Button type="submit" className="w-full h-12 rounded-xl" disabled={loading}>
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send reset link"}
                    </Button>
                  </form>
                )}
              </motion.div>
            )}

            {!emailVerificationSent && (
              <div className="mt-6 text-center">
                <button 
                  type="button" 
                  onClick={() => { setIsLogin(!isLogin); setForgotPassword(false); setResetEmailSent(false); }} 
                  className="text-primary hover:underline text-sm"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
