/**
 * Journey Path: 8-step guided progression (Duolingo-style)
 * Each step maps to an exercise category with 3 exercises to validate.
 */

export interface JourneyStep {
  index: number;
  categoryId: string;
  title: string;
  icon: string;
  description: string;
  exerciseIds: string[]; // 3 exercises to validate
  requiredValidations: number;
}

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    index: 0,
    categoryId: "warmup",
    title: "Warm-Up",
    icon: "🏋️",
    description: "Loosen your tongue gently",
    exerciseIds: ["warmup-1", "warmup-2", "warmup-3"],
    requiredValidations: 3,
  },
  {
    index: 1,
    categoryId: "slow-reading",
    title: "Slowing Down",
    icon: "🌱",
    description: "Learn to set your pace",
    exerciseIds: ["slow-1", "slow-2", "slow-3"],
    requiredValidations: 3,
  },
  {
    index: 2,
    categoryId: "breath-control",
    title: "Breath & Pauses",
    icon: "🌬️",
    description: "Breathe to speak better",
    exerciseIds: ["breath-1", "breath-2", "breath-3"],
    requiredValidations: 3,
  },
  {
    index: 3,
    categoryId: "daily-life",
    title: "Daily Life",
    icon: "📧",
    description: "Transfer to real life",
    exerciseIds: ["daily-1", "daily-2", "daily-3"],
    requiredValidations: 3,
  },
  {
    index: 4,
    categoryId: "articulation",
    title: "Articulation Challenges",
    icon: "👅",
    description: "Gain precision",
    exerciseIds: ["artic-1", "artic-2", "artic-3"],
    requiredValidations: 3,
  },
  {
    index: 5,
    categoryId: "improvisation",
    title: "Free Speech",
    icon: "🎤",
    description: "Speak without a net",
    exerciseIds: ["impro-1", "impro-2", "impro-3"],
    requiredValidations: 3,
  },
  {
    index: 6,
    categoryId: "cognitive-traps",
    title: "Cognitive Traps",
    icon: "🧠",
    description: "Stay on track under pressure",
    exerciseIds: ["trap-1", "trap-2", "trap-3"],
    requiredValidations: 3,
  },
  {
    index: 7,
    categoryId: "retelling",
    title: "Summary Narration",
    icon: "📖",
    description: "Synthesize and retell",
    exerciseIds: ["retelling-1", "retelling-2", "retelling-3"],
    requiredValidations: 3,
  },
];

export const TOTAL_STEPS = JOURNEY_STEPS.length;
