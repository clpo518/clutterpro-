import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Play, Square, Timer, Wind, Volume2, VolumeX,
  RotateCcw, ChevronRight, Zap, Flower2, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useVolumeAnalyzer } from "@/hooks/useVolumeAnalyzer";
import { useGamification } from "@/hooks/useGamification";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ── Themes ────────────────────────────────────────────────────
type ThemeKey = "routine" | "memories" | "hobbies" | "imagination" | "mix";

const THEMES: { key: ThemeKey; label: string; icon: string }[] = [
  { key: "routine", label: "Routine", icon: "\u2600\uFE0F" },
  { key: "memories", label: "Memories", icon: "\u{1F4F8}" },
  { key: "hobbies", label: "Hobbies", icon: "\u{1F3AE}" },
  { key: "imagination", label: "Imagination", icon: "\u{1F308}" },
  { key: "mix", label: "Mix", icon: "\u{1F3B2}" },
];

const THEME_PROMPTS: Record<Exclude<ThemeKey, "mix">, string[]> = {
  routine: [
    "Describe what you did this morning.",
    "What does your typical lunch look like?",
    "Talk about your evening routine.",
    "How do you usually get to work or school?",
    "Describe your morning coffee or tea ritual.",
    "What's the first thing you do when you wake up?",
    "Describe a typical weekend morning.",
  ],
  memories: [
    "Describe a happy childhood memory.",
    "Talk about a teacher who influenced you.",
    "What's the best gift you've ever received?",
    "Describe a moment that changed your perspective.",
    "Talk about a family tradition you enjoy.",
    "Describe a place you visited that left a mark on you.",
    "Talk about your most memorable trip.",
  ],
  hobbies: [
    "Talk about a hobby you've picked up recently.",
    "Describe what you enjoy about your favorite activity.",
    "If you had a free Saturday, how would you spend it?",
    "Talk about a skill you'd love to learn.",
    "Describe something creative you've made.",
    "Describe your favorite home-cooked meal.",
    "What's a food you didn't like as a kid but enjoy now?",
  ],
  imagination: [
    "What's the best advice you've ever been given?",
    "Describe a book, movie, or show you recommend.",
    "What makes a good friend in your opinion?",
    "Talk about something that makes you optimistic.",
    "If you could change one thing about your city, what would it be?",
    "If you could have dinner with anyone, who would it be and why?",
    "Describe your ideal day ten years from now.",
  ],
};

// ── Difficulty levels ───────────────────────────────────────────
type Difficulty = "beginner" | "intermediate" | "advanced";

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; icon: string; rounds: number; silenceDurations: number[]; speakDuration: number; description: string; range: string }
> = {
  beginner: {
    label: "Beginner",
    icon: "\u{1F331}",
    rounds: 5,
    silenceDurations: [2, 2, 3, 3, 4],
    speakDuration: 20,
    description: "Short pauses",
    range: "2\u20134s",
  },
  intermediate: {
    label: "Intermediate",
    icon: "\u{1F3AF}",
    rounds: 6,
    silenceDurations: [3, 3, 4, 4, 5, 6],
    speakDuration: 15,
    description: "Moderate pauses",
    range: "3\u20136s",
  },
  advanced: {
    label: "Advanced",
    icon: "\u{1F3C6}",
    rounds: 7,
    silenceDurations: [4, 4, 5, 6, 6, 7, 8],
    speakDuration: 12,
    description: "Long pauses",
    range: "4\u20138s",
  },
};

type Phase = "silence" | "speak";
type TrainingMode = "classic" | "interruption";

interface RoundResult {
  question: string;
  silenceDuration: number;
  held: boolean; // true = silence maintained, false = spoke
}

// Interruption mode: user speaks freely, random pauses imposed
const INTERRUPTION_CONFIG: Record<Difficulty, { minSpeak: number; maxSpeak: number }> = {
  beginner: { minSpeak: 12, maxSpeak: 20 },
  intermediate: { minSpeak: 8, maxSpeak: 15 },
  advanced: { minSpeak: 5, maxSpeak: 12 },
};

// ── Component ───────────────────────────────────────────────────
const SilenceTraining = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const journeyStep = searchParams.get("journey_step");
  const exerciseId = searchParams.get("exercise");

  // Setup state
  const [mode, setMode] = useState<TrainingMode>("classic");
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>("routine");
  const [showIntro, setShowIntro] = useState(false);

  // Exercise state
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("silence");
  const [phaseTimer, setPhaseTimer] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [roundIndex, setRoundIndex] = useState(0);
  const [pausesRespected, setPausesRespected] = useState(0);
  const [pausesTotal, setPausesTotal] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);

  // Refs — use ref for spokeInSilence to avoid stale closures in setInterval
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const usedPromptsRef = useRef<Set<string>>(new Set());
  const completedRoundsRef = useRef(0);
  const spokeInSilenceRef = useRef(false);
  const currentPromptRef = useRef("");

  // Hooks
  const { volumeLevel, isSpeaking, startAnalyzing, stopAnalyzing } = useVolumeAnalyzer();
  const gamification = useGamification();
  const journey = useJourneyProgress();

  const targetRounds = DIFFICULTY_CONFIG[difficulty].rounds;

  // ── Estimated duration for progress bar ──────────────────────
  const estimatedDuration = useMemo(() => {
    const config = DIFFICULTY_CONFIG[difficulty];
    const silenceSum = config.silenceDurations.reduce((a, b) => a + b, 0);
    if (mode === "classic") {
      return silenceSum + config.speakDuration * targetRounds;
    }
    const ic = INTERRUPTION_CONFIG[difficulty];
    return silenceSum + ((ic.minSpeak + ic.maxSpeak) / 2) * targetRounds;
  }, [difficulty, mode, targetRounds]);

  // ── Prompt selection ────────────────────────────────────────
  const pickRandomPrompt = useCallback(() => {
    let pool: string[];
    if (selectedTheme === "mix") {
      pool = Object.values(THEME_PROMPTS).flat();
    } else {
      pool = THEME_PROMPTS[selectedTheme];
    }
    const available = pool.filter((p) => !usedPromptsRef.current.has(p));
    const finalPool = available.length > 0 ? available : pool;
    const picked = finalPool[Math.floor(Math.random() * finalPool.length)];
    usedPromptsRef.current.add(picked);
    return picked;
  }, [selectedTheme]);

  // ── Get silence duration for current round ──────────────────
  const getSilenceDuration = useCallback(() => {
    const durations = DIFFICULTY_CONFIG[difficulty].silenceDurations;
    return durations[roundIndex % durations.length];
  }, [difficulty, roundIndex]);

  // ── Random speak duration for interruption mode ─────────────
  const getInterruptionSpeakDuration = useCallback(() => {
    const { minSpeak, maxSpeak } = INTERRUPTION_CONFIG[difficulty];
    return Math.floor(Math.random() * (maxSpeak - minSpeak + 1)) + minSpeak;
  }, [difficulty]);

  // ── Start exercise ──────────────────────────────────────────
  const handleStart = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      startAnalyzing(stream);

      const startPhase = mode === "classic" ? "silence" : "speak";
      const startTimer = mode === "classic"
        ? getSilenceDuration()
        : getInterruptionSpeakDuration();

      const firstPrompt = pickRandomPrompt();
      setIsRunning(true);
      setPhase(startPhase);
      setPhaseTimer(startTimer);
      setTotalElapsed(0);
      setRoundIndex(0);
      setPausesRespected(0);
      setPausesTotal(0);
      spokeInSilenceRef.current = false;
      setShowResult(false);
      setRoundResults([]);
      completedRoundsRef.current = 0;
      setCurrentPrompt(firstPrompt);
      currentPromptRef.current = firstPrompt;
      usedPromptsRef.current.clear();
    } catch {
      toast.error("Microphone access is required for this exercise.");
    }
  };

  // ── Stop exercise ───────────────────────────────────────────
  const handleStop = useCallback(() => {
    setIsRunning(false);
    stopAnalyzing();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setShowResult(true);
  }, [stopAnalyzing]);

  // ── Tick logic (round-based) ──────────────────────────────────
  useEffect(() => {
    if (!isRunning) return;

    const diffConfig = DIFFICULTY_CONFIG[difficulty];
    const rounds = diffConfig.rounds;

    timerRef.current = setInterval(() => {
      setTotalElapsed((prev) => prev + 1);

      setPhaseTimer((prev) => {
        if (prev <= 1) {
          if (mode === "classic") {
            // Classic: silence → speak → silence → ...
            setPhase((currentPhase) => {
              if (currentPhase === "silence") {
                // Silence ended — record result
                const held = !spokeInSilenceRef.current;
                const silDur = diffConfig.silenceDurations[completedRoundsRef.current % diffConfig.silenceDurations.length];
                setRoundResults((prev) => [...prev, { question: currentPromptRef.current, silenceDuration: silDur, held }]);
                setPausesTotal((t) => t + 1);
                if (held) setPausesRespected((r) => r + 1);
                spokeInSilenceRef.current = false;
                return "speak";
              } else {
                // Speak ended → round complete
                completedRoundsRef.current += 1;
                if (completedRoundsRef.current >= rounds) {
                  setTimeout(() => handleStop(), 0);
                  return currentPhase;
                }
                setRoundIndex((r) => r + 1);
                const nextPrompt = pickRandomPrompt();
                setCurrentPrompt(nextPrompt);
                currentPromptRef.current = nextPrompt;
                return "silence";
              }
            });
            setPhase((nextPhase) => {
              if (nextPhase === "speak") {
                setPhaseTimer(diffConfig.speakDuration);
              } else {
                setPhaseTimer(getSilenceDuration());
              }
              return nextPhase;
            });
          } else {
            // Interruption: speak → silence → speak → ...
            setPhase((currentPhase) => {
              if (currentPhase === "speak") {
                // Random pause imposed!
                setRoundIndex((r) => r + 1);
                return "silence";
              } else {
                // Silence ended — record result + round complete
                const held = !spokeInSilenceRef.current;
                const silDur = diffConfig.silenceDurations[completedRoundsRef.current % diffConfig.silenceDurations.length];
                setRoundResults((prev) => [...prev, { question: currentPromptRef.current, silenceDuration: silDur, held }]);
                setPausesTotal((t) => t + 1);
                if (held) setPausesRespected((r) => r + 1);
                spokeInSilenceRef.current = false;
                completedRoundsRef.current += 1;
                if (completedRoundsRef.current >= rounds) {
                  setTimeout(() => handleStop(), 0);
                  return currentPhase;
                }
                const nextPrompt = pickRandomPrompt();
                setCurrentPrompt(nextPrompt);
                currentPromptRef.current = nextPrompt;
                return "speak";
              }
            });
            setPhase((nextPhase) => {
              if (nextPhase === "silence") {
                setPhaseTimer(getSilenceDuration());
              } else {
                setPhaseTimer(getInterruptionSpeakDuration());
              }
              return nextPhase;
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, difficulty, mode, handleStop, pickRandomPrompt, getSilenceDuration, getInterruptionSpeakDuration]);

  // ── Detect voice during silence ─────────────────────────────
  useEffect(() => {
    if (isRunning && phase === "silence" && isSpeaking) {
      spokeInSilenceRef.current = true;
    }
  }, [isRunning, phase, isSpeaking]);

  // ── Save session ────────────────────────────────────────────
  const saveSession = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase.from("sessions").insert([
      {
        user_id: user.id,
        duration_seconds: totalElapsed,
        avg_wpm: 0,
        max_wpm: 0,
        target_wpm: 0,
        exercise_type: "silence_training",
        notes: `Silence Training [${mode}/${selectedTheme}] (${difficulty}) \u2014 ${pausesRespected}/${pausesTotal} pauses respected`,
      },
    ]).select("id").single();

    if (!error && data) {
      gamification.updateAfterSession(totalElapsed);

      // Journey validation
      if (journeyStep !== null && exerciseId) {
        await journey.validateExercise(
          parseInt(journeyStep, 10),
          exerciseId,
          data.id
        );
      }
    }
  }, [user, totalElapsed, difficulty, mode, selectedTheme, pausesRespected, pausesTotal, gamification, journey, journeyStep, exerciseId]);

  useEffect(() => {
    if (showResult && totalElapsed > 0) {
      saveSession();
    }
  }, [showResult]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cleanup on unmount ──────────────────────────────────────
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const totalSilenceTime = roundResults.reduce((sum, r) => sum + r.silenceDuration, 0);

  const progressPercent = Math.min(100, (totalElapsed / estimatedDuration) * 100);
  const silencePhaseDuration = phase === "silence" ? getSilenceDuration() : DIFFICULTY_CONFIG[difficulty].speakDuration;
  const phaseProgress = ((silencePhaseDuration - phaseTimer) / silencePhaseDuration) * 100;
  const successRate = pausesTotal > 0 ? Math.round((pausesRespected / pausesTotal) * 100) : 0;

  // ── Intro Modal ─────────────────────────────────────────────
  const IntroModal = () => (
    <Dialog open={showIntro} onOpenChange={setShowIntro}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-3">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center"
            >
              <span className="text-3xl">{"\u{1F910}"}</span>
            </motion.div>
          </div>
          <DialogTitle className="text-center text-xl">Silence Tolerance</DialogTitle>
          <DialogDescription className="text-center">
            Learn to be comfortable with pauses in conversation. Two modes: structured prompts or spontaneous interruptions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2.5 mt-3">
          {[
            { emoji: "\u{1F4AC}", text: "A question appears on screen" },
            { emoji: "\u{1F910}", text: "Wait in silence \u2014 a timer counts down" },
            { emoji: "\u{1F5E3}\uFE0F", text: "When prompted, answer naturally" },
            { emoji: "\u{1F504}", text: "Repeat with longer pauses each round" },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="flex items-center gap-3 bg-muted/50 rounded-lg px-3 py-2.5"
            >
              <span className="text-lg">{step.emoji}</span>
              <span className="text-sm text-foreground">{step.text}</span>
            </motion.div>
          ))}
        </div>

        <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-lg p-3 mt-3">
          <p className="text-xs text-amber-800 dark:text-amber-200">
            <strong>Tip:</strong> Silence isn't emptiness \u2014 it's a breathing space that gives your words power.
          </p>
        </div>

        <Button onClick={() => setShowIntro(false)} className="w-full mt-3">
          Got it, let's start
        </Button>
      </DialogContent>
    </Dialog>
  );

  // ── Setup Screen ────────────────────────────────────────────
  if (!isRunning && !showResult) {
    return (
      <div className="min-h-screen gradient-subtle">
        <IntroModal />

        {/* Header bar */}
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Link>
            <div className="flex items-center gap-1.5">
              <span className="text-base">{"\u{1F910}"}</span>
              <span className="font-display font-bold text-sm">Silence Tolerance</span>
            </div>
            <button
              onClick={() => setShowIntro(true)}
              className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="How this exercise works"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="container max-w-lg mx-auto px-4 py-6">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">{"\u{1F910}"}</span>
            </div>
            <h1 className="text-2xl font-bold">Silence Tolerance</h1>
            <p className="text-muted-foreground text-sm mt-2">
              Practice accepting pauses. Choose a theme and training mode.
            </p>
          </motion.div>

          {/* Training mode */}
          <Card className="mb-4">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{"\u{1F9D1}"}</span>
                <h2 className="text-sm font-semibold">Training mode</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMode("classic")}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                    mode === "classic"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <Flower2 className={`w-5 h-5 mx-auto mb-1.5 ${mode === "classic" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-sm font-semibold block">Classic</span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">
                    Silence before speaking
                  </span>
                </button>
                <button
                  onClick={() => setMode("interruption")}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                    mode === "interruption"
                      ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20"
                      : "border-border hover:border-amber-300/50"
                  }`}
                >
                  <Zap className={`w-5 h-5 mx-auto mb-1.5 ${mode === "interruption" ? "text-amber-500" : "text-muted-foreground"}`} />
                  <span className="text-sm font-semibold block">Interruption</span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">
                    Random pauses mid-speech
                  </span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Question theme */}
          <Card className="mb-4">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{"\u{1F3A8}"}</span>
                <h2 className="text-sm font-semibold">Question theme</h2>
              </div>
              <div className="flex gap-2 justify-center">
                {THEMES.map((theme) => (
                  <button
                    key={theme.key}
                    onClick={() => setSelectedTheme(theme.key)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all min-w-[56px] ${
                      selectedTheme === theme.key
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <span className="text-xl">{theme.icon}</span>
                    <span className="text-[10px] font-medium">{theme.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Questions in the same theme build on each other.
              </p>
            </CardContent>
          </Card>

          {/* Difficulty */}
          <Card className="mb-4">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{"\u{1F3AF}"}</span>
                <h2 className="text-sm font-semibold">Difficulty</h2>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(DIFFICULTY_CONFIG) as [Difficulty, typeof DIFFICULTY_CONFIG[Difficulty]][]).map(
                  ([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setDifficulty(key)}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        difficulty === key
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <span className="text-2xl block mb-1">{config.icon}</span>
                      <span className="text-sm font-semibold block">{config.label}</span>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">
                        {config.description} ({config.range})
                      </span>
                    </button>
                  )
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3">
                {targetRounds} questions &middot; Pauses {DIFFICULTY_CONFIG[difficulty].range}
              </p>
            </CardContent>
          </Card>

          {/* How it works */}
          <Card className="mb-6">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{"\u{1F4A1}"}</span>
                <h2 className="text-sm font-semibold">How it works</h2>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                  <span className="shrink-0">1\uFE0F\u20E3</span>
                  <span>A question appears \u2192 <strong className="text-foreground">stay silent</strong> during the countdown</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                  <span className="shrink-0">2\uFE0F\u20E3</span>
                  <span>When the signal appears \u2192 <strong className="text-foreground">answer freely</strong></span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                  <span className="shrink-0">3\uFE0F\u20E3</span>
                  <span>Pauses get progressively longer to desensitize you</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/70 mt-3 flex items-start gap-2">
                <span className="shrink-0">{"\u{1F3AF}"}</span>
                <span>Goal: realize that your pauses feel natural to your listener.</span>
              </p>
            </CardContent>
          </Card>

          <Button onClick={handleStart} size="lg" className="w-full gap-2">
            <Play className="w-5 h-5" />
            Start
          </Button>
        </div>
      </div>
    );
  }

  // ── Results Screen ──────────────────────────────────────────
  if (showResult) {
    const resultEmoji = successRate >= 80 ? "\u{1F389}" : successRate >= 50 ? "\u{1F44D}" : "\u{1F4AA}";

    return (
      <div className="min-h-screen gradient-subtle">
        <div className="container max-w-lg mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <span className="text-5xl block mb-4">{resultEmoji}</span>
              <h1 className="text-2xl font-bold mb-2">
                {successRate >= 80
                  ? "Excellent!"
                  : successRate >= 50
                  ? "Nice effort!"
                  : "Good start!"}
              </h1>
              <p className="text-muted-foreground">
                {successRate >= 80
                  ? "You stayed calm and composed during most pauses."
                  : successRate >= 50
                  ? "You're building your tolerance. Keep practicing!"
                  : "Silence is a skill \u2014 you'll get better each time."}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <Card>
                <CardContent className="py-4 text-center">
                  <p className="text-2xl font-bold text-primary">
                    {pausesRespected}/{pausesTotal}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Pauses held</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4 text-center">
                  <p className="text-2xl font-bold">{successRate}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Success rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4 text-center">
                  <p className="text-2xl font-bold">{totalSilenceTime}s</p>
                  <p className="text-xs text-muted-foreground mt-1">Total silence</p>
                </CardContent>
              </Card>
            </div>

            {/* Per-round detail */}
            {roundResults.length > 0 && (
              <Card className="mb-6">
                <CardContent className="pt-4 pb-3">
                  <h3 className="text-sm font-semibold mb-3">Round details</h3>
                  <div className="space-y-2">
                    {roundResults.map((round, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm">
                        <span className={`shrink-0 mt-0.5 ${round.held ? "text-green-500" : "text-red-500"}`}>
                          {round.held ? "\u2713" : "\u2717"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground truncate">{round.question}</p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {round.silenceDuration}s
                        </span>
                        <span className={`text-xs font-medium shrink-0 ${round.held ? "text-green-600" : "text-red-500"}`}>
                          {round.held ? "Held" : "Spoke"}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pedagogical insight */}
            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-lg p-3.5 mb-6">
              <p className="text-xs text-indigo-800 dark:text-indigo-200 leading-relaxed">
                <strong>Did you know?</strong> A pause of 3 to 5 seconds feels completely natural to your listener. What feels long to you is actually comfortable for them.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => {
                  setShowResult(false);
                  setTotalElapsed(0);
                  setRoundResults([]);
                }}
              >
                <RotateCcw className="w-4 h-4" />
                Try again
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={() => navigate("/library")}
              >
                Back to library
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Active Exercise Screen ──────────────────────────────────
  return (
    <div className="min-h-screen gradient-subtle flex flex-col">
      {/* Top bar */}
      <div className="border-b border-border/40 bg-background/90 backdrop-blur-xl px-4 py-3">
        <div className="container max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Timer className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              Question {Math.min(roundIndex + 1, targetRounds)} / {targetRounds}
            </span>
          </div>
          {/* Overall progress */}
          <div className="flex-1 mx-4">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                style={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleStop}>
            <Square className="w-4 h-4 mr-1.5" />
            Stop
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <AnimatePresence mode="wait">
          {phase === "silence" ? (
            <motion.div
              key="silence"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center max-w-md"
            >
              {/* Prompt preview (classic) or pause indicator (interruption) */}
              {mode === "classic" ? (
                <>
                  <p className="text-sm text-muted-foreground mb-6">
                    Coming up:
                  </p>
                  <p className="text-lg font-medium text-foreground/80 mb-8 italic">
                    &ldquo;{currentPrompt}&rdquo;
                  </p>
                </>
              ) : (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-lg font-semibold text-amber-600 dark:text-amber-400 mb-8"
                >
                  Pause! Hold your thought...
                </motion.p>
              )}

              {/* Silence indicator */}
              <div className="relative w-40 h-40 mx-auto mb-6">
                {/* Ring */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="44"
                    fill="none"
                    stroke="currentColor"
                    className="text-muted/30"
                    strokeWidth="6"
                  />
                  <circle
                    cx="50" cy="50" r="44"
                    fill="none"
                    stroke="currentColor"
                    className="text-indigo-500"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 44}`}
                    strokeDashoffset={`${2 * Math.PI * 44 * (1 - phaseProgress / 100)}`}
                    style={{ transition: "stroke-dashoffset 0.3s ease" }}
                  />
                </svg>
                {/* Center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <VolumeX className="w-8 h-8 text-indigo-500 mb-1" />
                  <span className="text-2xl font-bold font-mono">{phaseTimer}s</span>
                </div>
              </div>

              <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                Stay silent...
              </p>

              {/* Voice detection feedback */}
              <AnimatePresence>
                {isSpeaking && (
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-red-500 mt-3 font-medium"
                  >
                    Not yet \u2014 breathe and wait...
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Volume bar */}
              <div className="mt-4 w-48 mx-auto">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-100 ${
                      isSpeaking ? "bg-red-500" : "bg-indigo-200 dark:bg-indigo-800"
                    }`}
                    style={{ width: `${Math.min(100, volumeLevel * 100)}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="speak"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center max-w-md"
            >
              {/* Prompt */}
              <p className="text-xl font-semibold text-foreground mb-2">
                {currentPrompt}
              </p>
              {mode === "interruption" && (
                <p className="text-xs text-muted-foreground mb-6">
                  A pause will come at any moment...
                </p>
              )}
              {mode === "classic" && <div className="mb-8" />}

              {/* Speak indicator */}
              <div className="relative w-40 h-40 mx-auto mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="44"
                    fill="none"
                    stroke="currentColor"
                    className="text-muted/30"
                    strokeWidth="6"
                  />
                  {/* In interruption mode, don't show progress ring — keep pause unpredictable */}
                  {mode === "classic" && (
                    <circle
                      cx="50" cy="50" r="44"
                      fill="none"
                      stroke="currentColor"
                      className="text-emerald-500"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 44}`}
                      strokeDashoffset={`${2 * Math.PI * 44 * (1 - phaseProgress / 100)}`}
                      style={{ transition: "stroke-dashoffset 0.3s ease" }}
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Volume2 className="w-8 h-8 text-emerald-500 mb-1" />
                  {mode === "classic" ? (
                    <span className="text-2xl font-bold font-mono">{phaseTimer}s</span>
                  ) : (
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-xs text-emerald-500 font-medium mt-1"
                    >
                      speaking...
                    </motion.span>
                  )}
                </div>
              </div>

              <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                {mode === "classic" ? "Speak now!" : "Keep talking..."}
              </p>

              {/* Volume bar */}
              <div className="mt-4 w-48 mx-auto">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-100"
                    style={{ width: `${Math.min(100, volumeLevel * 100)}%` }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Round counter */}
        <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
          <Wind className="w-3.5 h-3.5" />
          <span>
            {pausesRespected}/{pausesTotal} pauses respected &middot;{" "}
            {Math.floor(totalElapsed / 60)}:{(totalElapsed % 60).toString().padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SilenceTraining;
