import { motion, AnimatePresence } from "framer-motion";
import { type VolumeZone } from "@/hooks/useVolumeBiofeedback";

interface VolumeGaugeProps {
  volume: number;       // 0-1 smoothed
  zone: VolumeZone;
  emoji: string;
  label: string;
  colorClass: string;
  isCalibrating: boolean;
  calibrationProgress: number;
}

/**
 * Vertical VU-meter gauge for vocal projection biofeedback.
 * Uses CSS transitions (500ms) + EMA-smoothed input for ultra-stable display.
 */
const VolumeGauge = ({
  volume,
  zone,
  emoji,
  label,
  colorClass,
  isCalibrating,
  calibrationProgress,
}: VolumeGaugeProps) => {
  // Bar height (clamped 0-100%)
  const barHeight = Math.min(100, Math.max(0, volume * 100 * 2.5)); // scale up for visibility

  // Color based on zone
  const barColor = (() => {
    switch (zone) {
      case 'too_quiet': return 'bg-blue-400';
      case 'target': return 'bg-emerald-500';
      case 'strong_projection': return 'bg-amber-500';
      case 'too_loud': return 'bg-red-500';
    }
  })();

  // Micro-hints
  const hint = (() => {
    if (isCalibrating) return "Speak normally to calibrate your baseline volume...";
    switch (zone) {
      case 'too_quiet': return "Speak louder — project your voice forward.";
      case 'target': return "Perfect volume! Keep it steady.";
      case 'strong_projection': return "Great projection! Powerful and clear.";
      case 'too_loud': return "Bring it down slightly — control the intensity.";
    }
  })();

  if (isCalibrating) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-48 bg-muted/50 rounded-2xl border-2 border-border overflow-hidden flex flex-col justify-end relative">
          <motion.div
            className="bg-primary/40 rounded-b-xl"
            style={{ height: `${barHeight}%` }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl">🎙️</span>
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-primary">Calibrating...</p>
          <div className="w-40 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${calibrationProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* VU Meter */}
      <div className="w-20 h-56 bg-muted/30 rounded-2xl border-2 border-border overflow-hidden flex flex-col justify-end relative">
        {/* Zone markers */}
        <div className="absolute inset-x-0 top-0 h-full flex flex-col justify-between pointer-events-none px-1">
          <div className="border-b border-red-300/40 text-[8px] text-red-400 text-right pr-1">loud</div>
          <div className="border-b border-amber-300/40 text-[8px] text-amber-400 text-right pr-1" />
          <div className="border-b border-emerald-300/40 text-[8px] text-emerald-400 text-right pr-1">target</div>
          <div className="text-[8px] text-blue-400 text-right pr-1">quiet</div>
        </div>

        {/* Animated bar with CSS transition for smoothness */}
        <div
          className={`${barColor} rounded-b-xl transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]`}
          style={{ height: `${barHeight}%` }}
        />
      </div>

      {/* Emoji + Label */}
      <div className="flex flex-col items-center gap-1">
        <AnimatePresence mode="wait">
          <motion.span
            key={emoji}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-4xl"
          >
            {emoji}
          </motion.span>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.span
            key={label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={`text-sm font-bold ${colorClass}`}
          >
            {label}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Micro-hint */}
      <p className="text-xs text-muted-foreground/70 text-center max-w-[180px]">{hint}</p>
    </div>
  );
};

export default VolumeGauge;
