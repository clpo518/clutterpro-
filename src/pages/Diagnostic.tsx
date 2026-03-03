import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, ArrowRight, ArrowLeft, RotateCcw, ChevronRight, Activity, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useDeepgramSPS } from "@/hooks/useDeepgramSPS";
import { useVolumeAnalyzer } from "@/hooks/useVolumeAnalyzer";
import { getNormSPS, getAgeGroupLabel, validateBirthYear, getAgeGroup } from "@/lib/ageNormsUtils";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const DURATION_SECONDS = 30;
const MIN_DURATION = 15;

// --- Interpretations cliniques adaptées au diagnostic ---
function getDiagnosticInterpretation(avgSps: number, normSps: number) {
  const diff = avgSps - normSps;

  if (diff > 1.0) {
    return {
      title: "Fast speech rate",
      emoji: "⚡",
      description: `Your rate of ${avgSps.toFixed(1)} syll/sec is significantly above the average for your age (${normSps.toFixed(1)} syll/sec). This may be a sign of cluttering or tachylalia.`,
      detail: "Regular training can help you better control your speech rate and gain clarity.",
      severity: "high" as const,
    };
  }
  if (diff > 0) {
    return {
      title: "Slightly fast",
      emoji: "🔶",
      description: `Your rate of ${avgSps.toFixed(1)} syll/sec is slightly above the norm (${normSps.toFixed(1)} syll/sec).`,
      detail: "With a few targeted exercises, you can gain clarity and speaking comfort.",
      severity: "medium" as const,
    };
  }
  if (diff >= -0.5) {
    return {
      title: "Normal rate",
      emoji: "✅",
      description: `Your rate of ${avgSps.toFixed(1)} syll/sec is within the norm for your age (${normSps.toFixed(1)} syll/sec).`,
      detail: "You can still train to gain confidence in varied speaking situations.",
      severity: "normal" as const,
    };
  }
  return {
    title: "Controlled rate",
    emoji: "🐢",
    description: `Your rate of ${avgSps.toFixed(1)} syll/sec is below the norm (${normSps.toFixed(1)} syll/sec).`,
    detail: "The app can help you maintain this control and adapt to different speaking contexts.",
    severity: "normal" as const,
  };
}

// --- Volume visualisation bars ---
function VolumeBars({ volume }: { volume: number }) {
  const bars = 12;
  return (
    <div className="flex items-end justify-center gap-1 h-16">
      {Array.from({ length: bars }).map((_, i) => {
        const center = bars / 2;
        const distFromCenter = Math.abs(i - center) / center;
        const height = Math.max(8, volume * 64 * (1 - distFromCenter * 0.5) + Math.random() * 6);
        return (
          <motion.div
            key={i}
            className="w-1.5 rounded-full bg-primary"
            animate={{ height: `${height}px`, opacity: 0.4 + volume * 0.6 }}
            transition={{ duration: 0.08 }}
          />
        );
      })}
    </div>
  );
}

// --- Gauge for results ---
function ResultGauge({ value, norm, max = 8 }: { value: number; norm: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const normPct = Math.min((norm / max) * 100, 100);

  return (
    <div className="relative w-full h-6 bg-muted rounded-full overflow-hidden">
      {/* Norm marker */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
        style={{ left: `${normPct}%` }}
      />
      <div
        className="absolute -top-5 text-xs font-medium text-primary"
        style={{ left: `${normPct}%`, transform: "translateX(-50%)" }}
      >
        Norm
</div>
      {/* Value bar */}
      <motion.div
        className="h-full rounded-full"
        style={{
          background:
            value > norm + 1
              ? "hsl(var(--speed-critical))"
              : value > norm
              ? "hsl(var(--speed-fast))"
              : "hsl(var(--speed-calm))",
        }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </div>
  );
}

const pageVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

const Diagnostic = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [birthYear, setBirthYear] = useState("");
  const [birthYearError, setBirthYearError] = useState<string | null>(null);
  const [normSps, setNormSps] = useState(5.0);
  const [ageLabel, setAgeLabel] = useState("Adult");
  const [countdown, setCountdown] = useState(DURATION_SECONDS);
  const [isRecording, setIsRecording] = useState(false);
  const [showAnalyzing, setShowAnalyzing] = useState(false);
  const [finalSps, setFinalSps] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartRef = useRef<number>(0);
  const deepgramReadyRef = useRef<boolean>(false);
  const stoppingRef = useRef<boolean>(false);

  const deepgram = useDeepgramSPS();
  const volume = useVolumeAnalyzer();

  // --- Step 1: Validate birth year ---
  const handleBirthYearChange = (val: string) => {
    setBirthYear(val);
    setBirthYearError(null);
    const year = parseInt(val, 10);
    if (val.length === 4 && !isNaN(year)) {
      const validation = validateBirthYear(year);
      if (validation.valid) {
        setNormSps(getNormSPS(year));
        setAgeLabel(getAgeGroupLabel(year));
      } else {
        setBirthYearError(validation.error || null);
      }
    }
  };

  const canProceedStep1 = () => {
    const year = parseInt(birthYear, 10);
    if (isNaN(year) || birthYear.length !== 4) return false;
    return validateBirthYear(year).valid;
  };

  // --- Step 3: Recording ---
  const startRecording = useCallback(async () => {
    setMicError(null);
    deepgramReadyRef.current = false;
    stoppingRef.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      volume.startAnalyzing(stream);

      // Start deepgram — track success
      try {
        await deepgram.start(stream, { detectFillers: true });
        deepgramReadyRef.current = true;
      } catch (e) {
        console.warn("Deepgram init failed:", e);
        deepgramReadyRef.current = false;
      }

      setIsRecording(true);
      recordingStartRef.current = Date.now();
      setCountdown(DURATION_SECONDS);

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartRef.current) / 1000);
        const remaining = Math.max(0, DURATION_SECONDS - elapsed);
        setCountdown(remaining);
        if (remaining <= 0) {
          stopRecording();
        }
      }, 250);
    } catch (err) {
      console.error("Mic access error:", err);
      setMicError("Cannot access microphone. Check your browser permissions and try again.");
    }
  }, [deepgram, volume]);

  // Use a ref to always access the latest deepgram values
  const deepgramRef = useRef(deepgram);
  deepgramRef.current = deepgram;

  const stopRecording = useCallback(() => {
    // Prevent double-stop
    if (stoppingRef.current) return;
    stoppingRef.current = true;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    volume.stopAnalyzing();
    deepgramRef.current.stop();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsRecording(false);

    // If deepgram never connected, skip analysis and show error
    if (!deepgramReadyRef.current) {
      setFinalSps(0);
      setStep(4);
      return;
    }

    // Show analyzing animation then results
    setShowAnalyzing(true);
    setTimeout(() => {
      const dg = deepgramRef.current;
      // Calculate average SPS from history
      const history = dg.spsHistory.filter((s) => s > 0);
      const totalSyllables = dg.syllableCount;
      const speakingTime = dg.actualSpeakingTime;

      let avg = 0;
      if (speakingTime > 0 && totalSyllables > 0) {
        avg = Math.round((totalSyllables / speakingTime) * 10) / 10;
      } else if (history.length > 0) {
        avg = Math.round((history.reduce((a, b) => a + b, 0) / history.length) * 10) / 10;
      }

      setFinalSps(avg);
      setShowAnalyzing(false);
      setStep(4);
    }, 1800);
  }, [volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const elapsedSeconds = DURATION_SECONDS - countdown;
  const canStop = elapsedSeconds >= MIN_DURATION;

  const interpretation = getDiagnosticInterpretation(finalSps, normSps);

  const resetDiagnostic = () => {
    deepgram.reset();
    stoppingRef.current = false;
    deepgramReadyRef.current = false;
    setStep(1);
    setBirthYear("");
    setCountdown(DURATION_SECONDS);
    setFinalSps(0);
    setMicError(null);
    setShowAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-12 px-4">
        <div className="max-w-xl mx-auto">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step ? "w-8 bg-primary" : s < step ? "w-6 bg-primary/40" : "w-6 bg-muted"
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ========== STEP 1: Age ========== */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardContent className="p-6 md:p-8 space-y-6">
                    <div className="text-center space-y-2">
                      <div className="text-3xl">🎙️</div>
                      <h1 className="text-2xl font-bold text-foreground">Free voice test</h1>
                      <p className="text-muted-foreground">
                        Measure your speech rate in 30 seconds.
                        <br />
                        Instant result, no sign-up required.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="birthYear" className="text-sm font-medium">
                        Year of birth
                      </Label>
                      <Input
                        id="birthYear"
                        type="number"
                        placeholder="e.g. 1995"
                        value={birthYear}
                        onChange={(e) => handleBirthYearChange(e.target.value)}
                        className="text-center text-lg"
                        min={1920}
                        max={new Date().getFullYear() - 5}
                      />
                      {birthYearError && (
                        <p className="text-sm text-destructive">{birthYearError}</p>
                      )}
                      <p className="text-xs text-muted-foreground text-center">
                        This helps calibrate the analysis to your age profile.
                      </p>
                    </div>

                    {canProceedStep1() && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-secondary rounded-lg p-4 text-center space-y-1"
                      >
                        <p className="text-sm font-medium text-foreground">
                          {getAgeGroup(parseInt(birthYear)).emoji} Profile: {ageLabel}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Clinical norm: <span className="font-semibold text-primary">{normSps} syll/sec</span>
                        </p>
                      </motion.div>
                    )}

                    <Button
                      onClick={() => setStep(2)}
                      disabled={!canProceedStep1()}
                      className="w-full"
                      size="lg"
                    >
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ========== STEP 2: Preparation ========== */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardContent className="p-6 md:p-8 space-y-6">
                    <div className="text-center space-y-2">
                      <div className="text-3xl">📋</div>
                      <h2 className="text-xl font-bold text-foreground">How it works</h2>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</div>
                        <div>
                          <p className="font-medium text-foreground">You will speak freely for 30 seconds</p>
                          <p className="text-sm text-muted-foreground">No text to read, no tricks.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</div>
                        <div>
                          <p className="font-medium text-foreground">Tell us something</p>
                          <p className="text-sm text-muted-foreground">
                            Your last vacation, a happy memory, or what you did this weekend.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">3</div>
                        <div>
                          <p className="font-medium text-foreground">We measure your speech rate</p>
                          <p className="text-sm text-muted-foreground">
                            In syllables per second — the measure used in speech-language pathology.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-accent/50 rounded-lg p-4 flex items-start gap-3">
                      <Shield className="h-5 w-5 text-accent-foreground mt-0.5 shrink-0" />
                      <p className="text-sm text-accent-foreground">
                        Your audio is never recorded or stored. The analysis is instant and confidential.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep(1)} className="flex-shrink-0">
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => { setStep(3); startRecording(); }} className="flex-1" size="lg">
                        <Mic className="mr-2 h-4 w-4" /> I'm ready
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ========== STEP 3: Recording ========== */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardContent className="p-6 md:p-8 space-y-6">
                    {micError ? (
                      <div className="text-center space-y-4">
                        <div className="text-4xl">🎤</div>
                        <p className="text-destructive font-medium">{micError}</p>
                        <p className="text-sm text-muted-foreground">
                          Allow microphone access in your browser settings, then try again.
                        </p>
                        <Button onClick={() => { setMicError(null); startRecording(); }}>
                          Try again
                        </Button>
                      </div>
                    ) : showAnalyzing ? (
                      <div className="text-center space-y-4 py-8">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        >
                          <Activity className="h-10 w-10 text-primary mx-auto" />
                        </motion.div>
                        <p className="text-lg font-medium text-foreground">Analyzing...</p>
                        <p className="text-sm text-muted-foreground">Calculating your speech rate</p>
                      </div>
                    ) : (
                      <>
                        <div className="text-center space-y-2">
                          <motion.div
                            className="text-5xl font-bold tabular-nums text-primary"
                            key={countdown}
                            initial={{ scale: 1.15, opacity: 0.7 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            {countdown}
                          </motion.div>
                          <p className="text-sm text-muted-foreground">seconds remaining</p>
                        </div>

                        {/* Volume animation */}
                        <VolumeBars volume={volume.volumeLevel} />

                        {/* Recording indicator */}
                        <div className="flex items-center justify-center gap-2">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {volume.isSpeaking ? "Great, keep going..." : "Speak naturally..."}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <Progress value={(elapsedSeconds / DURATION_SECONDS) * 100} className="h-2" />

                        <Button
                          onClick={stopRecording}
                          variant="outline"
                          disabled={!canStop}
                          className="w-full"
                        >
                          {canStop
                            ? "Finish the test"
                            : `${MIN_DURATION - elapsedSeconds}s more minimum...`}
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ========== STEP 4: Results ========== */}
            {step === 4 && (
              <motion.div
                key="step4"
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardContent className="p-6 md:p-8 space-y-6">
                    {finalSps === 0 ? (
                      /* No speech detected */
                      <div className="text-center space-y-4">
                        <div className="text-4xl">🤔</div>
                        <h2 className="text-xl font-bold text-foreground">No speech detected</h2>
                        <p className="text-muted-foreground">
                          We didn't detect any speech. Check your microphone and try again.
                        </p>
                        <Button onClick={resetDiagnostic}>
                          <RotateCcw className="mr-2 h-4 w-4" /> Try again
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="text-center space-y-1">
                          <div className="text-4xl">{interpretation.emoji}</div>
                          <h2 className="text-xl font-bold text-foreground">{interpretation.title}</h2>
                        </div>

                        {/* Big SPS number */}
                        <div className="text-center">
                          <motion.div
                            className="text-5xl font-bold text-primary"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", duration: 0.6 }}
                          >
                            {finalSps.toFixed(1)}
                          </motion.div>
                          <p className="text-sm text-muted-foreground mt-1">syllables / second</p>
                        </div>

                        {/* Gauge */}
                        <div className="pt-4">
                          <ResultGauge value={finalSps} norm={normSps} />
                          <div className="flex justify-between text-xs text-muted-foreground mt-2">
                            <span>Slow</span>
                            <span>Your norm: {normSps} syll/s ({ageLabel})</span>
                            <span>Fast</span>
                          </div>
                        </div>

                        {/* Interpretation */}
                        <div className="bg-secondary rounded-lg p-4 space-y-2">
                          <p className="text-sm text-foreground">{interpretation.description}</p>
                          <p className="text-sm text-muted-foreground">{interpretation.detail}</p>
                        </div>

                        {/* Filler words */}
                        {deepgram.fillerCount > 0 && (
                          <div className="bg-accent/50 rounded-lg p-4">
                            <p className="text-sm text-accent-foreground">
                              <span className="font-medium">Filler words detected: {deepgram.fillerCount}</span>
                              {" — "}
                              {Object.entries(deepgram.fillerDetails)
                                .map(([word, count]) => `"${word}" (${count}×)`)
                                .join(", ")}
                            </p>
                          </div>
                        )}

                        {/* CTAs */}
                        <div className="space-y-3 pt-2">
                          <Button
                            onClick={() => navigate("/auth")}
                            className="w-full"
                            size="lg"
                          >
                            Start my training <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => navigate("/assessment")}
                            variant="outline"
                            className="w-full"
                          >
                            Take the written test too
                          </Button>
                          <p className="text-center text-xs text-muted-foreground">
                            Free · 5 minutes a day · Results in 2 weeks
                          </p>
                        </div>

                        <div className="text-center">
                          <button
                            onClick={resetDiagnostic}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
                          >
                            <RotateCcw className="inline h-3 w-3 mr-1" />
                            Retake the test
                          </button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Diagnostic;
