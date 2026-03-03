import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface CategoryIntro {
  icon: string;
  title: string;
  goal: string;
  steps: { emoji: string; text: string }[];
  tip: string;
}

const categoryIntros: Record<string, CategoryIntro> = {
  "slow-reading": {
    icon: "🌱",
    title: "Slowdown",
    goal: "Learn to slow your speech rate by reading texts aloud at a guided pace.",
    steps: [
      { emoji: "🎯", text: "Choose a target speed" },
      { emoji: "📖", text: "Follow the highlighted text word by word" },
      { emoji: "🎤", text: "Read aloud following the rhythm" },
      { emoji: "🎧", text: "Feedback kicks in after a few words — speak naturally" },
    ],
    tip: "The guided mode supports you — let the rhythm carry you!",
  },
  "daily-life": {
    icon: "🏠",
    title: "Daily Life",
    goal: "Practice with everyday texts to apply controlled speech rate in realistic situations.",
    steps: [
      { emoji: "📖", text: "Read the everyday text" },
      { emoji: "🎤", text: "Record your reading" },
      { emoji: "📊", text: "Monitor your rate in real time" },
      { emoji: "🎧", text: "Feedback kicks in after a few words — speak naturally" },
    ],
    tip: "Imagine you're telling this story to a friend.",
  },
  "articulation": {
    icon: "👄",
    title: "Articulation Challenges",
    goal: "Work on articulatory precision with tongue twisters and complex phrases.",
    steps: [
      { emoji: "👀", text: "Read the text silently first" },
      { emoji: "🐢", text: "Start slowly, then speed up" },
      { emoji: "🎯", text: "Aim for clarity, not speed" },
    ],
    tip: "Precision matters more than speed.",
  },
  "clinical-texts": {
    icon: "🏥",
    title: "Clinical Texts",
    goal: "Standardized texts used in speech therapy to evaluate and track your progress.",
    steps: [
      { emoji: "📋", text: "Scientifically calibrated texts" },
      { emoji: "🎤", text: "Read aloud naturally" },
      { emoji: "📊", text: "Compare your results over time" },
    ],
    tip: "Read as you would in a therapy session.",
  },
  "warmup": {
    icon: "🤸",
    title: "Articulatory Warm-up",
    goal: "Warm up your speech muscles before a session or an important speaking engagement.",
    steps: [
      { emoji: "⏱️", text: "Short, targeted exercises" },
      { emoji: "🔁", text: "Repeat each movement several times" },
      { emoji: "💪", text: "Feel your mouth muscles working" },
    ],
    tip: "Like an athlete, a good warm-up improves performance.",
  },
  "improvisation": {
    icon: "💬",
    title: "Guided Improvisation",
    goal: "Speak freely on a given topic while controlling your rate — no text to read.",
    steps: [
      { emoji: "🎲", text: "A topic is suggested to you" },
      { emoji: "🎤", text: "Speak freely for 1 to 2 minutes" },
      { emoji: "📊", text: "Your rate is measured in real time" },
      { emoji: "🎧", text: "Feedback kicks in after a few words — speak naturally" },
    ],
    tip: "There's no right or wrong answer — express yourself!",
  },
  "motor-challenges": {
    icon: "⚡",
    title: "Motor Challenges",
    goal: "Test your articulatory agility with diadochokinetic exercises (rapid repetitions).",
    steps: [
      { emoji: "🔁", text: "Repeat syllables as fast as possible" },
      { emoji: "🎯", text: "Keep a regular rhythm" },
      { emoji: "📈", text: "Measure your articulatory speed" },
    ],
    tip: "Regularity > Speed. Keep a steady rhythm.",
  },
  "breath-control": {
    icon: "🌬️",
    title: "Breath Control",
    goal: "Learn to manage your breathing to support fluent, composed speech.",
    steps: [
      { emoji: "🫁", text: "Work on diaphragmatic breathing" },
      { emoji: "📖", text: "Read long passages in a single breath" },
      { emoji: "⏸️", text: "Mark your breathing pauses" },
    ],
    tip: "Breath is the fuel of speech.",
  },
  "cognitive-traps": {
    icon: "🧠",
    title: "Cognitive Traps",
    goal: "Train your brain to resist speeding up when facing complex texts.",
    steps: [
      { emoji: "🪤", text: "Texts designed to make you speed up" },
      { emoji: "🎯", text: "Maintain your target speed" },
      { emoji: "💡", text: "Spot the moments when you speed up" },
    ],
    tip: "The trap is in the complexity — stay focused on the rhythm.",
  },
  "auto-controle": {
    icon: "🪞",
    title: "Self-Monitoring",
    goal: "Develop your ability to self-evaluate and correct your rate in real time.",
    steps: [
      { emoji: "👂", text: "Listen to yourself speak carefully" },
      { emoji: "🔄", text: "Adjust your rate on the fly" },
      { emoji: "📊", text: "Compare your perception with the measurements" },
    ],
    tip: "The goal is to become your own coach.",
  },
  "rebus-enfant": {
    icon: "🧒",
    title: "Rebus Mode",
    goal: "A fun mode with pictures to practice speech while having fun.",
    steps: [
      { emoji: "🖼️", text: "Look at the pictures that form the word" },
      { emoji: "🗣️", text: "Say the word out loud" },
      { emoji: "⭐", text: "Earn stars for each success" },
    ],
    tip: "Have fun! Play is the best way to learn.",
  },
  "teen-life": {
    icon: "🎒",
    title: "Teen Situations",
    goal: "Texts about teen life to practice on topics that speak to you.",
    steps: [
      { emoji: "📱", text: "Everyday teen topics" },
      { emoji: "🎤", text: "Read at your own pace" },
      { emoji: "📊", text: "Track your progress" },
    ],
    tip: "It's your training — go at your own pace.",
  },
  "retelling": {
    icon: "📖",
    title: "Story Retelling",
    goal: "Listen to a story, then retell it from memory. Work on summarizing and structuring your speech.",
    steps: [
      { emoji: "👂", text: "Listen carefully to the story" },
      { emoji: "🎤", text: "Retell it from memory in your own words" },
      { emoji: "✅", text: "An algorithm checks if the key points are mentioned" },
    ],
    tip: "No need to remember everything — the essentials are enough!",
  },
  "dialogue": {
    icon: "💬",
    title: "Dialogue Mode",
    goal: "Speak freely in conversation while monitoring your rate with discreet visual feedback.",
    steps: [
      { emoji: "⏱️", text: "Choose a duration and target speed" },
      { emoji: "🗣️", text: "Speak naturally, like in conversation" },
      { emoji: "😊", text: "An emoji shows your pace in real time" },
      { emoji: "🎧", text: "Feedback kicks in after a few words — speak naturally" },
    ],
    tip: "The rate is automatically smoothed for stable, stress-free feedback.",
  },
  "dialogue-lab": {
    icon: "🔬",
    title: "Dialogue Lab",
    goal: "Analyze your rate by word chunks for ultra-precise feedback on your rhythm.",
    steps: [
      { emoji: "📦", text: "Choose the chunk size (5, 10, 15, or 20 words)" },
      { emoji: "🎤", text: "Speak freely" },
      { emoji: "📊", text: "Each chunk is analyzed individually" },
    ],
    tip: "An experimental tool for the detail-curious.",
  },
};

const STORAGE_KEY = "exercise-intro-seen";

function getSeenCategories(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markCategorySeen(categoryId: string) {
  const seen = getSeenCategories();
  seen.add(categoryId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]));
}

interface ExerciseIntroModalProps {
  categoryId: string | null;
  onDismiss: () => void;
}

const ExerciseIntroModal = ({ categoryId, onDismiss }: ExerciseIntroModalProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!categoryId) return;
    const seen = getSeenCategories();
    if (!seen.has(categoryId) && categoryIntros[categoryId]) {
      setOpen(true);
    }
  }, [categoryId]);

  const handleClose = () => {
    if (categoryId) markCategorySeen(categoryId);
    setOpen(false);
    onDismiss();
  };

  if (!categoryId || !categoryIntros[categoryId]) return null;

  const intro = categoryIntros[categoryId];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 gap-0">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent px-6 pt-8 pb-5 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
            className="text-5xl mb-3"
          >
            {intro.icon}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-xl font-bold text-foreground"
          >
            {intro.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-sm text-muted-foreground mt-2 leading-relaxed"
          >
            {intro.goal}
          </motion.p>
        </div>

        {/* Steps */}
        <div className="px-6 py-5 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            How it works
          </p>
          {intro.steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50"
            >
              <span className="text-xl flex-shrink-0">{step.emoji}</span>
              <span className="text-sm text-foreground">{step.text}</span>
            </motion.div>
          ))}
        </div>

        {/* Tip + CTA */}
        <div className="px-6 pb-6 space-y-4">
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
            <span className="text-sm">💡</span>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">{intro.tip}</p>
          </div>
          <Button onClick={handleClose} size="lg" className="w-full gap-2">
            Let's go!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseIntroModal;
