import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Square, RotateCcw } from "lucide-react";

/**
 * Visual breathing guide — animated expanding/contracting circle.
 * Supports Square Breathing (4-4-4-4) and custom patterns.
 * FR version has nothing like this — EN exclusive.
 */

interface BreathPhase {
  label: string;
  duration: number; // seconds
  color: string; // tailwind ring color
  scale: number; // circle scale multiplier
  instruction: string;
}

const BREATHING_PATTERNS: Record<string, { name: string; phases: BreathPhase[] }> = {
  square: {
    name: "Square Breathing",
    phases: [
      { label: "Inhale", duration: 4, color: "text-sky-400", scale: 1.3, instruction: "Breathe in slowly through your nose" },
      { label: "Hold", duration: 4, color: "text-amber-400", scale: 1.3, instruction: "Hold your breath gently" },
      { label: "Exhale", duration: 4, color: "text-indigo-400", scale: 0.7, instruction: "Breathe out slowly through your mouth" },
      { label: "Hold", duration: 4, color: "text-slate-400", scale: 0.7, instruction: "Rest before the next breath" },
    ],
  },
  calming: {
    name: "4-7-8 Calming",
    phases: [
      { label: "Inhale", duration: 4, color: "text-sky-400", scale: 1.3, instruction: "Breathe in through your nose" },
      { label: "Hold", duration: 7, color: "text-amber-400", scale: 1.3, instruction: "Hold your breath" },
      { label: "Exhale", duration: 8, color: "text-indigo-400", scale: 0.7, instruction: "Slowly exhale through your mouth" },
    ],
  },
  speech: {
    name: "Speech Prep",
    phases: [
      { label: "Inhale", duration: 3, color: "text-sky-400", scale: 1.3, instruction: "Fill your lungs before speaking" },
      { label: "Exhale + Speak", duration: 6, color: "text-emerald-400", scale: 0.7, instruction: "Speak on the exhalation" },
      { label: "Rest", duration: 2, color: "text-slate-400", scale: 0.85, instruction: "Brief pause before next phrase" },
    ],
  },
};

interface BreathingGuideProps {
  pattern?: keyof typeof BREATHING_PATTERNS;
  cycles?: number;
  onComplete?: () => void;
  compact?: boolean;
}

const BreathingGuide = ({
  pattern = "square",
  cycles = 4,
  onComplete,
  compact = false,
}: BreathingGuideProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseTimer, setPhaseTimer] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const config = BREATHING_PATTERNS[pattern];
  const currentPhase = config.phases[currentPhaseIndex];
  const totalPhaseSeconds = currentPhase.duration;
  const phaseProgress = totalPhaseSeconds > 0 ? (totalPhaseSeconds - phaseTimer) / totalPhaseSeconds : 0;

  const handleStart = useCallback(() => {
    setIsRunning(true);
    setCurrentPhaseIndex(0);
    setPhaseTimer(config.phases[0].duration);
    setCurrentCycle(0);
    setIsDone(false);
  }, [config]);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Tick logic
  useEffect(() => {
    if (!isRunning) return;

    timerRef.current = setInterval(() => {
      setPhaseTimer((prev) => {
        if (prev <= 1) {
          // Move to next phase
          setCurrentPhaseIndex((pi) => {
            const nextPi = pi + 1;
            if (nextPi >= config.phases.length) {
              // Completed a cycle
              setCurrentCycle((c) => {
                const nextCycle = c + 1;
                if (nextCycle >= cycles) {
                  // All cycles done
                  setIsRunning(false);
                  setIsDone(true);
                  onComplete?.();
                  return nextCycle;
                }
                return nextCycle;
              });
              setPhaseTimer(config.phases[0].duration);
              return 0; // restart phases
            }
            setPhaseTimer(config.phases[nextPi].duration);
            return nextPi;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, config, cycles, onComplete]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const circleSize = compact ? "w-32 h-32" : "w-48 h-48";

  if (isDone) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4 py-4"
      >
        <div className="text-4xl">{"\u2728"}</div>
        <p className="text-sm font-medium text-foreground">
          {cycles} cycles complete — you're ready
        </p>
        <Button variant="outline" size="sm" onClick={handleStart} className="gap-2">
          <RotateCcw className="w-3.5 h-3.5" />
          Again
        </Button>
      </motion.div>
    );
  }

  if (!isRunning) {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <div className={`${circleSize} rounded-full bg-muted/40 border-2 border-dashed border-border/60 flex items-center justify-center`}>
          <span className="text-3xl">{"\u{1F32C}\uFE0F"}</span>
        </div>
        <p className="text-sm text-muted-foreground text-center max-w-[220px]">
          {config.name} — {cycles} cycles
        </p>
        <Button onClick={handleStart} size="sm" className="gap-2">
          <Play className="w-4 h-4" />
          Start breathing
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* Animated breathing circle */}
      <div className="relative">
        <motion.div
          animate={{ scale: currentPhase.scale }}
          transition={{ duration: currentPhase.duration * 0.8, ease: "easeInOut" }}
          className={`${circleSize} rounded-full flex items-center justify-center relative`}
        >
          {/* Outer ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="46"
              fill="none"
              stroke="currentColor"
              className="text-muted/20"
              strokeWidth="3"
            />
            <motion.circle
              cx="50" cy="50" r="46"
              fill="none"
              stroke="currentColor"
              className={currentPhase.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 46}`}
              animate={{ strokeDashoffset: 2 * Math.PI * 46 * (1 - phaseProgress) }}
              transition={{ duration: 0.3, ease: "linear" }}
            />
          </svg>

          {/* Inner gradient circle */}
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className={`w-3/4 h-3/4 rounded-full bg-gradient-to-br from-primary/10 to-primary/5`}
          />

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentPhase.label}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className={`text-sm font-semibold ${currentPhase.color}`}
              >
                {currentPhase.label}
              </motion.span>
            </AnimatePresence>
            <span className="text-2xl font-bold font-mono mt-1">{phaseTimer}</span>
          </div>
        </motion.div>
      </div>

      {/* Instruction */}
      <AnimatePresence mode="wait">
        <motion.p
          key={currentPhase.instruction}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-sm text-muted-foreground text-center max-w-[250px]"
        >
          {currentPhase.instruction}
        </motion.p>
      </AnimatePresence>

      {/* Progress info */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>Cycle {currentCycle + 1}/{cycles}</span>
        <Button variant="ghost" size="sm" onClick={handleStop} className="h-7 px-2 text-xs gap-1">
          <Square className="w-3 h-3" />
          Stop
        </Button>
      </div>
    </div>
  );
};

export default BreathingGuide;
