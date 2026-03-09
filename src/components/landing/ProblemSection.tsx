import { motion } from "framer-motion";
import { Eye, Mic, TrendingUp, MessageCircleQuestion, Zap, Shuffle } from "lucide-react";

const problems = [
  {
    icon: MessageCircleQuestion,
    title: "Tired of repeating yourself?",
    description: "Friends, coworkers, and family keep asking 'Can you say that again?' — and it's exhausting.",
  },
  {
    icon: Zap,
    title: "Your brain races ahead of your mouth?",
    description: "You know exactly what to say, but the words come out jumbled or too fast to follow.",
  },
  {
    icon: Shuffle,
    title: "Stress makes it worse?",
    description: "Job interviews, presentations, phone calls — the higher the stakes, the faster you speak.",
  },
];

const steps = [
  {
    icon: Mic,
    title: "Practice that fits your life",
    description: "12 exercise modes — from guided reading to real conversations. Short daily sessions that build lasting habits.",
    color: "text-blue-600",
  },
  {
    icon: Eye,
    title: "See your progress in real time",
    description: "Watch your speech rate live as you practice. Visual feedback shows you exactly when you're speeding up.",
    color: "text-green-600",
  },
  {
    icon: TrendingUp,
    title: "Share results with your therapist",
    description: "Your speech therapist sees your progress remotely — no more guessing between appointments.",
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
              How ClutterPro works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three ways to build lasting habits — at your own pace.
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
