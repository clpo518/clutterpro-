import { motion } from "framer-motion";
import { Activity, Timer, Mic, FlaskConical, Dna } from "lucide-react";

const pillars = [
  {
    icon: Activity,
    title: "Clear Articulation",
    description: "Swallowed syllables are the #1 reason people can't follow you. Targeted drills train your mouth to keep up with your brain.",
    iconColor: "text-primary",
    bgColor: "bg-primary/10"
  },
  {
    icon: Timer,
    title: "Rhythm & Pausing",
    description: "People who clutter rarely pause. Learn where to breathe naturally so listeners can actually process what you're saying.",
    iconColor: "text-primary",
    bgColor: "bg-primary/10"
  },
  {
    icon: Mic,
    title: "Real Conversations",
    description: "Reading aloud is step one. The real test is talking to people. Dialogue Mode gives you live feedback during actual conversations.",
    iconColor: "text-primary",
    bgColor: "bg-primary/10"
  }
];

export const MethodSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4 md:px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <FlaskConical className="w-4 h-4" />
            Evidence-Based Method
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            3 skills. One clear voice.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Cluttering isn't just "talking fast." Each pillar targets a root cause — so the change lasts.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <motion.div
              key={index}
              className="relative p-8 rounded-xl bg-card border border-border"
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
          className="mt-16 p-8 rounded-xl bg-muted/50 border border-border"
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
                Your goal. Your pace.
              </h3>
              <p className="text-muted-foreground max-w-2xl">
                A child, a teenager, and an adult don't speak at the same rate — and that's perfectly normal.
                TalkSlower adjusts your target automatically based on your age.
                No frustrating false alarms, just honest feedback.
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
            Built on evidence-based methods recommended by speech-language pathologists.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
