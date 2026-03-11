import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Full-screen 3-2-1 countdown overlay before recording starts.
 * Prevents clipped first words — mic is already active when countdown ends.
 */
interface CountdownOverlayProps {
  onComplete: () => void;
}

const CountdownOverlay = ({ onComplete }: CountdownOverlayProps) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center"
    >
      <AnimatePresence mode="wait">
        {count > 0 ? (
          <motion.span
            key={count}
            initial={{ scale: 0.5, opacity: 0, filter: "blur(8px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            exit={{ scale: 1.5, opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-8xl font-bold text-primary tabular-nums"
          >
            {count}
          </motion.span>
        ) : null}
      </AnimatePresence>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0.7, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground mt-6 text-sm"
      >
        Get ready...
      </motion.p>
    </motion.div>
  );
};

export default CountdownOverlay;
