import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, Gauge, Mic2, Wind, Activity, Zap, Brain, MessageSquare } from "lucide-react";

const categories = [
  { icon: Gauge, title: "Slowing Down", count: 10, bg: "bg-muted/50", iconBg: "bg-emerald-100 dark:bg-emerald-900/50", text: "text-emerald-700 dark:text-emerald-400" },
  { icon: Mic2, title: "Articulation", count: 20, bg: "bg-muted/50", iconBg: "bg-red-100 dark:bg-red-900/50", text: "text-red-700 dark:text-red-400" },
  { icon: Wind, title: "Breath Management", count: 10, bg: "bg-muted/50", iconBg: "bg-pink-100 dark:bg-pink-900/50", text: "text-pink-700 dark:text-pink-400" },
  { icon: Activity, title: "Motor Challenges", count: 12, bg: "bg-muted/50", iconBg: "bg-cyan-100 dark:bg-cyan-900/50", text: "text-cyan-700 dark:text-cyan-400" },
  { icon: Zap, title: "Warm-Up", count: 5, bg: "bg-muted/50", iconBg: "bg-orange-100 dark:bg-orange-900/50", text: "text-orange-700 dark:text-orange-400" },
  { icon: Brain, title: "Cognitive Traps", count: 8, bg: "bg-muted/50", iconBg: "bg-purple-100 dark:bg-purple-900/50", text: "text-purple-700 dark:text-purple-400" },
  { icon: MessageSquare, title: "Dialogue Mode", count: 0, bg: "bg-muted/50", iconBg: "bg-primary/15 dark:bg-primary/20", text: "text-primary" },
];

const rebusCategory = {
  title: "Rebus Mode",
  subtitle: "For children & non-readers",
  count: 25,
};

export const LibraryShowcase = () => {
  const totalCount = categories.reduce((sum, c) => sum + c.count, 0) + rebusCategory.count;

  return (
    <section className="py-24 bg-muted/30 overflow-hidden">
      <div className="container px-4 md:px-6">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            Full Library
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            +{totalCount} varied exercises
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Rich and varied content to avoid monotony and progress across all dimensions of speech.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start max-w-5xl mx-auto">
          {/* Left: category list */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {categories.map((category, index) => (
              <motion.div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-xl ${category.bg}`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.06 }}
              >
                <div className={`w-10 h-10 rounded-lg ${category.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <category.icon className={`w-5 h-5 ${category.text}`} />
                </div>
                <span className={`font-medium flex-1 ${category.text}`}>{category.title}</span>
                <span className={`text-sm font-bold ${category.text} tabular-nums`}>{category.count || "—"}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Right: Rebus child card */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative rounded-xl overflow-hidden bg-muted/50 border border-border p-8">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">{rebusCategory.title}</h3>
              <p className="text-muted-foreground mb-4">{rebusCategory.subtitle}</p>

              {/* Example rebus preview */}
              <div className="bg-background/70 dark:bg-background/50 rounded-xl p-4 mb-4 border border-border">
                <p className="text-sm text-muted-foreground mb-2 font-medium">Example:</p>
                <div className="flex items-center gap-2 text-2xl flex-wrap">
                  <span>🏠</span>
                  <span className="text-lg text-foreground">→</span>
                  <span className="text-base font-medium text-foreground">"house"</span>
                  <span className="mx-1 text-muted-foreground">·</span>
                  <span>🐱</span>
                  <span className="text-lg text-foreground">→</span>
                  <span className="text-base font-medium text-foreground">"cat"</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-muted-foreground bg-background px-3 py-1 rounded-full">
                  {rebusCategory.count} exercises
                </span>
                <span className="text-xs text-muted-foreground">Ages 4+</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="text-center mt-14"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-muted-foreground mb-6">
            New exercises added every month to keep motivation high.
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link to="/auth">
              Explore the library
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
