
# Parcours Guide - Progression Duolingo

## Concept

Remplacer la carte "Exercice du jour" par un **parcours structure** qui guide le patient etape par etape a travers les categories, du plus simple au plus complexe. Chaque "unite" correspond a une categorie d'exercices existante. Le patient doit terminer un exercice avec un SPS dans la zone verte ("Bien" ou "Parfait") pour valider et debloquer l'unite suivante.

Le mode libre (bibliotheque complete) reste accessible via un bouton visible.

## Parcours en 8 etapes

Le parcours suit l'ordre clinique naturel des categories existantes (champ `level`) :

```text
Etape 1 : Gymnastique Articulatoire (warmup)      -- echauffement
Etape 2 : Ralentissement (slow-reading)            -- bases du controle
Etape 3 : Gestion du Souffle (breath-control)      -- respiration
Etape 4 : Vie quotidienne (daily-life)             -- transfert
Etape 5 : Defis d'articulation (articulation)      -- precision
Etape 6 : Improvisation Guidee (improvisation)     -- oral libre
Etape 7 : Pieges Cognitifs (cognitive-traps)        -- resilience
Etape 8 : Recit Resume (retelling)                 -- synthese
```

Chaque etape propose 3 exercices a valider (pris parmi ceux de la categorie). Le patient peut les faire dans l'ordre qu'il veut au sein d'une etape. Une fois les 3 valides (zone verte), l'etape suivante se debloque.

## Ce qui change sur le Dashboard

La carte "Exercice du jour" est remplacee par un **widget Parcours** :

- **Etape actuelle** mise en avant avec un bouton "Continuer" bien visible
- **Barre de progression** montrant ou le patient en est (ex: Etape 3/8, 2/3 exercices valides)
- **Etapes precedentes** cochees en vert
- **Etapes suivantes** grisees/verrouilees avec un cadenas
- **Bouton "Mode libre"** en bas du widget pour acceder a la bibliotheque complete

Visuellement, le parcours sera presente comme une **liste verticale d'etapes** avec des pastilles de couleur (vert = complete, bleu = en cours, gris = verrouille), pas un arbre complexe. Simple et lisible.

## Validation d'un exercice

Apres une session, le `SessionResultModal` verifie si le SPS moyen est dans la zone verte (ratio 0.5-1.2 de la cible, soit "Bien" ou "Parfait"). Si oui :
- L'exercice est marque comme "valide" dans la base de donnees
- Animation de celebration (deja en place avec les confettis)
- Message adapte : "Exercice valide ! Plus que X pour debloquer [nom etape suivante]"

Si le SPS n'est pas dans la zone verte :
- L'exercice n'est pas valide mais la session est quand meme enregistree
- Message encourageant : "Bel effort ! Reessayez pour valider cet exercice"

## Stockage de la progression

### Nouvelle table `journey_progress`

```sql
CREATE TABLE journey_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  step_index integer NOT NULL,        -- 0-7 (etape du parcours)
  exercise_id text NOT NULL,           -- ex: "slow-1"
  session_id uuid,                     -- reference a la session qui a valide
  validated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, step_index, exercise_id)
);
```

Avec RLS : chaque utilisateur ne voit/cree que ses propres lignes.

Un champ `current_journey_step` (integer, default 0) est ajoute a la table `profiles` pour savoir rapidement ou en est le patient sans requeter toute la table.

## Changements techniques

### 1. Nouvelle table + migration
- `journey_progress` avec RLS
- Ajout de `current_journey_step` dans `profiles`

### 2. Nouveau hook `useJourneyProgress`
- Fetch la progression depuis `journey_progress`
- Expose : etape actuelle, exercices valides par etape, % de progression global
- Methode `validateExercise(stepIndex, exerciseId, sessionId)` appelee apres une session reussie

### 3. Nouveau composant `JourneyWidget` (remplace `DailyExerciseCard`)
- Affiche le parcours avec les etapes
- Bouton "Continuer" sur l'etape en cours
- Bouton "Mode libre" vers `/library`

### 4. Configuration du parcours `src/data/journeyPath.ts`
- Definition des 8 etapes avec les 3 exercices par etape
- Reference les exercices existants dans `exercises.ts`

### 5. Mise a jour de `SessionResultModal`
- Apres une session en mode parcours, verifier si le SPS valide l'exercice
- Afficher le feedback parcours (exercice valide ou non)
- Mettre a jour `journey_progress` et `current_journey_step`

### 6. Mise a jour de `Dashboard.tsx`
- Remplacer `DailyExerciseCard` par `JourneyWidget`
- Conserver le reste du dashboard inchange

### 7. Mise a jour du routing dans `Practice.tsx`
- Ajouter un parametre `journey_step` pour savoir que la session vient du parcours
- Permettre la validation automatique en fin de session

## Fichiers crees
- `src/data/journeyPath.ts`
- `src/hooks/useJourneyProgress.ts`
- `src/components/dashboard/JourneyWidget.tsx`

## Fichiers modifies
- `src/pages/Dashboard.tsx` (swap DailyExerciseCard -> JourneyWidget)
- `src/components/practice/SessionResultModal.tsx` (logique de validation parcours)
- `src/pages/Practice.tsx` (param journey_step)
- Migration SQL (nouvelle table + colonne profiles)
