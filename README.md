# Le changement, l'innovation et l'apprentissage dans les organisations

Présentation immersive en 3D — **Sociologie des organisations**, École Supérieure de Technologie de Salé (EST Salé), filière Ressources Humaines.
Conçue et présentée par **Aya Yakoubi** et **Hassna Elhaddajy**.

React + TypeScript · Vite · Three.js / React Three Fiber / Drei · GSAP · Motion · Tailwind CSS · Lucide.

## Lancer la présentation

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
