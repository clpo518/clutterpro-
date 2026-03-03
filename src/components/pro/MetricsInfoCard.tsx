import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, BookOpen, Activity, Timer, MessageCircleWarning, Type, ExternalLink, AudioWaveform } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const metrics = [
  {
    icon: Activity,
    title: "SPS (Syllables/Second)",
    description: "Measures articulation rate in batches of 5 syllables (excluding pauses and silences).",
    details: "The calculation waits for 5 syllables to be spoken, then divides by the actual speech time of the batch (silences excluded). This batch mode gives stable and clinically reliable feedback, unaffected by natural pauses.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10"
  },
  {
    icon: Timer,
    title: "Fluency Ratio",
    description: "Speech time / Total session time.",
    details: "> 80% = Continuous speech | 60-80% = Natural pauses | < 60% = Possible blocks",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10"
  },
  {
    icon: MessageCircleWarning,
    title: "Disfluencies (Filler Words)",
    description: "\"um\", \"like\", \"you know\" detected automatically.",
    details: "The algorithm identifies disfluencies in real time",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10"
  },
  {
    icon: Type,
    title: "Syllable Counting",
    description: "Algorithm optimized for English.",
    details: "Handles contractions, compound words, and silent letters",
    color: "text-primary",
    bgColor: "bg-primary/10"
  },
  {
    icon: Activity,
    title: "Max Rate & Variability",
    description: "Peak rate reached during the session.",
    details: "A large gap between average and max can reveal involuntary accelerations — a key indicator in tachylalia and cluttering.",
    color: "text-red-500",
    bgColor: "bg-red-500/10"
  },
  {
    icon: AudioWaveform,
    title: "Stuttering Analysis",
    description: "Acoustic detection of blocks, repetitions, and prolongations.",
    details: "Blocks (silences > 1s) - Repetitions - Prolongations",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    isBeta: true,
    betaNote: "First version — being improved"
  }
];

export const MetricsInfoCard = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="bg-gradient-to-br from-cyan-500/5 to-emerald-500/5 border-cyan-500/20">
      <CardHeader 
        className="cursor-pointer select-none pb-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-cyan-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Understanding the metrics</CardTitle>
              <p className="text-sm text-muted-foreground">
                SPS, Fluency, Fillers — Everything you need to know
              </p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <CardContent className="pt-0">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {metrics.map((metric, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-xl bg-background border ${metric.isBeta ? 'border-purple-300 bg-purple-50/30 dark:bg-purple-950/20' : 'border-border'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg ${metric.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <metric.icon className={`w-4 h-4 ${metric.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{metric.title}</h4>
                          {metric.isBeta && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                              Beta
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{metric.description}</p>
                        <p className="text-xs font-medium text-foreground/80">{metric.details}</p>
                        {metric.betaNote && (
                          <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-1.5 italic">
                            ✨ {metric.betaNote}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
