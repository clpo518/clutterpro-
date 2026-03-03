import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, CheckCircle2, AlertTriangle } from "lucide-react";

const WaveformReferenceModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground hover:text-foreground">
          <HelpCircle className="w-4 h-4" />
          <span className="text-xs">See an ideal model</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            📊 How to read your waveform?
          </DialogTitle>
          <DialogDescription>
            Compare your recording with these examples to evaluate your rhythm.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Good Example */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="font-bold">Calm Rhythm</h3>
            </div>
            <div className="relative h-20 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-green-200 dark:border-green-800 p-3 overflow-hidden">
              {/* Simulated good waveform with gaps */}
              <div className="flex items-center justify-between h-full gap-3">
                {/* Speech block 1 */}
                <div className="flex items-end gap-[2px] h-full">
                  {[60, 80, 100, 90, 70, 85, 95, 75].map((h, i) => (
                    <div 
                      key={i} 
                      className="w-2 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                {/* Gap - Pause */}
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded text-green-700 dark:text-green-300 font-medium">⏸️ Pause</span>
                </div>
                {/* Speech block 2 */}
                <div className="flex items-end gap-[2px] h-full">
                  {[70, 90, 85, 100, 80, 65, 75, 95].map((h, i) => (
                    <div 
                      key={i} 
                      className="w-2 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                {/* Gap - Pause */}
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded text-green-700 dark:text-green-300 font-medium">⏸️ Pause</span>
                </div>
                {/* Speech block 3 */}
                <div className="flex items-end gap-[2px] h-full">
                  {[65, 85, 95, 80, 70, 90].map((h, i) => (
                    <div 
                      key={i} 
                      className="w-2 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground italic">
              "Islands of speech separated by breathing pauses."
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">vs</span>
            </div>
          </div>

          {/* Bad Example */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold">Cluttering</h3>
            </div>
            <div className="relative h-20 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-red-200 dark:border-red-800 p-3 overflow-hidden">
              {/* Simulated bad waveform - dense, no gaps */}
              <div className="flex items-end justify-center gap-[1px] h-full">
                {[70, 85, 90, 75, 80, 95, 70, 85, 90, 80, 75, 95, 85, 70, 90, 80, 75, 85, 95, 70, 80, 90, 75, 85, 80, 95, 70, 85, 90, 75, 80, 95, 85, 70, 90, 80].map((h, i) => (
                  <div 
                    key={i} 
                    className="w-1.5 bg-gradient-to-t from-red-500 to-red-400 rounded-t"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground italic">
              "A continuous block with no recovery time."
            </p>
          </div>

          {/* Tip */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-sm text-center">
              💡 <strong>Tip:</strong> Flat zones (silences) are just as important as the waves (speech).
              They show that you're breathing correctly.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WaveformReferenceModal;
