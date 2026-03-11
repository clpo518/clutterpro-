import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, Wind } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { FluencyGoal } from "@/data/journeyPath";

interface GoalSelectionModalProps {
  open: boolean;
  userId: string;
  onComplete: (goal: FluencyGoal) => void;
}

const GOALS: {
  value: FluencyGoal;
  icon: React.ReactNode;
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  border: string;
  bg: string;
}[] = [
  {
    value: "speed",
    icon: <Zap className="w-6 h-6" />,
    emoji: "\u26A1",
    title: "Speak more clearly",
    subtitle: "Cluttering / fast speech",
    description:
      "I tend to speak too fast, stumble over words, or feel like people can't follow me.",
    color: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    value: "fluency",
    icon: <Wind className="w-6 h-6" />,
    emoji: "\u{1F32C}\uFE0F",
    title: "Improve my fluency",
    subtitle: "Stuttering / blocks",
    description:
      "I experience blocks, repetitions, or prolonged sounds that interrupt my speech flow.",
    color: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
];

const GoalSelectionModal = ({ open, userId, onComplete }: GoalSelectionModalProps) => {
  const [selected, setSelected] = useState<FluencyGoal | null>(null);
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (!selected) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ fluency_goal: selected } as any)
      .eq("id", userId);

    if (error) {
      toast.error("Something went wrong. Please try again.");
      setSaving(false);
      return;
    }

    toast.success(
      selected === "speed"
        ? "Great \u2014 your journey is set for speech clarity!"
        : "Great \u2014 your journey is set for fluency!"
    );
    setSaving(false);
    onComplete(selected);
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-[95vw] sm:max-w-lg"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="text-xl font-display">
            What's your main goal?
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            This personalizes your guided journey. You can change it later in Settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {GOALS.map((goal, i) => (
            <motion.button
              key={goal.value}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelected(goal.value)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${goal.border} ${
                selected === goal.value
                  ? `${goal.bg} border-2 ring-2 ring-offset-2 ${
                      goal.value === "speed"
                        ? "ring-amber-400/50"
                        : "ring-blue-400/50"
                    }`
                  : "bg-card hover:bg-muted/30"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${goal.bg} ${goal.color}`}
                >
                  {goal.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-[15px]">
                    {goal.title}
                  </p>
                  <p className={`text-xs font-medium ${goal.color} mb-1`}>
                    {goal.subtitle}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {goal.description}
                  </p>
                </div>
                {/* Radio indicator */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-colors ${
                    selected === goal.value
                      ? goal.value === "speed"
                        ? "border-amber-500 bg-amber-500"
                        : "border-blue-500 bg-blue-500"
                      : "border-border"
                  }`}
                >
                  {selected === goal.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-white"
                    />
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <Button
          onClick={handleConfirm}
          disabled={!selected || saving}
          className="w-full mt-4"
          size="lg"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Continue"
          )}
        </Button>

        <p className="text-[11px] text-center text-muted-foreground/70 mt-1">
          Both paths include 8 progressive steps with 3 exercises each.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default GoalSelectionModal;
