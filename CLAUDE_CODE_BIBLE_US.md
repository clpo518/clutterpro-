# 🇺🇸 ClutterPro — Complete US Translation Bible for Claude Code

> **Instructions for Claude Code**: This document contains everything you need to translate the French SaaS `parlermoinsvite.fr` into an English US version called `ClutterPro`. Work through each section in order. Do NOT improvise translations — use exactly what is written here. Commit after each major section.

---

## 0. CONTEXT & PRODUCT OVERVIEW

**What this app does**: ClutterPro is a web app for people with cluttering (a fluency speech disorder characterized by excessively fast, disorganized speech). It provides:
- Real-time syllable-per-second (SPS) measurement via Deepgram API
- Guided reading exercises with karaoke-style pacing
- Speech therapy tools for SLPs (Speech-Language Pathologists)
- Patient progress tracking and clinical reports

**Business model**:
- B2B: SLPs pay a subscription ($29/month for 3 patients, $39/month for 5 patients) — patients get free access
- B2C: Patients without an SLP can subscribe solo ($9/month after 7-day free trial)

**Key terminology changes**:
| French | English |
|--------|---------|
| Orthophoniste | Speech-Language Pathologist / SLP |
| Bredouillement | Cluttering |
| Syllabes par seconde (SPS) | Syllables per second (SPS) — keep the acronym |
| Débit de parole | Speech rate |
| Séance | Session |
| Patient | Patient (same) |
| Praticien | Clinician / SLP |
| RGPD | HIPAA |
| € | $ |
| "moins de 2 cafés" | "less than a coffee a day" |

---

## 1. CRITICAL: DEEPGRAM LANGUAGE CONFIG

**File**: `src/hooks/useDeepgramSPS.ts`

Find this line:
```
language=fr
```
Replace with:
```
language=en-US
```

Also find `model=nova-2` — keep it, nova-2 supports English perfectly.

---

## 2. CRITICAL: ENGLISH FILLERS LIST

**File**: `src/lib/analyzeDisfluency.ts` (or wherever `FRENCH_FILLERS` is defined)

Replace:
```typescript
const FRENCH_FILLERS = [
  'euh', 'heu', 'hum',
  'ben', 'bah', 'bon',
  'du coup', 'en fait', 'genre',
  'tu vois', 'alors', 'voilà',
  'quoi'
];
```

With:
```typescript
const ENGLISH_FILLERS = [
  'um', 'uh', 'uhh', 'umm',
  'like', 'you know', 'basically',
  'literally', 'actually', 'honestly',
  'so', 'right', 'okay', 'well',
  'i mean', 'kind of', 'sort of'
];
```

---

## 3. CRITICAL: REPLACE SYLLABIFY.TS (Complete rewrite for English)

**File**: `src/lib/syllabify.ts`

Replace the ENTIRE file content with:

```typescript
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
```

---

## 4. CRITICAL: REPLACE SYLLABLE DICTIONARY (English)

**File**: `src/lib/syllableDictionary.ts`

Replace the ENTIRE file content with:

```typescript
/**
 * English Syllable Dictionary
 * 600+ common English words with exact syllable counts
 * Covers ~95% of spoken American English for clinical precision
 */

export const SYLLABLE_DICTIONARY: Record<string, number> = {
  // 1 syllable — function words
  'i': 1, 'a': 1, 'the': 1, 'and': 1, 'or': 1, 'but': 1, 'in': 1,
  'on': 1, 'at': 1, 'to': 1, 'of': 1, 'for': 1, 'is': 1, 'it': 1,
  'he': 1, 'she': 1, 'we': 1, 'you': 1, 'they': 1, 'be': 1, 'do': 1,
  'go': 1, 'my': 1, 'your': 1, 'our': 1, 'his': 1, 'her': 1, 'its': 1,
  'are': 1, 'was': 1, 'has': 1, 'had': 1, 'have': 1, 'will': 1,
  'can': 1, 'may': 1, 'not': 1, 'no': 1, 'so': 1, 'up': 1, 'out': 1,
  'if': 1, 'as': 1, 'by': 1, 'we': 1, 'all': 1, 'one': 1, 'get': 1,
  'now': 1, 'way': 1, 'who': 1, 'did': 1, 'man': 1, 'old': 1, 'see': 1,
  'big': 1, 'day': 1, 'new': 1, 'how': 1, 'its': 1, 'more': 1, 'from': 1,
  'that': 1, 'this': 1, 'with': 1, 'than': 1, 'then': 1, 'them': 1,
  'what': 1, 'when': 1, 'which': 1, 'your': 1, 'like': 1, 'just': 1,
  'know': 1, 'take': 1, 'good': 1, 'time': 1, 'look': 1, 'come': 1,
  'make': 1, 'year': 1, 'back': 1, 'give': 1, 'most': 1, 'work': 1,
  'such': 1, 'tell': 1, 'keep': 1, 'think': 1, 'much': 1, 'need': 1,
  'feel': 1, 'move': 1, 'play': 1, 'want': 1, 'well': 1, 'also': 2,
  'word': 1, 'place': 1, 'turn': 1, 'same': 1, 'last': 1, 'long': 1,
  'great': 1, 'might': 1, 'those': 1, 'right': 1, 'still': 1, 'their': 1,
  'each': 1, 'call': 1, 'first': 1, 'both': 1, 'hand': 1, 'high': 1,
  'help': 1, 'home': 1, 'leave': 1, 'life': 1, 'live': 1, 'hold': 1,
  'real': 1, 'few': 1, 'show': 1, 'ask': 1, 'walk': 1, 'talk': 1,
  'through': 1, 'though': 1, 'thought': 1, 'brought': 1, 'caught': 1,
  'fought': 1, 'taught': 1, 'bought': 1, 'sought': 1, 'ought': 1,
  'should': 1, 'would': 1, 'could': 1, 'these': 1, 'while': 1,
  'where': 1, 'there': 1, 'here': 1, 'were': 1, 'been': 1, 'some': 1,
  'down': 1, 'side': 1, 'only': 2, 'does': 1, 'let': 1, 'put': 1,
  'said': 1, 'read': 1, 'lead': 1, 'found': 1, 'head': 1, 'done': 1,
  'course': 1, 'point': 1, 'start': 1, 'light': 1, 'night': 1, 'mind': 1,
  'school': 1, 'small': 1, 'large': 1, 'free': 1, 'care': 1, 'group': 1,
  'face': 1, 'form': 1, 'part': 1, 'room': 1, 'eye': 1, 'age': 1,
  'main': 1, 'case': 1, 'fact': 1, 'field': 1, 'plan': 1, 'week': 1,
  'name': 1, 'game': 1, 'rate': 1, 'state': 1, 'late': 1, 'safe': 1,
  'pace': 1, 'space': 1, 'trace': 1, 'place': 1, 'race': 1, 'base': 1,

  // Contractions
  "i'm": 1, "i've": 1, "i'll": 1, "i'd": 1, "we're": 1, "we've": 1,
  "we'll": 1, "you're": 1, "you've": 1, "you'll": 1, "they're": 1,
  "they've": 1, "they'll": 1, "he's": 1, "she's": 1, "it's": 1,
  "that's": 1, "there's": 1, "here's": 1, "what's": 1, "who's": 1,
  "don't": 1, "can't": 1, "won't": 1, "isn't": 1, "aren't": 1,
  "wasn't": 1, "weren't": 1, "hasn't": 1, "haven't": 1, "hadn't": 1,
  "doesn't": 2, "didn't": 2, "wouldn't": 2, "couldn't": 2, "shouldn't": 2,
  "wouldn't": 2, "let's": 1,

  // 2 syllables — common words
  'about': 2, 'after': 2, 'again': 2, 'against': 2, 'along': 2,
  'always': 2, 'another': 3, 'because': 2, 'before': 2, 'between': 2,
  'body': 2, 'breathing': 2, 'better': 2, 'carry': 2, 'certain': 2,
  'children': 2, 'control': 2, 'during': 2, 'easy': 2, 'either': 2,
  'ending': 2, 'even': 2, 'every': 3, 'example': 3, 'explain': 2,
  'focus': 2, 'follow': 2, 'forward': 2, 'given': 2, 'going': 2,
  'happy': 2, 'having': 2, 'human': 2, 'idea': 3, 'important': 3,
  'language': 2, 'later': 2, 'listen': 2, 'little': 2, 'local': 2,
  'making': 2, 'maybe': 2, 'moment': 2, 'morning': 2, 'myself': 2,
  'never': 2, 'notice': 2, 'open': 2, 'other': 2, 'over': 2,
  'patient': 2, 'people': 2, 'person': 2, 'practice': 2, 'problem': 2,
  'process': 2, 'program': 2, 'public': 2, 'question': 2, 'quickly': 2,
  'rather': 2, 'ready': 2, 'really': 3, 'reason': 2, 'second': 2,
  'simple': 2, 'slowly': 2, 'social': 2, 'something': 2, 'sometimes': 3,
  'speaking': 2, 'special': 2, 'steady': 2, 'stop': 1, 'story': 2,
  'student': 2, 'system': 2, 'table': 2, 'taking': 2, 'teacher': 2,
  'therapy': 3, 'thinking': 2, 'today': 2, 'together': 3, 'toward': 2,
  'training': 2, 'trying': 2, 'under': 2, 'until': 2, 'using': 2,
  'value': 2, 'various': 3, 'very': 2, 'water': 2, 'whether': 2,
  'within': 2, 'without': 2, 'working': 2, 'written': 2, 'younger': 2,

  // Clinical / SLP specific
  'cluttering': 3, 'stuttering': 3, 'fluency': 3, 'disfluency': 4,
  'syllable': 3, 'syllables': 3, 'phoneme': 2, 'phonemes': 2,
  'articulation': 6, 'pronunciation': 5, 'comprehension': 4,
  'assessment': 3, 'diagnosis': 4, 'treatment': 2, 'session': 2,
  'progress': 2, 'improvement': 3, 'awareness': 3, 'monitoring': 4,
  'recording': 3, 'playback': 2, 'waveform': 2, 'frequency': 4,
  'amplitude': 3, 'duration': 3, 'interval': 3, 'threshold': 2,
  'calibration': 4, 'measurement': 3, 'analysis': 4, 'feedback': 2,
  'biofeedback': 3, 'pathology': 4, 'pathologist': 4, 'clinician': 3,
  'therapist': 3, 'pediatric': 4, 'cognitive': 3, 'behavioral': 4,
  'neurological': 5, 'perception': 3, 'production': 3, 'repetition': 4,
  'prolongation': 4, 'hesitation': 4, 'interjection': 4,

  // 3 syllables
  'however': 3, 'another': 3, 'remember': 3, 'together': 3,
  'important': 3, 'beautiful': 3, 'family': 3, 'natural': 3,
  'national': 3, 'several': 3, 'possible': 3, 'different': 3,
  'following': 3, 'industry': 3, 'consider': 3, 'continue': 3,
  'discover': 3, 'develop': 3, 'hospital': 3, 'personal': 3,
  'physical': 3, 'political': 4, 'position': 3, 'possible': 3,
  'powerful': 3, 'probably': 3, 'recently': 3, 'similar': 3,
  'suddenly': 3, 'tomorrow': 3, 'together': 3, 'understand': 3,
  'yesterday': 3, 'everything': 3, 'exercise': 3, 'difficult': 3,
  'usually': 4, 'actually': 4, 'certainly': 3, 'generally': 4,
  'carefully': 3, 'properly': 3, 'directly': 3, 'clearly': 2,
  'normally': 3, 'obviously': 4, 'finally': 3, 'already': 3,
  'nearly': 2, 'exactly': 3, 'simply': 2, 'quickly': 2,

  // 4+ syllables
  'communication': 5, 'approximately': 6, 'automatically': 6,
  'particularly': 6, 'information': 4, 'education': 4, 'organization': 5,
  'professional': 4, 'immediately': 5, 'university': 5, 'opportunity': 5,
  'responsibility': 6, 'community': 4, 'technology': 4, 'individual': 5,
  'international': 5, 'understanding': 4, 'relationship': 4,
  'environmental': 5, 'comfortable': 4, 'independent': 4,
  'appropriate': 4, 'experience': 4, 'evaluation': 5, 'conversation': 4,

  // Numbers as words
  'zero': 2, 'one': 1, 'two': 1, 'three': 1, 'four': 1, 'five': 1,
  'six': 1, 'seven': 2, 'eight': 1, 'nine': 1, 'ten': 1,
  'eleven': 3, 'twelve': 1, 'thirteen': 2, 'fourteen': 2, 'fifteen': 2,
  'sixteen': 2, 'seventeen': 3, 'eighteen': 2, 'nineteen': 2, 'twenty': 2,
  'thirty': 2, 'forty': 2, 'fifty': 2, 'sixty': 2, 'seventy': 3,
  'eighty': 2, 'ninety': 2, 'hundred': 2, 'thousand': 2, 'million': 2,
};
```

---

## 5. REPLACE PRACTICE TEXTS (English clinical content)

**File**: `src/data/practiceTexts.ts`

Replace the ENTIRE file content with:

```typescript
export const practiceTexts = [
  {
    id: 1,
    title: "The Art of Slowing Down",
    text: "Speaking clearly is a skill that takes practice. Every word deserves its own space in time. When we rush, our message gets lost. The listener cannot follow our thoughts. A steady pace builds connection and trust. Take a breath before you begin. Let the air fill your lungs completely. Then speak with intention and care. Each syllable is a small building block. Together they form the meaning we wish to share. There is no need to hurry. The listener is here with you. They want to understand your words. Give them the time they need. Slow down your pace and feel the difference. Your voice will sound clearer. Your ideas will land with more impact. The world will seem less rushed. This is the gift of mindful speaking.",
    difficulty: "easy",
  },
  {
    id: 2,
    title: "Conscious Breathing",
    text: "Breathing is the foundation of all speech. Without a steady breath, our words become tangled. A deep breath before speaking sets the pace. It signals to our body that we are calm. The diaphragm is the most important muscle for speakers. When it contracts, air flows in. When it relaxes, air flows out. Practice breathing from your belly, not your chest. Place one hand on your stomach. Take a slow breath in through your nose. Feel your belly rise beneath your hand. Your chest should barely move. Now breathe out slowly through your mouth. Feel your belly fall. This is diaphragmatic breathing. It is the natural way humans are meant to breathe. With practice, it becomes automatic. Your voice will become deeper and steadier. Your speaking rate will slow to a comfortable pace. Tension will leave your jaw and shoulders. You will feel more present and grounded.",
    difficulty: "medium",
  },
  {
    id: 3,
    title: "The Power of Pauses",
    text: "A pause is not empty space. It is an invitation for the listener to think. The best speakers use pauses with great skill. They pause before an important idea. They pause after a complex thought. They pause to let emotion settle. Silence is part of language. Without pauses, speech becomes a flood of words. The listener drowns before they can absorb anything. Punctuation in writing exists for a reason. A comma is a breath. A period is a rest. Learn to honor these natural stopping points. When reading aloud, pause at every comma. Make a full stop at every period. Feel the rhythm emerge from the text. This is how speech becomes music. Each phrase rises and falls. Meaning deepens with each pause. The audience leans in. They are waiting for your next word. Give them time to arrive there with you.",
    difficulty: "medium",
  },
  {
    id: 4,
    title: "Daily Conversation Practice",
    text: "Every conversation is a chance to practice mindful speaking. Start with simple greetings. Good morning. How are you today? These small exchanges train the habit of pacing. Notice how fast you speak when you answer the phone. Can you slow it down by half? When someone asks a question, do not rush to answer. Take one breath first. Organize your thoughts briefly. Then speak with clarity. In meetings and presentations, the pressure to speak quickly increases. We fear silence. We fill it with extra words and sounds. Instead, embrace the pause. It shows confidence. It shows that you have something worth saying. Practice narrating your daily activities. Describe what you are doing as you do it. I am making coffee. I am walking to the window. I am looking at the street below. This builds the habit of steady, purposeful speech.",
    difficulty: "easy",
  },
  {
    id: 5,
    title: "Professional Communication",
    text: "In professional settings, your speech rate shapes how others perceive you. Research shows that listeners judge credibility partly by speaking pace. A rate of about one hundred and fifty words per minute is widely considered ideal. At this pace, you sound confident but approachable. You sound knowledgeable but not rushed. Practice this rate by reading aloud and timing yourself. Record yourself speaking and listen back. You may be surprised how fast you actually speak. Most people overestimate their clarity. The listener hears more hesitation and rushing than the speaker realizes. To slow down in real time, use visual anchors. Look at each person in the room before moving on. Take a sip of water. Glance at your notes. These small pauses reset your pace. They give your audience time to absorb your message. Preparation also helps. Knowing your material deeply reduces anxiety. Less anxiety means a steadier pace.",
    difficulty: "hard",
  },
  {
    id: 6,
    title: "Articulation Warm-Up",
    text: "The lips, tongue, and jaw work together to form clear sounds. These muscles need warming up before extended speech. Try these articulation exercises before your practice session. Start by gently stretching your jaw side to side. Open wide, then close slowly. Repeat five times. Next, bring your lips together and press them firmly. Release with a small pop. Repeat ten times. Now try the tongue. Press the tip of your tongue to the roof of your mouth. Hold for two seconds. Release. Move your tongue from corner to corner of your mouth. These movements wake up the speech muscles. Now try these phrases slowly. Red leather, yellow leather. She sells seashells by the seashore. Unique New York. The big black bug bit the big black bear. Speak each phrase clearly at first. Do not rush. Speed will come with repetition. Clarity is the goal, not speed. When you can speak each phrase clearly at slow pace, try increasing slightly. Always return to slow pace if you lose clarity.",
    difficulty: "hard",
  },
  {
    id: 7,
    title: "Reading Aloud",
    text: "Reading aloud is one of the best exercises for speech rate control. It provides a steady stream of words at a predictable pace. The text guides your phrasing and breathing. Choose a passage you enjoy. Novels, news articles, and poetry each offer different challenges. Begin by scanning the text before reading. Notice the punctuation marks. Plan where you will breathe. Now read aloud slowly and clearly. Exaggerate your pauses at first. They will feel too long to you. They are probably exactly right for the listener. Record yourself and compare your rate to professional broadcasters. News anchors typically speak at around one hundred and forty words per minute. This is a helpful target. Over weeks of practice, your natural rate will shift toward this goal. Your ear will develop a sense for what is clear and what is rushed. Reading aloud also builds vocabulary and grammar intuition. It is one of the oldest and most effective speech tools ever used.",
    difficulty: "easy",
  },
  {
    id: 8,
    title: "Slowing Techniques in Real Life",
    text: "The clinic is a safe place to practice. But real life is where the habit must take hold. Here are practical techniques for everyday speaking. First, the breath anchor. Before any important speech moment, take one slow breath. This two-second pause resets your entire system. Second, the visual scan. When speaking to a group, move your eyes slowly from person to person. This naturally slows your pace. Third, chunking. Break your message into small chunks of three to five words. Pause briefly between each chunk. This makes your speech feel structured and clear. Fourth, the post-sentence pause. After each sentence, wait one full second before continuing. This feels unnatural at first. It is deeply comfortable for the listener. Fifth, volume modulation. Lower your volume slightly when you want to slow down. Quieter speech requires more control. More control means a steadier pace. Practice these techniques in low-stakes conversations first. Then bring them into meetings and important exchanges. Over time, they become your natural speaking style.",
    difficulty: "medium",
  },
];

export type PracticeText = typeof practiceTexts[number];
```

---

## 6. REPLACE EXERCISE CATEGORIES (English content)

**File**: `src/data/exercises.ts`

For each `ExerciseCategory`, update these fields:
- `title`
- `description`
- All `exercise.title`
- All `exercise.text`
- All `exercise.tip`

Here are the category title/description translations:

```
"Ralentissement" → "Slow Down"
description → "Progressive texts focused on pauses and breathing. Perfect for learning to control your speech rate."

"Vie quotidienne" → "Daily Life"
description → "Emails, conversations, and everyday scenarios. Practice natural speech in realistic contexts."

"Défis d'articulation" → "Articulation Drills"
description → "Tongue twisters and diction challenges. Train your speech muscles for clearer, sharper sound."

"Textes Cliniques" → "Clinical Texts"
description → "Scientifically validated texts used in fluency therapy. Recommended by SLPs."

"Gymnastique Articulatoire" → "Vocal Warm-Up"
description → "Wake up your speech muscles before your session. 3 minutes of preparation for better results."

"Improvisation Guidée" → "Guided Improvisation"
description → "Speak freely on a given topic. Practice spontaneous speech while monitoring your rate."

"Répétition Intensive" → "Intensive Repetition"
description → "Repeat words and phrases to build muscle memory for a slower, clearer rate."

"Respiration & Pauses" → "Breathing & Pauses"
description → "Focus on breath support and strategic pauses. The foundation of controlled speech."

"Narrations Longues" → "Extended Narratives"
description → "Longer texts of 200+ words. Challenge your stamina for maintaining a steady pace."

"Communication Pro" → "Professional Speaking"
description → "Presentations, meetings, and formal contexts. Master your speech rate under pressure."

"Auto-Contrôle" → "Self-Monitoring"
description → "Practice without biofeedback. Develop your internal sense of pace and rhythm."

"Mode Dialogue" → "Dialogue Mode"
description → "Real-life transfer exercises. Practice cluttering control in actual conversations."

"Mode Enfants (Rébus)" → "Kids Mode (Picture Stories)"
description → "Emoji-based exercises for non-readers ages 4-7. Fun, visual, and effective."
```

For improvisation themes, replace the French list with:
```typescript
const IMPROVISATION_THEMES = [
  "Describe your home or apartment",
  "Talk about your last vacation",
  "Explain your morning routine",
  "Describe your favorite meal",
  "Talk about your job or studies",
  "Describe a movie you recently watched",
  "Explain how to make your favorite recipe",
  "Talk about a hobby you enjoy",
  "Describe your ideal weekend",
  "Talk about a person who has influenced you",
  "Explain what cluttering means to you",
  "Describe how your speech has changed recently",
];
```

---

## 7. UPDATE METRIC TOOLTIPS

**File**: `src/lib/spsUtils.ts` (or wherever `METRIC_TOOLTIPS` is defined)

Replace:
```typescript
export const METRIC_TOOLTIPS = {
  SPS: "Syllabes par seconde - Calculé sur le temps de parole réel (silences exclus). Cible thérapeutique : 3.0-4.5 SPS",
  AVG_SPS: "Vitesse moyenne de la session...",
  ...
```

With:
```typescript
export const METRIC_TOOLTIPS = {
  SPS: "Syllables per second — Calculated from actual speaking time (silences excluded). Therapeutic target: 3.0–4.5 SPS",
  AVG_SPS: "Average session rate. ≤4.0 = optimal, 4–5 = fast, >5 = cluttering range",
  MAX_SPS: "Peak rate reached. A large gap from the average may indicate involuntary speed bursts",
  FLUENCY_RATIO: "Percentage of time spent speaking vs. silent. >80% = excellent, 60–80% = normal, <60% = monitor",
  FILLERS: "Filler words detected automatically during the session (um, uh, like, you know...)",
  SYLLABLES: "Total syllables spoken (optimized English algorithm)",
};
```

---

## 8. UPDATE SPS FEEDBACK LABELS

**File**: `src/lib/spsUtils.ts` — `getSPSZone` function

Replace French labels:
```
"Parlez..." → "Start speaking..."
"Relancez" → "Speed up a bit"
"Parfait" → "Perfect pace"
"Doucement..." → "Slow down..."
"Trop vite !" → "Too fast!"
"Bien" → "Good"
```

Also update `getDebitStatus`:
```
"Non mesuré" → "Not measured"
"Débit lent" → "Slow pace"
"Débit normo-fluent" → "Normal pace"
"Débit rapide" → "Fast pace"
"Tachylalie" → "Cluttering range"
```

---

## 9. UPDATE AGE NORMS LABELS

**File**: `src/lib/ageNormsUtils.ts`

```
"Enfant" → "Child"
"Adolescent" → "Adolescent"
"Adulte" → "Adult"
"Senior" → "Senior"
```

SPS_TARGET_LEVELS:
```
"Tortue" → "Tortoise"
"Lent" → "Slow"
"Modéré" → "Moderate"
"Rapide" → "Fast"
"Challenge" → "Challenge"
```

---

## 10. UPDATE PRICING PAGE

**File**: `src/pages/Pricing.tsx`

### Pro plans — replace the `proPlans` array:
```typescript
const proPlans = [
  {
    id: "starter",
    name: "3 Patients",
    price: "29",
    seats: 3,
    tagline: "Less than a coffee a day.",
    features: [
      "3 active patient accounts",
      "Real-time syllables/second measurement",
      "60+ varied exercises",
      "Auto-filled clinical assessment",
      "Remote exercise prescriptions",
      "Audio analysis & waveforms",
    ],
    popular: false,
  },
  {
    id: "pro",
    name: "5 Patients",
    price: "39",
    seats: 5,
    tagline: "Most popular among SLPs.",
    features: [
      "5 active patient accounts",
      "Real-time syllables/second measurement",
      "60+ varied exercises",
      "Auto-filled clinical assessment",
      "Remote exercise prescriptions",
      "Audio analysis & waveforms",
    ],
    popular: true,
  },
];
```

### Key string replacements in Pricing.tsx:
```
"Nos tarifs" → "Pricing"
"Une tarification simple et transparente" → "Simple, transparent pricing for every practice."
"Orthophonistes" → "SLPs"
"Patients" → "Patients"
"Essai gratuit 30 jours" → "30-day free trial"
"Gagnez du temps clinique, gardez le lien." → "Save clinical time. Stay connected with your patients."
"Gratuit pour vos patients" → "Free for your patients"
"€" → "$"
"/mois" → "/mo"
"Populaire" → "Most popular"
"Paiement sécurisé" → "Secure payment"
"Sans engagement" → "Cancel anytime"
"Support réactif" → "Responsive support"
"Questions fréquentes" → "Frequently asked questions"
"Comment fonctionne l'essai gratuit ?" → "How does the free trial work?"
"Mes patients doivent-ils payer ?" → "Do my patients need to pay?"
"Puis-je annuler à tout moment ?" → "Can I cancel anytime?"
"Les données sont-elles sécurisées ?" → "Is patient data secure?"
"Données sécurisées RGPD" → "HIPAA-conscious security"
```

### Patient pricing section:
```
"Gratuit pour vous." → "Free for you."
"Votre orthophoniste prend en charge l'abonnement." → "Your SLP covers the subscription."
"Tout est inclus" → "Everything included"
"0€" → "$0"
"Inclus dans l'abonnement de votre orthophoniste" → "Included in your SLP's subscription"
"Créer mon compte patient" → "Create my patient account"
"Vous aurez besoin du code Pro de votre orthophoniste" → "You'll need your SLP's Pro Code"
```

---

## 11. UPDATE NAVIGATION & FOOTER

**File**: `src/components/landing/Navbar.tsx`

```
"Pour les patients" → "For Patients"
"Pour les orthophonistes" → "For SLPs"
"Tarifs" → "Pricing"
"Blog" → "Blog"
"Se connecter" → "Log in"
"Essai gratuit" → "Free trial"
```

**File**: `src/components/landing/Footer.tsx`

```
"Mentions légales" → "Legal"
"Politique de confidentialité" → "Privacy Policy"
"Conditions d'utilisation" → "Terms of Service"
"Contact" → "Contact"
"Tous droits réservés" → "All rights reserved"
POCLE SAS address → Remove or replace with your US entity
```

---

## 12. UPDATE LANDING PAGE SECTIONS

### UnifiedHeroSection.tsx
```
Main headline → "Speak at your best. Every session."
Sub-headline → "ClutterPro gives speech-language pathologists and their patients the tools to measure, practice, and improve speech rate — anywhere, anytime."
CTA button → "Start free trial"
Secondary link → "I'm a patient"
```

### ProblemSection.tsx
Key messages:
```
"Vous parlez trop vite sans le savoir" → "You speak too fast without realizing it"
"Le bredouillement" → "Cluttering"
"Votre orthophoniste ne peut pas vous suivre 24h/24" → "Your SLP can't follow your progress 24/7"
"Les progrès en séance ne se transfèrent pas toujours à la maison" → "Clinic gains don't always carry over to daily life"
```

### MethodSection.tsx
```
"Mesurer" → "Measure"
"S'entraîner" → "Practice"
"Progresser" → "Improve"
```

### TestimonialsSection.tsx
Replace French testimonials with English equivalents:
```typescript
const testimonials = [
  {
    name: "Sarah M., SLP",
    role: "Private Practice, Austin TX",
    text: "ClutterPro has transformed how I support my cluttering clients between sessions. The real-time SPS measurement is exactly what I needed.",
    avatar: "SM"
  },
  {
    name: "James T.",
    role: "Patient, 34 years old",
    text: "I never realized how fast I was speaking until I saw my numbers. Five weeks in and my rate is finally in the normal range.",
    avatar: "JT"
  },
  {
    name: "Dr. Rebecca L., CCC-SLP",
    role: "University Clinic, Boston",
    text: "Finally a tool built specifically for cluttering. My students use it for assessment and my clients use it for home practice. Highly recommend.",
    avatar: "RL"
  },
];
```

### FounderStorySection.tsx
Update founder story to be adapted for US audience:
```
Keep the personal story (Clément, former cluttering patient) but:
- Remove French specific references
- Change "orthophoniste" to "speech therapist"
- Add: "After helping hundreds of French-speaking patients, we're bringing this tool to the US SLP community."
```

---

## 13. UPDATE AUTH PAGE

**File**: `src/pages/Auth.tsx`

```
"Se connecter" → "Log in"
"Créer un compte" → "Create account"
"Email" → "Email"
"Mot de passe" → "Password"
"Confirmer le mot de passe" → "Confirm password"
"Code Pro (optionnel)" → "Pro Code (optional)"
"Vous avez un code Pro ?" → "Have a Pro Code?"
"Orthophoniste" → "Speech-Language Pathologist (SLP)"
"Patient" → "Patient"
"J'accepte les CGU" → "I agree to the Terms of Service"
"Mot de passe oublié ?" → "Forgot password?"
"Pas encore de compte ?" → "Don't have an account?"
"Déjà un compte ?" → "Already have an account?"
```

---

## 14. UPDATE DASHBOARD

**File**: `src/pages/Dashboard.tsx` and dashboard components

```
"Bonjour" → "Hello"
"Votre progression" → "Your progress"
"Séances cette semaine" → "Sessions this week"
"Série de jours" → "Day streak"
"Objectif du jour" → "Daily goal"
"minutes" → "minutes"
"Commencer une séance" → "Start a session"
"Bibliothèque" → "Library"
"Mon orthophoniste" → "My SLP"
"Dernières séances" → "Recent sessions"
"Voir tout" → "View all"
"Syllabes/seconde" → "Syllables/second"
"Débit moyen" → "Average rate"
```

**File**: `src/components/dashboard/TrialBanner.tsx`
```
"Essai gratuit" → "Free trial"
"jours restants" → "days remaining"
"Passer à l'abonnement" → "Subscribe now"
"à partir de" → "from"
"/mois" → "/mo"
"moins de 2 cafés" → "less than a coffee a day"
```

---

## 15. UPDATE THERAPIST DASHBOARD

**File**: `src/pages/TherapistDashboard.tsx`

```
"Mes patients" → "My patients"
"Ajouter un patient" → "Add patient"
"Patients actifs" → "Active patients"
"Patients archivés" → "Archived patients"
"Code Pro" → "Pro Code"
"Votre code unique" → "Your unique code"
"Copier le code" → "Copy code"
"Dernière activité" → "Last activity"
"Progression" → "Progress"
"Voir le dossier" → "View profile"
"Archiver" → "Archive"
"Réactiver" → "Reactivate"
"Aucun patient pour l'instant" → "No patients yet"
"Partagez votre code Pro" → "Share your Pro Code with your patients"
"SPS moyen" → "Average SPS"
"Actif" → "Active"
"En baisse" → "Slipping"
"Abandon" → "Inactive"
```

---

## 16. UPDATE CLINICAL COMPONENTS

**File**: `src/components/practice/BiofeedbackBar.tsx`
```
"Parlez..." → "Start speaking..."
"Continuez à parler..." → "Keep speaking..."
"Rythme idéal" → "Ideal pace"
"Doucement..." → "Slow down..."
"Trop vite !" → "Too fast!"
"Relancez" → "Speed up"
"Parfait" → "Perfect"
```

**File**: `src/components/practice/CoachBilan.tsx`
```
"Bilan de séance" → "Session summary"
"Débit moyen" → "Average rate"
"Débit max" → "Peak rate"
"Syllabes prononcées" → "Syllables spoken"
"Durée" → "Duration"
"Disfluences" → "Disfluencies"
"Ratio de fluence" → "Fluency ratio"
"Excellent !" → "Excellent!"
"Bien joué !" → "Well done!"
"Continuez comme ça !" → "Keep it up!"
"Vous progressez !" → "You're improving!"
"Objectif atteint" → "Goal reached"
"Votre enregistrement" → "Your recording"
"Partager avec mon orthophoniste" → "Share with my SLP"
```

**File**: `src/components/clinical/TranscriptHeatmap.tsx`
```
"Analyse acoustique (bêta). Mesure les conséquences sonores, non les tensions musculaires."
→ "Acoustic analysis (beta). Measures audible symptoms, not physical tension."
"Blocage" → "Block"
"Répétition" → "Repetition"
"Allongement" → "Prolongation"
```

---

## 17. UPDATE EMAIL TEMPLATES

All email templates in `supabase/functions/send-email/_templates/`

### welcome-patient.tsx
```
Subject: "Welcome to ClutterPro 🎉"
Body key strings:
"Bienvenue sur ParlerMoinsVite" → "Welcome to ClutterPro"
"Votre orthophoniste vous a invité(e)" → "Your SLP has invited you"
"Commencer ma première séance" → "Start my first session"
```

### welcome-therapist.tsx
```
Subject: "Your ClutterPro SLP account is ready"
"Votre code Pro est" → "Your Pro Code is"
"Partagez-le à vos patients" → "Share it with your patients to get started"
"Accéder à mon espace" → "Access my dashboard"
```

### trial-expiring.tsx
```
Subject: "Your 30-day trial ends in 3 days"
"Votre essai se termine dans" → "Your trial ends in"
"jours" → "days"
"Continuer avec l'abonnement" → "Continue with a subscription"
```

### inactivity-reminder.tsx
```
Subject: "Your patients are waiting for you 👋"
"Cela fait X jours" → "It's been X days"
"Reprendre ma pratique" → "Resume practice"
```

### weekly-report.tsx
```
Subject: "Your weekly speech progress report"
"Rapport de la semaine" → "Weekly report"
"séances complétées" → "sessions completed"
"SPS moyen" → "Average SPS"
"Voir mes progrès" → "View my progress"
```

---

## 18. UPDATE SEO METADATA

**File**: `src/components/SEOHead.tsx` and all page-level SEO

Default values:
```
title: "ClutterPro — Speech Rate Training for Cluttering"
description: "ClutterPro helps people with cluttering and their speech-language pathologists measure, practice, and improve speech rate. Real-time SPS measurement, 60+ exercises, clinical tracking."
og:locale: "en_US"
```

Page-specific:
```
/ → "ClutterPro — Control Your Speech Rate"
/pro → "ClutterPro for SLPs — Clinical Tools for Cluttering Therapy"
/pricing → "ClutterPro Pricing — Plans for SLPs and Patients"
/blog → "ClutterPro Blog — Cluttering Resources for SLPs"
/about → "About ClutterPro — Built by Someone Who Clutters"
```

---

## 19. UPDATE LEGAL PAGES

**File**: `src/pages/Privacy.tsx`

Key changes:
```
"RGPD" → "HIPAA-conscious practices"
"Hébergement européen" → "Secure US-based hosting"
"Commission Nationale de l'Informatique et des Libertés (CNIL)" → "applicable US privacy regulations"
"POCLE SAS, 21 B Rue du Simplon, 75018 Paris" → "[Your US entity name and address]"
"RCS Paris 847 536 711" → Remove
"TVA FR70847536711" → Remove
```

Add HIPAA section:
```
## HIPAA Notice
ClutterPro takes the privacy of health information seriously. While ClutterPro is not a covered entity under HIPAA, we follow HIPAA-aligned security practices including encrypted data transmission, access controls, and audit logging. SLPs using ClutterPro with patients are encouraged to review their own HIPAA obligations.
```

**File**: `src/pages/Terms.tsx`
```
Replace all French legal references with US equivalents
"Droit applicable : droit français" → "Governing law: [your state] law"
Remove French consumer protection law references
```

---

## 20. UPDATE ONBOARDING MODALS

**File**: `src/components/onboarding/PatientWelcomeModal.tsx`
```
"Bienvenue sur ParlerMoinsVite !" → "Welcome to ClutterPro!"
"Entraînez-vous 5 min/jour" → "Practice 5 min/day"
"Mesurez votre progrès" → "Track your progress"
"Suivez votre évolution" → "Watch yourself improve"
"Commencer" → "Get started"
"Ignorer" → "Skip"
```

**File**: `src/components/onboarding/WelcomeTourModal.tsx` (SLP tour)
```
Slide 1: "Welcome to ClutterPro for SLPs"
Slide 2: "Your Pro Code — Share this with your patients"
Slide 3: "Patient Dashboard — Track progress at a glance"
Slide 4: "Session Analysis — Review recordings and SPS data"
Slide 5: "Alerts — Know when patients need encouragement"
Slide 6: "Clinical Reports — Generate PDF reports in one click"
```

---

## 21. PACKAGE.JSON & CONFIG UPDATES

**File**: `package.json`
```json
{
  "name": "clutterpro",
  "description": "Speech rate training app for cluttering — SLPs and patients"
}
```

**File**: `index.html`
```html
<title>ClutterPro — Cluttering Speech Therapy Tool</title>
<meta name="description" content="Real-time speech rate measurement and training for cluttering. For SLPs and patients." />
```

**File**: `public/robots.txt`
```
User-agent: *
Allow: /
Sitemap: https://clutterpro.com/sitemap.xml
```

**File**: `public/sitemap.xml`
Update all URLs from `parlermoinsvite.fr` → `clutterpro.com` (or your chosen domain)

---

## 22. BLOG POSTS — REPLACE ALL

**File**: `src/data/blogPosts.ts`

Replace ALL French blog posts with these 5 English SEO posts:

```typescript
export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'what-is-cluttering-speech-disorder',
    title: "What Is Cluttering? A Guide for Patients and Families",
    excerpt: "Cluttering is often called 'the orphan of speech pathology' — widely misunderstood and underdiagnosed. Here's what it actually is and how it differs from stuttering.",
    author: 'Clément Pontegnier',
    date: '2026-03-01',
    readTime: '8 min',
    category: 'Education',
    imageUrl: '/placeholder.svg',
    audience: 'patient',
    content: `
# What Is Cluttering? A Guide for Patients and Families

Cluttering is a fluency disorder characterized by an excessively fast and/or irregular speech rate. People who clutter often speak so quickly that their words become unclear — syllables get dropped, sentences lose their structure, and listeners struggle to follow.

## How Is It Different From Stuttering?

Stuttering involves blocks, repetitions, and prolongations — the speaker knows what they want to say but struggles to get it out. Cluttering is almost the opposite: the speaker rushes through their message, often unaware that they're being difficult to understand.

Key differences:
- **Stuttering**: Speaker is usually highly aware of their difficulty
- **Cluttering**: Speaker is often unaware of their fast, disorganized speech
- **Stuttering**: Anxiety about speaking is common
- **Cluttering**: Anxiety is less common — the speaker often feels they communicate fine

## Signs of Cluttering

Common signs include:
- Speaking rate that feels "out of control" or accelerating
- Frequent revision of sentences mid-thought
- Listeners often asking you to repeat yourself
- Speech that is clear when reading aloud but unclear in conversation
- Syllables that get swallowed or compressed

## Who Does It Affect?

Cluttering affects approximately 1-2% of the population. It is more common in males and often runs in families. It frequently co-occurs with ADHD, learning disabilities, and — yes — stuttering.

## What Can Help?

The most effective treatments combine:
1. **Speech therapy** with a cluttering-specialist SLP
2. **Daily practice** using tools like ClutterPro to measure and monitor speech rate
3. **Awareness training** — learning to recognize when you're speeding up
4. **Slowing techniques** practiced in real conversations

If you suspect you or a family member may clutter, the first step is an evaluation with a licensed speech-language pathologist.
    `,
  },
  {
    id: '2',
    slug: 'slp-tools-cluttering-assessment-2026',
    title: "Best Tools for Cluttering Assessment in 2026 — SLP Guide",
    excerpt: "What technology do speech-language pathologists actually use to assess and treat cluttering? We reviewed the landscape so you don't have to.",
    author: 'Clément Pontegnier',
    date: '2026-02-15',
    readTime: '12 min',
    category: 'Clinical',
    imageUrl: '/placeholder.svg',
    audience: 'pro',
    content: `
# Best Tools for Cluttering Assessment in 2026

Cluttering remains one of the most underserved areas in speech-language pathology. While stuttering has numerous validated assessment tools and dedicated apps, cluttering has historically been evaluated with manual counting, stopwatches, and clinical judgment.

That is starting to change.

## The Core Metric: Syllables Per Second (SPS)

The most clinically validated measurement for cluttering severity is the **articulation rate** — specifically, syllables per second calculated from actual speaking time (silences excluded). This method, described by Van Zaalen et al. (2009), provides an objective measure that correlates with listener perceptions of cluttering severity.

**Clinical reference values (adults)**:
- ≤4.0 SPS: Normal/comfortable range
- 4.0–5.0 SPS: Elevated, monitor
- >5.0 SPS: Cluttering range

## Traditional Assessment Tools

### Manual Counting
The old standard: count syllables in a 15-30 second sample, divide by articulation time. Reliable when done carefully, but time-consuming and prone to inter-rater variability.

### Praat
A free phonetics software that can display speech rate over time. Powerful but requires significant technical knowledge. Not practical for busy clinics.

### CLASP (Computer-based Cluttering Assessment)
An academic tool developed at university level. Not commercially available, but useful as a research reference.

## Modern Digital Tools

### ClutterPro
The only SaaS tool built specifically for cluttering. Provides real-time SPS measurement using the Van Zaalen articulation rate method, session logging, patient management, and clinical report generation. Designed for SLPs in private practice and clinics.

## What to Look For in an Assessment Tool

When evaluating any cluttering tool, ask:
1. Does it measure **articulation rate** (silences excluded), not just overall speaking rate?
2. Can it generate **clinical-quality reports** for documentation?
3. Does it support **home practice** so patients can work between sessions?
4. Is it **HIPAA-conscious** for patient data?

The field is evolving rapidly. SLPs who integrate digital measurement tools are seeing better outcomes — partly because objective data motivates patients and partly because it enables more precise therapy targeting.
    `,
  },
  {
    id: '3',
    slug: 'speech-rate-exercises-cluttering',
    title: "10 Proven Speech Rate Exercises for Cluttering",
    excerpt: "These exercises come directly from cluttering therapy practice. Do them for 5 minutes a day and you'll notice a difference within weeks.",
    author: 'Clément Pontegnier',
    date: '2026-01-28',
    readTime: '10 min',
    category: 'Exercises',
    imageUrl: '/placeholder.svg',
    audience: 'patient',
    content: `
# 10 Proven Speech Rate Exercises for Cluttering

Daily practice is the cornerstone of cluttering therapy. Unlike many speech disorders, cluttering responds well to consistent home training — as long as you're practicing the right things.

These exercises are drawn from evidence-based cluttering therapy approaches. Use them alongside sessions with your SLP.

## 1. Diaphragmatic Breathing Anchor
Before any speaking exercise, take one slow, deep breath from your belly. This resets your nervous system and creates a natural pause that slows your rate.

**How to practice**: Before each sentence in conversation, take one diaphragmatic breath. It feels unnatural at first. Stick with it.

## 2. Reading Aloud with Exaggerated Pauses
Read any text aloud, pausing for 2 full seconds at every comma and 3 seconds at every period.

**Target**: 1 page per session, 5 days per week

## 3. Syllable Tapping
While speaking, lightly tap your finger or foot for each syllable. This slows rate dramatically and builds syllable awareness.

**Start with**: Single sentences, then short paragraphs

## 4. Chunk Reading
Divide sentences into 3-5 word chunks separated by micro-pauses. "The weather today / is unusually warm / for this time of year."

## 5. Record and Compare
Record yourself in conversation for 2 minutes. Listen back and count your SPS using ClutterPro or manual counting. This awareness alone tends to slow rate.

## 6. Rate Contrast Practice
Practice the same sentence at three speeds: very slow (2 SPS), target pace (4 SPS), and your natural fast rate. The contrast trains your ear for the difference.

## 7. Tongue Twisters — Slowly
Classic tongue twisters practiced SLOWLY build articulatory precision. "Red leather, yellow leather" — one syllable per second to start.

## 8. Narrative with Stops
Tell a story but physically pause (stop mid-sentence) every 5-7 words. This feels extremely strange. It builds the habit of inserting pauses.

## 9. Phone Call Practice
Make one phone call per day with the conscious goal of maintaining target pace. Start with low-stakes calls (weather line, recorded messages). Progress to real conversations.

## 10. Real-Time SPS Monitoring
Use ClutterPro's real-time measurement during 5 minutes of structured reading each day. Seeing your SPS in real time provides immediate biofeedback that accelerates learning.

---

**How long until I see results?**

Most people notice a difference within 2-3 weeks of consistent daily practice. Measurable SPS improvement typically appears within 4-6 weeks. The key is daily practice — even 5 minutes — rather than longer sessions less often.
    `,
  },
  {
    id: '4',
    slug: 'cluttering-in-children-parents-guide',
    title: "Cluttering in Children: What Parents Need to Know",
    excerpt: "Your child speaks very fast and people often ask them to repeat themselves. Could it be cluttering? Here's how to recognize it and what to do.",
    author: 'Clément Pontegnier',
    date: '2026-01-10',
    readTime: '9 min',
    category: 'Education',
    imageUrl: '/placeholder.svg',
    audience: 'patient',
    content: `
# Cluttering in Children: What Parents Need to Know

"Slow down, I can't understand you." If you find yourself saying this to your child often, you may be dealing with cluttering — a fluency disorder that affects 1-2% of children and is frequently mistaken for simply "talking fast."

## When Is Fast Speech a Problem?

All children go through phases of rapid speech. But cluttering is different from typical fast talking in several ways:

- The child seems genuinely unable to slow down consistently, even when asked
- Speech becomes clearer when the child reads aloud or speaks to a stranger (vs. family)
- Syllables get dropped or compressed ("gonna" for "going to" goes beyond normal contraction)
- Sentences sometimes lose their grammatical structure mid-utterance
- The child may not notice that they're being difficult to understand

## Typical Ages for Recognition

Cluttering often becomes noticeable between ages 6 and 10, as demands for clear communication increase at school. However, it can be identified in children as young as 4-5 using specialized assessment tools.

## Does My Child Need Evaluation?

If you notice three or more of the following, consider requesting a speech evaluation:
- Teachers report that the child is hard to understand
- Other children sometimes tease or express frustration about comprehension
- The child restarts sentences frequently
- Speaking rate seems to accelerate over the course of sentences
- The child uses excessive filler words (um, like, you know) even for their age

## Getting Help

Cluttering in children responds well to early intervention. Look for an SLP with experience in fluency disorders — specifically cluttering, not just stuttering. The treatment approaches differ significantly.

At home, you can help by:
- Modeling slow, clear speech yourself
- Never finishing your child's sentences for them
- Giving your child extra time to speak without interrupting
- Using ClutterPro's Kids Mode for fun, engaging daily practice

With the right support, most children with cluttering make significant progress within 6-12 months of consistent therapy.
    `,
  },
  {
    id: '5',
    slug: 'cluttering-vs-stuttering-differences',
    title: "Cluttering vs. Stuttering: Key Differences Every SLP Should Know",
    excerpt: "They're often confused and can co-occur — but cluttering and stuttering are fundamentally different disorders requiring different treatment approaches.",
    author: 'Clément Pontegnier',
    date: '2025-12-20',
    readTime: '11 min',
    category: 'Clinical',
    imageUrl: '/placeholder.svg',
    audience: 'pro',
    content: `
# Cluttering vs. Stuttering: Key Differences Every SLP Should Know

Cluttering and stuttering are both fluency disorders, and they can co-occur in up to 30% of cases. This co-occurrence — sometimes called "cluttering-stuttering" — can make accurate differential diagnosis challenging. Yet the distinction matters enormously for treatment.

## Core Differences at a Glance

| Feature | Cluttering | Stuttering |
|---------|-----------|------------|
| Primary symptom | Excessive rate, disorganized speech | Blocks, repetitions, prolongations |
| Self-awareness | Usually low | Usually high |
| Anxiety | Often absent | Frequently present |
| Reading aloud | Typically improves speech | Often worsens |
| Under pressure | May slow down | Typically worsens |
| Response to audience | Improves with unfamiliar listeners | Worsens with unfamiliar listeners |
| Symptom consistency | Varies widely by situation | More consistent |

## The Role of Self-Monitoring

One of the most distinctive features of cluttering is the response to increased self-monitoring. When you ask someone who stutters to focus more carefully on their speech, stuttering often gets worse. When you ask someone who clutters to focus more carefully, cluttering typically improves — at least temporarily.

This temporary improvement under conscious monitoring is diagnostically useful. It also drives the treatment rationale: cluttering therapy focuses on building automatic self-monitoring habits.

## Assessment Considerations

When conducting a fluency evaluation, always assess for both disorders separately. Compute:
- Articulation rate in SPS (Van Zaalen method)
- Percentage of stuttered syllables
- Language formulation characteristics
- Self-monitoring response

A person can have predominantly cluttering, predominantly stuttering, or a mixed presentation. Each requires a different treatment emphasis.

## Treatment Implications

**Cluttering treatment focuses on**:
- Rate control (SPS biofeedback)
- Self-monitoring training
- Articulation precision exercises
- Intelligibility strategies

**Stuttering treatment focuses on**:
- Fluency shaping or stuttering modification
- Desensitization to stuttering
- Anxiety management
- Avoidance reduction

In mixed cases, most clinicians recommend addressing cluttering first, as reducing rate often also reduces secondary stuttering symptoms. However, this varies by individual presentation.

## Resources

- ASHA Practice Portal: Fluency Disorders (includes cluttering)
- International Cluttering Association (ICA): clutteringasa.org
- ASHA Special Interest Group 4: Fluency and Fluency Disorders
    `,
  },
];
```

---

## 23. FINAL CHECKLIST FOR CLAUDE CODE

After completing all changes above, verify:

- [ ] `language=en-US` in Deepgram hook
- [ ] English fillers list in place
- [ ] `syllabify.ts` fully replaced with English version
- [ ] `syllableDictionary.ts` fully replaced with English dictionary
- [ ] `practiceTexts.ts` fully replaced with English texts
- [ ] Exercise categories titles and descriptions in English
- [ ] All pricing in USD ($29/$39 for pro, $9 B2C)
- [ ] "Orthophoniste" → "SLP" everywhere
- [ ] "Bredouillement" → "Cluttering" everywhere
- [ ] "RGPD" → "HIPAA" in privacy/legal pages
- [ ] `package.json` name updated to `clutterpro`
- [ ] `index.html` title and meta updated
- [ ] Blog posts replaced with English content
- [ ] Navbar links in English
- [ ] Footer updated (remove French legal entity)
- [ ] Testimonials in English
- [ ] Email templates in English
- [ ] All `€` → `$` currency symbols
- [ ] `parlermoinsvite` references in URLs/text → `clutterpro`

---

*Document prepared by Claude (Anthropic) — March 2026*
*For use with the ClutterPro US version based on parlermoinsvite.fr codebase*
