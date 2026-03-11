import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

/**
 * Animated speed gauge demo for blog articles.
 * No microphone needed — purely visual demonstration.
 */
const DEMO_SEQUENCE = [
  { sps: 2.8, label: "Slow & steady", emoji: "\u{1F422}", color: "text-blue-500", ring: "stroke-blue-500" },
  { sps: 3.5, label: "Good control", emoji: "\u{1F44D}", color: "text-emerald-500", ring: "stroke-emerald-500" },
  { sps: 4.2, label: "Perfect pace", emoji: "\u2705", color: "text-emerald-500", ring: "stroke-emerald-500" },
  { sps: 5.1, label: "A bit fast", emoji: "\u26A1", color: "text-amber-500", ring: "stroke-amber-500" },
  { sps: 6.3, label: "Too fast!", emoji: "\u{1F534}", color: "text-red-500", ring: "stroke-red-500" },
  { sps: 4.0, label: "Back on track", emoji: "\u2705", color: "text-emerald-500", ring: "stroke-emerald-500" },
];

const BlogDemoSpeedGauge = () => {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % DEMO_SEQUENCE.length);
    }, 2000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const item = DEMO_SEQUENCE[index];
  const progress = Math.min(100, (item.sps / 7) * 100);
  const circumference = 2 * Math.PI * 44;

  return (
    <div className="my-10 p-6 md:p-8 rounded-2xl border border-border/60 bg-gradient-to-br from-muted/20 to-muted/40">
      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-4">
        Live Demo
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Gauge */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="44"
              fill="none" stroke="currentColor"
              className="text-muted/30" strokeWidth="8"
            />
            <motion.circle
              cx="50" cy="50" r="44"
              fill="none" stroke="currentColor"
              className={item.ring}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: circumference * (1 - progress / 100) }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={item.emoji}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl"
            >
              {item.emoji}
            </motion.span>
            <span className="text-lg font-bold font-mono mt-0.5">{item.sps}</span>
            <span className="text-[9px] text-muted-foreground">syll/sec</span>
          </div>
        </div>

        {/* Description */}
        <div className="text-center sm:text-left flex-1">
          <motion.p
            key={item.label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-lg font-semibold ${item.color}`}
          >
            {item.label}
          </motion.p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Real-time biofeedback shows your speech rate as you talk.
            The gauge adapts instantly so you always know if you're on pace.
          </p>
          <Button asChild size="sm" variant="outline">
            <Link to="/diagnostic">
              Try it free
              <ArrowRight className="ml-2 w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlogDemoSpeedGauge;
