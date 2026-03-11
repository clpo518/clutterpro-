import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import BreathingGuide from "@/components/practice/BreathingGuide";

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
  "silence-training": {
    icon: "\u{1F910}",
    title: "Silence Tolerance",
    goal: "Practice being comfortable with pauses in conversation through structured silence exercises.",
    steps: [
      { emoji: "\u{1F4AC}", text: "A question appears on screen" },
      { emoji: "\u{1F910}", text: "Wait in silence \u2014 a timer counts down" },
      { emoji: "\u{1F5E3}\uFE0F", text: "When prompted, answer naturally" },
      { emoji: "\u{1F504}", text: "Repeat with longer pauses each round" },
    ],
    tip: "Silence isn't emptiness \u2014 it's a breathing space that gives your words power.",
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
  "neuro-projection": {
    icon: "📢",
    title: "Vocal Projection",
    goal: "Strengthen your voice volume using real-time biofeedback. No speed measurement — only loudness.",
    steps: [
      { emoji: "🎙️", text: "A short calibration measures your baseline volume" },
      { emoji: "📢", text: "Read the prompt, projecting your voice" },
      { emoji: "📊", text: "A live gauge shows if you're in the target zone" },
      { emoji: "🎯", text: "Aim to stay in the green zone as long as possible" },
    ],
    tip: "Push from your diaphragm, not your throat. Imagine someone 10 feet away needs to hear you.",
  },
  "neuro-articulation": {
    icon: "🧠",
    title: "Neuro Articulation",
    goal: "Targeted oral-motor exercises for motor speech precision — fricatives, praxis, diadochokinesis, and more.",
    steps: [
      { emoji: "👄", text: "Read the exercise instructions carefully" },
      { emoji: "🔁", text: "Repeat each pattern slowly, then speed up" },
      { emoji: "🪞", text: "Use a mirror to check your mouth movements" },
      { emoji: "🎯", text: "Clarity over speed — precision matters most" },
    ],
    tip: "These exercises come from clinical motor speech therapy. Exaggerate each movement.",
  },
  "neuro-narrative": {
    icon: "🧩",
    title: "Narrative Coherence",
    goal: "Listen to a short story, then retell it from memory. Trains sequencing, working memory, and structured speech.",
    steps: [
      { emoji: "👂", text: "Listen to or read the story carefully" },
      { emoji: "🎤", text: "Retell it from memory in your own words" },
      { emoji: "✅", text: "An algorithm checks if the key points are covered" },
      { emoji: "🧠", text: "Work on ordering events logically" },
    ],
    tip: "You don't need to remember every word — focus on the main events in order.",
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
  /** When true, forces the modal open even if the user has already seen it */
  forceOpen?: boolean;
}

const ExerciseIntroModal = ({ categoryId, onDismiss, forceOpen }: ExerciseIntroModalProps) => {
  const [open, setOpen] = useState(false);
  const [showBreathWarmup, setShowBreathWarmup] = useState(false);

  useEffect(() => {
    if (!categoryId) return;
    if (!categoryIntros[categoryId]) return;
    if (forceOpen) {
      setOpen(true);
      return;
    }
    const seen = getSeenCategories();
    if (!seen.has(categoryId)) {
      setOpen(true);
    }
  }, [categoryId, forceOpen]);

  const handleClose = () => {
    if (categoryId) markCategorySeen(categoryId);
    setOpen(false);
    setShowBreathWarmup(false);
    onDismiss();
  };

  if (!categoryId || !categoryIntros[categoryId]) return null;

  const intro = categoryIntros[categoryId];
  const isBreathCategory = categoryId === "breath-control";

  // Breathing warmup sub-view
  if (showBreathWarmup) {
    return (
      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-0 gap-0">
          <div className="px-6 pt-6 pb-2 text-center">
            <h2 className="text-lg font-bold text-foreground mb-1">Quick Breathing Warmup</h2>
            <p className="text-xs text-muted-foreground">Square breathing: 4 cycles to center yourself</p>
          </div>
          <div className="px-6 py-2">
            <BreathingGuide
              pattern="square"
              cycles={3}
              compact
              onComplete={() => {
                setTimeout(handleClose, 1500);
              }}
            />
          </div>
          <div className="px-6 pb-5">
            <Button variant="ghost" onClick={handleClose} size="sm" className="w-full text-muted-foreground">
              Skip warmup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
        <div className="px-6 pb-6 space-y-3">
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
            <span className="text-sm">{"\u{1F4A1}"}</span>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">{intro.tip}</p>
          </div>
          {isBreathCategory && (
            <Button
              variant="outline"
              onClick={() => setShowBreathWarmup(true)}
              size="lg"
              className="w-full gap-2"
            >
              {"\u{1F32C}\uFE0F"} Breathing warmup first
            </Button>
          )}
          <Button onClick={handleClose} size="lg" className="w-full gap-2">
            {isBreathCategory ? "Start exercise" : "Let's go!"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseIntroModal;
