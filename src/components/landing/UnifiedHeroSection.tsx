import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Activity, ArrowRight, MessageSquare, Play, Users, CheckCircle } from "lucide-react";
import { KaraokeDemo } from "./KaraokeDemo";

/** Animated SPS counter widget for the hero */
const SPSWidget = () => {
  const [sps, setSps] = useState(4.2);

  useEffect(() => {
    const values = [4.2, 4.5, 5.1, 4.8, 3.8, 5.6, 4.0, 3.5];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % values.length;
      setSps(values[i]);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const isGood = sps <= 5.0;

  return (
    <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-card border border-border shadow-sm">
      <span className={`w-3 h-3 rounded-full ${isGood ? "bg-success" : "bg-warning"}`} />
      <div className="flex items-baseline gap-1.5">
        <motion.span
          className="text-2xl font-bold tabular-nums text-foreground"
          key={sps}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {sps.toFixed(1)}
        </motion.span>
        <span className="text-xs text-muted-foreground">syll/s</span>
      </div>
      <div className="h-6 w-px bg-border" />
      <span className="text-xs text-muted-foreground">Real-time speech rate</span>
    </div>
  );
};

const rebusItems = [
  { emoji: "🐮", label: "cow", pauseAfter: true },
  { emoji: "🍽️", label: "eats", pauseAfter: true },
  { emoji: "🍦", label: "ice cream", pauseAfter: false },
];

export const UnifiedHeroSection = () => {
  const [activeRebus, setActiveRebus] = useState(-1);

  const animateRebus = () => {
    setActiveRebus(-1);
    let delay = 0;
    rebusItems.forEach((item, index) => {
      setTimeout(() => setActiveRebus(index), delay);
      delay += item.pauseAfter ? 1400 : 800;
    });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center">
      <div className="container relative z-10 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            <span className="badge-clinical inline-flex">
              <Activity className="w-3.5 h-3.5" />
              Cluttering · Tachylalia · Fluency Disorders
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6 leading-[1.1] tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Stop repeating yourself.{" "}
            <span className="text-primary">Start being heard.</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            The first app designed specifically for cluttering and fast speech. Real-time feedback on your speech rate, 90+ exercises, and progress your therapist can see.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button asChild size="lg" className="text-base px-8 h-14">
              <Link to="/auth?tab=signup">
                Start free trial
                <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            </Button>
            <a href="#patients" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              I'm a patient — learn more
            </a>
          </motion.div>

          {/* SPS Widget */}
          <motion.div
            className="flex justify-center mt-8 mb-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <SPSWidget />
          </motion.div>
          <motion.p
            className="text-center text-xs text-muted-foreground max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            Your speech rate, measured in syllables per second — the clinical gold standard.
          </motion.p>

          {/* Tabbed exercise demo */}
          <motion.div
            className="mt-14"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="bg-card rounded-xl shadow-sm border border-border p-4 md:p-6">
              <p className="text-xs text-muted-foreground text-center mb-3">
                Preview 3 of our 12 exercise modes
              </p>
              <Tabs defaultValue="lecture" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4 md:mb-6">
                  <TabsTrigger value="lecture" className="gap-1 md:gap-2 text-[11px] md:text-sm px-1.5 md:px-3">
                    <Play className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                    <span className="truncate">Reading</span>
                  </TabsTrigger>
                  <TabsTrigger value="dialogue" className="gap-1 md:gap-2 text-[11px] md:text-sm px-1.5 md:px-3">
                    <MessageSquare className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                    <span className="truncate">Dialogue</span>
                  </TabsTrigger>
                  <TabsTrigger value="rebus" className="gap-1 md:gap-2 text-[11px] md:text-sm px-1.5 md:px-3">
                    <Users className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                    <span className="truncate">Kids</span>
                  </TabsTrigger>
                </TabsList>

                {/* Guided Reading */}
                <TabsContent value="lecture" className="mt-0">
                  <div className="rounded-xl overflow-hidden border border-border/40 bg-card mb-3">
                    <KaraokeDemo />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    The highlighter advances word by word at the speed you choose.
                  </p>
                </TabsContent>

                {/* Dialogue */}
                <TabsContent value="dialogue" className="mt-0">
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-emerald-500 bg-emerald-500/10 flex flex-col items-center justify-center">
                      <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-emerald-500" />
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">Perfect</span>
                      <span className="text-[11px] text-muted-foreground">4.0 syll/s</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center max-w-sm">
                      A single indicator visible from afar — changes in real time based on your speech rate.
                    </p>
                  </div>
                </TabsContent>

                {/* Kids Rebus */}
                <TabsContent value="rebus" className="mt-0">
                  <div className="flex flex-wrap justify-center items-end gap-4 md:gap-6 py-4 mb-3">
                    {rebusItems.map((item, index) => (
                      <motion.div key={index} className="flex items-center gap-3">
                        <div className="flex flex-col items-center gap-1">
                          <motion.span
                            className={`text-4xl md:text-5xl transition-all duration-300 ${
                              index === activeRebus ? "scale-110" : index <= activeRebus ? "opacity-100" : "opacity-40"
                            }`}
                            animate={index === activeRebus ? { scale: [1, 1.15, 1.1] } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            {item.emoji}
                          </motion.span>
                          <span className="text-[11px] text-muted-foreground">{item.label}</span>
                        </div>

                        {item.pauseAfter && (
                          <div className="flex gap-1 items-center">
                            {[0, 1, 2].map((bar) => (
                              <motion.div
                                key={bar}
                                className="w-1 rounded-full bg-primary/60"
                                animate={
                                  index === activeRebus
                                    ? { height: [12, 24, 12], opacity: [0.5, 1, 0.5] }
                                    : { height: 12, opacity: 0.3 }
                                }
                                transition={{ duration: 0.6, delay: bar * 0.15, repeat: index === activeRebus ? 1 : 0 }}
                                style={{ height: 12 }}
                              />
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                  <div className="text-center mb-2">
                    <button
                      onClick={animateRebus}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Play demo
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground text-center font-medium mb-1">
                    "The cow eats ice cream"
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    No reading required: emojis guide the speech (ages 4-7).
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
