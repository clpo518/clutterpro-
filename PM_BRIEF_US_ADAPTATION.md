# PM Brief — ClutterPro US Market Adaptation
> Give this brief to Claude Code. Read it entirely before touching any file.

---

## 1. Context

You are working on **ClutterPro**, a SaaS web app for cluttering (speech fluency disorder) therapy.
The app was originally built for the French market (parlermoinsvite.fr). It has already been translated to English.
Your job now is to make it feel **100% native to American SLPs** — not just translated, but culturally and clinically accurate.

**Target user:** American Speech-Language Pathologists (SLPs) in private practice or outpatient clinics.
**Secondary user:** Their adult/teen patients who practice between sessions.

---

## 2. What You Must Know About American SLPs

### Who they are
- Called **SLPs** (Speech-Language Pathologists) or **speech therapists** — never "orthophoniste" or "speech pathologist" in casual use
- Certified by **ASHA** (American Speech-Language-Hearing Association) — this is their professional bible
- 218,000+ SLPs in the US; ~19% in private practice (our core target), 56% in schools, 39% in hospitals
- Very tech-savvy: they use **SimplePractice**, **TheraPlatform**, or **TheraNest** for scheduling + notes
- Post-COVID: **teletherapy is mainstream** — many SLPs see patients 100% online

### How cluttering therapy actually works in the US
1. **Initial evaluation** (60 min): SLP records spontaneous speech + oral reading, counts SPS, assesses intelligibility
2. **Treatment sessions** (45–60 min in private practice, 30 min in schools): structured with warm-up, target skill work, functional practice, homework assignment
3. **Key techniques used by US SLPs:**
   - **Rate reduction** — slowing syllable rate consciously (primary goal)
   - **Phrasing** — teaching patients to speak in short phrases with natural pauses
   - **Over-articulation** — deliberately exaggerating consonants and vowels
   - **Self-monitoring** — patient learns to catch their own fast/unclear speech in real time
   - **Delayed Auditory Feedback (DAF)** — hearing your voice slightly delayed slows rate naturally
   - **"Speeding tickets"** — SLP interrupts session when rate goes too fast, very common metaphor
   - **Pullouts** — patient catches cluttered speech, stops, repeats slowly (similar to stuttering therapy)
4. **Homework is critical** — US SLPs assign 10–20 min of daily practice. Patients read aloud, record themselves, and self-evaluate before the next session.
5. **Progress tracking** — SLPs document in **SOAP notes** (Subjective, Objective, Assessment, Plan) and use **CPT code 92507** for treatment billing

### Vocabulary that US SLPs actually use
| Use this | Not this |
|----------|----------|
| speech rate / speaking rate | débit |
| syllables per second (SPS) | bredouillement score |
| cluttering | tachylalie |
| fluency / disfluency | fluence |
| session / therapy session | séance |
| clinician / SLP | thérapeute |
| patient / client | patient (both are used) |
| intelligibility | intelligibilité |
| self-monitoring | auto-évaluation |
| home practice / homework | exercices à domicile |
| progress note | compte-rendu |
| articulation rate | taux d'articulation |
| normal rate (adult): 4.0–5.5 SPS | same metric, different label |

---

## 3. Changes to Make in the Codebase

### A. `src/data/practiceTexts.ts` — Replace all 8 texts with clinically relevant US content

US SLPs use reading passages that:
- Are **conversational and natural** (not literary)
- Have **varied sentence lengths** (mix of short and long)
- Are **phonetically balanced** (cover all English phonemes)
- Relate to **daily communication** situations a cluttering patient faces

Replace the current 8 texts with these (keep the same data structure):

```typescript
// Text 1 — Warm-Up: Short sentences
{
  id: "warmup-short",
  title: "Warm-Up: Short Phrases",
  difficulty: "easy",
  category: "warm-up",
  text: "Take a breath. Speak slowly. One phrase at a time. Feel the rhythm. Pause between ideas. Let the words land. Your listener is following you. There is no rush. Slow is clear. Clear is confident."
}

// Text 2 — Daily Conversation
{
  id: "daily-conversation",
  title: "Daily Conversation",
  difficulty: "easy",
  category: "conversation",
  text: "Good morning. How are you today? I am doing well, thank you. I had a busy morning but things are calming down. I wanted to call you because I have a question about the meeting next week. Is Tuesday still good for you? I can also do Wednesday if that works better. Just let me know and I will confirm."
}

// Text 3 — Professional Context
{
  id: "workplace",
  title: "At Work",
  difficulty: "medium",
  category: "professional",
  text: "I wanted to follow up on the project we discussed last Thursday. The team has reviewed the initial draft and we have a few suggestions. First, we think the timeline could be adjusted to give us more time on the testing phase. Second, the budget estimate might need to be revised based on the new requirements. I can send you a summary by end of day if that would be helpful."
}

// Text 4 — Storytelling
{
  id: "storytelling",
  title: "Telling a Story",
  difficulty: "medium",
  category: "narrative",
  text: "Last weekend I went hiking with my family. We chose a trail near the lake that we had never done before. The weather was perfect — sunny but not too hot. About halfway through, my daughter spotted a deer standing just off the path. We all stopped and watched it for a minute before it walked away into the trees. It was one of those moments that just makes you feel grateful."
}

// Text 5 — Phone Call
{
  id: "phone-call",
  title: "Phone Call Practice",
  difficulty: "medium",
  category: "conversation",
  text: "Hello, this is Alex calling. I am reaching out because I received a letter about my account and I have a few questions. The letter mentioned a change to my plan starting next month, but I am not sure I understand what is changing exactly. Could you walk me through it? I also want to make sure my billing address is correct before the renewal date."
}

// Text 6 — Complex Sentence Structure
{
  id: "complex-ideas",
  title: "Explaining Complex Ideas",
  difficulty: "hard",
  category: "professional",
  text: "The concept of neuroplasticity — the brain's ability to reorganize itself by forming new neural connections — is central to understanding why speech therapy works. When we practice a skill repeatedly and with intention, we strengthen the pathways that support that behavior. For cluttering specifically, this means that consistent rate monitoring, even outside of therapy sessions, creates lasting change over time. The key is not perfection but persistence."
}

// Text 7 — Emotional Topic
{
  id: "emotional",
  title: "Talking About Something That Matters",
  difficulty: "hard",
  category: "personal",
  text: "I have been thinking about this for a while and I want to share something with you. When I was younger, I always felt like people were not really listening to me — like I was talking but somehow not being heard. I did not understand at the time that the way I was speaking was making it hard for others to follow. Working on my speech has changed things. I feel more confident now. People actually wait for me to finish."
}

// Text 8 — Articulation Challenge
{
  id: "articulation-challenge",
  title: "Articulation Challenge",
  difficulty: "hard",
  category: "warm-up",
  text: "Precise articulation requires deliberate coordination between the lips, tongue, teeth, and palate. Practice producing each syllable with intention, particularly in words containing consonant clusters like 'strengths', 'scripts', 'sprints', and 'thresholds'. Slow your rate and notice how clarity improves when each phoneme is fully formed before moving to the next."
}
```

---

### B. `src/data/exercises.ts` — Update exercise categories and content

US SLPs organize cluttering exercises around these clinical categories. Update the categories and all descriptions/tips to match:

**Category names to use:**
1. **Rate Reduction** (not "ralentissement") — exercises focused on slowing SPS
2. **Phrasing & Pausing** — short phrase technique, strategic pauses
3. **Over-Articulation** — exaggerating consonants for clarity
4. **Self-Monitoring** — catching fast speech in real time
5. **Reading Aloud** — oral reading at controlled rate
6. **Conversational Practice** — role-play scenarios
7. **Breathing & Preparation** — pre-speech breath support
8. **Functional Communication** — phone calls, presentations, meetings

For each exercise tip, use language US SLPs actually say in sessions:
- "Use a 'slow and go' approach — pause before key words"
- "Give yourself a speeding ticket if you feel your rate climbing"
- "Think in phrases, not words"
- "Your job is to monitor, not to be perfect"
- "Record yourself and listen back — your ear is your best tool"

---

### C. `src/lib/spsUtils.ts` — Update SPS zone labels and tooltips

US SLPs use these rate benchmarks for cluttering (Van Zaalen 2009, English norms):

```typescript
// Update getSPSZone thresholds and labels:
// < 3.0 SPS  → "Slow — Target Zone" (green) — this is the therapy goal
// 3.0–4.5 SPS → "Conversational" (green) — normal adult rate
// 4.5–5.5 SPS → "Fast — Monitor" (yellow) — borderline cluttering
// > 5.5 SPS  → "Cluttering Range" (red) — clinical concern

// Update METRIC_TOOLTIPS:
METRIC_TOOLTIPS = {
  sps: "Syllables Per Second (SPS) measures your articulation rate. Silences and pauses are excluded. Typical cluttering range: above 5.5 SPS. Therapy target: below 4.5 SPS.",
  pauseRatio: "Percentage of speech time spent in pauses. Healthy speech includes 20–30% pause time for processing and clarity.",
  disfluencies: "Filler words and revisions (um, uh, like, you know...) per minute. Higher counts may indicate planning difficulties.",
  intelligibility: "Estimated percentage of speech clearly understood by a naive listener."
}
```

---

### D. `src/lib/analyzeDisfluency.ts` — US English fillers

Make sure these are the ONLY fillers tracked (already done in Bible, but confirm):
```typescript
const ENGLISH_FILLERS = [
  'um', 'uh', 'like', 'you know', 'basically', 'literally',
  'actually', 'so', 'right', 'okay', 'well', 'i mean',
  'kind of', 'sort of', 'you see', 'I guess'
]
```

---

### E. `src/components/practice/CoachBilan.tsx` — Clinical feedback language

Replace all coach feedback with language that mirrors what an SLP would say. Examples:

| Score zone | French (remove) | English clinical (use) |
|------------|-----------------|------------------------|
| Great | "Très bien !" | "Excellent rate control — you stayed in the target zone." |
| Good | "Bien" | "Good work. Your rate was mostly controlled with a few fast bursts." |
| Too fast | "Trop vite" | "Your rate climbed above 5.0 SPS. Try the phrasing technique on your next attempt." |
| Needs work | "À améliorer" | "Focus on pausing between phrases. Use a 'pause and check' before key sentences." |

---

### F. `src/components/onboarding/` — SLP onboarding flow

When an SLP signs up, the welcome modal should:
1. Ask **"What setting do you work in?"** → Private Practice / Hospital / School / Teletherapy / Other
2. Ask **"What age range do you primarily treat?"** → Adults / Adolescents (13–17) / Mixed
3. Show a quick-start tip referencing **ASHA guidelines**: *"ClutterPro tracks articulation rate using the Van Zaalen (2009) method, consistent with ASHA's recommended assessment approach for cluttering."*

This gives SLPs instant clinical credibility and trust in the tool.

---

### G. `src/pages/Dashboard.tsx` and `TherapistDashboard.tsx` — US-specific copy

Update the empty state and tooltip text to reference US clinical context:

- Empty patient list: *"Add your first client to start tracking their speech rate across sessions."*
  (Use **"client"** — in US private practice, SLPs often say "client" not "patient")
- Session summary header: *"Session Summary"* (not "Bilan")
- Progress section: *"Progress Over Time"*
- Add a tooltip on the SPS chart: *"Rate data collected via Deepgram real-time transcription. Results reflect articulation rate only (pauses excluded), consistent with Van Zaalen (2009)."*

---

### H. `src/pages/Pricing.tsx` — Confirm USD pricing and positioning

Make sure:
- All prices show **USD ($)** not EUR (€)
- Pro plan is **$29/mo** (solo SLP) and **$39/mo** (clinic/group)
- Patient plan remains **free**
- Tagline under pricing: *"Designed for SLPs. Trusted by ASHA members."*
- Add a FAQ item: *"Is ClutterPro HIPAA-compliant?"* → Answer: *"ClutterPro does not store Protected Health Information (PHI). Audio is processed in real time and not retained. Always consult your practice's compliance officer for full HIPAA guidance."*

---

### I. `index.html` and SEO metadata

```html
<title>ClutterPro — Speech Rate Therapy Tool for SLPs</title>
<meta name="description" content="ClutterPro helps speech-language pathologists track and treat cluttering. Real-time syllable rate analysis for SLP sessions and patient home practice.">
<meta name="keywords" content="cluttering therapy, SLP tools, speech rate, syllables per second, speech-language pathology, fluency disorder">
```

---

### J. `src/data/blogPosts.ts` — SEO articles must target US SLP search intent

The 5 blog posts should target keywords US SLPs actually Google:
1. **"What is cluttering? A guide for SLPs"** → target: "cluttering speech disorder SLP"
2. **"How to measure speech rate in cluttering therapy"** → target: "syllables per second cluttering assessment"
3. **"Cluttering vs stuttering: key differences for clinicians"** → target: "cluttering vs stuttering SLP"
4. **"Home practice strategies for cluttering clients"** → target: "cluttering therapy homework"
5. **"ASHA guidelines for cluttering: what SLPs need to know"** → target: "ASHA cluttering fluency disorder"

---

## 4. What NOT to Change

- The SPS calculation algorithm (Van Zaalen 2009 — already correct)
- Supabase backend logic
- Stripe integration (just confirm USD currency)
- Deepgram integration (just confirm `language=en-US`)
- The overall UX/UI structure
- Gamification logic (streaks, scores)

---

## 5. Priority Order

1. `spsUtils.ts` — zone labels (clinicians see this first)
2. `practiceTexts.ts` — patients use these every day
3. `exercises.ts` — SLPs assign these as homework
4. `CoachBilan.tsx` — feedback must feel clinical, not gamified
5. `Pricing.tsx` — USD + HIPAA FAQ
6. Blog posts — SEO
7. Everything else

---

*End of brief. Execute section by section. Confirm each file change before moving to the next.*
