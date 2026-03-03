/**
 * Blog Posts Data (Local CMS)
 * SEO-optimized articles targeting US SLP search intent
 */

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  imageUrl: string;
  audience: 'pro' | 'patient';
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'what-is-cluttering-speech-disorder-slp-guide',
    title: "What Is Cluttering? A Guide for SLPs",
    excerpt: "Cluttering is one of the most underdiagnosed fluency disorders in speech-language pathology. Here's what every SLP needs to know — from definition to differential diagnosis.",
    author: 'ClutterPro Editorial',
    date: '2026-03-01',
    readTime: '8 min',
    category: 'Clinical',
    imageUrl: '/placeholder.svg',
    audience: 'pro',
    content: `
# What Is Cluttering? A Guide for SLPs

Cluttering is a fluency disorder characterized by an excessively fast and/or irregular speech rate, often accompanied by reduced intelligibility, disorganized language, and limited self-awareness. It remains one of the most underdiagnosed conditions in speech-language pathology — frequently mistaken for stuttering, ADHD-related speech, or simply "talking fast."

## ASHA Definition

According to ASHA's Practice Portal on Fluency Disorders, cluttering is defined as "a fluency disorder characterized by a rate that is perceived to be abnormally rapid, irregular, or both for the speaker (even if the rate is objectively within normal limits)." The key diagnostic features include:

- Excessive speech rate (articulation rate, not overall speaking rate)
- Reduced intelligibility not explained by articulation errors
- Disorganized language output (mazes, revisions, incomplete sentences)
- Limited self-monitoring and low awareness

## How Is It Different From Stuttering?

This is the question every SLP encounters. The table below summarizes the core clinical distinctions:

| Feature | Cluttering | Stuttering |
|---------|-----------|------------|
| Primary symptom | Excessive rate, disorganized speech | Blocks, repetitions, prolongations |
| Self-awareness | Usually low | Usually high |
| Anxiety | Often absent | Frequently present |
| Reading aloud | Typically improves | Often worsens |
| Response to unfamiliar listeners | Often improves | Often worsens |
| Response to stress | Rate accelerates | Stuttering increases |

Co-occurrence is common — studies suggest 30–40% of people who clutter also stutter. When both are present, most clinicians recommend addressing cluttering first, as rate reduction often reduces secondary stuttering symptoms.

## Prevalence and Populations

Cluttering affects approximately 1–2% of the general population. It is more prevalent in:
- Males (3:1 ratio)
- Individuals with ADHD or learning disabilities
- First-degree relatives of people who clutter (familial pattern)
- Individuals who also stutter

## Assessment: What to Measure

The gold standard metric is **articulation rate** — syllables per second (SPS) calculated from actual speech time, with silences excluded. This method, described by Van Zaalen et al. (2009), provides an objective measure correlating with listener-perceived cluttering severity.

**Reference values (adults, Van Zaalen 2009)**:
- ≤4.5 SPS: Conversational range
- 4.5–5.5 SPS: Borderline — monitor
- >5.5 SPS: Cluttering range — clinical concern

Always collect samples across contexts: spontaneous speech, oral reading, and conversational narration.

## Treatment Approaches

Evidence-based treatment for cluttering focuses on:
1. **Rate reduction** via SPS biofeedback (real-time or retrospective)
2. **Phrasing technique** — speaking in short breath groups with natural pauses
3. **Over-articulation** — deliberate exaggeration of consonants
4. **Self-monitoring training** — teaching the client to catch fast speech independently
5. **Home practice** — 10–20 min of daily structured practice with a tool like ClutterPro

For resources, see ASHA's Practice Portal on Fluency Disorders and the International Cluttering Association (ICA).
    `,
  },
  {
    id: '2',
    slug: 'how-to-measure-speech-rate-cluttering-assessment',
    title: "How to Measure Speech Rate in Cluttering Therapy",
    excerpt: "Syllables per second is the gold standard for cluttering assessment. Here's how to calculate it accurately, what norms to use, and how ClutterPro automates the process.",
    author: 'ClutterPro Editorial',
    date: '2026-02-15',
    readTime: '10 min',
    category: 'Clinical',
    imageUrl: '/placeholder.svg',
    audience: 'pro',
    content: `
# How to Measure Speech Rate in Cluttering Therapy

Speech rate measurement is the foundation of any cluttering assessment or treatment plan. Yet many SLPs still rely on manual counting or WPM estimates — approaches that introduce significant measurement error and don't align with current research.

## Why Syllables Per Second (SPS), Not WPM?

Words per minute (WPM) is intuitive but clinically problematic for two reasons:

1. **Word length varies**: "I" and "Mediterranean" are both one word. SPS treats each syllable as a unit — the actual motor output of speech.
2. **Silences distort the picture**: Overall speaking rate includes pauses, which cluttering clients actually tend to use *less*. Articulation rate (silences excluded) reflects the motor pattern that's clinically relevant.

The Van Zaalen (2009) method — now referenced in ASHA's cluttering materials — uses articulation rate in SPS as the primary metric. This is what ClutterPro measures.

## How to Calculate SPS Manually

1. Record a 1–3 minute speech sample
2. Transcribe it orthographically
3. Count total syllables in the sample
4. Measure total *articulation time* (exclude silences >0.3s)
5. Divide: SPS = syllables ÷ articulation seconds

Example: 180 syllables in 45 seconds of actual speech = 4.0 SPS

## Clinical Reference Values (Adults)

Based on Van Zaalen et al. (2009) and English-language norms:

| Range | Label | Clinical Interpretation |
|-------|-------|------------------------|
| < 3.0 SPS | Slow — Target Zone | Therapy goal during structured practice |
| 3.0–4.5 SPS | Conversational | Normal adult rate |
| 4.5–5.5 SPS | Fast — Monitor | Borderline cluttering |
| > 5.5 SPS | Cluttering Range | Clinical concern |

Note: Children and adolescents have higher normative rates. Adjust expectations by age group.

## Practical Tips for Accurate Measurement

- Use a **standardized reading passage** as one sample (reading aloud tends to be faster than conversation for clutterers — opposite of stuttering)
- Collect **multiple samples** across contexts: phone call simulation, narrative retell, conversation
- Measure **pre- and post-treatment** with the same passage for valid comparison
- Document in your SOAP note: "Articulation rate measured at X.X SPS (Van Zaalen 2009 method)"

## How ClutterPro Automates This

ClutterPro uses Deepgram Nova-2 real-time transcription with word-level timestamps to calculate SPS continuously during a session — silences automatically excluded. The result is a session-by-session SPS chart that replaces manual counting entirely.

SLPs receive per-session reports showing average SPS, peak SPS, and variance — ready to reference in SOAP notes.
    `,
  },
  {
    id: '3',
    slug: 'cluttering-vs-stuttering-key-differences-clinicians',
    title: "Cluttering vs. Stuttering: Key Differences for Clinicians",
    excerpt: "They can co-occur, but cluttering and stuttering are fundamentally different disorders. Here's the differential diagnosis framework every SLP needs.",
    author: 'ClutterPro Editorial',
    date: '2026-01-28',
    readTime: '11 min',
    category: 'Clinical',
    imageUrl: '/placeholder.svg',
    audience: 'pro',
    content: `
# Cluttering vs. Stuttering: Key Differences for Clinicians

Cluttering and stuttering are both fluency disorders — but their profiles, prognoses, and treatment approaches differ substantially. Misdiagnosis is common, partly because they co-occur in approximately 30–40% of cases.

## The Core Diagnostic Distinction

**Stuttering** is characterized by involuntary disruptions in the forward flow of speech: part-word repetitions, prolongations, and silent blocks. The speaker is typically highly aware of the difficulty and often experiences significant anxiety around speaking.

**Cluttering** is characterized by an excessively fast or irregular articulation rate that degrades intelligibility. The speaker is often *unaware* of the problem — a defining feature that dramatically affects treatment.

## Side-by-Side Comparison

| Feature | Cluttering | Stuttering |
|---------|-----------|------------|
| Primary symptom | Rate, disorganized speech | Blocks, repetitions, prolongations |
| Self-awareness | Low | High |
| Anxiety | Usually absent | Often significant |
| Reading aloud | Rate accelerates, intelligibility drops | Often increases stuttering |
| Unfamiliar listeners | Often improves | Often worsens |
| Stress/time pressure | Rate increases | Stuttering increases |
| Language formulation | Often disorganized | Typically intact |
| Response to slowing request | Often marked improvement | Variable |
| ADHD co-occurrence | High | Moderate |

## Differential Diagnosis Protocol

When a client presents with fluency concerns, use this sequence:

### Step 1: Calculate Articulation Rate (SPS)
If SPS > 4.5 in multiple contexts, cluttering is on the table. If SPS is normal, cluttering is less likely.

### Step 2: Assess % Stuttered Syllables (%SS)
Count part-word repetitions, prolongations, and blocks. If %SS > 3%, stuttering criteria are met.

### Step 3: Evaluate Self-Awareness
Ask: "Do you notice yourself speaking too fast?" A clutterer often says no or is surprised by recordings. A person who stutters almost always has strong awareness.

### Step 4: Assess Intelligibility and Language Formulation
Does the speech sound disorganized beyond the fluency disruptions? Mazes, revisions, and incomplete sentences point toward cluttering.

### Step 5: Check Response to Instruction
Ask the client to slow down or read aloud. If intelligibility improves dramatically, cluttering is likely.

## When Both Are Present

In mixed cluttering-stuttering cases:
- Treat cluttering first: rate reduction often reduces stuttering frequency
- Use SPS biofeedback (ClutterPro) for rate component
- Address stuttering anxiety and avoidance with fluency shaping or stuttering modification
- Document both in your evaluation report and treatment plan

## Resources

- ASHA Practice Portal: Fluency Disorders (includes cluttering)
- International Cluttering Association (ICA)
- ASHA Special Interest Group 4: Fluency and Fluency Disorders
- Van Zaalen et al. (2009): foundational SPS measurement paper
    `,
  },
  {
    id: '4',
    slug: 'cluttering-therapy-homework-home-practice-strategies',
    title: "Home Practice Strategies for Cluttering Clients",
    excerpt: "Homework is critical in cluttering therapy. Here are evidence-based home practice strategies SLPs can assign — and how to track compliance between sessions.",
    author: 'ClutterPro Editorial',
    date: '2026-01-10',
    readTime: '9 min',
    category: 'Clinical',
    imageUrl: '/placeholder.svg',
    audience: 'pro',
    content: `
# Home Practice Strategies for Cluttering Clients

Cluttering responds well to consistent home practice. Unlike stuttering, where in-clinic desensitization is often central, cluttering treatment depends heavily on what the client does *between* sessions. The goal: automatizing rate control so it transfers to real speech.

## Why Home Practice Is Non-Negotiable

Cluttering is a neuromotor habit. The motor pattern of speaking too fast is deeply ingrained — often developed over years or decades. Changing it requires massed practice outside the clinic, not just 45 minutes of therapy once a week.

The research consensus: **10–20 minutes of daily structured practice** produces measurable SPS change within 4–6 weeks.

## What to Assign

### 1. Controlled Oral Reading (5–10 min/day)
Assign a reading passage at the client's level. Ask them to:
- Read aloud at target SPS (typically 3.5–4.5 for cluttering clients)
- Pause at every punctuation mark for 1–2 seconds
- Record themselves and listen back

**Why it works**: Reading provides linguistic structure, reducing the cognitive load on language formulation — so the client can focus entirely on rate.

### 2. Real-Time SPS Monitoring (5 min/day)
With ClutterPro, clients practice with live SPS feedback on their screen. The visual gauge gives immediate reinforcement when rate is in the target zone.

This is the most efficient form of home practice for rate reduction.

### 3. Conversation Carry-Over Practice (2–3x/week)
Assign a specific daily conversation (e.g., one phone call, one dinner conversation) with a self-monitoring goal. The client rates themselves on a 1–5 scale: "How well did I monitor my rate?"

### 4. "Speeding Ticket" Self-Awareness Log
Every time the client catches themselves speeding up, they mentally issue themselves a speeding ticket and restart the phrase slowly. Ask them to log how many tickets they give themselves per day — increasing tickets early in treatment often signals growing awareness (a good sign).

## Tracking Compliance

Without data, you're flying blind. Use ClutterPro's session log to:
- See how many practice sessions the client completed
- Review their average SPS trends between appointments
- Identify which exercise types are most challenging

If compliance is low, revisit the homework load. 10 minutes beats 0 minutes — reduce the target if needed.

## What to Say at the End of Each Session

> "Your homework this week: 5 minutes of reading in ClutterPro, every day. That's it. Focus on staying below 4.5 SPS. Next session, we'll look at your data together."

Short, specific, measurable. Clients are more likely to follow through.

## CPT Coding Note

Home practice assignments are typically included under **CPT 92507** (Treatment of speech, language, voice, communication, and/or auditory processing disorder). Document in your SOAP plan: "Client assigned daily home practice using ClutterPro rate monitoring tool, targeting <4.5 SPS."
    `,
  },
  {
    id: '5',
    slug: 'asha-guidelines-cluttering-fluency-disorder-slp',
    title: "ASHA Guidelines for Cluttering: What SLPs Need to Know",
    excerpt: "ASHA's Practice Portal on Fluency Disorders covers cluttering — but the guidance is scattered. Here's a practical summary of what ASHA says and how to apply it clinically.",
    author: 'ClutterPro Editorial',
    date: '2025-12-20',
    readTime: '12 min',
    category: 'Clinical',
    imageUrl: '/placeholder.svg',
    audience: 'pro',
    content: `
# ASHA Guidelines for Cluttering: What SLPs Need to Know

Cluttering is recognized by ASHA as a fluency disorder, but it has historically received far less attention than stuttering in clinical training and continuing education. Here's what the current ASHA guidance says — and what it means for your practice.

## ASHA's Definition

ASHA's Practice Portal on Fluency Disorders defines cluttering as:

> "A fluency disorder characterized by a rate that is perceived to be abnormally rapid, irregular, or both for the speaker (even if the rate is objectively within normal limits). When cluttering is present, the speaker's speech is characterized by one or more of the following: (a) an excessive number of disfluencies, the majority of which are not typical of people who stutter; (b) the frequent placement of pauses and use of prosodic patterns that do not conform to syntactic and semantic constraints; and (c) inappropriate (usually excessive) degrees of coarticulation among sounds, especially in multisyllabic words."

## Assessment: What ASHA Recommends

ASHA recommends a comprehensive evaluation that includes:

### Speech Rate
Measure articulation rate in SPS (Van Zaalen 2009 method), collected across multiple contexts:
- Spontaneous conversational speech
- Oral reading of a standardized passage
- Narrative retelling

### Disfluency Analysis
Differentiate between typical disfluencies (mazes, revisions — common in cluttering) and stuttering-type disfluencies (part-word repetitions, prolongations, blocks).

### Intelligibility
Assess intelligibility in conversation and identify whether reduced clarity is phonetic or prosodic in origin.

### Language Formulation
Evaluate sentence structure, word retrieval, and discourse organization. Cluttering often involves language formulation difficulties beyond the fluency disruption.

### Self-Awareness and Monitoring
Assess the client's awareness of their speech rate and their ability to self-monitor in real time.

## Treatment: Evidence Base

ASHA acknowledges that the evidence base for cluttering treatment is smaller than for stuttering, but identifies the following approaches as consistent with current research:

1. **Rate reduction** — the primary target; can be achieved through biofeedback (real-time SPS display), DAF, or clinician-guided practice
2. **Phrasing and pausing** — teaching clients to use strategic pauses to chunk speech into shorter units
3. **Over-articulation** — deliberate exaggeration of consonants to slow rate and improve intelligibility
4. **Self-monitoring training** — the critical carryover skill; without it, gains don't transfer
5. **Language therapy** — for clients with co-occurring language formulation difficulties

## Documentation Best Practices

**Evaluation report**: Include objective SPS measurements from at least 2 contexts, intelligibility rating, and differential diagnosis from stuttering.

**Treatment plan**: Specify target SPS range (e.g., "client will demonstrate articulation rate ≤4.5 SPS in structured oral reading in 4/5 trials").

**SOAP notes**: Record session SPS data. ClutterPro generates per-session SPS summaries compatible with SOAP format.

**CPT code**: 92507 for treatment sessions. 92521 for fluency assessment if billing separately.

## Key Reference

Van Zaalen, Y., Wijnen, F., & Dejonckere, P. H. (2009). Differential diagnostic characteristics between cluttering and stuttering, Part One. *Journal of Fluency Disorders, 34*(3), 137–154.

This is the foundational paper for SPS-based cluttering assessment and the methodology ClutterPro uses.
    `,
  },
];

export const getBlogPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find((post) => post.slug === slug);
};
