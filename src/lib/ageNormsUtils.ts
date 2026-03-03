/**
 * Age-Based SPS Norms (Van Zaalen)
 * Clinical speech rate calibration based on age groups
 * 
 * Reference: Van Zaalen, Y., Wijnen, F., & Dejonckere, P. H.
 */

// Age group definitions
export type AgeGroup = 'child' | 'adolescent' | 'adult' | 'senior';

export interface AgeNorm {
  group: AgeGroup;
  label: string;
  emoji: string;
  minAge: number;
  maxAge: number;
  normSPS: number;
  description: string;
}

// Van Zaalen clinical norms for articulation rate
export const AGE_NORMS: AgeNorm[] = [
  {
    group: 'child',
    label: 'Child',
    emoji: '👶',
    minAge: 0,
    maxAge: 12,
    normSPS: 4.2,
    description: 'Developing articulation rate'
  },
  {
    group: 'adolescent',
    label: 'Adolescent',
    emoji: '🧑',
    minAge: 13,
    maxAge: 20,
    normSPS: 5.5,
    description: 'Peak physiological speed'
  },
  {
    group: 'adult',
    label: 'Adult',
    emoji: '👤',
    minAge: 21,
    maxAge: 60,
    normSPS: 5.0,
    description: 'Stabilized rate'
  },
  {
    group: 'senior',
    label: 'Senior',
    emoji: '🧓',
    minAge: 61,
    maxAge: 120,
    normSPS: 4.5,
    description: 'Natural physiological slowing'
  }
];

// Default norm for fallback (adult)
export const DEFAULT_NORM_SPS = 5.0;

/**
 * Calculate age from birth year
 */
export function calculateAge(birthYear: number): number {
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear;
}

/**
 * Get the appropriate age group for a given birth year
 */
export function getAgeGroup(birthYear: number | null): AgeNorm {
  if (!birthYear) {
    return AGE_NORMS.find(n => n.group === 'adult')!;
  }
  
  const age = calculateAge(birthYear);
  
  for (const norm of AGE_NORMS) {
    if (age >= norm.minAge && age <= norm.maxAge) {
      return norm;
    }
  }
  
  // Fallback to adult
  return AGE_NORMS.find(n => n.group === 'adult')!;
}

/**
 * Get the clinical norm SPS for a given birth year
 * This is the center of the "green zone" for the user
 */
export function getNormSPS(birthYear: number | null): number {
  const ageGroup = getAgeGroup(birthYear);
  return ageGroup.normSPS;
}

/**
 * Get the age group label for display
 */
export function getAgeGroupLabel(birthYear: number | null): string {
  const ageGroup = getAgeGroup(birthYear);
  return ageGroup.label;
}

/**
 * Dynamic level interface for calibrated targets
 */
export interface DynamicSPSLevel {
  level: number;
  sps: number;
  label: string;
  description: string;
  emoji: string;
  recommended: boolean;
  isAboveNorm: boolean;
}

/**
 * Generate 5 dynamic levels centered on the user's norm SPS
 * Level 3 is always the recommended level (the norm)
 */
export function getDynamicLevels(normSPS: number): DynamicSPSLevel[] {
  // 6 levels: 1 to 6 syll/s, level N = N syll/s
  return [
    {
      level: 1,
      sps: 1.0,
      label: "Ultra-slow",
      description: "Deep phonetic work.",
      emoji: "🐌",
      recommended: Math.abs(1.0 - normSPS) < 0.5,
      isAboveNorm: 1.0 > normSPS + 0.5
    },
    {
      level: 2,
      sps: 2.0,
      label: "Tortoise",
      description: "Maximum control.",
      emoji: "🐢",
      recommended: Math.abs(2.0 - normSPS) < 0.5,
      isAboveNorm: 2.0 > normSPS + 0.5
    },
    {
      level: 3,
      sps: 3.0,
      label: "Slow",
      description: "Dictation pace.",
      emoji: "🎯",
      recommended: Math.abs(3.0 - normSPS) < 0.5,
      isAboveNorm: 3.0 > normSPS + 0.5
    },
    {
      level: 4,
      sps: 4.0,
      label: "Moderate",
      description: "Natural conversation.",
      emoji: "💬",
      recommended: Math.abs(4.0 - normSPS) < 0.5,
      isAboveNorm: 4.0 > normSPS + 0.5
    },
    {
      level: 5,
      sps: 5.0,
      label: "Fast",
      description: "Sustained rate.",
      emoji: "⚡",
      recommended: Math.abs(5.0 - normSPS) < 0.5,
      isAboveNorm: 5.0 > normSPS + 0.5
    },
    {
      level: 6,
      sps: 6.0,
      label: "Challenge",
      description: "Push your limits.",
      emoji: "🏃",
      recommended: Math.abs(6.0 - normSPS) < 0.5,
      isAboveNorm: 6.0 > normSPS + 0.5
    }
  ];
}

/**
 * Extended 6-level system (1 to 6 SPS, for advanced mode)
 */
export function getExtendedLevels(normSPS: number): DynamicSPSLevel[] {
  const levels: DynamicSPSLevel[] = [];
  
  for (let i = 1; i <= 6; i++) {
    const sps = i * 1.0;
    const isNorm = Math.abs(sps - normSPS) < 0.5;
    const isAboveNorm = sps > normSPS + 0.5;
    
    let label = "";
    let emoji = "";
    let description = "";
    
    switch (i) {
      case 1:
        label = "Ultra-slow";
        emoji = "🐌";
        description = "Extreme articulation.";
        break;
      case 2:
        label = "Tortoise";
        emoji = "🐢";
        description = "Maximum control.";
        break;
      case 3:
        label = "Slow";
        emoji = "🎯";
        description = "Dictation pace.";
        break;
      case 4:
        label = "Moderate";
        emoji = "💬";
        description = "Natural conversation.";
        break;
      case 5:
        label = "Fast";
        emoji = "⚡";
        description = "Sustained rate.";
        break;
      case 6:
        label = "Challenge";
        emoji = "🏃";
        description = "Push your limits.";
        break;
    }

    // Override for the norm level
    if (isNorm) {
      label = "Recommended";
      emoji = "✅";
      description = "Your clinical norm.";
    }
    
    levels.push({
      level: i,
      sps,
      label,
      description,
      emoji,
      recommended: isNorm,
      isAboveNorm
    });
  }
  
  return levels;
}

/**
 * Check if a selected SPS exceeds the safe threshold above the user's norm
 */
export function isAboveSafeThreshold(selectedSPS: number, normSPS: number): boolean {
  return selectedSPS > normSPS + 1.5;
}

/**
 * Get a warning message for selections above the safe threshold
 */
export function getAboveNormWarning(selectedSPS: number, normSPS: number, ageGroupLabel: string): string | null {
  if (!isAboveSafeThreshold(selectedSPS, normSPS)) {
    return null;
  }
  
  const diff = Math.round((selectedSPS - normSPS) * 10) / 10;
  return `This level exceeds the ${ageGroupLabel.toLowerCase()} physiological norm by ${diff} syll/sec. Increase gradually.`;
}

/**
 * Validate birth year input
 */
export function validateBirthYear(year: number): { valid: boolean; error?: string } {
  const currentYear = new Date().getFullYear();
  const minYear = 1920;
  const maxYear = currentYear - 5; // Minimum 5 years old
  
  if (!Number.isInteger(year)) {
    return { valid: false, error: "Year must be a whole number" };
  }

  if (year < minYear) {
    return { valid: false, error: `Year must be after ${minYear}` };
  }

  if (year > maxYear) {
    return { valid: false, error: `Year must be before ${maxYear}` };
  }
  
  return { valid: true };
}
