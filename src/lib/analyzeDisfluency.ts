/**
 * Disfluency Analysis Module
 * Detects stuttering markers: repetitions, prolongations, and blocks
 * Based on acoustic analysis of word timestamps from Deepgram
 */

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  duration: number;
  syllables?: number;
  isFiller?: boolean;
  fillerKey?: string;
}

export type DisfluencyType = 'repetition' | 'prolongation' | 'block';
export type DisfluencySeverity = 'mild' | 'moderate' | 'severe';

export interface DisfluencyMarker {
  type: DisfluencyType;
  wordIndex: number;
  severity: DisfluencySeverity;
  duration?: number;  // For blocks and prolongations
  word?: string;      // The affected word
  count?: number;     // For repetitions: how many times the word is repeated consecutively
}

export interface DisfluencySummary {
  repetitions: number;
  prolongations: number;
  blocks: number;
  total: number;
}

export interface DisfluencyAnalysis {
  markers: DisfluencyMarker[];
  summary: DisfluencySummary;
}

// Configuration thresholds
const THRESHOLDS = {
  // Repetition: same word repeated with gap < 0.2s
  REPETITION_GAP_MAX: 0.2,
  
  // Prolongation: word duration > 0.8s on short words (< 8 chars)
  PROLONGATION_DURATION_MIN: 0.8,
  PROLONGATION_WORD_LENGTH_MAX: 8,
  PROLONGATION_SEVERE_DURATION: 1.5,
  
  // Block: silence > 2.0s without punctuation before
  BLOCK_SILENCE_MIN: 2.0,
  BLOCK_SEVERE_SILENCE: 3.0,
};

// Punctuation that indicates natural pauses
const PAUSE_PUNCTUATION = /[.,!?;:…—–-]$/;

/**
 * Analyze word timestamps for disfluency markers
 */
export function analyzeDisfluency(words: WordTimestamp[]): DisfluencyAnalysis {
  const markers: DisfluencyMarker[] = [];
  
  if (!words || words.length === 0) {
    return {
      markers: [],
      summary: { repetitions: 0, prolongations: 0, blocks: 0, total: 0 }
    };
  }
  
  for (let i = 0; i < words.length; i++) {
    const current = words[i];
    const previous = i > 0 ? words[i - 1] : null;
    const next = i < words.length - 1 ? words[i + 1] : null;
    
    // Normalize word for comparison
    const normalizedWord = current.word.toLowerCase().replace(/[.,!?;:'"]/g, '');
    
    // 1. Check for REPETITIONS (Clonic stuttering)
    // Same word repeated rapidly (gap < 0.2s)
    // Count consecutive repetitions
    if (next) {
      const nextNormalized = next.word.toLowerCase().replace(/[.,!?;:'"]/g, '');
      const gap = next.start - current.end;
      
      if (normalizedWord === nextNormalized && gap >= 0 && gap < THRESHOLDS.REPETITION_GAP_MAX) {
        // Only mark the first occurrence of the repetition
        const alreadyMarked = markers.some(
          m => m.type === 'repetition' && m.wordIndex === i
        );
        if (!alreadyMarked) {
          // Count how many times this word repeats consecutively
          let repCount = 2; // at least current + next
          let j = i + 2;
          while (j < words.length) {
            const jNormalized = words[j].word.toLowerCase().replace(/[.,!?;:'"]/g, '');
            const jGap = words[j].start - words[j - 1].end;
            if (jNormalized === normalizedWord && jGap >= 0 && jGap < THRESHOLDS.REPETITION_GAP_MAX) {
              repCount++;
              j++;
            } else {
              break;
            }
          }
          
          markers.push({
            type: 'repetition',
            wordIndex: i,
            severity: repCount >= 4 ? 'severe' : repCount >= 3 ? 'moderate' : 'mild',
            word: current.word,
            count: repCount,
          });
        }
      }
    }
    
    // 2. Check for PROLONGATIONS (Tonic stuttering)
    // Duration > 0.8s on short words
    if (
      current.duration > THRESHOLDS.PROLONGATION_DURATION_MIN &&
      normalizedWord.length < THRESHOLDS.PROLONGATION_WORD_LENGTH_MAX
    ) {
      const severity: DisfluencySeverity = 
        current.duration >= THRESHOLDS.PROLONGATION_SEVERE_DURATION ? 'severe' : 
        current.duration >= 1.0 ? 'moderate' : 'mild';
      
      markers.push({
        type: 'prolongation',
        wordIndex: i,
        severity,
        duration: current.duration,
        word: current.word
      });
    }
    
    // 3. Check for BLOCKS (Silent blocks)
    // Silence > 1.0s without punctuation before
    if (previous) {
      const silence = current.start - previous.end;
      
      // Only flag as block if previous word didn't end with punctuation
      // (punctuation indicates natural pause, not a block)
      const hasPunctuationBefore = PAUSE_PUNCTUATION.test(previous.word);
      
      if (silence >= THRESHOLDS.BLOCK_SILENCE_MIN && !hasPunctuationBefore) {
        const severity: DisfluencySeverity = 
          silence >= THRESHOLDS.BLOCK_SEVERE_SILENCE ? 'severe' : 
          silence >= 1.5 ? 'moderate' : 'mild';
        
        markers.push({
          type: 'block',
          wordIndex: i,
          severity,
          duration: silence,
          word: current.word // The word that came after the block
        });
      }
    }
  }
  
  // Calculate summary
  const summary: DisfluencySummary = {
    repetitions: markers.filter(m => m.type === 'repetition').length,
    prolongations: markers.filter(m => m.type === 'prolongation').length,
    blocks: markers.filter(m => m.type === 'block').length,
    total: markers.length
  };
  
  return { markers, summary };
}

/**
 * Get human-readable label for disfluency type
 */
export function getDisfluencyLabel(type: DisfluencyType): string {
  switch (type) {
    case 'repetition':
      return 'Repetition';
    case 'prolongation':
      return 'Prolongation';
    case 'block':
      return 'Block';
    default:
      return type;
  }
}

/**
 * Get emoji for disfluency type
 */
export function getDisfluencyEmoji(type: DisfluencyType): string {
  switch (type) {
    case 'repetition':
      return '🟡';
    case 'prolongation':
      return '🟣';
    case 'block':
      return '🟠';
    default:
      return '⚪';
  }
}

/**
 * Get CSS classes for disfluency highlighting
 */
export function getDisfluencyStyles(type: DisfluencyType): {
  className: string;
  description: string;
} {
  switch (type) {
    case 'repetition':
      return {
        className: 'underline decoration-yellow-400 decoration-2 underline-offset-4 bg-yellow-50',
        description: 'Word repeated rapidly'
      };
    case 'prolongation':
      return {
        className: 'bg-purple-100 text-purple-900 rounded px-1',
        description: 'Abnormally long duration'
      };
    case 'block':
      return {
        className: 'border-l-4 border-orange-400 pl-2 ml-1',
        description: 'Silence > 2s between words'
      };
    default:
      return {
        className: '',
        description: ''
      };
  }
}
