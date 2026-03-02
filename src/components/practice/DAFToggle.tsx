/**
 * DAF (Delayed Auditory Feedback) Toggle Component
 * 
 * Renamed to "Mode Ralentisseur" for better UX understanding.
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
      toast.warning("🎧 Casque ou écouteurs obligatoires !", {
        description: "Sans eux, vous entendrez un sifflement désagréable (Larsen).",
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
                Mode Ralentisseur
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
                      Comment ça marche ?
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">
                      Ce mode renvoie votre voix dans vos oreilles avec un <strong>léger retard</strong> (100ms).
                    </p>
                    <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                      <p className="text-sm font-medium text-foreground">
                        🧠 Cet effet "écho" trompe votre cerveau et vous <strong>oblige mécaniquement</strong> à ralentir 
                        et à mieux articuler pour rester confortable.
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      C'est une <strong>technique clinique très puissante</strong> utilisée par les orthophonistes 
                      pour traiter le bredouillement et la tachylalie.
                    </p>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700">
                      <Headphones className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        <strong>Important :</strong> Utilisez un casque ou des écouteurs. 
                        Sans eux, le son revient dans le micro et crée un sifflement (larsen).
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <span className="text-[10px] text-muted-foreground leading-tight">
              Retour audio décalé pour forcer le ralentissement
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
                🎧 Casque obligatoire pour éviter le sifflement !
              </p>
            </div>

            {/* Delay slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Intensité du décalage</span>
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
                <span>50ms (subtil)</span>
                <span>250ms (puissant)</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
