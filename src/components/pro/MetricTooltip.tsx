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
  SPS: "Syllabes par seconde — Calculé par paquets de 5 syllabes sur le temps de parole réel (silences exclus). Cible thérapeutique : 3.5-5.5 SPS",
  AVG_SPS: "Vitesse moyenne de la session en Syllabes Par Seconde, calculée par paquets de 5 syllabes. ≤5.0 = optimal, 5-6 = rapide, >6.5 = tachylalie",
  MAX_SPS: "Vitesse maximale atteinte pendant la session. Un écart important avec la moyenne peut indiquer des accélérations involontaires",
  FLUENCY_RATIO: "Pourcentage du temps passé à parler vs en silence. > 80% = excellent, 60-80% = normal, < 60% = à surveiller",
  FILLERS: "Disfluences : 'euh', 'du coup', 'en fait' (mots parasites) détectés automatiquement pendant la session",
  SYLLABLES: "Nombre total de syllabes prononcées, calculé avec un algorithme optimisé pour le français (gestion des 'e' muets)",
} as const;
