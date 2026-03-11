import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import BreathingGuide from "@/components/practice/BreathingGuide";

/**
 * Blog-embedded breathing demo.
 * Shows the visual breathing guide in a compact card.
 */
const BlogDemoBreathing = () => {
  return (
    <div className="my-10 p-6 md:p-8 rounded-2xl border border-border/60 bg-gradient-to-br from-sky-50/30 to-indigo-50/30 dark:from-sky-950/10 dark:to-indigo-950/10">
      <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
        Try It Now
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        Square breathing calms the nervous system and prepares you for controlled speech.
      </p>

      <BreathingGuide pattern="square" cycles={2} compact />

      <div className="text-center mt-4">
        <Button asChild size="sm" variant="outline">
          <Link to="/auth?tab=signup">
            Explore all breathing exercises
            <ArrowRight className="ml-2 w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default BlogDemoBreathing;
