/**
 * SPS (Syllables Per Second) Utility functions
 * Clinical standard for speech rate measurement
 *
 * Conversion: ~1.5 syllables per English word on average
 * Clinical targets: 2.0-6.0 SPS (vs 120-200 WPM)
 */

import { countSyllables } from './syllabify';

// Maximum realistic SPS for a human speaker (~6 syllables/sec = 360 SPM)
export const MAX_REALISTIC_SPS = 8.0;

// Rolling buffer size for smoothing
export const SPS_BUFFER_SIZE = 5;

// Convert WPM to SPS (for backward compatibility with old data)
export const wpmToSps = (wpm: number): number => {
  // Average English word has ~1.5 syllables
  // WPM * 1.5 = SPM (syllables per minute)
  // SPM / 60 = SPS (syllables per second)
  return Math.round((wpm * 1.5 / 60) * 10) / 10;
};

// Convert SPS to WPM (for display compatibility)
export const spsToWpm = (sps: number): number => {
  // SPS * 60 = SPM
  // SPM / 1.5 = WPM
  return Math.round(sps * 60 / 1.5);
};

/**
 * SPS Target Levels (Clinical Presets)
 */
export interface SPSTargetLevel {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  sps: number;
  label: string;
  description: string;
  emoji: string;
  recommended?: boolean;
}

export const SPS_TARGET_LEVELS: SPSTargetLevel[] = [
  { level: 1, sps: 1.0, label: "Ultra-slow", description: "Deep phonetic work.", emoji: "🐌" },
  { level: 2, sps: 2.0, label: "Tortoise", description: "Maximum control. Articulation drill.", emoji: "🐢" },
  { level: 3, sps: 3.0, label: "Slow", description: "Dictation pace. Great for beginners.", emoji: "🎯" },
  { level: 4, sps: 4.0, label: "Moderate", description: "Natural conversation.", emoji: "💬", recommended: true },
  { level: 5, sps: 5.0, label: "Fast", description: "Sustained rate.", emoji: "⚡" },
  { level: 6, sps: 6.0, label: "Challenge", description: "Push your limits.", emoji: "🏃" },
];

/**
 * Get target level by SPS value
 */
export function getTargetLevelBySPS(sps: number): SPSTargetLevel {
  return SPS_TARGET_LEVELS.reduce((closest, level) => 
    Math.abs(level.sps - sps) < Math.abs(closest.sps - sps) ? level : closest
  );
}

/**
 * Smooth SPS calculation using a rolling buffer
 */
export function smoothSPS(buffer: number[]): number {
  if (buffer.length === 0) return 0;
  
  // Filter out unrealistic spikes
  const validReadings = buffer.filter(sps => sps <= MAX_REALISTIC_SPS && sps >= 0);
  
  if (validReadings.length === 0) return 0;
  
  const sum = validReadings.reduce((a, b) => a + b, 0);
  return Math.round((sum / validReadings.length) * 10) / 10;
}

/**
 * Calculate max SPS with spike protection
 */
export function calculateSafeMaxSPS(history: number[]): number {
  if (history.length === 0) return 0;
  
  // Filter unrealistic values
  const validHistory = history.filter(sps => sps <= MAX_REALISTIC_SPS && sps > 0);
  
  if (validHistory.length === 0) return 0;
  
  // Find the highest value that appears at least 2 times in a 3-reading window
  let safeMax = 0;
  
  for (let i = 0; i < validHistory.length; i++) {
    const sps = validHistory[i];
    
    let sustainedCount = 1;
    const tolerance = 0.5; // 0.5 SPS tolerance
    
    for (let j = Math.max(0, i - 2); j < i; j++) {
      if (Math.abs(validHistory[j] - sps) <= tolerance) {
        sustainedCount++;
      }
    }
    
    for (let j = i + 1; j <= Math.min(validHistory.length - 1, i + 2); j++) {
      if (Math.abs(validHistory[j] - sps) <= tolerance) {
        sustainedCount++;
      }
    }
    
    if (sustainedCount >= 2 && sps > safeMax) {
      safeMax = sps;
    }
  }
  
  if (safeMax === 0) {
    safeMax = Math.max(...validHistory);
  }
  
  return Math.round(safeMax * 10) / 10;
}

/**
 * Adaptive thresholds: more forgiving for low targets (e.g. Tortue 2.0 syll/s).
 * Scale factor is >1 when target < 4, meaning bands widen.
 * Returns { good, bad } absolute diff thresholds.
 */
export function getAdaptiveThresholds(targetSps: number): { good: number; bad: number } {
  const scale = Math.max(1, 4.0 / targetSps);
  return {
    good: Math.round(0.3 * scale * 10) / 10,  // ±0.3 at target 4, ±0.6 at target 2
    bad: Math.round(1.0 * scale * 10) / 10,    // ±1.0 at target 4, ±2.0 at target 2
  };
}

/**
 * Get real-time feedback zone based on current vs target SPS
 */
export type SPSZone = 'perfect' | 'good' | 'warning' | 'danger' | 'too_slow' | 'waiting';

export function getSPSZone(currentSPS: number, targetSPS: number): {
  zone: SPSZone;
  label: string;
  colorClass: string;
  bgClass: string;
} {
  if (currentSPS === 0) {
    return {
      zone: 'waiting',
      label: "Start speaking...",
      colorClass: "text-muted-foreground",
      bgClass: "bg-muted"
    };
  }

  // Proportional thresholds: target is a ceiling, not a bullseye
  const ratio = currentSPS / targetSPS;

  if (ratio < 0.5) {
    return {
      zone: 'too_slow',
      label: "Speed up a bit",
      colorClass: "text-blue-600 dark:text-blue-400",
      bgClass: "bg-blue-100 dark:bg-blue-900/30"
    };
  }

  if (ratio < 0.8) {
    return {
      zone: 'good',
      label: "Good",
      colorClass: "text-green-600 dark:text-green-400",
      bgClass: "bg-green-100 dark:bg-green-900/30"
    };
  }

  if (ratio <= 1.2) {
    return {
      zone: 'perfect',
      label: "Perfect pace",
      colorClass: "text-emerald-600 dark:text-emerald-400",
      bgClass: "bg-emerald-100 dark:bg-emerald-900/30"
    };
  }

  if (ratio <= 1.5) {
    return {
      zone: 'warning',
      label: "Slow down...",
      colorClass: "text-orange-600 dark:text-orange-400",
      bgClass: "bg-orange-100 dark:bg-orange-900/30"
    };
  }

  return {
    zone: 'danger',
    label: "Too fast!",
    colorClass: "text-red-600 dark:text-red-400",
    bgClass: "bg-red-100 dark:bg-red-900/30"
  };
}

/**
 * Get feedback interpretation based on average SPS
 */
export function getSpeedFeedback(avgSps: number, targetSps: number = 4.0): {
  title: string;
  description: string;
  emoji: string;
  colorClass: string;
} {
  if (avgSps === 0) {
    return {
      title: "Incomplete session",
      description: "No speech detected.",
      emoji: "⏸️",
      colorClass: "text-muted-foreground"
    };
  }

  const diff = avgSps - targetSps;
  const { good, bad } = getAdaptiveThresholds(targetSps);

  if (diff >= -good && diff <= good) {
    return {
      title: "Goal reached",
      description: `Your rate of ${avgSps.toFixed(1)} syll/s is right on target (${targetSps.toFixed(1)} syll/s). Great job!`,
      emoji: "✨",
      colorClass: "text-green-600"
    };
  }

  if (diff > good && diff <= bad) {
    return {
      title: "Slightly above target",
      description: `Your rate of ${avgSps.toFixed(1)} syll/s is above the target of ${targetSps.toFixed(1)} syll/s. Try adding more pauses.`,
      emoji: "⚡",
      colorClass: "text-orange-600"
    };
  }

  if (diff > bad) {
    return {
      title: "Too fast",
      description: `Your rate of ${avgSps.toFixed(1)} syll/s is well above the target of ${targetSps.toFixed(1)} syll/s. Try slowing down.`,
      emoji: "🔴",
      colorClass: "text-red-600"
    };
  }

  if (diff < -good && diff >= -bad) {
    return {
      title: "Well controlled",
      description: `Your rate of ${avgSps.toFixed(1)} syll/s is slightly below target. You're doing a great job controlling your pace.`,
      emoji: "🐢",
      colorClass: "text-emerald-600"
    };
  }

  // diff < -bad
  return {
    title: "Very slow pace",
    description: `Your rate of ${avgSps.toFixed(1)} syll/s is well below the target of ${targetSps.toFixed(1)} syll/s. You can gradually increase your pace.`,
    emoji: "🐢",
    colorClass: "text-blue-600"
  };
}

/**
 * Calculate syllables from text and elapsed time to get SPS
 */
export function calculateSPSFromText(text: string, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  const syllables = countSyllables(text);
  return Math.round((syllables / elapsedSeconds) * 10) / 10;
}

/**
 * Format SPS for display
 */
export function formatSPS(sps: number): string {
  return sps.toFixed(1);
}

/**
 * Clinical thresholds for SPS (Van Zaalen 2009 — English adult norms)
 * < 3.0   → Slow — Target Zone (therapy goal)
 * 3.0–4.5 → Conversational (normal adult rate)
 * 4.5–5.5 → Fast — Monitor (borderline cluttering)
 * > 5.5   → Cluttering Range (clinical concern)
 */
export const SPS_THRESHOLDS = {
  targetZone: 3.0,   // Below this = target zone
  conversational: 4.5, // Below this = normal
  monitor: 5.5,      // Below this = borderline
  // Above 5.5 = cluttering range
} as const;

/**
 * Metric tooltips for clinical UI
 */
export const METRIC_TOOLTIPS = {
  sps: "Syllables Per Second (SPS) measures your articulation rate. Silences and pauses are excluded. Typical cluttering range: above 5.5 SPS. Therapy target: below 4.5 SPS.",
  pauseRatio: "Percentage of speech time spent in pauses. Healthy speech includes 20–30% pause time for processing and clarity.",
  disfluencies: "Filler words and revisions (um, uh, like, you know...) per minute. Higher counts may indicate planning difficulties.",
  intelligibility: "Estimated percentage of speech clearly understood by a naive listener.",
} as const;

/**
 * Returns a clinical status label based on average SPS
 * (Van Zaalen 2009 norms for English-speaking adults)
 */
export function getDebitStatus(avgSps: number): {
  label: string;
  shortLabel: string;
  color: "green" | "yellow" | "red" | "gray";
} {
  if (avgSps === 0) {
    return { label: "Not measured", shortLabel: "—", color: "gray" };
  }
  if (avgSps < SPS_THRESHOLDS.targetZone) {
    return { label: "Slow — Target Zone", shortLabel: "Target Zone", color: "green" };
  }
  if (avgSps <= SPS_THRESHOLDS.conversational) {
    return { label: "Conversational", shortLabel: "Conversational", color: "green" };
  }
  if (avgSps <= SPS_THRESHOLDS.monitor) {
    return { label: "Fast — Monitor", shortLabel: "Monitor", color: "yellow" };
  }
  return { label: "Cluttering Range", shortLabel: "Cluttering", color: "red" };
}
