import { motion } from "framer-motion";
import { Activity, Timer, Mic, Sparkles, Dna } from "lucide-react";

const pillars = [
  {
    icon: Activity,
    title: "Clear Articulation",
    description: "Exercises to pronounce each syllable distinctly and improve clarity.",
    color: "from-cyan-500/20 to-teal-500/10",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/30"
  },
  {
    icon: Timer,
    title: "Rhythm & Pausing",
    description: "Learn to insert natural pauses between your phrases for a controlled speech rate.",
    color: "from-purple-500/20 to-violet-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30"
  },
  {
    icon: Mic,
    title: "Dialogue Mode",
    description: "Transfer your skills to real-life situations: talk with friends, family, or your speech therapist, guided by a real-time visual indicator.",
    color: "from-primary/20 to-accent/10",
    iconColor: "text-primary",
    bgColor: "bg-primary/10"
  }
];

export const MethodSection = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-secondary/30">
      <div className="container px-4 md:px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Evidence-Based Method
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            The 3 Clinical Pillars
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive approach to fluency, tailored for cluttering, tachylalia, and fluency disorders.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <motion.div
              key={index}
              className={`relative p-8 rounded-2xl bg-gradient-to-br ${pillar.color} border border-border/50 hover:shadow-lg transition-shadow`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className={`w-14 h-14 rounded-xl ${pillar.bgColor} flex items-center justify-center mb-6`}>
                <pillar.icon className={`w-7 h-7 ${pillar.iconColor}`} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {pillar.title}
              </h3>
              <p className="text-muted-foreground">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Personalized calibration highlight */}
        <motion.div
          className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
              <Dna className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-foreground mb-2">
                A goal tailored to YOU
              </h3>
              <p className="text-muted-foreground max-w-2xl">
                A child, a teenager, and an adult don't speak at the same rate — and that's normal!
                The app automatically adjusts to your age to give you a
                realistic, personalized target. No more frustrating false positives.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Trust badge */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-sm text-muted-foreground">
            A proven method, recommended by specialized speech-language pathologists.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
