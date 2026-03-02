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
    title: "Échauffement",
    icon: "🏋️",
    description: "Déliez votre langue en douceur",
    exerciseIds: ["warmup-1", "warmup-2", "warmup-3"],
    requiredValidations: 3,
  },
  {
    index: 1,
    categoryId: "slow-reading",
    title: "Ralentir le débit",
    icon: "🌱",
    description: "Apprenez à poser votre rythme",
    exerciseIds: ["slow-1", "slow-2", "slow-3"],
    requiredValidations: 3,
  },
  {
    index: 2,
    categoryId: "breath-control",
    title: "Souffle & pauses",
    icon: "🌬️",
    description: "Respirez pour mieux parler",
    exerciseIds: ["breath-1", "breath-2", "breath-3"],
    requiredValidations: 3,
  },
  {
    index: 3,
    categoryId: "daily-life",
    title: "Vie quotidienne",
    icon: "📧",
    description: "Transférez dans la vraie vie",
    exerciseIds: ["daily-1", "daily-2", "daily-3"],
    requiredValidations: 3,
  },
  {
    index: 4,
    categoryId: "articulation",
    title: "Défis d'articulation",
    icon: "👅",
    description: "Gagnez en précision",
    exerciseIds: ["artic-1", "artic-2", "artic-3"],
    requiredValidations: 3,
  },
  {
    index: 5,
    categoryId: "improvisation",
    title: "Oral libre",
    icon: "🎤",
    description: "Parlez sans filet",
    exerciseIds: ["impro-1", "impro-2", "impro-3"],
    requiredValidations: 3,
  },
  {
    index: 6,
    categoryId: "cognitive-traps",
    title: "Pièges cognitifs",
    icon: "🧠",
    description: "Gardez le cap sous pression",
    exerciseIds: ["trap-1", "trap-2", "trap-3"],
    requiredValidations: 3,
  },
  {
    index: 7,
    categoryId: "retelling",
    title: "Récit résumé",
    icon: "📖",
    description: "Synthétisez et racontez",
    exerciseIds: ["retelling-1", "retelling-2", "retelling-3"],
    requiredValidations: 3,
  },
];

export const TOTAL_STEPS = JOURNEY_STEPS.length;
