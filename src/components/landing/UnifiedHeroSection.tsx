import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Activity, ArrowRight, MessageSquare, Play, Stethoscope } from "lucide-react";
import { KaraokeDemo } from "./KaraokeDemo";

/** Animated SPS counter widget for the hero */
const SPSWidget = () => {
  const [sps, setSps] = useState(4.2);
  const [emoji, setEmoji] = useState("✅");

  useEffect(() => {
    const values = [
      { sps: 4.2, emoji: "✅" },
      { sps: 4.5, emoji: "✅" },
      { sps: 5.1, emoji: "⚡" },
      { sps: 4.8, emoji: "✅" },
      { sps: 3.8, emoji: "✅" },
      { sps: 5.6, emoji: "⚡" },
      { sps: 4.0, emoji: "✅" },
      { sps: 3.5, emoji: "🐢" },
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % values.length;
      setSps(values[i].sps);
      setEmoji(values[i].emoji);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-card border border-border/60 shadow-sm">
      <motion.span className="text-2xl" key={emoji} initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
        {emoji}
      </motion.span>
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
      <span className="text-xs text-muted-foreground">Débit en temps réel</span>
    </div>
  );
};

const rebusItems = [
  { emoji: "🐮", label: "vache", pauseAfter: true },
  { emoji: "🍽️", label: "mange", pauseAfter: true },
  { emoji: "🍦", label: "glace", pauseAfter: false },
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
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 gradient-subtle" />
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary/[0.03]"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 -left-24 w-[400px] h-[400px] rounded-full bg-accent/30"
          animate={{ scale: [1.1, 1, 1.1], y: [0, 20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
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
              Bredouillement · Tachylalie · Bégaiement
            </span>
          </motion.div>
          
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6 leading-[1.1] tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Vous parlez trop vite ?{" "}
            <span className="gradient-text">Reprenez le contrôle.</span>
          </motion.h1>
          
          <motion.p
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            L'application d'entraînement pour les troubles de la fluence : bredouillement, tachylalie et bégaiement. 
            Entraînez-vous seul ou avec votre orthophoniste.
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button asChild size="lg" className="text-base px-8 h-14 shadow-md hover:shadow-lg">
              <Link to="/diagnostic">
                Tester ma vitesse
                <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-base px-8 h-14" asChild>
              <a href="#orthophonistes">
                <Stethoscope className="w-4 h-4 mr-2" />
                Espace Orthophoniste
              </a>
            </Button>
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
            Mesurez votre débit de parole en syllabes par seconde — la référence en orthophonie.
          </motion.p>
          
          {/* Tabbed exercise demo */}
          <motion.div
            className="mt-14"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="bg-card rounded-2xl shadow-lg border border-border/60 p-4 md:p-6">
              <p className="text-xs text-muted-foreground text-center mb-3">
                Aperçu de 3 de nos 12 modes d'exercice
              </p>
              <Tabs defaultValue="lecture" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4 md:mb-6">
                  <TabsTrigger value="lecture" className="gap-1 md:gap-2 text-[11px] md:text-sm px-1.5 md:px-3">
                    <Play className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                    <span className="truncate">Lecture</span>
                  </TabsTrigger>
                  <TabsTrigger value="dialogue" className="gap-1 md:gap-2 text-[11px] md:text-sm px-1.5 md:px-3">
                    <MessageSquare className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                    <span className="truncate">Dialogue</span>
                  </TabsTrigger>
                  <TabsTrigger value="rebus" className="gap-1 md:gap-2 text-[11px] md:text-sm px-1.5 md:px-3">
                    <span className="shrink-0">🧒</span>
                    <span className="truncate">Enfants</span>
                  </TabsTrigger>
                </TabsList>

                {/* Lecture guidée */}
                <TabsContent value="lecture" className="mt-0">
                  <div className="rounded-xl overflow-hidden border border-border/40 bg-card mb-3">
                    <KaraokeDemo />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Le surligneur avance mot par mot selon la vitesse que vous choisissez.
                  </p>
                </TabsContent>

                {/* Dialogue */}
                <TabsContent value="dialogue" className="mt-0">
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-emerald-500 bg-emerald-500/10 flex flex-col items-center justify-center">
                      <span className="text-3xl md:text-4xl">✅</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Parfait</span>
                      <span className="text-[11px] text-muted-foreground">4.0 syll/s</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center max-w-sm">
                      Un seul indicateur visible de loin — juste un emoji qui change en temps réel selon votre débit.
                    </p>
                    <Button asChild size="sm" className="text-sm">
                      <Link to="/dialogue">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Essayer le Mode Dialogue
                      </Link>
                    </Button>
                  </div>
                </TabsContent>

                {/* Rébus enfant */}
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
                                className="w-1 rounded-full bg-orange-400"
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
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-all shadow-md"
                    >
                      <Play className="w-4 h-4" />
                      Lancer la démo
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground text-center font-medium mb-1">
                    « La vache mange une glace »
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    Pas besoin de savoir lire : les emojis guident la parole (4-7 ans).
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