import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Animated karaoke text highlight preview for blog articles.
 * Demonstrates the guided reading mode without requiring a microphone.
 */
const DEMO_TEXT = "Take the time to breathe. Each inhale fills your lungs with fresh air. Each exhale releases the tension. Your body relaxes gradually.";
const WORDS = DEMO_TEXT.split(" ");
const WORD_INTERVAL_MS = 400; // 2.5 words/sec ~ natural reading pace

const BlogDemoKaraoke = () => {
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isPlaying) return;

    intervalRef.current = setInterval(() => {
      setHighlightIndex((prev) => {
        if (prev >= WORDS.length - 1) {
          // Reset after brief pause
          setTimeout(() => setHighlightIndex(-1), 800);
          return prev;
        }
        return prev + 1;
      });
    }, WORD_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  // Auto-restart loop
  useEffect(() => {
    if (highlightIndex === -1 && isPlaying) {
      const timeout = setTimeout(() => setHighlightIndex(0), 1200);
      return () => clearTimeout(timeout);
    }
  }, [highlightIndex, isPlaying]);

  return (
    <div className="my-10 p-6 md:p-8 rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 to-primary/10">
      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-4">
        Guided Reading Mode
      </p>

      {/* Karaoke text */}
      <div className="bg-background/80 rounded-xl p-4 md:p-6 mb-4 min-h-[80px]">
        <p className="text-base md:text-lg leading-relaxed font-serif">
          {WORDS.map((word, i) => (
            <motion.span
              key={i}
              className={`inline-block mr-1.5 transition-colors duration-200 ${
                i === highlightIndex
                  ? "text-primary font-semibold bg-primary/10 rounded px-0.5"
                  : i < highlightIndex
                  ? "text-muted-foreground/60"
                  : "text-foreground"
              }`}
              animate={
                i === highlightIndex
                  ? { scale: [1, 1.02, 1] }
                  : {}
              }
              transition={{ duration: 0.2 }}
            >
              {word}
            </motion.span>
          ))}
        </p>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        The blue highlighter follows your voice in real time, pacing you through each word.
        If you speed up, it nudges you to slow down.
      </p>

      <Button asChild size="sm" variant="outline">
        <Link to="/auth?tab=signup">
          Try guided reading
          <ArrowRight className="ml-2 w-3.5 h-3.5" />
        </Link>
      </Button>
    </div>
  );
};

export default BlogDemoKaraoke;
