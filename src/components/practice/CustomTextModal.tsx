import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles } from "lucide-react";

interface CustomTextModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (text: string, title: string) => void;
}

const PLACEHOLDER =
  "Paste or type any text here — an email you need to read aloud, a presentation script, a bedtime story, or anything you'd like to practice with.";

const CustomTextModal = ({ open, onOpenChange, onSubmit }: CustomTextModalProps) => {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const isValid = text.trim().length >= 20;

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit(text.trim(), title.trim() || "My Custom Text");
    setText("");
    setTitle("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Use your own text
          </DialogTitle>
          <DialogDescription>
            Paste any text to practice reading at a controlled pace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Optional title */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Title <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Work presentation"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* Text area */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Your text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={PLACEHOLDER}
              rows={8}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-[11px] text-muted-foreground">
                {wordCount} {wordCount === 1 ? "word" : "words"}
                {wordCount > 0 && ` \u00B7 ~${Math.ceil(wordCount / 3)} seconds at normal pace`}
              </p>
              {text.length > 0 && !isValid && (
                <p className="text-[11px] text-amber-600">Min. 20 characters</p>
              )}
            </div>
          </div>

          {/* Tip */}
          <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Works great with emails, scripts, or anything you need to rehearse.
              The guided highlighter will pace you through your text.
            </p>
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={!isValid} className="w-full mt-2">
          Start practicing
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default CustomTextModal;
