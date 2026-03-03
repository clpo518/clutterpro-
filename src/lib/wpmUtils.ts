/**
 * WPM Utility functions for smoothing and interpretation
 * Now with SPS (Syllables Per Second) support
 */

import { wpmToSps } from "@/lib/spsUtils";

// Maximum realistic WPM for a human speaker
export const MAX_REALISTIC_WPM = 350;

// Rolling buffer size for smoothing
export const WPM_BUFFER_SIZE = 5;

/**
 * Smooth WPM calculation using a rolling buffer
 */
export function smoothWPM(buffer: number[]): number {
  if (buffer.length === 0) return 0;
  
  // Filter out unrealistic spikes
  const validReadings = buffer.filter(wpm => wpm <= MAX_REALISTIC_WPM && wpm >= 0);
  
  if (validReadings.length === 0) return 0;
  
  const sum = validReadings.reduce((a, b) => a + b, 0);
  return Math.round(sum / validReadings.length);
}

/**
 * Calculate max WPM with spike protection
 * Only accept a new max if it stays high for > 2 readings
 */
export function calculateSafeMaxWPM(history: number[]): number {
  if (history.length === 0) return 0;
  
  // Filter unrealistic values
  const validHistory = history.filter(wpm => wpm <= MAX_REALISTIC_WPM && wpm > 0);
  
  if (validHistory.length === 0) return 0;
  
  // Find the highest value that appears at least 2 times in a 3-reading window
  let safeMax = 0;
  
  for (let i = 0; i < validHistory.length; i++) {
    const wpm = validHistory[i];
    
    // Check if this value (or close to it) appears in nearby readings
    let sustainedCount = 1;
    const tolerance = 20; // 20 WPM tolerance
    
    // Check previous 2 readings
    for (let j = Math.max(0, i - 2); j < i; j++) {
      if (Math.abs(validHistory[j] - wpm) <= tolerance) {
        sustainedCount++;
      }
    }
    
    // Check next 2 readings
    for (let j = i + 1; j <= Math.min(validHistory.length - 1, i + 2); j++) {
      if (Math.abs(validHistory[j] - wpm) <= tolerance) {
        sustainedCount++;
      }
    }
    
    // Only count as max if sustained for at least 2 readings
    if (sustainedCount >= 2 && wpm > safeMax) {
      safeMax = wpm;
    }
  }
  
  // Fallback to simple max if no sustained peak found
  if (safeMax === 0) {
    safeMax = Math.max(...validHistory);
  }
  
  return safeMax;
}

/**
 * Get feedback interpretation based on average WPM (displayed as SPS)
 */
export function getSpeedFeedback(avgWpm: number): {
  title: string;
  description: string;
  emoji: string;
  colorClass: string;
} {
  const sps = wpmToSps(avgWpm);
  
  if (avgWpm === 0) {
    return {
      title: "Session too short",
      description: "We didn't capture enough speech. Try again speaking a little louder.",
      emoji: "⏸️",
      colorClass: "text-muted-foreground"
    };
  }
  
  if (sps < 3.0) {
    return {
      title: "Target Zone ✓",
      description: "Excellent rate control — you stayed in the target zone. Your listener can follow every word.",
      emoji: "🎯",
      colorClass: "text-emerald-600"
    };
  }

  if (sps <= 4.5) {
    return {
      title: "Conversational rate",
      description: "Good work. Your rate was mostly controlled with a few fast bursts. Keep using the phrasing technique.",
      emoji: "✨",
      colorClass: "text-green-600"
    };
  }

  if (sps <= 5.5) {
    return {
      title: "Rate climbing — monitor",
      description: "Your rate climbed above 5.0 SPS. Try the phrasing technique on your next attempt. Use a 'pause and check' before key sentences.",
      emoji: "⚡",
      colorClass: "text-orange-600"
    };
  }

  return {
    title: "Cluttering range",
    description: "Your rate is above 5.5 SPS. Focus on pausing between phrases. Give yourself a speeding ticket and try again at a slower pace.",
    emoji: "🔴",
    colorClass: "text-red-600"
  };
}

/**
 * Coach Feedback Interface for enriched session analysis
 */
export interface CoachFeedback {
  verdict: {
    title: string;
    description: string;
    emoji: string;
    colorClass: string;
  };
  stability: {
    score: 'excellent' | 'good' | 'warning';
    title: string;
    description: string;
    emoji: string;
  };
  contextualTip: string;
  exerciseReminder?: string;
}

/**
 * Get contextual tip based on exercise category
 */
function getContextualTip(categoryId?: string): string {
  switch (categoryId) {
    case 'slow-reading':
    case 'reading-aloud':
      return "Use a 'slow and go' approach — pause before key words. Think in phrases, not words.";
    case 'daily-life':
    case 'functional-communication':
      return "Try applying this rate in a real conversation today — that's where therapy gains transfer.";
    case 'articulation':
    case 'over-articulation':
    case 'motor-challenges':
      return "Your job is to monitor, not to be perfect. Precision over speed — restart slowly if needed.";
    case 'improvisation':
    case 'conversational-practice':
      return "One idea per phrase. Give yourself a speeding ticket if you feel your rate climbing.";
    case 'warmup':
    case 'breathing-preparation':
      return "Good warm-up session! Follow it with a reading exercise to reinforce rate control.";
    case 'self-monitoring':
      return "Record yourself and listen back — your ear is your best tool for catching fast speech.";
    case 'phrasing-pausing':
      return "Focus on pausing between phrases. A 1-second pause after each sentence feels long to you — it feels natural to your listener.";
    default:
      return "Breathe between sentences — it's the single most effective habit for rate control.";
  }
}

/**
 * Analyze stability based on avg vs max WPM difference
 */
function getStabilityAnalysis(avgWpm: number, maxWpm: number): CoachFeedback['stability'] {
  if (avgWpm === 0 || maxWpm === 0) {
    return {
      score: 'warning',
      title: "Not enough data",
      description: "The session was too short to evaluate consistency. Try again with a longer text.",
      emoji: "📊"
    };
  }

  const variance = ((maxWpm - avgWpm) / avgWpm) * 100;

  if (variance < 20) {
    return {
      score: 'excellent',
      title: "Very stable pace 🎯",
      description: `Only ${Math.round(variance)}% variation — you're maintaining great control.`,
      emoji: "🎯"
    };
  }

  if (variance < 40) {
    return {
      score: 'good',
      title: "Good consistency",
      description: `Some acceleration detected (${Math.round(variance)}% variation), but your overall rhythm stays stable.`,
      emoji: "📈"
    };
  }

  return {
    score: 'warning',
    title: "Variable pace",
    description: `${Math.round(variance)}% gap between your average and peak rate. Breathing exercises can help.`,
    emoji: "🌬️"
  };
}

/**
 * Generate comprehensive coach feedback for a session
 */
export function generateCoachFeedback(
  avgWpm: number,
  maxWpm: number,
  targetWpm?: number,
  categoryId?: string,
  exerciseTip?: string
): CoachFeedback {
  // Get base verdict from existing function
  const baseVerdict = getSpeedFeedback(avgWpm);
  const avgSps = wpmToSps(avgWpm);
  const targetSps = targetWpm ? wpmToSps(targetWpm) : null;
  
  // Enrich verdict with target comparison if available
  let verdictDescription = baseVerdict.description;
  if (targetSps && avgSps > 0) {
    const diff = Math.round((avgSps - targetSps) * 10) / 10;
    if (Math.abs(diff) <= 0.3) {
      verdictDescription = `Goal reached! You targeted ${targetSps} syll/s and averaged ${avgSps} syll/s. ${baseVerdict.description}`;
    } else if (diff < 0) {
      verdictDescription = `You are ${Math.abs(diff)} syll/sec below your target of ${targetSps} syll/sec. ${baseVerdict.description}`;
    } else {
      verdictDescription = `You are ${diff} syll/sec above your target of ${targetSps} syll/sec. ${baseVerdict.description}`;
    }
  }

  return {
    verdict: {
      ...baseVerdict,
      description: verdictDescription
    },
    stability: getStabilityAnalysis(avgWpm, maxWpm),
    contextualTip: getContextualTip(categoryId),
    exerciseReminder: exerciseTip
  };
}
