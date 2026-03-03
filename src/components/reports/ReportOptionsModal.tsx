/**
 * Report Options Modal
 * 
 * Allows therapist to customize the report before generation (PDF or Text)
 */

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FileText, FileType, Loader2 } from "lucide-react";
import { ReportOptions } from "@/lib/clinicalReportAnalysis";
import { cn } from "@/lib/utils";

export type ReportFormat = "pdf" | "text";

interface ReportOptionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (options: ReportOptions, format: ReportFormat) => void;
  isGenerating: boolean;
  patientName: string;
}

const ReportOptionsModal: React.FC<ReportOptionsModalProps> = ({
  open,
  onOpenChange,
  onGenerate,
  isGenerating,
  patientName,
}) => {
  const [recipientDoctor, setRecipientDoctor] = React.useState("");
  const [therapistNotes, setTherapistNotes] = React.useState("");
  const [includeEvolutionChart, setIncludeEvolutionChart] = React.useState(true);
  const [format, setFormat] = React.useState<ReportFormat>("pdf");

  const handleGenerate = () => {
    onGenerate(
      {
        recipientDoctor: recipientDoctor.trim() || undefined,
        therapistNotes: therapistNotes.trim() || undefined,
        includeEvolutionChart,
      },
      format
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Customize Report
          </DialogTitle>
          <DialogDescription>
            Add optional information before generating the report for{" "}
            <span className="font-medium text-foreground">{patientName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Format Selector */}
          <div className="grid gap-2">
            <Label>Export format</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormat("pdf")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all",
                  format === "pdf"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted bg-background text-muted-foreground hover:border-primary/50"
                )}
              >
                <FileText className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">PDF</div>
                  <div className="text-xs opacity-70">Professional layout</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormat("text")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all",
                  format === "text"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted bg-background text-muted-foreground hover:border-primary/50"
                )}
              >
                <FileType className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Text</div>
                  <div className="text-xs opacity-70">Easy copy-paste</div>
                </div>
              </button>
            </div>
          </div>

          {/* Recipient Doctor */}
          <div className="grid gap-2">
            <Label htmlFor="recipient">Attention (optional)</Label>
            <Input
              id="recipient"
              placeholder="Dr. Smith, primary care physician"
              value={recipientDoctor}
              onChange={(e) => setRecipientDoctor(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Will be displayed in the document header if provided
            </p>
          </div>

          {/* Therapist Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes">Clinical observations (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Personal observations to include in the report...&#10;&#10;Example: Cooperative patient, good awareness of the disorder. Working on slowing strategies."
              value={therapistNotes}
              onChange={(e) => setTherapistNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              These notes will be added in a "Clinician Observations" section
            </p>
          </div>

          {/* Include Chart Toggle - only for PDF */}
          {format === "pdf" && (
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label htmlFor="include-chart">Progress chart</Label>
                <p className="text-xs text-muted-foreground">
                  Include the progression curve in the PDF
                </p>
              </div>
              <Switch
                id="include-chart"
                checked={includeEvolutionChart}
                onCheckedChange={setIncludeEvolutionChart}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                {format === "pdf" ? <FileText className="w-4 h-4" /> : <FileType className="w-4 h-4" />}
                Generate {format === "pdf" ? "PDF" : "Text"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportOptionsModal;
