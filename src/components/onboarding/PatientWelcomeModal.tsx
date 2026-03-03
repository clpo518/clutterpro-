import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Mic,
  Target,
  TrendingUp,
  Award,
  Stethoscope,
  ChevronRight,
  ChevronLeft,
  PartyPopper
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface PatientWelcomeModalProps {
  open: boolean;
  onClose: () => void;
  patientName?: string;
}

const slides = [
  {
    icon: PartyPopper,
    title: "Welcome to ClutterPro!",
    description: "Thank you for trusting us. You're about to discover a tool designed to help you manage your speech rate, at your own pace.",
    visual: "welcome",
    color: "from-primary to-emerald-500",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Target,
    title: "Your personalized goal",
    description: "Based on your age, the app automatically calculates your target speech rate. No pointless comparisons!",
    visual: "target",
    color: "from-primary to-primary/80",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Mic,
    title: "Practice 5 min/day",
    description: "5 to 10 minutes is all it takes. Read aloud, and the app measures your rate in real time and guides you.",
    visual: "practice",
    color: "from-blue-500 to-cyan-500",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: TrendingUp,
    title: "Track your progress",
    description: "Progress charts, training streaks, scores... Everything is here to keep you motivated.",
    visual: "progress",
    color: "from-green-500 to-emerald-500",
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
  },
  {
    icon: Stethoscope,
    title: "Your therapist follows along",
    description: "Your sessions are shared with your clinician. They can send you targeted exercises and encouragement.",
    visual: "therapist",
    color: "from-purple-500 to-violet-500",
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    icon: Award,
    title: "Ready to get started?",
    description: "Consistency is the key. Even 5 minutes a day makes a difference. Launch your first exercise!",
    visual: "ready",
    color: "from-amber-500 to-orange-500",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
];

const PatientWelcomeModal = ({ open, onClose, patientName }: PatientWelcomeModalProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const confettiFired = useRef(false);

  useEffect(() => {
    if (open && !confettiFired.current) {
      confettiFired.current = true;
      setTimeout(() => {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => confetti({ particleCount: 40, spread: 90, origin: { y: 0.5 } }), 300);
      }, 400);
    }
    if (!open) confettiFired.current = false;
  }, [open]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  const renderVisual = () => {
    switch (slide.visual) {
      case "welcome":
        return (
          <div className="bg-muted/50 rounded-xl p-6 border border-border/50 text-center">
            <div className="flex justify-center gap-3 mb-4">
              {["🎉", "🗣️", "🚀"].map((emoji, i) => (
                <motion.span
                  key={i}
                  className="text-4xl"
                  initial={{ opacity: 0, scale: 0, rotate: -20 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5 + i * 0.15, type: "spring", stiffness: 200 }}
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
            <motion.p
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {patientName ? `${patientName}, your journey begins!` : "Your journey begins now!"}
            </motion.p>
          </div>
        );
      case "target":
        return (
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">Your goal</span>
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">Personalized</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">4.2</span>
              <span className="text-sm text-muted-foreground">syll./sec</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Adapted to your age group</p>
          </div>
        );
      case "practice":
        return (
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-4">
              <motion.div
                className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Mic className="w-6 h-6 text-primary" />
              </motion.div>
              <div className="flex-1">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: "65%" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Real-time analysis...</p>
              </div>
            </div>
          </div>
        );
      case "progress":
        return (
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">This week</span>
              <span className="text-xs text-green-600 font-medium">+15%</span>
            </div>
            <div className="flex items-end gap-1 h-16">
              {[30, 45, 40, 55, 60, 70, 75].map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-primary/60 to-primary rounded-t"
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Mon</span>
              <span>Sun</span>
            </div>
          </div>
        );
      case "therapist":
        return (
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">New message</p>
                <p className="text-xs text-muted-foreground mt-1">
                  "Great job staying consistent! Keep it up 💪"
                </p>
              </div>
            </div>
          </div>
        );
      case "ready":
        return (
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50 text-center">
            <div className="flex justify-center gap-2 mb-3">
              {["🎯", "📈", "🏆"].map((emoji, i) => (
                <motion.span
                  key={i}
                  className="text-2xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 }}
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Your journey starts now
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${slide.color}`} />

        <div className="p-6 sm:p-8">
          <div className="text-center mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              How it works
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="text-center"
            >
              <div className={`w-16 h-16 rounded-2xl ${slide.iconBg} flex items-center justify-center mx-auto mb-4`}>
                <Icon className={`w-8 h-8 ${slide.iconColor}`} />
              </div>

              <h2 className="text-xl sm:text-2xl font-display font-bold mb-2">
                {slide.title}
              </h2>

              <p className="text-muted-foreground text-sm sm:text-base mb-6">
                {slide.description}
              </p>

              {/* Visual element */}
              <div className="mb-6">
                {renderVisual()}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex justify-center gap-2 mb-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "w-6 bg-primary"
                    : "w-2 bg-muted hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {currentSlide > 0 && (
              <Button
                variant="outline"
                onClick={handlePrev}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              className={`flex-1 gap-1 bg-gradient-to-r ${slide.color} hover:opacity-90 text-white`}
            >
              {currentSlide < slides.length - 1 ? (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                "Get started"
              )}
            </Button>
          </div>

          {/* Skip link */}
          {currentSlide < slides.length - 1 && (
            <button
              onClick={onClose}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground mt-4 transition-colors"
            >
              Skip introduction
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatientWelcomeModal;
