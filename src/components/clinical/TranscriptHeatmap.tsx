import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, AlertTriangle } from "lucide-react";
import { 
  analyzeDisfluency, 
  getDisfluencyEmoji, 
  getDisfluencyLabel,
  type WordTimestamp,
  type DisfluencyMarker 
} from "@/lib/analyzeDisfluency";
import DisfluencyInfoModal from "./DisfluencyInfoModal";
import { cn } from "@/lib/utils";

interface TranscriptHeatmapProps {
  wordTimestamps: WordTimestamp[];
  className?: string;
}

const TranscriptHeatmap = ({ wordTimestamps, className }: TranscriptHeatmapProps) => {
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  // Analyze disfluencies
  const analysis = useMemo(() => {
    return analyzeDisfluency(wordTimestamps);
  }, [wordTimestamps]);

  // Count fillers from word timestamps
  const fillerCount = useMemo(() => {
    const fillerKeys = new Set<string>();
    wordTimestamps.forEach(w => {
      if (w.isFiller && w.fillerKey) {
        fillerKeys.add(w.fillerKey);
      }
    });
    return fillerKeys.size;
  }, [wordTimestamps]);
  
  // Create a map of word index to markers for quick lookup
  const markerMap = useMemo(() => {
    const map = new Map<number, DisfluencyMarker[]>();
    analysis.markers.forEach(marker => {
      const existing = map.get(marker.wordIndex) || [];
      existing.push(marker);
      map.set(marker.wordIndex, existing);
    });
    return map;
  }, [analysis.markers]);
  
  // Get styling for a word based on its markers and filler status
  const getWordStyling = (index: number): { className: string; hasBlock: boolean } => {
    const word = wordTimestamps[index];
    const markers = markerMap.get(index) || [];
    
    const classes: string[] = [];
    let hasBlock = false;

    // Filler highlighting (blue/teal)
    if (word?.isFiller) {
      classes.push('bg-blue-100 text-blue-800 rounded px-1');
    }
    
    for (const marker of markers) {
      switch (marker.type) {
        case 'repetition':
          classes.push('underline decoration-yellow-400 decoration-2 underline-offset-2 bg-yellow-50');
          break;
        case 'prolongation':
          classes.push('bg-purple-100 text-purple-900 rounded px-1');
          break;
        case 'block':
          hasBlock = true;
          break;
      }
    }
    
    return { className: classes.join(' '), hasBlock };
  };

  // Build tooltip for a word
  const getWordTitle = (index: number): string | undefined => {
    const parts: string[] = [];
    const word = wordTimestamps[index];
    
    if (word?.isFiller) {
      parts.push('🔵 Filler word');
    }
    
    const markers = markerMap.get(index);
    if (markers) {
      markers.forEach(m => {
        let label = `${getDisfluencyEmoji(m.type)} ${getDisfluencyLabel(m.type)}`;
        if (m.type === 'repetition' && m.count && m.count > 1) {
          label += ` x${m.count}`;
        }
        parts.push(label);
      });
    }
    
    return parts.length > 0 ? parts.join(', ') : undefined;
  };
  
  if (!wordTimestamps || wordTimestamps.length === 0) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>Transcript data not available for this session.</p>
          <p className="text-sm mt-2">New sessions will include this data automatically.</p>
        </CardContent>
      </Card>
    );
  }

  const hasObservations = analysis.summary.total > 0 || fillerCount > 0;
  
  return (
    <>
      <Card className={cn("border-purple-200 bg-purple-50/30", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                🔬 Cluttering Detection
                <Badge variant="secondary" className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                  Beta
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                Automatically detects sound repetitions, syllable prolongations, and unusual silences
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowInfoModal(true)}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
            >
              <Info className="w-4 h-4 mr-1" />
              How it works
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Summary */}
          {hasObservations ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-3 p-3 rounded-lg bg-background border">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">Observations:</span>
                </div>
                {analysis.summary.blocks > 0 && (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    🟠 {analysis.summary.blocks} Long pause{analysis.summary.blocks > 1 ? 's' : ''}
                  </Badge>
                )}
                {analysis.summary.repetitions > 0 && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    🟡 {analysis.summary.repetitions} Repetition{analysis.summary.repetitions > 1 ? 's' : ''}
                  </Badge>
                )}
                {analysis.summary.prolongations > 0 && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    🟣 {analysis.summary.prolongations} Prolongation{analysis.summary.prolongations > 1 ? 's' : ''}
                  </Badge>
                )}
                {fillerCount > 0 && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    🔵 {fillerCount} Filler word{fillerCount > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              {analysis.summary.blocks > 0 && (
                <p className="text-xs text-muted-foreground px-1">
                  💡 Long pauses are not necessarily blocks. They may correspond to a moment of reflection or word-finding.
                </p>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              ✅ No disfluency markers detected in this session
            </div>
          )}
          
          {/* Transcript with highlighting */}
          <div className="p-4 rounded-lg bg-background border leading-relaxed text-base">
            {wordTimestamps.map((word, index) => {
              const { className, hasBlock } = getWordStyling(index);
              
              return (
                <span key={index}>
                  {/* Block indicator (red bar before the word) */}
                  {hasBlock && (
                    <span className="inline-flex items-center mx-1 text-orange-500" title="Long pause detected (silence > 2s)">
                      <span className="inline-block w-0.5 h-5 bg-orange-400 rounded-full mx-1" />
                      <span className="text-xs text-orange-500 font-mono">[⏸]</span>
                    </span>
                  )}
                  <span 
                    className={cn("transition-colors", className)}
                    title={getWordTitle(index)}
                  >
                    {word.word}
                  </span>
                  {' '}
                </span>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-0.5 h-4 bg-orange-400 rounded-full" />
              <span className="text-xs font-mono text-orange-500 mr-1">[⏸]</span>
              <span>Long pause (silence &gt;2s)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="underline decoration-yellow-400 decoration-2 underline-offset-2 bg-yellow-50 px-1">example</span>
              <span>Repetition</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="bg-purple-100 text-purple-900 rounded px-1">example</span>
              <span>Prolongation (&gt;0.8s)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="bg-blue-100 text-blue-800 rounded px-1">example</span>
              <span>Filler word</span>
            </div>
          </div>
          
          {/* Disclaimer */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-amber-50/50 border border-amber-100 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Acoustic analysis (beta).</strong>{' '}
              Measures audible symptoms, not physical tension.
              Does not replace direct clinical observation.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <DisfluencyInfoModal 
        open={showInfoModal} 
        onOpenChange={setShowInfoModal} 
      />
    </>
  );
};

export default TranscriptHeatmap;
