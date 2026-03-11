# TalkSlower — Dossier Projet Complet
> Dernière mise à jour : Mars 2026
> À lire en début de chaque session Claude

---

## 1. Contexte fondateur

**Clément Pontegnier** — lui-même bredouilleur depuis l'enfance, papa dans 3 mois.
A créé **parlermoinsvite.fr** — SaaS FR de thérapie du bredouillement sur Lovable.
Validé avec des orthophonistes français enthousiastes.

**Décision stratégique :** répliquer sur le marché américain avec une codebase séparée — pas de fork i18n, un repo indépendant ciblant les SLPs (Speech-Language Pathologists) américains.
Zéro concurrent direct identifié sur le marché US au moment du lancement.

---

## 2. Analyse marché US (réalisée)

- **Marché** : $5.2B, 218 000+ SLPs aux USA
- **Cible principale** : SLPs en cabinet privé ou clinique ambulatoire (~19% des SLPs)
- **Cible secondaire** : patients adultes/ados sans SLP (solo)
- **Certifications clés** : ASHA (American Speech-Language-Hearing Association)
- **Outils que les SLPs utilisent déjà** : SimplePractice, TheraPlatform, TheraNest
- **Documentation** : SOAP notes, CPT code 92507 pour billing assurance
- **Télépratique** : mainstream post-COVID, beaucoup de SLPs 100% online
- **Verdict** : GO 🟢

---

## 3. Le produit — TalkSlower

### Ce que c'est
App web SaaS de thérapie du bredouillement (cluttering) pour le marché US.
Mesure le débit de parole en temps réel (Syllables Per Second) via Deepgram.
Permet aux SLPs de suivre leurs patients à distance entre les séances.

### Stack technique
- React 18 + TypeScript + Vite
- Supabase (BDD + Auth + Edge Functions)
- Stripe (abonnements)
- Deepgram Nova-2 (transcription temps réel, `language=en-US`)
- Shadcn UI + Framer Motion + Tailwind CSS
- wavesurfer.js, @react-pdf/renderer

### Architecture business
- **B2B** : SLPs paient, patients accèdent gratuitement via Pro Code
- **B2C** : patients solo sans SLP à $9/mo

### Algorithme SPS
Van Zaalen (2009) Articulation Rate — silences exclus du dénominateur.
Standard clinique reconnu par l'ASHA.

---

## 4. Pricing

| Plan | Prix | Pour qui | Stripe Price ID |
|------|------|----------|----------------|
| Starter | $29/mo | SLP — 3 patients actifs | `price_1T6vACB2RQKSq514l8s2xu23` |
| Pro | $39/mo | SLP — 5 patients actifs | `price_1T6vBUB2RQKSq5141IVOBeTd` |
| Solo Patient | $9/mo | Patient sans SLP | `price_1T6vC8B2RQKSq514G4qEhff9` |
| Patient via SLP | Gratuit | Patient lié à un SLP | — |

---

## 5. Infrastructure

### Domaine
- **En cours de décision** entre : `speakslower.com`, `cluttering.app`, `talkslower.com`
- À acheter sur **OVH**
- `cluttering.com` → pris
- Note : "clutter" en anglais familier = bordel → `speakslower.com` favori

### Frontend
- **Hébergement** : Vercel (free tier, CDN US)
- **Repo GitHub** : `https://github.com/clpo518/talkslower-`
- **Dossier local** : `C:\Users\cleme\Downloads\cluttering`

### Backend Supabase
- **Projet** : `talkslower` — ID `butdaaniqckgfsofdket`
- **URL** : `https://butdaaniqckgfsofdket.supabase.co`
- **Région** : US East (North Virginia) ✅ HIPAA-conscious
- **Plan** : Free tier + cron job anti-pause → Pro à $25/mo au 1er client payant
- **Migrations appliquées** : 34 fichiers SQL ✅
- **Edge Functions déployées** : 12 ✅

### Secrets Supabase configurés
| Secret | Statut |
|--------|--------|
| `SUPABASE_ANON_KEY` | ✅ Auto |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Auto |
| `DEEPGRAM_API_KEY` | ✅ |
| `RESEND_API_KEY` | ✅ |
| `STRIPE_SECRET_KEY` | ✅ |
| `STRIPE_WEBHOOK_SECRET` | ✅ |
| `STRIPE_PRICE_ID_ESSENTIEL` | ✅ ($29 Starter) |
| `STRIPE_PRICE_ID_EXPERT` | ✅ ($39 Pro) |
| `STRIPE_PRICE_ID_B2C` | ✅ ($9 Solo) |

### Stripe
- **Webhook URL** : `https://butdaaniqckgfsofdket.supabase.co/functions/v1/stripe-webhook`
- **Events** : subscription.created/updated/deleted, invoice.payment_succeeded/failed
- **Produits** :
  - Starter : `prod_U55Kg9Ld7tCDFd`
  - Pro : `prod_U55MryL5QMrljn`
  - Solo : `prod_U55MN0Wvx69QQI`

### Emails (Resend)
- Compte Resend existant (partagé avec parlermoinsvite.fr pour l'instant)
- From : `noreply@talkslower.com` (déjà dans le code)
- À faire : vérifier le domaine talkslower.com dans Resend une fois OVH configuré

---

## 6. Adaptations cliniques US réalisées

### Algorithme & métriques
- `useDeepgramSPS.ts` : `language=en-US` ✅
- `spsUtils.ts` : zones SPS cliniques US
  - < 3.0 SPS → Slow — Target Zone (vert)
  - 3.0–4.5 SPS → Conversational (vert)
  - 4.5–5.5 SPS → Fast — Monitor (orange)
  - \> 5.5 SPS → Cluttering Range (rouge)
- `analyzeDisfluency.ts` : fillers anglais (um, uh, like, you know, i mean, kind of, sort of...)

### Contenu clinique
- `syllabify.ts` : réécriture complète pour l'anglais américain ✅
- `syllableDictionary.ts` : **3 871 mots** anglais + conjugaisons + termes cliniques ✅
- `practiceTexts.ts` : 8 textes cliniques US (Warm-Up, Daily Conversation, At Work, Storytelling, Phone Call, Complex Ideas, Emotional, Articulation Challenge) ✅
- `exercises.ts` : catégories US (Rate Reduction, Phrasing & Pausing, Over-Articulation, Self-Monitoring, Reading Aloud, Conversational Practice...) ✅
- `wpmUtils.ts` : feedback coach type SLP ("Give yourself a speeding ticket", "Try the phrasing technique"...) ✅

### Marketing & SEO
- `blogPosts.ts` : 5 articles SEO US ciblant les SLPs
  1. "What Is Cluttering? A Guide for SLPs"
  2. "How to Measure Speech Rate in Cluttering Therapy"
  3. "Cluttering vs. Stuttering: Key Differences for Clinicians"
  4. "Home Practice Strategies for Cluttering Clients"
  5. "ASHA Guidelines for Cluttering: What SLPs Need to Know"
- Landing : témoignages `CCC-SLP`, mentions ASHA, Van Zaalen 2009 ✅
- FAQ HIPAA sur la page Pricing ✅

### Onboarding
- SLP (`WelcomeTourModal`) : 6 slides, mentions SPS/syllabic rate, Pro Code flow ✅
- Patient (`PatientWelcomeModal`) : 6 slides, ton encourageant, "Your SLP follows along" ✅

### Emails
- 20 templates traduits en anglais ✅
- From : `TalkSlower <noreply@talkslower.com>` ✅
- `newsletter-ortho-v1.tsx` renommé en `newsletter-slp-v1.tsx` ✅

---

## 7. Ce qui reste à faire

### Priorité 1 — Pour être live
- [ ] Choisir et acheter le domaine (speakslower.com ? cluttering.app ? talkslower.com ?)
- [ ] Configurer Vercel : connecter repo GitHub → custom domain
- [ ] Configurer DNS sur OVH → Vercel
- [ ] Vérifier domaine sur Resend (SPF, DKIM, DMARC)
- [ ] Configurer cron job anti-pause Supabase (cron-job.org, ping toutes les 72h)

### Priorité 2 — Avant premier client
- [ ] Tester le flow complet : signup SLP → Pro Code → signup patient → session → paiement
- [ ] Vérifier Stripe en mode live (pas test)
- [ ] Tester les emails transactionnels (welcome, inactivity, weekly report)

### Priorité 3 — Marketing
- [ ] Plan de lancement US (outreach SLPs, ASHA community, Reddit r/slp)
- [ ] Profil LinkedIn TalkSlower
- [ ] Email d'outreach pour premiers SLPs américains

---

## 8. Fichiers clés du repo

| Fichier | Rôle |
|---------|------|
| `src/lib/syllabify.ts` | Algorithme syllabification anglais |
| `src/lib/syllableDictionary.ts` | 3 871 mots (ne jamais écraser, append seulement) |
| `src/lib/spsUtils.ts` | Zones SPS + tooltips cliniques |
| `src/lib/wpmUtils.ts` | Feedback coach SLP |
| `src/lib/analyzeDisfluency.ts` | Détection fillers anglais |
| `src/data/practiceTexts.ts` | 8 textes cliniques US |
| `src/data/exercises.ts` | Catégories US |
| `src/data/blogPosts.ts` | 5 articles SEO US |
| `src/hooks/useDeepgramSPS.ts` | Deepgram en-US + fillers |
| `src/components/onboarding/PatientWelcomeModal.tsx` | Onboarding patient |
| `src/components/pro/WelcomeTourModal.tsx` | Onboarding SLP |
| `supabase/functions/send-email/_templates/` | 20 templates email EN |
| `TALKSLOWER_CONTEXT.md` | Contexte court pour Claude Code |
| `TALKSLOWER_MASTER.md` | Ce fichier — dossier complet |

---

## 9. Commandes utiles

```bash
# Aller dans le bon dossier (toujours faire ça en premier)
cd C:\Users\cleme\Downloads\cluttering

# Push des modifications
git add -A
git commit -m "description"
git push

# Déployer une edge function
npx supabase functions deploy nom-de-la-fonction --project-ref butdaaniqckgfsofdket

# Appliquer les migrations
npx supabase db push --project-ref butdaaniqckgfsofdket
```

---

## 10. Décisions prises (ne pas revenir dessus)

- ✅ Codebase séparée (pas de fork i18n)
- ✅ Supabase free tier au départ + cron job anti-pause
- ✅ Vercel pour le frontend
- ✅ OVH pour le domaine uniquement
- ✅ Pas de stockage audio (Deepgram temps réel) → HIPAA-conscious sans BAA
- ✅ Pricing mensuel uniquement (pas d'annuel pour l'instant)
- ✅ Compte Stripe partagé avec parlermoinsvite.fr (produits séparés)
- ✅ Compte Resend partagé (domaine talkslower.com à vérifier)
