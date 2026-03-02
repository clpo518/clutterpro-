# ParlerMoinsVite - Documentation Technique Complète

## 🎯 Vision & Mission

**ParlerMoinsVite** est une application web d'entraînement vocal et de régulation du débit de parole, conçue pour les personnes souffrant de bredouillement (cluttering) et de bégaiement. L'application propose un suivi autonome à domicile en complément du travail clinique avec un orthophoniste.

**Fondateur** : Clément Pontegnier, lui-même ancien patient suivi pour bredouillement par Audrey Laydernier (2022).

**URL publique** : https://parlermoinsvite.lovable.app

---

## 💼 Modèle Business Dual : B2B + B2C

### 1. B2B "Therapist-Pays"

#### Principe
Les **orthophonistes** paient pour leurs patients actifs. Les patients bénéficient d'un **accès complet gratuit** lorsqu'ils sont liés à un praticien avec un abonnement valide.

#### Implémentation Technique
- L'accès patient est déterminé par `profiles.linked_therapist_id`
- Vérification via `useLimitCheck.tsx` : patient lié à thérapeute avec trial/abonnement actif = accès complet
- **Aucun paywall, badge "Premium", ou CTA vers /pricing** n'est affiché côté patient B2B

### 2. B2C "Mode Autonomie" (Solo)

#### Principe
Les patients peuvent s'inscrire **sans Code Pro** d'orthophoniste. Ils bénéficient d'un **essai gratuit de 7 jours**, puis d'un abonnement à **9€/mois** (cadré comme "moins de 2 cafés par mois ☕").

#### Parcours Solo
1. **Inscription** sans Code Pro → `trial_end_date` = now() + 7 jours
2. **Dashboard "Mode Autonomie"** : masque les composants thérapeute, affiche un `TrialBanner` avec décompte et prix
3. **Fin d'essai** : redirection vers paiement Stripe (9€/mois)
4. **À tout moment** : le patient peut lier un Code Pro via les paramètres → bascule en mode B2B

#### Implémentation Technique
- Détection solo : `!linked_therapist_id && !is_therapist`
- Trial actif : `trial_end_date && new Date(trial_end_date) > new Date()`
- Accès payant solo : `subscription_status === 'active'` sans thérapeute lié
- CGV : Article 4 (Abonnement Professionnel B2B) et Article 5 (Abonnement Autonome B2C) distincts dans `/legal/terms`

#### Pricing & Communication
- Prix : **9€/mois** affiché sur le dashboard (TrialBanner), la landing patient, et la page de résiliation
- Analogie : "Moins de 2 cafés par mois ☕" utilisée partout (UI, emails, landing)
- Justification affichée : hébergement sécurisé, exercices mis à jour, support humain

### Composants Retirés (v2.1)
| Fichier | Raison |
|---------|--------|
| `UserBadge.tsx` | Affichait "PREMIUM" ou "ACCÈS COMPLET" - distinction inutile |
| `BlurredAnalyticsCard.tsx` | Composant paywall - plus utilisé |

### Props Supprimées
- `isPremium` retirée de : `PatientProgressCard`, `FillerCard`, `CoachBilan`
- Tous les overlays de blur avec Lock icon supprimés

---

## 🏗️ Architecture Technique

### Stack Principal
| Couche | Technologies |
|--------|-------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, Shadcn UI, Framer Motion |
| **Design System** | v3 "Soft & Organique" — Nunito (display) + DM Sans (body), palette crème/teal/pêche, radius 1.125rem, ombres diffuses teintées, animations cubic-bezier(0.22,1,0.36,1) |
| **Backend** | Supabase (Lovable Cloud) |
| **Audio** | MediaRecorder API, Deepgram Nova-2, wavesurfer.js |
| **Paiement** | Stripe (B2B : 9€/mois ou 79€/an par ortho, B2C : 9€/mois par patient solo) |
| **PDF** | @react-pdf/renderer |

### Edge Functions
| Fonction | Description |
|----------|-------------|
| `get-deepgram-token` | Génère un token temporaire Deepgram (1 heure) pour transcription temps réel |
| `create-checkout-session` | Crée une session Stripe Checkout avec métadonnées utilisateur |
| `stripe-webhook` | Gère 6 événements Stripe : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded`, `invoice.payment_failed`, `invoice.payment_succeeded` |
| `send-welcome-email` | Email de bienvenue (détecte solo via `isSolo` flag) |
| `send-email` | Moteur d'envoi multi-templates (14+ types) |
| `scheduled-emails` | Cron quotidien : inactivité, fins d'essai B2B/B2C, bilans hebdo |
| `notify-first-win` | Notification 1ère session complétée |
| `notify-patient-joined` | Alerte thérapeute quand patient rejoint |
| `admin-stats` | Statistiques admin globales |

### Tables Principales
| Table | Colonnes Clés | Description |
|-------|---------------|-------------|
| `profiles` | `id`, `full_name`, `birth_year`, `is_premium`, `is_therapist`, `current_streak`, `longest_streak`, `daily_goal`, `today_minutes`, `last_activity_date`, `target_wpm`, `linked_therapist_id`, `therapist_code`, `stripe_customer_id`, `subscription_status`, `subscription_plan`, `trial_start_date`, `trial_end_date`, `referral_code`, `referral_bonus_months`, `seats_limit`, `is_archived`, `last_engagement_email_at` | Profils utilisateurs avec gamification et abonnement |
| `sessions` | `id`, `user_id`, `avg_wpm`, `max_wpm`, `duration_seconds`, `exercise_type`, `target_wpm`, `recording_url`, `word_timestamps`, `wpm_data`, `patient_sentiment`, `notes` | Sessions d'entraînement avec métriques |
| `session_comments` | `id`, `session_id`, `author_id`, `content`, `is_read` | Feedback orthophoniste |
| `clinical_notes` | `id`, `patient_id`, `therapist_id`, `content`, `is_private` | Notes cliniques privées |
| `assignments` | `id`, `patient_id`, `therapist_id`, `exercise_category`, `exercise_id`, `status`, `completed_session_id` | Exercices prescrits |
| `therapist_directory` | `id`, `user_id`, `display_name`, `city`, `zip_code`, `specialties`, `is_listed`, `accepts_new_patients` | Annuaire orthophonistes |

---

## 📊 Algorithmes de Calcul SPS

### Principe Fondamental
Le **SPS (Syllabes Par Seconde)** est calculé selon la méthode **Articulation Rate** de Van Zaalen (2009) :
- **Numérateur** : Nombre de syllabes prononcées
- **Dénominateur** : Temps d'articulation réel (silences EXCLUS)

### Hook `useDeepgramSPS.ts` - Paramètres Techniques

```typescript
// Constantes critiques
const SPS_WINDOW_SECONDS = 2;        // Fenêtre glissante de 2 secondes
const SPS_UPDATE_INTERVAL_MS = 150;  // Rafraîchissement toutes les 150ms
const AUDIO_BUFFER_SIZE = 1024;      // Taille buffer audio
const TARGET_SAMPLE_RATE = 16000;    // Deepgram attend 16kHz
const MAX_RECONNECT_ATTEMPTS = 2;   // Reconnexion auto WebSocket
```

### Formule de Calcul SPS Temps Réel

```typescript
// Filtre les mots dans la fenêtre glissante de 3s
const recentWords = wordTimestampsRef.current.filter(
  w => w.end >= (elapsedSeconds - SPS_WINDOW_SECONDS)
);

// Somme des syllabes dans la fenêtre
const syllablesInWindow = recentWords.reduce((sum, w) => sum + w.syllables, 0);

// Somme du temps d'articulation (PAS le temps total!)
const articulationTimeInWindow = recentWords.reduce((sum, w) => {
  const effectiveStart = Math.max(w.start, windowStart);
  const effectiveEnd = Math.min(w.end, elapsedSeconds);
  return sum + Math.max(0, effectiveEnd - effectiveStart);
}, 0);

// SPS = syllabes / temps articulation (minimum 0.15s pour éviter division par zéro)
const sps = articulationTimeInWindow > 0.15
  ? Math.round((syllablesInWindow / articulationTimeInWindow) * 10) / 10
  : 0;
```

### Fluency Ratio (Ratio de Fluence)

```typescript
// Pourcentage du temps passé à parler vs silences
fluencyRatio = totalArticulationTime / totalElapsedTime
// > 80% = Excellent, 60-80% = Normal, < 60% = À surveiller
```

---

## 🔤 Comptage des Syllabes Françaises

### Fichier `syllabify.ts` - Algorithme Optimisé

**1. Dictionnaire de 150+ mots français courants** avec comptage exact :
```typescript
const SYLLABLE_DICTIONARY: Record<string, number> = {
  // 1 syllabe (souvent sur-comptés)
  'je': 1, 'tu': 1, 'elle': 1, 'nous': 1, 'vous': 1, 'que': 1, 'qui': 1,
  'est': 1, 'sont': 1, 'fait': 1, 'mais': 1, 'dans': 1, 'pour': 1,
  
  // 2 syllabes
  'bonjour': 2, 'merci': 2, 'avec': 2, 'après': 2, 'toujours': 2,
  
  // 3+ syllabes (souvent mal comptés)
  "aujourd'hui": 3, 'absolument': 4, 'évidemment': 4,
  'particulièrement': 6, 'généralement': 5,
  
  // Contractions orales
  "j'suis": 1, "t'as": 1, "c'est": 1, "d'accord": 2,
  // ... 150+ mots
};
```

**2. Heuristique de Fallback** :

```typescript
function countSyllablesHeuristic(word: string): number {
  // Compte les groupes de voyelles
  const vowelGroups = word.match(/[aeiouyàâäéèêëïîôùûüœæ]+/gi) || [];
  let count = vowelGroups.length;
  
  // Gestion du 'e' muet final
  if (word.endsWith('e') && !/[aeiouy]/.test(word.slice(-2, -1))) {
    count = Math.max(1, count - 1);  // "table" = 1, pas 2
  }
  
  // Gestion du 'es' muet final
  if (word.endsWith('es') && !/[aeiouy]/.test(word.slice(-3, -2))) {
    count = Math.max(1, count - 1);  // "tables" = 1
  }
  
  // Gestion du 'ent' muet (3e personne pluriel verbes)
  if (word.endsWith('ent') && /[aeiouy]/.test(word.slice(-4, -3))) {
    count = Math.max(1, count - 1);  // "parlent" = 1, mais "parent" = 2
  }
  
  return Math.max(1, count);
}
```

---

## 🎨 Design System v3 — "Soft & Organique"

### Direction Artistique
Inspiré Headspace/Calm : formes arrondies, couleurs pastel chaleureuses, animations fluides et organiques. Ton rassurant et clinique sans être froid.

### Typographie
| Usage | Police | Poids |
|-------|--------|-------|
| **Titres (display)** | Nunito | 600-800 |
| **Corps (sans)** | DM Sans | 300-700 |
Chargées via Google Fonts dans `index.html` (preconnect + display=swap).

### Palette de Couleurs (Light)
| Token | HSL | Usage |
|-------|-----|-------|
| `--background` | 36 33% 97% | Fond crème chaud |
| `--foreground` | 230 18% 22% | Texte principal |
| `--card` | 40 40% 99% | Cards blanc crème |
| `--primary` | 170 45% 41% | Teal doux — CTA, accents |
| `--secondary` | 28 60% 95% | Blush chaud |
| `--muted` | 34 25% 93% | Fond sable |
| `--accent` | 22 75% 93% | Pêche lumineux |
| `--border` | 36 20% 88% | Bordures douces |

### Tokens de Feedback Clinique
| Token | HSL | Signification |
|-------|-----|---------------|
| `--speed-calm` | 160 50% 45% | Zone de confort |
| `--speed-fast` | 38 85% 55% | Attention |
| `--speed-critical` | 2 65% 55% | Trop rapide |
| `--success` | 160 50% 45% | Réussite |
| `--warning` | 38 85% 55% | Alerte |
| `--destructive` | 2 65% 55% | Erreur/danger |

### Radius & Ombres
- **Radius de base** : `--radius: 1.125rem` (généreux, organique)
- Variants : `sm` (-6px), `md` (-2px), `lg` (base), `xl` (+4px), `2xl` (+8px), `3xl` (1.75rem)
- **Ombres** : diffuses et teintées primary (`shadow-soft`, `shadow-glow`, `shadow-card`, `shadow-card-hover`)
- Card hover : lift de 3px + glow teal subtil

### Animations
| Classe | Effet | Durée |
|--------|-------|-------|
| `animate-fade-up` | Apparition + slide up | 0.6s ease-smooth |
| `animate-scale-in` | Scale de 94% à 100% | 0.4s ease-smooth |
| `animate-float` | Lévitation douce | 5s infinite |
| `animate-breathe` | Respiration (scale + opacity) | 6s infinite |
| `animate-blob` | Déformation organique | 8s infinite |
| `animate-shimmer` | Skeleton loading | 2s linear infinite |

Toutes les transitions utilisent `cubic-bezier(0.22, 1, 0.36, 1)` ("ease-smooth") pour un feeling organique.

### Utilities CSS Composants
| Classe | Description |
|--------|-------------|
| `.card-elevated` | Card avec shadow-card, hover lift 3px + glow |
| `.card-soft` | Card subtile, backdrop-blur, sans hover lift |
| `.glass` | Glassmorphism : bg-card/70, blur-2xl, border légère |
| `.gradient-text` | Texte dégradé primary → teal clair |
| `.gradient-subtle` | Fond dégradé background → secondary → accent |
| `.gradient-organic` | Fond organique multi-stops chaud |
| `.blob` | Border-radius organique (60% 40% 30% 70%) |
| `.interactive` | Transition douce hover scale 1.02, active 0.98 |
| `.badge-clinical` | Badge arrondi avec fond primary/10 |

### Timing Functions Tailwind
- `ease-smooth` : `cubic-bezier(0.22, 1, 0.36, 1)` — défaut organique
- `ease-bounce-sm` : `cubic-bezier(0.34, 1.56, 0.64, 1)` — rebond subtil
- `ease-organic` : `cubic-bezier(0.4, 0, 0.2, 1)` — naturel

---

## 🎯 Normes Van Zaalen par Âge

### `ageNormsUtils.ts` - Seuils Cliniques

```typescript
export const AGE_NORMS = {
  child: { maxAge: 12, targetSPS: 3.8, label: "Enfant" },
  adolescent: { minAge: 13, maxAge: 20, targetSPS: 5.2, label: "Adolescent" },
  adult: { minAge: 21, maxAge: 60, targetSPS: 4.3, label: "Adulte" },
  senior: { minAge: 61, targetSPS: 4.0, label: "Senior" }
};

// Fonction de calcul de l'âge et norme
export function getAgeNorm(birthYear: number | null): {
  ageGroup: string;
  targetSPS: number;
  warningThreshold: number;  // Alerte si débit > norme + 1.5 SPS
}
```

### Système de Niveaux (aligné SPS)

Le Niveau N correspond exactement à N syllabes par seconde. Les seuils de performance sont adaptatifs : la tolérance (marge d'erreur) est multipliée par un facteur d'échelle pour les vitesses lentes afin d'éviter des retours trop sévères.

Normes de référence : Adulte/Adolescent (5.0 SPS), Enfant (4.2), Senior (4.5).

En base de données, les valeurs sont stockées historiquement en WPM avec un coefficient de conversion de 2.2 syllabes par mot.

### Niveaux de Cibles Cliniques

```typescript
export const SPS_TARGET_LEVELS = [
  { level: 1, sps: 2.0, label: "Tortue", emoji: "🐢" },
  { level: 2, sps: 3.0, label: "Lent", emoji: "🎯" },
  { level: 3, sps: 4.0, label: "Modéré", emoji: "💬", recommended: true },
  { level: 4, sps: 5.0, label: "Rapide", emoji: "⚡" },
  { level: 5, sps: 6.0, label: "Challenge", emoji: "🏃" },
];
```

---

## 🎨 Système de Feedback Visuel

### Zones SPS (`spsUtils.ts`)

```typescript
export function getSPSZone(currentSPS: number, targetSPS: number): {
  zone: 'perfect' | 'good' | 'warning' | 'danger' | 'too_slow' | 'waiting';
  label: string;
  colorClass: string;
  bgClass: string;
} {
  const diff = currentSPS - targetSPS;
  
  if (currentSPS === 0) return { zone: 'waiting', label: "Parlez..." };
  if (diff < -1.0)      return { zone: 'too_slow', label: "Relancez", color: "blue" };
  if (diff >= -0.5 && diff <= 0.5) return { zone: 'perfect', label: "Parfait", color: "emerald" };
  if (diff > 0.5 && diff <= 1.5)   return { zone: 'warning', label: "Doucement...", color: "orange" };
  if (diff > 1.5)       return { zone: 'danger', label: "Trop vite !", color: "red" };
  
  return { zone: 'good', label: "Bien", color: "green" };  // Entre -1.0 et -0.5
}
```

### Seuils de Statut Clinique

```typescript
export function getDebitStatus(avgSps: number): {
  label: string;
  color: "green" | "yellow" | "red" | "gray";
} {
  if (avgSps === 0)   return { label: "Non mesuré", color: "gray" };
  if (avgSps < 2.5)   return { label: "Débit lent", color: "green" };
  if (avgSps <= 4.5)  return { label: "Débit normo-fluent", color: "green" };
  if (avgSps <= 5.5)  return { label: "Débit rapide", color: "yellow" };
  return { label: "Tachylalie", color: "red" };
}
```

---

## 🔴 Analyse des Disfluences (Bêta)

### `analyzeDisfluency.ts` - Marqueurs Acoustiques

```typescript
export interface DisfluencyMarker {
  type: 'block' | 'repetition' | 'prolongation';
  startIndex: number;
  endIndex: number;
  severity: 'low' | 'medium' | 'high';
  words: string[];
}

// Seuils de détection
const BLOCK_THRESHOLD = 1.0;        // Silence > 1 seconde = blocage
const REPETITION_GAP = 0.2;         // Même mot répété < 0.2s = répétition
const PROLONGATION_DURATION = 0.8;  // Mot > 0.8 seconde = allongement
```

### Composant `TranscriptHeatmap.tsx`

Affiche le transcript avec coloration selon les disfluences :
- 🔴 **Rouge** : Blocages (silences intra-phrase)
- 🟡 **Jaune** : Répétitions (mots consécutifs identiques)
- 🟣 **Violet** : Allongements (durée anormale)

**Disclaimer** : "Analyse acoustique (bêta). Mesure les conséquences sonores, non les tensions musculaires."

---

## 🎮 Gamification

### Hook `useGamification.ts` - Logique des Streaks

```typescript
// Calcul de la série (streak)
const isToday = lastActivity && isSameDay(lastActivity, now);
const isYesterday = lastActivity && isSameDay(addDays(now, -1), lastActivity);

if (isToday) {
  // Même jour → ajoute minutes, garde streak
  newTodayMinutes += durationMinutes;
} else if (isYesterday) {
  // Jour consécutif → streak + 1
  newStreak += 1;
  newTodayMinutes = durationMinutes;
} else {
  // Gap > 1 jour → reset streak à 1
  newStreak = 1;
  newTodayMinutes = durationMinutes;
}

// Goal completion check
const wasGoalMet = todayMinutes >= dailyGoal;
const isGoalMetNow = newTodayMinutes >= dailyGoal;
const goalJustCompleted = !wasGoalMet && isGoalMetNow;  // Déclenche confetti
```

### Statuts de Rétention (pour orthophonistes)

```typescript
export type RetentionStatus = "active" | "slipping" | "dropout";

export function getRetentionStatus(daysSinceActivity: number): RetentionStatus {
  if (daysSinceActivity <= 2) return "active";   // ✅ Actif
  if (daysSinceActivity <= 5) return "slipping"; // ⚠️ En baisse
  return "dropout";                              // 🔴 Abandon
}
```

---

## 📚 Catégories d'Exercices

### 13 Catégories Distinctes

| ID | Titre | Type | Description |
|----|-------|------|-------------|
| `dialogue` | Mode Dialogue | dialogue | Transfert en situation réelle, biofeedback émoji |
| `rebus-enfant` | Mode Enfants (Rébus) | rebus | 30+ exercices emoji pour non-lecteurs 4-7 ans |
| `slow-reading` | Ralentissement | reading | Phrases courtes avec pauses |
| `daily-life` | Vie quotidienne | reading | Emails, conversations réalistes |
| `articulation` | Défis d'articulation | reading | Virelangues, diction |
| `clinical-texts` | Textes Cliniques | reading | Textes validés scientifiquement |
| `warmup` | Gymnastique Articulatoire | warmup | Échauffement vocal |
| `improvisation` | Improvisation Guidée | improvisation | Parole spontanée sur thème |
| `repetition` | Répétition Intensive | repetition | Mots/phrases répétés |
| `respiration` | Respiration & Pauses | reading | Focus sur le souffle |
| `narrative` | Narrations Longues | reading | Textes > 200 mots |
| `professional` | Communication Pro | reading | Présentations, réunions |
| `proprioception` | Auto-Contrôle | proprioception | Test sans biofeedback |

### Mode Rébus (Enfant 4-7 ans)
- Exercices basés sur des séquences emoji avec labels texte
- TTS avec contrôle de vitesse 🐢 (0.4×) à 🐇 (1.0×)
- Pauses respiratoires visuelles (barres animées)
- Countdown 3-2-1 entre les répétitions ("Reprends ton souffle")
- Le temps de countdown est exclu du calcul SPS via `addPauseOffset(3000)`
- Modes Libre et Guidé (karaoké emoji par emoji)

### Mode Auto-Contrôle (Proprioception)

```typescript
// 3 niveaux de calibration spécifiques
const PROPRIOCEPTION_LEVELS = [
  { sps: 3.0, label: "Lent" },
  { sps: 4.0, label: "Modéré" },
  { sps: 5.0, label: "Rapide" },
];

// Thèmes d'improvisation concrets
const IMPROVISATION_THEMES = [
  "Décrivez votre maison ou appartement",
  "Racontez vos dernières vacances",
  "Expliquez votre routine matinale",
  "Décrivez votre plat préféré",
  "Parlez de votre métier ou études",
  // ... 10+ thèmes
];
```

---

## 🎵 Modes de Guidage

### 1. Mode Libre
- Lecture naturelle sans guidage visuel
- Tracking SPS uniquement
- Enregistrement audio pour réécoute

### 2. Mode Guidé (Karaoké)
- Surligneur bleu mot-par-mot
- Vitesse basée sur `target MPM = target SPS × 33.3`
- Pauses forcées après ponctuation : `,` = 400ms, `.!?` = 800ms
- Effet "Tunnel Vision" : mots futurs floutés

### 3. Mode Syllabique
- Syllabes françaises mises en évidence
- Intervalle de 600ms par syllabe
- Utilise `syllabifySentence()` de `syllabify.ts`

---

## 🎤 Biofeedback Temps Réel

### Composant `BiofeedbackBar.tsx`

**Stabilisation UX** :
- Debounce de **1.5 secondes** sur les changements de zone
- Seuil de silence de **0.3 SPS** avant d'afficher "Parlez..."
- Message d'attente initial : "Continuez à parler..." pendant les 2 premières secondes

**Éléments affichés** :
- `SpeedGaugeBar` : Barre colorée avec zone cible intégrée
- Emoji dynamique : 🐢 / ✅ / ⚡ selon la zone
- Label : "Rythme idéal", "Doucement...", "Trop vite !"
- SPS numérique (secondaire, plus petit)

### Mode Auto-Contrôle
- Remplace la jauge par une "Breathing Light" (pulsation)
- Aucun feedback numérique pendant l'exercice
- Révélation de la courbe uniquement à la fin

---

## 📈 Waveform Interactive

### Composant `ClinicalWaveform.tsx`

```typescript
// Configuration wavesurfer.js
const wavesurfer = WaveSurfer.create({
  container: waveformRef.current,
  waveColor: '#10b981',      // Emerald
  progressColor: '#059669',  // Emerald darker
  cursorColor: '#6366f1',    // Indigo
  height: 100,
  barWidth: 2,
  barGap: 1,
  normalize: true,
});

// Zoom configurable
const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 200];
```

**Fonctionnalités** :
- Click-to-seek (navigation temporelle)
- Zoom de 25% à 200%
- Light mode aesthetique (fond blanc, vagues emerald)
- Affichage de la durée et position

---

## 📄 Génération de Rapports PDF

### `ClinicalReportPDF.tsx`

**Contenu du rapport** :
- En-tête avec logo et informations patient
- Période d'analyse sélectionnable
- Statistiques clés : sessions, SPS moyen, évolution
- Graphique de progression (intégré en image)
- Notes cliniques (optionnelles)
- Disclaimer légal

**Options** :
- Période : 7, 30, 90 jours ou personnalisée
- Inclure notes privées : oui/non
- Inclure graphique : oui/non

---

## 💳 Intégration Stripe

### Edge Function `create-checkout-session`

```typescript
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  payment_method_types: ['card'],
  customer: customerId,
  line_items: [{
    price: plan === 'yearly' ? YEARLY_PRICE_ID : MONTHLY_PRICE_ID,
    quantity: 1,
  }],
  success_url: `${origin}/dashboard?payment=success`,
  cancel_url: `${origin}/pricing`,
  metadata: { user_id: userId, plan },
  subscription_data: {
    metadata: { user_id: userId },
  },
});
```

### Edge Function `stripe-webhook`

**Événements gérés** :
| Événement | Action |
|-----------|--------|
| `checkout.session.completed` | `is_premium = true`, `subscription_status = 'active'` |
| `customer.subscription.updated` | Sync `subscription_status` |
| `customer.subscription.deleted` | `is_premium = false`, `subscription_status = 'canceled'` |
| `charge.refunded` | `is_premium = false` |
| `invoice.payment_failed` | Log pour investigation |
| `invoice.payment_succeeded` | Confirmation dans logs |

**Signature verification** (Deno) :
```typescript
const event = await stripe.webhooks.constructEventAsync(
  body,
  signature,
  Deno.env.get('STRIPE_WEBHOOK_SECRET'),
  undefined,
  cryptoProvider
);
```

---

## 🔐 Sécurité & RLS

### Politiques RLS Principales

```sql
-- Profiles : lecture/écriture pour propriétaire
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Sessions : propriétaire + thérapeute lié
CREATE POLICY "Users can read own sessions" ON sessions FOR SELECT 
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = sessions.user_id AND linked_therapist_id = auth.uid()
  ));

-- Clinical notes : thérapeute uniquement
CREATE POLICY "Therapist notes" ON clinical_notes 
  USING (auth.uid() = therapist_id);
```

---

## 🌐 Pages et Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Index | Landing page avec démo karaoké |
| `/pro` | ProLanding | Page dédiée orthophonistes |
| `/pricing` | Pricing | Grille tarifaire |
| `/about` | About | Histoire du fondateur |
| `/blog` | Blog | Articles SEO |
| `/blog/:slug` | BlogArticle | Article détaillé |
| `/contact` | Contact | Formulaire de contact |
| `/auth` | Auth | Login/Signup |
| `/dashboard` | Dashboard | Dashboard patient |
| `/library` | Library | Bibliothèque d'exercices |
| `/practice` | Practice | Arène de pratique |
| `/session/:id` | SessionDetail | Détail d'une session |
| `/patient/:id` | PatientDetail | Dossier patient (thérapeute) |
| `/therapist` | TherapistDashboard | Dashboard orthophoniste |
| `/settings` | Settings | Paramètres utilisateur |
| `/legal/terms` | Terms | CGV/CGU |
| `/legal/privacy` | Privacy | Politique de confidentialité |

---

## 📝 Conventions de Terminologie

### À éviter → À utiliser

| ❌ Éviter | ✅ Utiliser |
|----------|-------------|
| IA | Algorithme, Moteur d'analyse |
| Fillers | Disfluences, Mots parasites |
| AI feedback | Analyse automatique |
| Machine learning | Traitement du signal |
| Ortho | Orthophoniste |
| New | Nouveau |
| WPM | SPS (sauf dans code legacy) |
| Premium (côté patient) | Aucune mention - accès complet par défaut |
| mots/minute, WPM (affichage) | syllabes/seconde, syll./sec, SPS |

---

## ⚠️ Disclaimers Légaux

L'application **n'est pas un dispositif médical** :
- Pas de diagnostic ni prescription
- Ne remplace pas une consultation orthophonique
- Données à titre indicatif uniquement
- POCLE décline toute responsabilité en cas d'absence de progrès

**Éditeur** : POCLE SAS, 21 B Rue du Simplon, 75018 Paris
**RCS** : Paris 847 536 711
**TVA** : FR70847536711

---

## 🔧 Mots-clés de Détection de Disfluences

```typescript
const FRENCH_FILLERS = [
  'euh', 'heu', 'hum',           // Hésitations vocales
  'ben', 'bah', 'bon',           // Interjections
  'du coup', 'en fait', 'genre', // Mots de liaison parasites
  'tu vois', 'alors', 'voilà',   // Ponctuants oraux
  'quoi'                         // Marqueur final
];
```

---

## 📊 Tooltips Cliniques Standardisés

```typescript
export const METRIC_TOOLTIPS = {
  SPS: "Syllabes par seconde - Calculé sur le temps de parole réel (silences exclus). Cible thérapeutique : 3.0-4.5 SPS",
  AVG_SPS: "Vitesse moyenne de la session. ≤4.0 = optimal, 4-5 = rapide, >5 = tachylalie",
  MAX_SPS: "Vitesse maximale atteinte. Un écart important avec la moyenne peut indiquer des accélérations involontaires",
  FLUENCY_RATIO: "Pourcentage du temps passé à parler vs silence. >80% = excellent, 60-80% = normal, <60% = à surveiller",
  FILLERS: "Disfluences détectées automatiquement pendant la session",
  SYLLABLES: "Nombre total de syllabes prononcées (algorithme optimisé français)",
};
```

---

## 🎯 Constantes Techniques Critiques

```typescript
// SPS
export const MAX_REALISTIC_SPS = 8.0;     // Maximum humain réaliste
export const SPS_BUFFER_SIZE = 5;         // Taille buffer de lissage
export const SPS_THRESHOLDS = {
  optimal: 4.0,
  elevated: 5.0,
  tachylalia: 6.0,
};

// Deepgram
const WS_URL = 'wss://api.deepgram.com/v1/listen?model=nova-2&language=fr&punctuate=true&interim_results=true&encoding=linear16&sample_rate=16000';

// Gamification
const DEFAULT_DAILY_GOAL = 3;  // 3 minutes par défaut

// Mode Guidé (Karaoké)
const PAUSE_COMMA = 400;       // ms après virgule
const PAUSE_PERIOD = 800;      // ms après point
const SYLLABLE_INTERVAL = 600; // ms entre syllabes (mode syllabique)
```

---

## 🔄 Conversion WPM ↔ SPS

Pour compatibilité avec données legacy :

```typescript
// WPM vers SPS
export const wpmToSps = (wpm: number): number => {
  return Math.round((wpm * 1.8 / 60) * 10) / 10;
  // Ex: 120 WPM → 3.6 SPS
};

// SPS vers WPM
export const spsToWpm = (sps: number): number => {
  return Math.round(sps * 60 / 1.8);
  // Ex: 4.0 SPS → 133 WPM
};

// Moyenne : 1 mot français ≈ 1.8 syllabes
```

---

## 📋 Copie Presse-Papiers Robuste

### Fonction `handleShare` (`SessionDetail.tsx`)

```typescript
// Méthode moderne avec fallback
try {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(shareText);
  } else {
    // Fallback : textarea temporaire + execCommand
    const textArea = document.createElement('textarea');
    textArea.value = shareText;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
  toast.success("Résumé copié");
} catch (error) {
  console.error("Erreur de copie:", error);
  toast.error("Impossible de copier...");
}
```

**Compatibilité** : Fonctionne sur tous les navigateurs, contextes sécurisés/non-sécurisés.

---

## 📱 Responsive & Accessibilité

- Mobile-first avec breakpoints Tailwind standards
- Dark mode complet (next-themes)
- Contraste WCAG AA minimum
- Focus visible sur éléments interactifs
- Labels ARIA pour lecteurs d'écran

---

## 📧 Cycle de Vie Email

### Templates Disponibles

| Template | Déclencheur | Audience |
|----------|-------------|----------|
| `welcome-patient` | Inscription (détecte `isSolo`) | Patients B2B + B2C |
| `welcome-therapist` | Inscription orthophoniste | Thérapeutes |
| `first-win` | 1ère session complétée | Tous patients |
| `patient-joined` | Patient lie son Code Pro | Thérapeutes |
| `patient-archived` | Patient archivé par ortho | Patients B2B |
| `inactivity-reminder` | 5+ jours sans activité (cooldown 7j) | Patients actifs |
| `weekly-report` | Dimanche soir (cron) | Patients actifs non-archivés |
| `trial-expiring` | J-3 avant fin essai B2B | Thérapeutes |
| `b2c_trial_expiring` | J-2 avant fin essai solo (±1j) | Patients B2C |
| `subscription-expiring` | Abonnement expirant | Thérapeutes |
| `subscription-canceled` | Résiliation Stripe | Abonnés |
| `payment-failed` | Échec de paiement | Abonnés |
| `refund-confirmation` | Remboursement Stripe | Abonnés |

### Logique Cron (`scheduled-emails`)
- **Quotidien** : relances inactivité (cooldown `last_engagement_email_at` 7j), fins d'essai B2B (J-3) et B2C (J-2)
- **Dimanche** : bilan hebdomadaire SPS aux patients actifs (< 7j d'inactivité, non archivés)
- **B2C trial** : requête solo = `linked_therapist_id IS NULL AND is_therapist = false AND trial_end_date BETWEEN now()+1j AND now()+3j`

---

## 📝 Conventions de Terminologie

### À éviter → À utiliser

| ❌ Éviter | ✅ Utiliser |
|----------|-------------|
| IA | Algorithme, Moteur d'analyse |
| Fillers | Disfluences, Mots parasites |
| AI feedback | Analyse automatique |
| Machine learning | Traitement du signal |
| Ortho | Orthophoniste |
| WPM | SPS (sauf dans code legacy) |
| Premium (côté patient) | Aucune mention - accès complet par défaut |
| mots/minute, WPM (affichage) | syllabes/seconde, syll./sec, SPS |
| Prix seul | Prix + analogie "moins de 2 cafés ☕" (B2C) |

---

## 🎉 Onboarding & Effet "Wahou"

### Écrans de Bienvenue (Slide 0)
Les modaux d'onboarding (Patient via `PatientWelcomeModal` et Orthophoniste via `WelcomeTourModal`) incluent un écran de bienvenue célébrant l'arrivée de l'utilisateur :
- **Confettis** : `canvas-confetti` déclenché une seule fois à l'ouverture (via `useRef` guard)
- **Emojis animés** : entrée spring staggerée (🎉 🩺 📊 pour ortho, 🎉 🗣️ 🎯 pour patient)
- **Personnalisation** : prénom du patient affiché si disponible
- **Tour guidé ortho** : 6 slides (Code Pro, patients, suivi, alertes, rapports)

### Déclenchement
- Patient : `!is_therapist && !onboarding_completed_at && isNewAccount` → modal avec delay
- Ortho : `is_therapist && !onboarding_completed_at` → `WelcomeTourModal`
- Marqué complété via `onboarding_completed_at` en base

---

*Document mis à jour le 24/02/2026 - Version 3.0*
