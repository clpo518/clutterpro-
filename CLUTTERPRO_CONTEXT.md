# ClutterPro — Contexte projet (à lire en début de session)

## C'est quoi
SaaS de thérapie du bredouillement (cluttering) pour le marché US.
Version anglaise de parlermoinsvite.fr (marché FR, validé).
Cible : Speech-Language Pathologists (SLPs) américains + leurs patients.

## Stack technique
- React 18 + TypeScript + Vite
- Supabase (BDD + Edge Functions + Auth)
- Stripe (abonnements)
- Deepgram Nova-2 (transcription temps réel, `language=en-US`)
- Shadcn UI + Framer Motion + Tailwind CSS
- Hébergé sur Lovable (sera migré sur Vercel)

## Repo GitHub
`https://github.com/clpo518/clutterpro-`
Dossier local : `C:\Users\cleme\Downloads\cluttering`

## Ce qui est FAIT ✅
- Traduction complète FR → EN (toutes les pages, composants, emails)
- Adaptation clinique US :
  - SPS zones : Slow Target / Conversational / Fast-Monitor / Cluttering Range (seuils 3.0 / 4.5 / 5.5)
  - Feedback coach type SLP ("Give yourself a speeding ticket", "phrasing technique"...)
  - 8 textes de pratique cliniques US (Warm-Up, Phone Call, Workplace, etc.)
  - Catégories d'exercices US (Rate Reduction, Phrasing, Over-Articulation...)
  - Fillers anglais (um, uh, like, you know, i mean, kind of...)
  - 5 articles SEO US ciblant les SLPs (ASHA, Van Zaalen, cluttering vs stuttering...)
- syllableDictionary.ts : 3 871 mots anglais avec conjugaisons + termes cliniques
- syllabify.ts : réécriture complète pour l'anglais américain
- Pricing : $29/$39 USD + FAQ HIPAA
- Landing : témoignages CCC-SLP, mentions ASHA, Van Zaalen 2009

## Ce qui est EN COURS / À FAIRE ⏳
1. **Supabase US** — créer nouveau projet région `us-east-1` (North Virginia)
   - Actuellement : projet FR `lllzwnffmdicoqqxqmeh` (parlermoinsvite.fr)
   - À faire : nouveau projet ClutterPro + appliquer migrations depuis `/supabase/migrations/`
   - Secrets à configurer : DEEPGRAM_API_KEY, STRIPE_SECRET_KEY, RESEND_API_KEY
2. **Domaine** — clutterpro.com à acheter sur OVH
3. **Deploy** — Vercel (connecter repo GitHub clutterpro-)
4. **DNS** — pointer OVH → Vercel
5. **Cron job** — ping DB toutes les 3 jours pour éviter pause free tier Supabase

## Décisions prises
- Codebase séparée (pas de fork i18n) — repo indépendant
- Supabase free tier au démarrage + cron job anti-pause → Pro à $25/mo au 1er client payant
- Vercel pour le frontend (gratuit, CDN US)
- OVH pour le domaine uniquement
- Pas de stockage audio (Deepgram traite en temps réel) → HIPAA-conscious sans BAA

## Pricing ClutterPro
| Plan | Prix | Inclus |
|------|------|--------|
| Starter (SLP) | $29/mo | 3 patients actifs |
| Pro (SLP) | $39/mo | 5 patients actifs |
| Patient | Gratuit | Via code SLP |
| Solo patient | $9/mo | Sans SLP |

## Fichiers clés à connaître
- `src/lib/syllabify.ts` — algorithme syllabification anglais
- `src/lib/syllableDictionary.ts` — 3 871 mots (NE PAS écraser, seulement appender)
- `src/lib/spsUtils.ts` — zones SPS + tooltips cliniques
- `src/lib/wpmUtils.ts` — feedback coach SLP
- `src/lib/analyzeDisfluency.ts` — détection fillers anglais
- `src/data/practiceTexts.ts` — 8 textes cliniques US
- `src/data/exercises.ts` — catégories US
- `src/data/blogPosts.ts` — 5 articles SEO US
- `src/hooks/useDeepgramSPS.ts` — Deepgram en-US + fillers
- `src/components/onboarding/PatientWelcomeModal.tsx` — onboarding patient
- `src/components/pro/WelcomeTourModal.tsx` — onboarding SLP
- `supabase/functions/send-email/_templates/` — 20 templates email EN

## Contexte fondateur
Clément Pontegnier — lui-même bredouilleur, papa dans 3 mois.
parlermoinsvite.fr validé avec des orthophonistes FR enthousiastes.
Objectif US : répliquer le succès sur le marché anglophone, 0 concurrent direct identifié.
