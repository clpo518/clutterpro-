/**
 * Generate Report Button Component
 * 
 * Handles PDF and Text report generation with modal customization and loading states
 */

import React, { useState, useCallback } from "react";
import { pdf } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Download, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import ClinicalReportPDF from "./ClinicalReportPDF";
import ReportOptionsModal, { ReportFormat } from "./ReportOptionsModal";
import { 
  analyzePatientData, 
  generateTextReport,
  SessionData, 
  PatientProfile,
  ReportOptions 
} from "@/lib/clinicalReportAnalysis";

interface GenerateReportButtonProps {
  sessions: SessionData[];
  profile: PatientProfile;
  therapistName?: string;
}

type GenerationStep = "idle" | "modal" | "analyzing" | "generating" | "downloading" | "done";

const stepLabels: Record<GenerationStep, string> = {
  idle: "Generate Report",
  modal: "Configuring...",
  analyzing: "Analyzing data...",
  generating: "Generating...",
  downloading: "Preparing download...",
  done: "Report generated!",
};

const GenerateReportButton: React.FC<GenerateReportButtonProps> = ({
  sessions,
  profile,
  therapistName,
}) => {
  const [step, setStep] = useState<GenerationStep>("idle");
  const [modalOpen, setModalOpen] = useState(false);
  
  const handleButtonClick = useCallback(() => {
    if (sessions.length < 2) {
      toast.error("At least 2 sessions are required to generate a report");
      return;
    }
    setModalOpen(true);
    setStep("modal");
  }, [sessions.length]);
  
  const handleModalClose = useCallback((open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setStep("idle");
    }
  }, []);
  
  const handleGenerate = useCallback(async (options: ReportOptions, format: ReportFormat) => {
    try {
      // Step 1: Analyze data
      setStep("analyzing");
      await new Promise(resolve => setTimeout(resolve, 300)); // UX delay
      
      const analysisResult = analyzePatientData(sessions, profile, options);
      
      // Generate filename with patient name and date
      const patientSlug = (profile.full_name || "patient")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const dateSlug = new Date().toISOString().slice(0, 10);
      
      if (format === "text") {
        // Generate Text Report
        setStep("generating");
        await new Promise(resolve => setTimeout(resolve, 200)); // UX delay
        
        const textContent = generateTextReport(analysisResult, therapistName);
        const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
        
        // Download
        setStep("downloading");
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `clinical_report-${patientSlug}-${dateSlug}.txt`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setStep("done");
        setModalOpen(false);
        toast.success("Text report generated successfully!");
        
      } else {
        // Generate PDF Report
        setStep("generating");
        await new Promise(resolve => setTimeout(resolve, 500)); // UX delay
        
        const doc = <ClinicalReportPDF analysis={analysisResult} therapistName={therapistName} />;
        const blob = await pdf(doc).toBlob();
        
        // Download
        setStep("downloading");
        await new Promise(resolve => setTimeout(resolve, 200)); // UX delay
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `clinical_report-${patientSlug}-${dateSlug}.pdf`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setStep("done");
        setModalOpen(false);
        toast.success("PDF report generated successfully!");
      }
      
      // Reset after delay
      setTimeout(() => {
        setStep("idle");
      }, 2000);
      
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Error generating report");
      setStep("idle");
      setModalOpen(false);
    }
  }, [sessions, profile, therapistName]);
  
  const isLoading = step !== "idle" && step !== "done" && step !== "modal";
  const isDone = step === "done";
  
  return (
    <>
      <Button
        onClick={handleButtonClick}
        disabled={isLoading || sessions.length < 2}
        className={`gap-2 transition-all ${
          isDone 
            ? "bg-green-600 hover:bg-green-700" 
            : "bg-primary hover:bg-primary/90"
        }`}
        size="lg"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isDone ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        <span>{stepLabels[step]}</span>
        {step === "idle" && <Download className="w-4 h-4 ml-1 opacity-50" />}
      </Button>
      
      <ReportOptionsModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        onGenerate={handleGenerate}
        isGenerating={isLoading}
        patientName={profile.full_name || "Patient"}
      />
    </>
  );
};

export default GenerateReportButton;
