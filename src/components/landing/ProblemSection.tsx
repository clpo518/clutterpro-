import { motion } from "framer-motion";
import { Eye, Mic, TrendingUp, MessageCircleQuestion, Zap, Shuffle } from "lucide-react";

const problems = [
  {
    icon: MessageCircleQuestion,
    title: '"Can you say that again?"',
    description: "You've heard it a thousand times. At work, at dinner, on the phone. You start avoiding conversations altogether.",
  },
  {
    icon: Zap,
    title: "Your mouth can't keep up with your brain",
    description: "You know exactly what you want to say. But the words pile up, syllables get swallowed, and people look confused.",
  },
  {
    icon: Shuffle,
    title: "High stakes? Even faster speech.",
    description: "Job interviews, first dates, presentations — when it matters most, your speech speeds up and clarity drops.",
  },
];

const steps = [
  {
    icon: Mic,
    title: "Pick an exercise. Hit record.",
    description: "90+ exercises across 12 modes — guided reading, free conversation, tongue twisters, and more. Sessions as short as 2 minutes.",
    color: "text-blue-600",
  },
  {
    icon: Eye,
    title: "Get instant visual feedback",
    description: "See your syllables-per-second in real time. A green light when you're on target, a nudge when you speed up.",
    color: "text-green-600",
  },
  {
    icon: TrendingUp,
    title: "Track your progress over time",
    description: "Watch your speech rate drop week after week. Your therapist sees it too — no more guessing between sessions.",
    color: "text-primary",
  },
];

export const ProblemSection = () => {
  return (
    <>
      {/* Problem Recognition Section */}
      <section id="symptoms" className="py-24 bg-card">
        <div className="container px-4 md:px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Does this sound like you?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              You're not alone. Millions of people struggle with speech that's faster than their listeners can follow.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {problems.map((problem, index) => (
              <motion.div
                key={index}
                className="bg-background rounded-2xl p-8 border border-border/50 text-center hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <problem.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {problem.title}
                </h3>
                <p className="text-muted-foreground">
                  {problem.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-background to-secondary/30">
        <div className="container px-4 md:px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              A simple system that works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              5 minutes a day. Real feedback. Visible progress.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="relative bg-card rounded-2xl p-8 shadow-lg border border-border/50 hover:shadow-xl transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <div className={`w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-6`}>
                  <step.icon className={`w-7 h-7 ${step.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
