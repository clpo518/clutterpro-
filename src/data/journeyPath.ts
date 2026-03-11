/**
 * Journey Path: 8-step guided progression (Duolingo-style)
 * Two distinct paths based on the user's fluency goal:
 *   - SPEED: for cluttering / tachylalia (default)
 *   - FLUENCY: for stuttering (starts with breathing, includes silence tolerance & dialogue)
 */

export type FluencyGoal = "speed" | "fluency";

export interface JourneyStep {
  index: number;
  categoryId: string;
  title: string;
  icon: string;
  description: string;
  exerciseIds: string[]; // 3 exercises to validate
  requiredValidations: number;
  /** Optional: route override instead of /practice?category=... */
  customRoute?: string;
}

// ── Speed path (cluttering / tachylalia) ───────────────────────
export const JOURNEY_STEPS_SPEED: JourneyStep[] = [
  {
    index: 0,
    categoryId: "warmup",
    title: "Warm-Up",
    icon: "\u{1F3CB}\uFE0F",
    description: "Loosen your tongue gently",
    exerciseIds: ["warmup-1", "warmup-2", "warmup-3"],
    requiredValidations: 3,
  },
  {
    index: 1,
    categoryId: "slow-reading",
    title: "Slowing Down",
    icon: "\u{1F331}",
    description: "Learn to set your pace",
    exerciseIds: ["slow-1", "slow-2", "slow-3"],
    requiredValidations: 3,
  },
  {
    index: 2,
    categoryId: "breath-control",
    title: "Breath & Pauses",
    icon: "\u{1F32C}\uFE0F",
    description: "Breathe to speak better",
    exerciseIds: ["breath-1", "breath-2", "breath-3"],
    requiredValidations: 3,
  },
  {
    index: 3,
    categoryId: "daily-life",
    title: "Daily Life",
    icon: "\u{1F4E7}",
    description: "Transfer to real life",
    exerciseIds: ["daily-1", "daily-2", "daily-3"],
    requiredValidations: 3,
  },
  {
    index: 4,
    categoryId: "articulation",
    title: "Articulation Challenges",
    icon: "\u{1F445}",
    description: "Gain precision",
    exerciseIds: ["artic-1", "artic-2", "artic-3"],
    requiredValidations: 3,
  },
  {
    index: 5,
    categoryId: "improvisation",
    title: "Free Speech",
    icon: "\u{1F3A4}",
    description: "Speak without a net",
    exerciseIds: ["impro-1", "impro-2", "impro-3"],
    requiredValidations: 3,
  },
  {
    index: 6,
    categoryId: "cognitive-traps",
    title: "Cognitive Traps",
    icon: "\u{1F9E0}",
    description: "Stay on track under pressure",
    exerciseIds: ["trap-1", "trap-2", "trap-3"],
    requiredValidations: 3,
  },
  {
    index: 7,
    categoryId: "retelling",
    title: "Summary Narration",
    icon: "\u{1F4D6}",
    description: "Synthesize and retell",
    exerciseIds: ["retelling-1", "retelling-2", "retelling-3"],
    requiredValidations: 3,
  },
];

// ── Fluency path (stuttering) ──────────────────────────────────
export const JOURNEY_STEPS_FLUENCY: JourneyStep[] = [
  {
    index: 0,
    categoryId: "breath-control",
    title: "Breath & Pauses",
    icon: "\u{1F32C}\uFE0F",
    description: "Ground yourself with breathing",
    exerciseIds: ["breath-1", "breath-2", "breath-3"],
    requiredValidations: 3,
  },
  {
    index: 1,
    categoryId: "silence-training",
    title: "Silence Tolerance",
    icon: "\u{1F910}",
    description: "Get comfortable with pauses",
    exerciseIds: ["silence-1", "silence-2", "silence-3"],
    requiredValidations: 3,
    customRoute: "/silence-training",
  },
  {
    index: 2,
    categoryId: "slow-reading",
    title: "Slowing Down",
    icon: "\u{1F331}",
    description: "Find a steady pace",
    exerciseIds: ["slow-1", "slow-2", "slow-3"],
    requiredValidations: 3,
  },
  {
    index: 3,
    categoryId: "daily-life",
    title: "Daily Life",
    icon: "\u{1F4E7}",
    description: "Transfer to real life",
    exerciseIds: ["daily-1", "daily-2", "daily-3"],
    requiredValidations: 3,
  },
  {
    index: 4,
    categoryId: "improvisation",
    title: "Dialogue",
    icon: "\u{1F4AC}",
    description: "Speak freely in conversation",
    exerciseIds: ["impro-1", "impro-2", "impro-3"],
    requiredValidations: 3,
  },
  {
    index: 5,
    categoryId: "articulation",
    title: "Articulation Challenges",
    icon: "\u{1F445}",
    description: "Build precision and control",
    exerciseIds: ["artic-1", "artic-2", "artic-3"],
    requiredValidations: 3,
  },
  {
    index: 6,
    categoryId: "cognitive-traps",
    title: "Cognitive Traps",
    icon: "\u{1F9E0}",
    description: "Stay on track under pressure",
    exerciseIds: ["trap-1", "trap-2", "trap-3"],
    requiredValidations: 3,
  },
  {
    index: 7,
    categoryId: "retelling",
    title: "Summary Narration",
    icon: "\u{1F4D6}",
    description: "Synthesize and retell",
    exerciseIds: ["retelling-1", "retelling-2", "retelling-3"],
    requiredValidations: 3,
  },
];

/** Backward-compatible alias — defaults to speed path */
export const JOURNEY_STEPS = JOURNEY_STEPS_SPEED;

/** Pick the right path based on goal */
export function getJourneySteps(goal: FluencyGoal = "speed"): JourneyStep[] {
  return goal === "fluency" ? JOURNEY_STEPS_FLUENCY : JOURNEY_STEPS_SPEED;
}

export const TOTAL_STEPS = 8;
