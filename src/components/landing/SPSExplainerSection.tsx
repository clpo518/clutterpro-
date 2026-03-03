import { motion } from "framer-motion";
import { FlaskConical, AlertTriangle, CheckCircle2, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

const AnimatedComparison = () => {
  const [wrongValue, setWrongValue] = useState(0);
  const [rightValue, setRightValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const wrongInterval = setInterval(() => {
        setWrongValue(prev => {
          if (prev >= 1.1) { clearInterval(wrongInterval); return 1.1; }
          return prev + 0.1;
        });
      }, 150);
      const rightInterval = setInterval(() => {
        setRightValue(prev => {
          if (prev >= 2.7) { clearInterval(rightInterval); return 2.7; }
          return prev + 0.3;
        });
      }, 100);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <div className="text-center mb-6">
        <p className="text-muted-foreground mb-2">Imagine you say:</p>
        <p className="text-xl font-medium text-foreground">
          "Hello..." <span className="text-muted-foreground/50">[pause 2s]</span> "...Marie."
        </p>
        <p className="text-sm text-muted-foreground mt-2">4 syllables • Total time: 3.5s • Speech time: 1.5s</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-destructive text-xl">❌</span>
              <span className="text-foreground font-medium">Classic method</span>
            </div>
            <span className="font-mono font-bold text-destructive text-xl">
              {wrongValue.toFixed(1)} SPS
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">4 syllables ÷ 3.5s (total time)</p>
          <Progress value={(wrongValue / 4) * 100} className="h-2" />
        </div>

        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 text-xl">✅</span>
              <span className="text-foreground font-medium">Our method</span>
            </div>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xl">
              {rightValue.toFixed(1)} SPS
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">4 syllables ÷ 1.5s (actual speech time)</p>
          <Progress value={(rightValue / 4) * 100} className="h-2 [&>div]:bg-emerald-500" />
        </div>
      </div>
    </div>
  );
};

export const SPSExplainerSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4 md:px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <FlaskConical className="w-4 h-4" />
            The measure that matters
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How we measure your speech rate
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We don't simply count words — we measure your <strong className="text-foreground">actual articulation rate</strong>, 
            without pauses or silence.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {[
            {
              icon: AlertTriangle,
              title: "The problem",
              color: "text-destructive",
              bgColor: "bg-destructive/10",
              description: "Classic counters include your pauses in the calculation. Result: your score drops even when you speak well."
            },
            {
              icon: CheckCircle2,
              title: "Our solution",
              color: "text-emerald-600 dark:text-emerald-400",
              bgColor: "bg-emerald-500/10",
              description: "We measure only the time you're actually speaking. Your breathing pauses no longer skew the result."
            },
            {
              icon: Target,
              title: "The result",
              color: "text-primary",
              bgColor: "bg-primary/10",
              description: "A reliable number, in syllables per second, that your speech therapist can track from session to session."
            }
          ].map((card, index) => (
            <motion.div
              key={index}
              className={`${card.bgColor} rounded-2xl p-6 border border-border/50`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`w-10 h-10 rounded-xl ${card.bgColor} flex items-center justify-center mb-4`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{card.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{card.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <AnimatedComparison />
        </motion.div>
      </div>
    </section>
  );
};
