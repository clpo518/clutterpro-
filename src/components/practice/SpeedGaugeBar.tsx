import { motion } from "framer-motion";
import { useMemo } from "react";

interface SpeedGaugeBarProps {
  sps: number;
  targetSps: number;
  showLabel?: boolean;
  compact?: boolean;
}

/**
 * Visual gauge bar for speech speed display
 * Uses color gradient (green → yellow → red) instead of raw numbers
 * Pedagogical: shows "syllabes" term but focuses on visual feedback
 */
const SpeedGaugeBar = ({ 
  sps, 
  targetSps, 
  showLabel = true,
  compact = false 
}: SpeedGaugeBarProps) => {
  const { percentage, color, bgColor, label, emoji } = useMemo(() => {
    // Map SPS to percentage (0-100%) relative to a max of 8 SPS
    const maxSps = 8;
    const percentage = Math.min((sps / maxSps) * 100, 100);
    
    // Proportional thresholds: target is a ceiling
    const ratio = sps / targetSps;
    
    let color: string;
    let bgColor: string;
    let label: string;
    let emoji: string;
    
    if (sps === 0) {
      color = "hsl(var(--muted-foreground))";
      bgColor = "bg-muted";
      label = "En attente";
      emoji = "⏳";
    } else if (ratio < 0.5) {
      color = "hsl(210 80% 60%)"; // Blue
      bgColor = "bg-blue-500";
      label = "Très lent";
      emoji = "🐢";
    } else if (ratio < 0.8) {
      color = "hsl(142 76% 45%)"; // Green
      bgColor = "bg-green-500";
      label = "Bien";
      emoji = "👍";
    } else if (ratio <= 1.2) {
      color = "hsl(142 76% 45%)"; // Green
      bgColor = "bg-emerald-500";
      label = "Parfait";
      emoji = "✅";
    } else if (ratio <= 1.5) {
      color = "hsl(38 92% 50%)"; // Orange
      bgColor = "bg-orange-500";
      label = "Rapide";
      emoji = "⚡";
    } else {
      color = "hsl(0 84% 60%)"; // Red
      bgColor = "bg-red-500";
      label = "Trop vite";
      emoji = "🔴";
    }
    
    return { percentage, color, bgColor, label, emoji };
  }, [sps, targetSps]);

  // Calculate target zone position on the bar
  const targetZone = useMemo(() => {
    const maxSps = 8;
    // Green zone = 50% to 120% of target (good + perfect)
    const zoneMin = targetSps * 0.5;
    const zoneMax = targetSps * 1.2;
    
    return {
      left: (zoneMin / maxSps) * 100,
      width: ((zoneMax - zoneMin) / maxSps) * 100,
    };
  }, [targetSps]);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg">{emoji}</span>
        <span className="text-sm font-medium" style={{ color }}>{label}</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      {/* Label row */}
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xl">{emoji}</span>
            <span className="font-medium" style={{ color }}>{label}</span>
          </div>
          <span className="text-muted-foreground text-xs">
            {sps.toFixed(1)} syll/s
          </span>
        </div>
      )}
      
      {/* Gauge bar */}
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        {/* Target zone indicator (subtle background) */}
        <div 
          className="absolute h-full bg-emerald-200/50 dark:bg-emerald-900/30"
          style={{ 
            left: `${targetZone.left}%`, 
            width: `${targetZone.width}%` 
          }}
        />
        
        {/* Current value bar */}
        <motion.div
          className={`absolute h-full rounded-full ${bgColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
        
        {/* Target marker */}
        <div 
          className="absolute top-0 h-full w-0.5 bg-foreground/30"
          style={{ left: `${(targetSps / 8) * 100}%` }}
        />
      </div>
      
      {/* Scale labels */}
      <div className="flex justify-between text-[10px] text-muted-foreground px-1">
        <span>Lent</span>
        <span>Normal</span>
        <span>Rapide</span>
      </div>
    </div>
  );
};

export default SpeedGaugeBar;
