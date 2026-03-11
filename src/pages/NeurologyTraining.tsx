import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Volume2, Brain, BookOpen, Square, Play, Pause, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { getCategoryById, type Exercise } from "@/data/exercises";
import VolumeGauge from "@/components/practice/VolumeGauge";
import { useVolumeBiofeedback } from "@/hooks/useVolumeBiofeedback";
import RetellingPlayer from "@/components/practice/RetellingPlayer";
import ExerciseIntroModal from "@/components/practice/ExerciseIntroModal";

type NeuroMode = "projection" | "articulation" | "narrative";

interface ModeConfig {
  mode: NeuroMode;
  icon: React.ReactNode;
  title: string;
  description: string;
  categoryId: string;
  color: string;
}

const MODES: ModeConfig[] = [
  {
    mode: "projection",
    icon: <Volume2 className="w-6 h-6" />,
    title: "Vocal Projection",
    description: "Volume biofeedback — speak louder, not faster.",
    categoryId: "neuro-projection",
    color: "from-violet-500 to-purple-600",
  },
  {
    mode: "articulation",
    icon: <Brain className="w-6 h-6" />,
    title: "Neuro Articulation",
    description: "Targeted oral-motor and diadochokinetic drills.",
    categoryId: "neuro-articulation",
    color: "from-pink-500 to-rose-600",
  },
  {
    mode: "narrative",
    icon: <BookOpen className="w-6 h-6" />,
    title: "Narrative Coherence",
    description: "Listen, remember, retell — train working memory.",
    categoryId: "neuro-narrative",
    color: "from-cyan-500 to-sky-600",
  },
];

const NeurologyTraining = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedMode = searchParams.get("mode") as NeuroMode | null;
  const preselectedExercise = searchParams.get("exercise");

  const [selectedMode, setSelectedMode] = useState<NeuroMode | null>(preselectedMode);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);

  // Intro modal (re-openable via ? button)
  const [forceShowIntro, setForceShowIntro] = useState(false);

  // Projection mode state
  const volumeFeedback = useVolumeBiofeedback();
  const [isRecording, setIsRecording] = useState(false);
  const [showBilan, setShowBilan] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  // Load exercise from category
  useEffect(() => {
    if (!selectedMode) return;
    const modeConfig = MODES.find(m => m.mode === selectedMode);
    if (!modeConfig) return;
    const category = getCategoryById(modeConfig.categoryId);
    if (!category) return;

    // If preselected exercise, find it
    if (preselectedExercise) {
      const ex = category.exercises.find(e => e.id === preselectedExercise);
      if (ex) { setExercise(ex); return; }
    }

    // Otherwise use exerciseIndex
    if (category.exercises[exerciseIndex]) {
      setExercise(category.exercises[exerciseIndex]);
    }
  }, [selectedMode, exerciseIndex, preselectedExercise]);

  const currentModeConfig = MODES.find(m => m.mode === selectedMode);

  // ─── Projection Mode Handlers ───
  const startProjection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      volumeFeedback.start(stream);
      setIsRecording(true);
      setShowBilan(false);
    } catch {
      toast.error("Unable to access microphone");
    }
  };

  const stopProjection = () => {
    volumeFeedback.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setIsRecording(false);
    setShowBilan(true);
  };

  const nextExercise = () => {
    const category = currentModeConfig ? getCategoryById(currentModeConfig.categoryId) : null;
    if (!category) return;
    const nextIdx = (exerciseIndex + 1) % category.exercises.length;
    setExerciseIndex(nextIdx);
    setShowBilan(false);
    setIsRecording(false);
  };

  // ─── Mode Selection Screen ───
  if (!selectedMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/30 flex flex-col">
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <button onClick={() => navigate("/library")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" /><span className="hidden sm:inline">Back</span>
            </button>
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <span className="font-display font-bold text-sm sm:text-base">Neuro Training</span>
            </div>
            <div className="w-20" />
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-8 max-w-lg">
          <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center">
              <div className="text-5xl mb-3">🧠</div>
              <h1 className="text-2xl font-display font-bold mb-2">Neuro Training</h1>
              <p className="text-muted-foreground text-sm">
                Motor speech exercises for vocal projection, articulation, and narrative coherence.
              </p>
            </div>

            <div className="space-y-3">
              {MODES.map((mode) => {
                const category = getCategoryById(mode.categoryId);
                const count = category?.exercises.length || 0;
                return (
                  <motion.button
                    key={mode.mode}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setSelectedMode(mode.mode); setExerciseIndex(0); }}
                    className="w-full"
                  >
                    <Card className="border-2 hover:border-primary/50 transition-all">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center text-white`}>
                          {mode.icon}
                        </div>
                        <div className="text-left flex-1">
                          <h3 className="font-bold text-sm">{mode.title}</h3>
                          <p className="text-xs text-muted-foreground">{mode.description}</p>
                          <span className="text-[10px] text-muted-foreground/60">{count} exercises</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // ─── Narrative Mode → Delegate to RetellingPlayer ───
  if (selectedMode === "narrative" && exercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/30">
        <ExerciseIntroModal
          categoryId="neuro-narrative"
          forceOpen={forceShowIntro}
          onDismiss={() => setForceShowIntro(false)}
        />
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <button onClick={() => { setSelectedMode(null); setExercise(null); }} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" /><span className="hidden sm:inline">Back</span>
            </button>
            <span className="font-display font-bold text-sm">Narrative Coherence</span>
            <button onClick={() => setForceShowIntro(true)} className="p-2 rounded-full hover:bg-muted transition-colors" title="How it works">
              <HelpCircle className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </header>
        <RetellingPlayer
          exercise={exercise}
          onBack={() => {
            setSelectedMode(null);
            setExercise(null);
          }}
        />
      </div>
    );
  }

  // ─── Articulation Mode → Read text with visual guide ───
  if (selectedMode === "articulation" && exercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/30 flex flex-col">
        <ExerciseIntroModal
          categoryId="neuro-articulation"
          forceOpen={forceShowIntro}
          onDismiss={() => setForceShowIntro(false)}
        />
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <button onClick={() => { setSelectedMode(null); setExercise(null); }} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" /><span className="hidden sm:inline">Back</span>
            </button>
            <span className="font-display font-bold text-sm">Neuro Articulation</span>
            <button onClick={() => setForceShowIntro(true)} className="p-2 rounded-full hover:bg-muted transition-colors" title="How it works">
              <HelpCircle className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-6 max-w-lg flex flex-col items-center">
          <motion.div className="w-full space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Exercise card */}
            <Card className="border-2 border-primary/20">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🧠</span>
                  <h2 className="font-bold">{exercise.title}</h2>
                  <span className="text-xs text-muted-foreground ml-auto">{exerciseIndex + 1}/{getCategoryById("neuro-articulation")?.exercises.length || 0}</span>
                </div>

                <div className="p-4 bg-muted/50 rounded-xl">
                  <p className="text-lg leading-relaxed font-medium">{exercise.text}</p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    💡 {exercise.tip}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center gap-3 justify-center">
              <Button variant="outline" onClick={() => { setSelectedMode(null); setExercise(null); }}>
                Back to modes
              </Button>
              <Button onClick={nextExercise} className="gap-2">
                Next exercise →
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // ─── Projection Mode → Volume Biofeedback ───
  if (selectedMode === "projection" && exercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/30 flex flex-col">
        <ExerciseIntroModal
          categoryId="neuro-projection"
          forceOpen={forceShowIntro}
          onDismiss={() => setForceShowIntro(false)}
        />
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <button onClick={() => { volumeFeedback.stop(); streamRef.current?.getTracks().forEach(t => t.stop()); setSelectedMode(null); setExercise(null); setIsRecording(false); setShowBilan(false); }} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" /><span className="hidden sm:inline">Back</span>
            </button>
            <span className="font-display font-bold text-sm">Vocal Projection</span>
            <button onClick={() => setForceShowIntro(true)} className="p-2 rounded-full hover:bg-muted transition-colors" title="How it works">
              <HelpCircle className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-6 max-w-lg flex flex-col items-center">
          {/* Bilan */}
          {showBilan ? (
            <motion.div className="w-full space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-center">
                <span className="text-5xl">
                  {volumeFeedback.timeInTarget / Math.max(1, volumeFeedback.totalTime) >= 0.7 ? "🎉" :
                   volumeFeedback.timeInTarget / Math.max(1, volumeFeedback.totalTime) >= 0.4 ? "👍" : "💪"}
                </span>
                <h2 className="text-xl font-bold mt-2">Projection Summary</h2>
              </div>

              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-muted/50 rounded-xl">
                      <p className="text-2xl font-bold">{Math.round(volumeFeedback.avgVolume * 100)}%</p>
                      <p className="text-[10px] text-muted-foreground">Avg volume</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-xl">
                      <p className="text-2xl font-bold">{Math.round(volumeFeedback.maxVolume * 100)}%</p>
                      <p className="text-[10px] text-muted-foreground">Max volume</p>
                    </div>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                      <p className="text-2xl font-bold text-emerald-600">{volumeFeedback.totalTime > 0 ? Math.round((volumeFeedback.timeInTarget / volumeFeedback.totalTime) * 100) : 0}%</p>
                      <p className="text-[10px] text-muted-foreground">Time in target</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {volumeFeedback.timeInTarget.toFixed(0)}s in target zone out of {volumeFeedback.totalTime}s total
                  </p>
                </CardContent>
              </Card>

              <div className="flex items-center gap-3 justify-center">
                <Button variant="outline" onClick={() => { setShowBilan(false); }}>
                  Try again
                </Button>
                <Button onClick={nextExercise}>
                  Next exercise →
                </Button>
              </div>
            </motion.div>
          ) : !isRecording ? (
            /* Exercise preview + start button */
            <motion.div className="w-full space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-2 border-primary/20">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📢</span>
                    <h2 className="font-bold">{exercise.title}</h2>
                    <span className="text-xs text-muted-foreground ml-auto">{exerciseIndex + 1}/{getCategoryById("neuro-projection")?.exercises.length || 0}</span>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <p className="text-lg leading-relaxed font-medium">{exercise.text}</p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <p className="text-sm text-amber-800 dark:text-amber-200">💡 {exercise.tip}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button size="lg" onClick={startProjection} className="h-14 px-8 rounded-2xl text-lg gap-3 shadow-lg shadow-primary/25">
                  <Volume2 className="w-6 h-6" /> Start projection
                </Button>
              </div>
            </motion.div>
          ) : (
            /* Recording with VolumeGauge */
            <motion.div
              className="w-full flex flex-col items-center gap-6 flex-1 justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {/* Exercise text during recording */}
              <div className="p-4 bg-muted/30 rounded-xl max-w-sm text-center">
                <p className="text-sm leading-relaxed">{exercise.text}</p>
              </div>

              {/* Volume Gauge */}
              <VolumeGauge
                volume={volumeFeedback.volume}
                zone={volumeFeedback.zoneInfo.zone}
                emoji={volumeFeedback.zoneInfo.emoji}
                label={volumeFeedback.zoneInfo.label}
                colorClass={volumeFeedback.zoneInfo.colorClass}
                isCalibrating={volumeFeedback.isCalibrating}
                calibrationProgress={volumeFeedback.calibrationProgress}
              />

              {/* Stop button */}
              <Button variant="destructive" size="lg" onClick={stopProjection} className="h-14 px-8 rounded-xl gap-2">
                <Square className="w-5 h-5" /> Stop
              </Button>
            </motion.div>
          )}
        </main>
      </div>
    );
  }

  // Fallback (no exercise loaded yet)
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Loading exercise...</p>
    </div>
  );
};

export default NeurologyTraining;
