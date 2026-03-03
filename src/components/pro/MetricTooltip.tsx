import { ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MetricTooltipProps {
  children: ReactNode;
  content: string;
  className?: string;
}

export const MetricTooltip = ({ children, content, className = "" }: MetricTooltipProps) => {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 cursor-help ${className}`}>
            {children}
            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground opacity-60" />
          </span>
        </TooltipTrigger>
        <TooltipContent 
          className="max-w-xs text-sm"
          side="top"
        >
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Pre-defined tooltips for common metrics
export const METRIC_TOOLTIPS = {
  SPS: "Syllables per second — Calculated in 5-syllable chunks over actual speaking time (silences excluded). Therapeutic target: 3.5-5.5 SPS",
  AVG_SPS: "Average session speed in Syllables Per Second, calculated in 5-syllable chunks. ≤5.0 = optimal, 5-6 = fast, >6.5 = cluttering range",
  MAX_SPS: "Peak speed reached during the session. A large gap from the average may indicate involuntary acceleration",
  FLUENCY_RATIO: "Percentage of time spent speaking vs. in silence. > 80% = excellent, 60-80% = normal, < 60% = watch closely",
  FILLERS: "Disfluencies: 'um', 'uh', 'like', 'you know' (filler words) automatically detected during the session",
  SYLLABLES: "Total syllables spoken, calculated with an algorithm optimized for English (silent 'e' handling, suffix rules)",
} as const;
