/**
 * English Syllabification Utility
 * Based on clinical speech therapy methods for cluttering
 * Optimized for American English
 */

import { SYLLABLE_DICTIONARY } from './syllableDictionary';

// English vowels
const VOWELS = 'aeiouy';
const VOWELS_REGEX = new RegExp(`[${VOWELS}]`, 'gi');

// Common English consonant clusters that shouldn't be split
const CONSONANT_CLUSTERS = [
  'bl', 'br', 'ch', 'cl', 'cr', 'dr', 'fl', 'fr', 'gh', 'gl', 'gr',
  'ph', 'pl', 'pr', 'qu', 'sc', 'sh', 'sk', 'sl', 'sm', 'sn', 'sp',
  'st', 'sw', 'th', 'tr', 'tw', 'wh', 'wr'
];

/**
 * Count syllables using dictionary lookup + heuristic fallback
 */
export function countSyllablesWord(word: string): number {
  const normalized = word.toLowerCase().trim().replace(/[.,!?;:'"()\[\]{}…–—]/g, '');
  if (!normalized) return 0;

  // 1. Dictionary lookup first
  if (SYLLABLE_DICTIONARY[normalized] !== undefined) {
    return SYLLABLE_DICTIONARY[normalized];
  }

  // 2. Handle hyphenated words
  if (normalized.includes('-')) {
    const parts = normalized.split('-').filter(p => p.length > 0);
    if (parts.length > 1) {
      let total = 0;
      for (const part of parts) {
        total += SYLLABLE_DICTIONARY[part] ?? countSyllablesHeuristic(part);
      }
      return Math.max(1, total);
    }
  }

  // 3. Handle contractions
  if (normalized.includes("'")) {
    const clean = normalized.replace(/'(s|t|re|ve|ll|d|m)$/i, '');
    if (SYLLABLE_DICTIONARY[clean] !== undefined) {
      return SYLLABLE_DICTIONARY[clean];
    }
  }

  return countSyllablesHeuristic(normalized);
}

/**
 * English syllable counting heuristic
 * Based on standard English phonological rules
 */
function countSyllablesHeuristic(word: string): number {
  if (word.length === 0) return 0;
  if (word.length <= 2) return 1;

  let count = 0;
  let prevWasVowel = false;

  for (let i = 0; i < word.length; i++) {
    const isVowel = VOWELS.includes(word[i].toLowerCase());
    if (isVowel && !prevWasVowel) {
      count++;
    }
    prevWasVowel = isVowel;
  }

  // Subtract silent 'e' at end: "make" = 1, "time" = 1
  if (word.length > 2 && word.endsWith('e')) {
    const beforeE = word.slice(-2, -1);
    if (!VOWELS.includes(beforeE.toLowerCase())) {
      count = Math.max(1, count - 1);
    }
  }

  // Subtract silent 'ed' at end after consonant: "talked" = 1, "baked" = 1
  // But NOT: "ted" = 1, "needed" = 2
  if (word.length > 3 && word.endsWith('ed')) {
    const beforeEd = word.slice(-3, -2);
    if (!['t', 'd'].includes(beforeEd.toLowerCase()) && !VOWELS.includes(beforeEd.toLowerCase())) {
      count = Math.max(1, count - 1);
    }
  }

  // Handle 'le' at end after consonant: "ta-ble" = 2, "sim-ple" = 2
  if (word.length > 3 && word.endsWith('le')) {
    const beforeLe = word.slice(-3, -2);
    if (!VOWELS.includes(beforeLe.toLowerCase())) {
      // 'le' at end after consonant IS a syllable (already counted via 'e'), keep it
    }
  }

  // Handle 'es' ending: "boxes" = 2, "makes" = 1
  if (word.length > 3 && word.endsWith('es')) {
    const beforeEs = word.slice(-3, -2);
    if (['s', 'x', 'z', 'h'].includes(beforeEs.toLowerCase())) {
      // "boxes", "buses" — 'es' IS a syllable, keep count
    } else if (!VOWELS.includes(beforeEs.toLowerCase())) {
      count = Math.max(1, count - 1);
    }
  }

  return Math.max(1, count);
}

/**
 * Syllabify a word into an array of syllables (visual aid for karaoke mode)
 */
export function syllabifyWord(word: string): string[] {
  if (!word || word.length <= 2) return [word];

  const lowerWord = word.toLowerCase();
  const syllables: string[] = [];
  let currentSyllable = '';

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    const lowerChar = lowerWord[i];
    currentSyllable += char;

    if (VOWELS.includes(lowerChar)) {
      const remaining = lowerWord.slice(i + 1);
      if (remaining.length === 0) continue;

      let consonantCount = 0;
      for (let j = 0; j < remaining.length; j++) {
        if (VOWELS.includes(remaining[j])) break;
        consonantCount++;
      }

      if (consonantCount === 0) {
        continue;
      } else if (consonantCount === 1) {
        syllables.push(currentSyllable);
        currentSyllable = '';
      } else if (consonantCount >= 2) {
        const nextTwo = remaining.slice(0, 2).toLowerCase();
        if (CONSONANT_CLUSTERS.includes(nextTwo)) {
          syllables.push(currentSyllable);
          currentSyllable = '';
        } else {
          const nextChar = word[i + 1];
          syllables.push(currentSyllable + nextChar);
          currentSyllable = '';
          i++;
        }
      }
    }
  }

  if (currentSyllable) {
    if (syllables.length > 0 && !VOWELS_REGEX.test(currentSyllable)) {
      syllables[syllables.length - 1] += currentSyllable;
    } else {
      syllables.push(currentSyllable);
    }
  }

  return syllables.length > 0 ? syllables : [word];
}

export interface SyllabifiedWord {
  original: string;
  syllables: string[];
  isPunctuation: boolean;
}

export function syllabifySentence(sentence: string): SyllabifiedWord[] {
  const tokens = sentence.split(/\s+/).filter(t => t.length > 0);

  return tokens.map(token => {
    if (/^[.,!?;:…\-–—'"()[\]{}]+$/.test(token)) {
      return { original: token, syllables: [token], isPunctuation: true };
    }

    const match = token.match(/^(.+?)([.,!?;:…\-–—'"()[\]{}]*)?$/);
    if (!match) return { original: token, syllables: [token], isPunctuation: false };

    const [, word, punctuation] = match;
    const syllables = syllabifyWord(word);

    if (punctuation && syllables.length > 0) {
      syllables[syllables.length - 1] += punctuation;
    }

    return { original: token, syllables, isPunctuation: false };
  });
}

export function countSyllables(sentence: string): number {
  const words = sentence.split(/\s+/).filter(w => w.length > 0);
  let total = 0;
  for (const word of words) {
    if (/^[.,!?;:…\-–—'"()[\]{}]+$/.test(word)) continue;
    total += countSyllablesWord(word);
  }
  return total;
}
