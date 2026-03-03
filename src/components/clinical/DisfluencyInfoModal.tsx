import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Info } from "lucide-react";

interface DisfluencyInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DisfluencyInfoModal = ({ open, onOpenChange }: DisfluencyInfoModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Info className="w-5 h-5 text-purple-600" />
            How does cluttering detection work?
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Understanding what the tool detects and its limitations
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-5 py-4">
          {/* Explanation */}
          <p className="text-sm text-foreground leading-relaxed">
            This tool analyzes the <strong>audio signal</strong> to identify markers
            that may indicate cluttering. It does not detect muscular tension.
            Here are the three markers it looks for:
          </p>
          
          {/* Markers */}
          <div className="space-y-3">
            {/* Block / Long pause */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 border border-orange-100">
              <span className="text-2xl">🟠</span>
              <div>
                <p className="font-medium text-orange-800">Long Pause</p>
                <p className="text-sm text-orange-700">
                  Silence &gt;2 seconds detected between two words. This could be
                  a normal thinking pause or a block.
                </p>
              </div>
            </div>
            
            {/* Repetition */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-100">
              <span className="text-2xl">🟡</span>
              <div>
                <p className="font-medium text-yellow-800">Repetition (Clonic)</p>
                <p className="text-sm text-yellow-700">
                  Identical words repeated rapidly (interval &lt;0.2s).
                  E.g.: "I-I-I want"
                </p>
              </div>
            </div>
            
            {/* Prolongation */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-100">
              <span className="text-2xl">🟣</span>
              <div>
                <p className="font-medium text-purple-800">Prolongation (Tonic)</p>
                <p className="text-sm text-purple-700">
                  Abnormally long pronunciation duration (&gt;0.8s)
                  on a short word.
                </p>
              </div>
            </div>
          </div>
          
          {/* Disclaimer */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-amber-800">
                Feature in beta
              </p>
              <p className="text-sm text-amber-700 leading-relaxed">
                <strong>Does not replace direct clinical observation.</strong>
                <br />
                False positives are possible (reflective pauses, normal hesitations, etc.).
                Use this tool as a quick screening aid, not as a diagnosis.
              </p>
            </div>
          </div>
          
          {/* Method note */}
          <p className="text-xs text-muted-foreground italic">
            Method: Deepgram timestamp analysis (Nova-2 model).
            Detection based on acoustic durations and intervals.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DisfluencyInfoModal;
