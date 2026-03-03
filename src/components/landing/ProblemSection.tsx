import { motion } from "framer-motion";
import { Eye, Mic, TrendingUp, MessageCircleQuestion, Zap, Shuffle } from "lucide-react";

const problems = [
  {
    icon: MessageCircleQuestion,
    title: "People often ask you to repeat yourself?",
    description: "Your listeners lose track of what you're saying.",
  },
  {
    icon: Zap,
    title: "Your ideas move faster than your words?",
    description: "You think fast but your mouth can't keep up.",
  },
  {
    icon: Shuffle,
    title: "You mix up syllables under stress?",
    description: "In high-pressure situations, your speech rate spirals.",
  },
];

const steps = [
  {
    icon: Mic,
    title: "Practice without boredom",
    description: "Access varied exercises: guided reading, over-articulation drills, and conversational practice for real-world transfer.",
    color: "text-blue-600",
  },
  {
    icon: Eye,
    title: "Understand your speech rate",
    description: "Visualize your voice waveform. Concrete visual feedback to learn where to place your pauses.",
    color: "text-green-600",
  },
  {
    icon: TrendingUp,
    title: "Stay connected with your speech therapist",
    description: "Don't practice alone. Share your sessions with your speech-language pathologist and receive remote feedback.",
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
              Do you recognize yourself?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sound familiar? ClutterPro was built for you.
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
              How it works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A 3-step method to take control of your speech rate.
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
