/**
 * DAF (Delayed Auditory Feedback) Toggle Component
 *
 * Renamed to "Slowdown Mode" for better UX understanding.
 * Allows users to enable the therapeutic DAF effect
 * with clear explanation and headphone warning.
 */

import { Headphones, Volume2, HelpCircle, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface DAFToggleProps {
  isEnabled: boolean;
  isActive: boolean;
  delayMs: number;
  onToggle: () => void;
  onDelayChange: (ms: number) => void;
  disabled?: boolean;
}

export default function DAFToggle({
  isEnabled,
  isActive,
  delayMs,
  onToggle,
  onDelayChange,
  disabled = false
}: DAFToggleProps) {
  
  const handleToggle = () => {
    // Show headphone warning when enabling
    if (!isEnabled) {
      toast.warning("🎧 Headphones or earbuds required!", {
        description: "Without them, you'll hear unpleasant feedback (Larsen effect).",
        duration: 5000,
      });
    }
    onToggle();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className={`w-4 h-4 ${isActive ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="daf-toggle" className="text-sm font-medium cursor-pointer">
                Slowdown Mode
              </Label>
              {isEnabled && (
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                  DAF
                </span>
              )}
              
              {/* Info Modal */}
              <Dialog>
                <DialogTrigger asChild>
                  <button className="text-muted-foreground hover:text-primary transition-colors">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      How does it work?
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">
                      This mode plays your voice back in your ears with a <strong>slight delay</strong> (100ms).
                    </p>
                    <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                      <p className="text-sm font-medium text-foreground">
                        🧠 This "echo" effect tricks your brain and <strong>mechanically forces</strong> you to slow down
                        and articulate better to stay comfortable.
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      It's a <strong>very powerful clinical technique</strong> used by SLPs
                      to treat cluttering and tachylalia.
                    </p>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700">
                      <Headphones className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        <strong>Important:</strong> Use headphones or earbuds.
                        Without them, the sound feeds back into the mic and creates a squeal (Larsen effect).
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <span className="text-[10px] text-muted-foreground leading-tight">
              Delayed audio feedback to enforce slowing down
            </span>
          </div>
        </div>
        
        <Switch
          id="daf-toggle"
          checked={isEnabled}
          onCheckedChange={handleToggle}
          disabled={disabled}
        />
      </div>

      <AnimatePresence>
        {isEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            {/* Headphone warning - more visible */}
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-300 dark:border-amber-700">
              <Headphones className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                🎧 Headphones required to avoid feedback squeal!
              </p>
            </div>

            {/* Delay slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Delay intensity</span>
                <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{delayMs}ms</span>
              </div>
              <Slider
                value={[delayMs]}
                onValueChange={([value]) => onDelayChange(value)}
                min={50}
                max={250}
                step={25}
                disabled={disabled}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>50ms (subtle)</span>
                <span>250ms (strong)</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
