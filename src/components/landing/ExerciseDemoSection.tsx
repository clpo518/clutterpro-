import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const rebusItems = [
  { emoji: "🐮", label: "vache", pauseAfter: true },
  { emoji: "🍽️", label: "mange", pauseAfter: true },
  { emoji: "🍦", label: "glace", pauseAfter: false },
];

export const ExerciseDemoSection = () => {
  const [activeWord, setActiveWord] = useState(0);
  const [activeRebus, setActiveRebus] = useState(-1);
  const words = ["Je", "prends", "le", "temps", "de", "parler."];

  const animateWords = () => {
    setActiveWord(0);
    words.forEach((_, index) => {
      setTimeout(() => setActiveWord(index), index * 800);
    });
  };

  const animateRebus = () => {
    setActiveRebus(-1);
    let delay = 0;
    rebusItems.forEach((item, index) => {
      setTimeout(() => setActiveRebus(index), delay);
      delay += item.pauseAfter ? 1400 : 800;
    });
  };

  return (
    <section className="py-24 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container px-4 md:px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Des outils concrets pour ralentir
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Aperçu de 3 de nos 12 modes d'exercice. Chacun cible un aspect différent du débit de parole.
          </p>
        </motion.div>

        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-card rounded-2xl shadow-xl border border-border/50 p-8 md:p-12">
            <Tabs defaultValue="dialogue" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="dialogue" className="gap-1 md:gap-2 text-[11px] md:text-sm px-1.5 md:px-3">
                  <span className="shrink-0">💬</span>
                  <span className="truncate">Dialogue</span>
                </TabsTrigger>
                <TabsTrigger value="lecture" className="gap-1 md:gap-2 text-[11px] md:text-sm px-1.5 md:px-3">
                  <Play className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                  <span className="truncate">Lecture</span>
                </TabsTrigger>
                <TabsTrigger value="rebus" className="gap-1 md:gap-2 text-[11px] md:text-sm px-1.5 md:px-3">
                  <span className="shrink-0">🧒</span>
                  <span className="truncate">Enfants</span>
                </TabsTrigger>
              </TabsList>

              {/* Dialogue tab */}
              <TabsContent value="dialogue">
                <div className="text-center mb-8">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                    💬 Mode Dialogue — En situation réelle
                  </span>
                  <p className="text-muted-foreground">
                    Posez le téléphone sur la table et discutez. L'indicateur vous guide en temps réel.
                  </p>
                </div>

                <div className="flex flex-col items-center gap-6 mb-8">
                  {/* Simulated big gauge */}
                  <div className="w-40 h-40 rounded-full border-4 border-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 flex flex-col items-center justify-center">
                    <span className="text-5xl">✅</span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">Parfait</span>
                    <span className="text-xs text-muted-foreground">4.0 syll/s</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-center max-w-sm">
                    Un seul gros indicateur visible de loin — pas de chiffres stressants, juste un emoji qui change en temps réel.
                  </p>
                </div>

                <div className="text-center">
                  <a
                    href="/auth"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-lg shadow-primary/25"
                  >
                    💬 Essayer le Mode Dialogue
                  </a>
                </div>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  Sessions de 30 sec à 5 min. Transférez vos acquis en conversation réelle.
                </p>
              </TabsContent>

              {/* Lecture tab */}
              <TabsContent value="lecture">
                <div className="text-center mb-8">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                    <Play className="w-4 h-4" />
                    Exercice : Le Syllabeur
                  </span>
                  <p className="text-muted-foreground">
                    Lisez chaque mot lentement, en marquant une pause entre chacun.
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  {words.map((word, index) => (
                    <motion.div
                      key={index}
                      className={`flex items-center gap-2 ${
                        index <= activeWord ? "opacity-100" : "opacity-40"
                      }`}
                    >
                      <span
                        className={`text-2xl md:text-4xl font-bold transition-colors duration-300 ${
                          index === activeWord ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {word}
                      </span>
                      {index < words.length - 1 && (
                        <div className="flex items-center gap-1 mx-2">
                          <Pause className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="text-center">
                  <button
                    onClick={animateWords}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                  >
                    <Play className="w-5 h-5" />
                    Lancer la démo
                  </button>
                </div>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  Nos exercices visuels vous guident pour insérer les bonnes pauses respiratoires.
                </p>
              </TabsContent>

              {/* Rebus tab */}
              <TabsContent value="rebus">
                <div className="text-center mb-8">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm font-medium mb-4">
                    🖼️ Mode Rébus — Enfant / Non-lecteur
                  </span>
                  <p className="text-muted-foreground">
                    L'enfant regarde les images et répète à voix haute, en soufflant entre chaque image.
                  </p>
                </div>

                <div className="flex flex-wrap justify-center items-end gap-6 mb-8">
                  {rebusItems.map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-4"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <motion.span
                          className={`text-5xl md:text-7xl transition-all duration-300 ${
                            index === activeRebus ? "scale-110" : index <= activeRebus ? "opacity-100" : "opacity-40"
                          }`}
                          animate={index === activeRebus ? { scale: [1, 1.15, 1.1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          {item.emoji}
                        </motion.span>
                        <span className="text-xs text-muted-foreground">{item.label}</span>
                      </div>

                      {item.pauseAfter && (
                        <div className="flex gap-1 items-center">
                          {[0, 1, 2].map((bar) => (
                            <motion.div
                              key={bar}
                              className="w-1.5 rounded-full bg-orange-400"
                              animate={
                                index === activeRebus
                                  ? { height: [16, 28, 16], opacity: [0.5, 1, 0.5] }
                                  : { height: 16, opacity: 0.3 }
                              }
                              transition={{ duration: 0.6, delay: bar * 0.15, repeat: index === activeRebus ? 1 : 0 }}
                              style={{ height: 16 }}
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="text-center">
                  <button
                    onClick={animateRebus}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 hover:scale-105 transition-all duration-200 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30"
                  >
                    <Play className="w-5 h-5" />
                    Lancer la démo
                  </button>
                </div>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  Pas besoin de savoir lire : les emojis guident la parole, les barres orange marquent les pauses respiratoires.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
