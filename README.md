# Le changement, l'innovation et l'apprentissage dans les organisations

Présentation immersive en 3D — **Sociologie des organisations**, École Supérieure de Technologie de Salé (EST Salé), filière Ressources Humaines.
Conçue et présentée par **Aya Yakoubi** et **Hassna Elhaddajy**.

React + TypeScript · Vite · Three.js / React Three Fiber / Drei · GSAP · Motion · Tailwind CSS · Lucide.

## Installation simple sur un PC Windows (sans connaissances techniques)

1. Récupérez le fichier **`installer-presentation.bat`** (par WhatsApp, clé USB, ou depuis ce dépôt GitHub).
2. Double-cliquez dessus et laissez la fenêtre ouverte (5 à 10 minutes, Internet nécessaire).
   Il installe Git et Node.js si besoin, télécharge la présentation, installe tout et la prépare.
   Si Windows affiche « Windows a protégé votre ordinateur », cliquez sur *Informations complémentaires* → *Exécuter quand même*.
3. Ensuite, à chaque fois : double-cliquez sur **`lancer-presentation`** (placé sur le Bureau).
   Il récupère la dernière version (si Internet est disponible), prépare la présentation et l'ouvre dans le navigateur.
   Gardez sa fenêtre ouverte pendant la présentation ; fermez-la pour arrêter.

La présentation est installée dans `%USERPROFILE%\Aya-Hassna-Presentation`. Après l'installation, elle fonctionne aussi hors ligne.

## Lancer la présentation (développeurs)

```bash
npm install
npm run dev        # développement : http://localhost:5173
npm run build      # version de production dans dist/
npm run preview    # tester la version de production
```

Le dossier `dist/` fonctionne hors ligne (polices incluses) : idéal pour une salle sans Internet.
Servez-le avec `npm run preview` (ou n'importe quel serveur statique) plutôt qu'en ouvrant `index.html` directement.

## Commandes pendant l'exposé

| Touche | Action |
| --- | --- |
| `→` `Espace` `Page ↓` | Étape / diapositive suivante |
| `←` `Page ↑` | Étape / diapositive précédente |
| `Début` / `Fin` | Première / dernière diapositive |
| `O` ou `Échap` | Vue d'ensemble (flèches + Entrée pour sauter) |
| `N` | Notes de présentation (panneau) |
| `P` | Vue présentateur dans une fenêtre séparée (synchronisée) |
| `F` | Plein écran |
| `B` | Écran noir |
| `M` | Activer / couper le son |
| `T` | Mode clair / sombre (mémorisé) |
| `H` / `?` | Aide |

Les télécommandes de présentation (Page ↑ / Page ↓) fonctionnent. Les diapositives n'avancent jamais toutes seules.

**Conseil projecteur :** en écran *étendu*, ouvrez la vue présentateur (`P`) sur l'ordinateur et placez la présentation en plein écran (`F`) sur le projecteur. En écran *dupliqué*, le panneau de notes (`N`) serait visible du public.

**Son :** les transitions sont sonorisées (souffle entre les diapositives, carillon à chaque révélation), générées en direct par le navigateur, sans fichier audio. Les navigateurs n'autorisent le son qu'après une première action : appuyez sur une touche ou cliquez une fois avant de commencer. Seule la fenêtre active joue le son (jamais en double avec la vue présentateur).

**Logo :** placez le logo officiel dans `public/logo-est-sale.png`. Il s'affiche sur l'ouverture et l'écran de questions ; tant que le fichier est absent, rien n'est affiché.

Chaque position a une adresse : `#/5/2` = diapositive 5, étape 2.
Ajoutez `?3d=off` à l'adresse pour forcer le mode léger sans 3D.

## Modifier le contenu

- `src/content/presentation.ts` — textes visibles, ordre des diapositives, couleurs, étapes, caméra, année universitaire.
- `src/content/speakerNotes.ts` — notes de l'oratrice pour chaque diapositive.
- `src/content/bibliography.ts` — références.

## Structure

```
src/
  components/
    presentation/   moteur, navigation, progression, vue d'ensemble, notes, vue présentateur
    3d/             canvas unique, caméra, lumière, particules, transitions
    3d/scenes/      une métaphore 3D unique par diapositive
    ui/             texte animé, révélations progressives, panneaux
  slides/           couche texte de chaque diapositive (Slide01Intro … Slide14Questions)
  content/          données (séparées de la logique)
  hooks/ animations/ lib/ styles/
```

## Performance et fiabilité

- Un seul canvas WebGL ; seule la scène active est montée (plus la sortante pendant ~1 s de transition), les ressources GPU sont libérées au démontage.
- Qualité adaptative : la résolution et le nombre de particules baissent automatiquement si la fluidité chute.
- Le module 3D est chargé à part : le texte et les commandes sont utilisables immédiatement.
- Repli automatique (fond animé en CSS) si WebGL est indisponible ou si la 3D échoue.
- `prefers-reduced-motion` est respecté (mouvements réduits, transitions courtes).

## Version PowerPoint animée (recommandée)

Fichier : `export/Presentation-EST-Sale-animee.pptx` (≈ 1 Mo, généré, non versionné dans Git).

- Aucune vidéo : chaque scène est dessinée avec des formes et icônes PowerPoint natives
  (personnes, organigramme, ampoules, arbre, cycle, zellige…), entièrement modifiables.
- Une diapositive par étape (39) ; la transition **Morph** déplace les éléments d'une étape à l'autre
  (l'organigramme devient une équipe, les ampoules dessinent une grande ampoule, l'arbre pousse…).
- ≈ 1 400 animations PowerPoint automatiques : apparitions, zooms, balayages, rotations, pulsations,
  trajectoires (flux, énergie qui circule). Aucun clic supplémentaire : chaque clic passe à l'étape suivante.
- Notes de l'oratrice dans chaque diapositive.

Régénérer (Windows, PowerPoint installé) : `npm run pptx:native`.

## Version PowerPoint avec vidéos 3D (alternative)

Fichier : `export/Presentation-EST-Sale.pptx` (≈ 130 Mo, non versionné dans Git).

- Une diapositive PowerPoint par étape de la présentation web (39 diapositives, 14 sections).
- Texte français natif et modifiable, notes de l'oratrice dans les notes de chaque diapositive.
- La 3D de chaque étape est une vidéo (MP4) en arrière-plan, lancée automatiquement et figée sur sa dernière image.
- Transitions **Morph** entre les étapes d'une même scène, fondu entre les scènes (PowerPoint 2019 / Microsoft 365 ; les versions plus anciennes affichent un fondu).

### Régénérer le fichier (Windows, PowerPoint installé)

1. Enregistrer la 3D : lancer `RECORD_SCENES=1 npx vite --port 5199`, puis ouvrir
   `http://localhost:5199/?record=1&seconds=8` dans Edge ou Chrome (fenêtre au premier plan ou en mode headless).
   Les vidéos arrivent dans `recordings/` (`&only=3` pour ne refaire qu'une diapositive).
2. `npm run pptx:scrims` (une seule fois), puis `npm run pptx`.

## Deuxième présentation : « Les 5 grands enjeux RH de 2023 » (carte conceptuelle)

Fichier : `export/Enjeux-RH-2023-carte-conceptuelle.pptx` (≈ 0,6 Mo, généré).
Contenu tiré du webinar Bleexo « Les 5 grands enjeux RH de 2023 » ; les chiffres sont ceux cités dans le webinar.
12 diapositives organisées comme une carte conceptuelle : la transition Morph zoome de la carte vers chaque branche,
avec ≈ 300 animations PowerPoint (flux lumineux le long des liens, pulsations, rotations, apparitions en cascade).

Régénérer : `npm run pptx:native` une première fois (icônes), puis `npm run pptx:enjeux`.
