import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Static rebus preview for blog articles.
 * Shows a sample rebus puzzle to demonstrate the exercise type.
 */
const SAMPLE_REBUS = [
  { emoji: "\u2600\uFE0F", text: "Sun" },
  { emoji: "\u{1F338}", text: "Flower" },
  { emoji: "\u{1F40D}", text: "Sunflower" },
];

const FULL_WORD = "Sunflower";

const BlogDemoRebus = () => {
  return (
    <div className="my-10 p-6 md:p-8 rounded-2xl border border-border/60 bg-gradient-to-br from-amber-50/30 to-orange-50/30 dark:from-amber-950/10 dark:to-orange-950/10">
      <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-4">
        Rebus Mode for Kids
      </p>

      {/* Rebus display */}
      <div className="flex items-center justify-center gap-4 mb-4">
        {SAMPLE_REBUS.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex flex-col items-center"
          >
            <span className="text-4xl md:text-5xl">{item.emoji}</span>
            {i < SAMPLE_REBUS.length - 1 && (
              <span className="text-xs text-muted-foreground mt-1">{item.text}</span>
            )}
          </motion.div>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground mb-1">
        Can you guess the word?
      </p>
      <p className="text-center text-lg font-bold text-foreground mb-4">
        {FULL_WORD}
      </p>

      <p className="text-sm text-muted-foreground text-center mb-4">
        35 picture puzzles designed for children. They practice saying each syllable clearly
        while having fun decoding emoji clues.
      </p>

      <div className="text-center">
        <Button asChild size="sm" variant="outline">
          <Link to="/auth?tab=signup">
            Try all 35 puzzles
            <ArrowRight className="ml-2 w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default BlogDemoRebus;
