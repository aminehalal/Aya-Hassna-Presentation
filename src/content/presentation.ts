import type { LabeledText, SlideMeta } from './types';

/* ------------------------------------------------------------------ */
/*  General information                                                */
/* ------------------------------------------------------------------ */

export const presentationInfo = {
  title: "Le changement, l'innovation et l'apprentissage dans les organisations",
  shortTitle: "Le changement, l'innovation et l'apprentissage",
  subtitle: "Comprendre comment les organisations évoluent, s'adaptent et se transforment.",
  module: 'Sociologie des organisations',
  institution: 'École Supérieure de Technologie de Salé',
  institutionShort: 'EST Salé',
  /** Official logo, served from public/. Drop the file there; nothing is shown while it is missing. */
  logo: '/logo-est-sale.png',
  field: 'Ressources Humaines',
  country: 'Maroc',
  academicYear: 'Année universitaire 2026 – 2027',
  presenters: ['Aya Yakoubi', 'Hassna Elhaddajy'],
};

/* ------------------------------------------------------------------ */
/*  Slide metadata (order = presentation order)                        */
/* ------------------------------------------------------------------ */

export const slides: SlideMeta[] = [
  {
    id: 'intro',
    kicker: 'Ouverture',
    title: "Le changement, l'innovation et l'apprentissage",
    overview: 'Un noyau lumineux sort de l’obscurité.',
    accent: '#7b8cff',
    steps: 2,
    soundCues: { 1: { duration: 1.8 } },
    camera: [
      { position: [0, 0, 17], target: [0, 0, 0] },
      { position: [-4.3, 0.25, 12.6], target: [-4.3, 0, 0] },
    ],
  },
  {
    id: 'question',
    kicker: '02 — Question introductive',
    title: 'Pourquoi certaines organisations évoluent-elles ?',
    overview: 'Deux mondes : l’un figé, l’autre en mouvement.',
    accent: '#45e0ff',
    steps: 2,
    soundCues: { 1: { duration: 1.6 } },
    camera: [
      { position: [0, 0.4, 12.5], target: [0, -0.6, 0] },
      { position: [0, 0.2, 11.5], target: [0, -0.6, 0] },
    ],
  },
  {
    id: 'change',
    kicker: '03 — Le changement organisationnel',
    title: 'Comprendre le changement',
    overview: 'Une hiérarchie rigide devient un réseau souple.',
    accent: '#4f8cff',
    steps: 3,
    soundCues: { 1: { duration: 1.2 }, 2: { duration: 2.4 } },
    camera: [
      { position: [0, 0.2, 11], target: [0, 0, 0] },
      { position: [0.4, 0.4, 11.5], target: [0, 0, 0] },
      { position: [0.8, 2.9, 10.6], target: [0.4, -0.5, 0] },
    ],
  },
  {
    id: 'change-types',
    kicker: '04 — Formes et niveaux',
    title: 'Les formes et les niveaux du changement',
    overview: 'Trois strates : individu, groupe, organisation.',
    accent: '#6aa8ff',
    steps: 5,
    soundCues: { 1: { duration: 1.4 }, 2: { duration: 1.4 }, 3: { duration: 2.6, hits: [0.05, 1.3, 2.6] }, 4: { duration: 2.2 } },
    camera: [
      { position: [0, 3.2, 11], target: [0, 0, 0] },
      { position: [0, 3.2, 11], target: [0, 0, 0] },
      { position: [0, 3.4, 11.5], target: [0, -0.2, 0] },
      { position: [0.6, 2.6, 11], target: [0.2, 0, 0] },
      { position: [-0.4, 4, 11.5], target: [0.2, 0, 0] },
    ],
  },
  {
    id: 'resistance',
    kicker: '05 — La résistance au changement',
    title: 'La résistance au changement',
    overview: 'Un flux de transformation bute sur des barrières.',
    accent: '#ff8a6b',
    steps: 2,
    soundCues: { 1: { duration: 2.6, hits: [0.5, 0.72, 0.94, 1.16, 1.38] } },
    camera: [
      { position: [0, 0, 11], target: [0, 0, 0] },
      { position: [0, 0, 11], target: [0, 0, 0] },
    ],
  },
  {
    id: 'innovation',
    kicker: "06 — L'innovation",
    title: "Comprendre l'innovation",
    overview: 'Des idées dispersées se relient en une structure.',
    accent: '#a98bff',
    steps: 3,
    soundCues: { 1: { duration: 1.6 }, 2: { duration: 2.6 } },
    camera: [
      { position: [0, 0, 11.5], target: [0, 0, 0] },
      { position: [0.3, 0.3, 11], target: [0, 0, 0] },
      { position: [0.5, 0.6, 10.2], target: [0.2, 0, 0] },
    ],
  },
  {
    id: 'innovation-orgs',
    kicker: "07 — L'innovation en action",
    title: "L'innovation dans les organisations",
    overview: 'Une organisation-système, irriguée par l’innovation.',
    accent: '#8f7bff',
    steps: 2,
    soundCues: { 1: { duration: 1.4 } },
    camera: [
      { position: [0, 4.6, 10.4], target: [0, -0.2, 0] },
      { position: [0.8, 5.2, 10.8], target: [0.5, -0.4, 0] },
    ],
  },
  {
    id: 'learning',
    kicker: "08 — L'apprentissage organisationnel",
    title: "Comprendre l'apprentissage organisationnel",
    overview: 'Un arbre de savoirs qui pousse et se ramifie.',
    accent: '#3fe0c5',
    steps: 5,
    soundCues: { 1: { duration: 2.6 }, 2: { duration: 2.6 }, 3: { duration: 1.4 }, 4: { duration: 1.8 } },
    camera: [
      { position: [0, -0.6, 10.5], target: [0, -0.8, 0] },
      { position: [0, 0, 11.2], target: [0, 0, 0] },
      { position: [0, 0.6, 12], target: [0, 0.4, 0] },
      { position: [0.6, 0.6, 11.5], target: [0.2, 0.4, 0] },
      { position: [-0.4, 1.4, 12.5], target: [0.2, 0.4, 0] },
    ],
  },
  {
    id: 'learning-org',
    kicker: "09 — L'organisation apprenante",
    title: 'Les organisations apprenantes',
    overview: 'Les cinq disciplines de Peter Senge.',
    accent: '#45e0ff',
    steps: 3,
    soundCues: { 1: { duration: 1.4 }, 2: { duration: 1.6 } },
    camera: [
      { position: [0, 0, 12], target: [0, 0, 0] },
      { position: [0.4, 0.6, 11], target: [0.2, 0, 0] },
      { position: [0.6, 1.6, 10], target: [0.3, 0, 0] },
    ],
  },
  {
    id: 'relationship',
    kicker: '10 — Le lien entre les trois concepts',
    title: 'Changement → Innovation → Apprentissage',
    overview: 'Trois structures se relient en un écosystème.',
    accent: '#7ad7ff',
    steps: 5,
    soundCues: { 1: { duration: 1.6 }, 2: { duration: 1.6 }, 3: { duration: 1.6 }, 4: { duration: 3, hits: [0.05, 1, 2, 3] } },
    camera: [
      { position: [0, 1.2, 12], target: [0, 0, 0] },
      { position: [0.4, 1.4, 11.5], target: [0, 0, 0] },
      { position: [0.6, 1.8, 11.2], target: [0, 0, 0] },
      { position: [0.2, 2.2, 11], target: [0, 0.2, 0] },
      { position: [0, 4.4, 13.5], target: [0, 0.8, 0] },
    ],
  },
  {
    id: 'morocco',
    kicker: '11 — Application au contexte marocain',
    title: 'Le contexte marocain',
    overview: 'Un zellige qui se transforme en réseau numérique.',
    accent: '#ffb86b',
    steps: 2,
    soundCues: { 1: { duration: 2.4 } },
    camera: [
      { position: [0, 3, 10.5], target: [0, -0.8, 0] },
      { position: [1.2, 4.2, 9.4], target: [0.6, -1, 0] },
    ],
  },
  {
    id: 'conclusion',
    kicker: '12 — Conclusion',
    title: 'Une organisation qui apprend est une organisation qui évolue',
    overview: 'Tous les éléments convergent en une seule harmonie.',
    accent: '#9fb6ff',
    steps: 3,
    soundCues: { 1: { duration: 1.8 }, 2: { duration: 2.4, hits: [0.05, 0.8, 1.6, 2.4] } },
    camera: [
      { position: [0, 0.2, 11.5], target: [0, 0, 0] },
      { position: [0, 0.4, 12.5], target: [0, 0.2, 0] },
      { position: [0, 0.2, 9.2], target: [0, 0, 0] },
    ],
  },
  {
    id: 'bibliography',
    kicker: 'Références',
    title: 'Bibliographie',
    overview: 'Les sources académiques mobilisées.',
    accent: '#9aa8d6',
    steps: 1,
    camera: [{ position: [0, 0, 12], target: [0, 0, 0] }],
  },
  {
    id: 'questions',
    kicker: 'Échanges',
    title: 'Questions & échanges',
    overview: 'Place au dialogue.',
    accent: '#7b8cff',
    steps: 1,
    camera: [{ position: [0, 0, 11], target: [0, 0, 0] }],
  },
];

export const totalSlides = slides.length;

export const slideIndexById = Object.fromEntries(slides.map((s, i) => [s.id, i])) as Record<
  SlideMeta['id'],
  number
>;

/* ------------------------------------------------------------------ */
/*  Visible slide content                                              */
/* ------------------------------------------------------------------ */

export const questionContent = {
  question: "Pourquoi certaines organisations évoluent-elles tandis que d'autres résistent au changement ?",
  rigid: {
    label: 'Organisation figée',
    text: 'Règles immuables, cloisonnement, peur de l’incertitude.',
  },
  dynamic: {
    label: 'Organisation évolutive',
    text: 'Structure souple, ouverture, apprentissage continu.',
  },
  hypothesisLead: 'Notre fil conducteur : tout se joue dans l’articulation de trois dynamiques.',
  hypothesis: ['Changer', 'Innover', 'Apprendre'],
};

export const changeContent = {
  title: 'Comprendre le changement',
  definition: {
    label: 'Définition',
    text: "Le changement organisationnel désigne une transformation durable de la structure, des processus, des technologies, de la culture ou des comportements d'une organisation.",
    sociology:
      'Pour la sociologie des organisations, changer, c’est aussi transformer les relations entre les acteurs : les règles, le pouvoir, la coopération.',
  },
  factors: {
    label: 'Pourquoi les organisations changent-elles ?',
    external: {
      label: 'Facteurs externes',
      items: ['Évolutions technologiques', 'Concurrence et marché', 'Lois et réglementations', 'Attentes de la société'],
    },
    internal: {
      label: 'Facteurs internes',
      items: ['Nouvelle stratégie ou direction', 'Problèmes de performance', 'Évolution des compétences', 'Attentes des salariés'],
    },
  },
  planned: {
    label: 'Planifié ou subi ?',
    items: [
      {
        label: 'Changement planifié',
        text: 'Décidé, préparé et piloté. Ex. : déployer un nouveau logiciel de gestion RH.',
      },
      {
        label: 'Changement non planifié',
        text: 'Imposé par l’environnement ou une crise. Ex. : le passage brutal au travail à distance en 2020.',
      },
    ] satisfies LabeledText[],
    lewinLabel: 'Le modèle de Kurt Lewin',
    lewin: ['Décristallisation', 'Changement', 'Recristallisation'],
  },
};

export const changeTypesContent = {
  title: 'Les formes et les niveaux du changement',
  levelsLabel: 'Trois niveaux',
  levels: [
    { label: 'Individuel', text: 'De nouvelles compétences, habitudes et attitudes.' },
    { label: 'Groupe', text: 'De nouvelles façons de coopérer, de communiquer et de décider.' },
    { label: 'Organisationnel', text: 'La structure, la stratégie et la culture se transforment.' },
  ] satisfies LabeledText[],
  natureLabel: 'Deux rythmes',
  nature: [
    {
      label: 'Incrémental',
      text: 'Des ajustements progressifs, dans le cadre existant. Ex. : améliorer pas à pas le processus de recrutement.',
    },
    {
      label: 'Transformationnel',
      text: 'Une rupture qui redéfinit le fonctionnement. Ex. : passer d’une gestion papier à un SIRH entièrement numérique.',
    },
  ] satisfies LabeledText[],
};

export const resistanceContent = {
  title: 'Pourquoi résiste-t-on ?',
  lead: 'La résistance n’est pas irrationnelle : chacun protège ses repères et sa marge de liberté.',
  leadSource: 'Crozier & Friedberg, 1977',
  causes: [
    { label: 'Peur de l’incertitude', text: '« Que va-t-il m’arriver ? »' },
    { label: 'Manque de communication', text: 'Rumeurs et méfiance' },
    { label: 'Peur de perdre le contrôle', text: 'Pouvoir, statut, autonomie' },
    { label: 'Culture organisationnelle', text: '« On a toujours fait ainsi »' },
    { label: 'Manque d’implication', text: 'Un changement imposé d’en haut' },
  ] satisfies LabeledText[],
  leversLabel: 'Les leviers',
  levers: [
    { label: 'Communication', text: 'expliquer le pourquoi' },
    { label: 'Formation', text: 'donner les moyens d’agir' },
    { label: 'Participation', text: 'associer les salariés' },
  ] satisfies LabeledText[],
};

export const innovationContent = {
  title: "Comprendre l'innovation",
  definition: {
    label: 'Définition',
    text: 'L’innovation est la mise en œuvre d’une idée nouvelle — un produit, une méthode ou une organisation — qui est adoptée et qui crée de la valeur.',
    source: 'Schumpeter parlait déjà de « nouvelles combinaisons ».',
  },
  creativity: {
    label: 'Créativité ≠ innovation',
    items: [
      { label: 'Créativité', text: 'Produire des idées nouvelles.' },
      { label: 'Innovation', text: 'Transformer ces idées en pratiques réelles, adoptées par les acteurs.' },
    ] satisfies LabeledText[],
    note: 'Une invention ne devient innovation que lorsqu’elle est appropriée par les acteurs (N. Alter).',
  },
  types: {
    label: "Quatre formes d'innovation",
    items: [
      { label: 'Produit', text: 'Un nouveau bien ou service. Ex. : une application pour les usagers.' },
      { label: 'Procédé', text: 'Une nouvelle façon de produire. Ex. : automatiser la paie.' },
      { label: 'Organisationnelle', text: 'Une nouvelle organisation du travail. Ex. : le mode projet.' },
      { label: 'Technologique', text: 'L’intégration d’une technologie. Ex. : des outils d’IA.' },
    ] satisfies LabeledText[],
  },
};

export const innovationOrgsContent = {
  title: "Ce que l'innovation change dans les organisations",
  benefits: [
    { label: 'Productivité', text: 'faire mieux avec les mêmes ressources' },
    { label: 'Compétitivité', text: 'se distinguer et rester pertinent' },
    { label: 'Efficacité organisationnelle', text: 'des processus plus simples et plus rapides' },
    { label: 'Expérience collaborateur', text: 'de meilleurs outils et conditions de travail' },
    { label: 'Adaptabilité', text: 'réagir plus vite aux évolutions' },
  ] satisfies LabeledText[],
  examplesLabel: 'Exemples concrets',
  examples: [
    { label: 'En entreprise', text: 'Dématérialisation des documents, outils collaboratifs, automatisation des tâches répétitives.' },
    { label: 'Dans la fonction RH', text: 'Recrutement en ligne, SIRH, formation à distance (e-learning).' },
    { label: 'Dans l’enseignement', text: 'Plateformes pédagogiques, cours hybrides, espaces numériques de travail.' },
  ] satisfies LabeledText[],
  rogers: 'Une innovation ne s’impose pas : elle se diffuse progressivement dans un groupe social.',
  rogersSource: 'E. Rogers, 1962',
};

export const learningContent = {
  title: 'Comment une organisation apprend',
  levelsLabel: 'Trois niveaux d’apprentissage',
  levels: [
    { label: 'Individuel', text: 'Chaque personne acquiert des savoirs et des compétences.' },
    { label: 'Collectif', text: 'L’équipe partage, confronte et construit ensemble.' },
    { label: 'Organisationnel', text: 'Les savoirs s’inscrivent dans les règles, les outils et la culture : ils survivent aux départs.' },
  ] satisfies LabeledText[],
  mechanismsLabel: 'Les mécanismes',
  mechanisms: [
    { label: 'Partage des connaissances', text: 'Rendre transmissibles les savoirs tacites.' },
    { label: 'Retour d’expérience', text: 'Apprendre des réussites comme des erreurs.' },
    { label: 'Amélioration continue', text: 'Ajuster les pratiques en permanence.' },
  ] satisfies LabeledText[],
  loopsLabel: 'Argyris & Schön (1978)',
  loops: [
    { label: 'Simple boucle', text: 'On corrige l’action sans remettre en cause les règles.' },
    { label: 'Double boucle', text: 'On questionne les normes et les hypothèses qui guident l’action.' },
  ] satisfies LabeledText[],
};

export const learningOrgContent = {
  title: "L'organisation apprenante",
  definition:
    'Une organisation où chacun développe en permanence sa capacité à apprendre — individuellement et surtout collectivement.',
  definitionSource: "d'après Peter Senge, The Fifth Discipline (1990)",
  traits: ['Partage des savoirs', 'Formation continue', 'Collaboration', 'Feedback', 'Adaptabilité'],
  disciplinesLabel: 'Les cinq disciplines de Peter Senge',
  disciplines: [
    { label: 'Maîtrise personnelle', text: 'développer ses compétences, clarifier ses objectifs' },
    { label: 'Modèles mentaux', text: 'prendre conscience de nos représentations' },
    { label: 'Vision partagée', text: 'construire ensemble un projet commun' },
    { label: 'Apprentissage en équipe', text: 'dialoguer et penser ensemble' },
    { label: 'Pensée systémique', text: 'voir les interdépendances' },
  ] satisfies LabeledText[],
  systemsNote: 'La cinquième discipline relie toutes les autres : sans vision d’ensemble, les efforts restent isolés.',
};

export const relationshipContent = {
  title: 'Un cycle, pas trois notions isolées',
  cycle: [
    { label: 'Changement', text: 'crée le besoin de s’adapter.' },
    { label: 'Innovation', text: 'apporte de nouvelles solutions.' },
    { label: 'Apprentissage', text: 'permet de comprendre, d’améliorer et de pérenniser la transformation.' },
    { label: 'Nouveau changement', text: 'l’organisation, enrichie, peut évoluer à nouveau.' },
  ] satisfies LabeledText[],
  synthesis: 'Une spirale plutôt qu’un cercle : chaque cycle repart d’un niveau de compétence plus élevé.',
};

export const moroccoContent = {
  title: 'Le Maroc en transformation',
  examplesLabel: 'Des évolutions visibles',
  examples: [
    { label: 'Administration', text: 'Démarches en ligne et dématérialisation des services.' },
    { label: 'Ressources humaines', text: 'SIRH, recrutement en ligne, formation à distance.' },
    { label: 'Compétences', text: 'Former les salariés aux nouveaux outils numériques.' },
    { label: 'Enseignement', text: 'Plateformes en ligne et enseignement hybride, accélérés depuis 2020.' },
    { label: 'Méthodes de travail', text: 'Mode projet, outils collaboratifs, travail à distance partiel.' },
  ] satisfies LabeledText[],
  challengesLabel: 'Les défis',
  challenges: [
    { label: 'Résistance aux technologies', text: 'Appréhension face aux nouveaux outils.' },
    { label: 'Déficit de compétences', text: 'Des besoins de formation numérique importants.' },
    { label: 'Culture organisationnelle', text: 'Des fonctionnements parfois très hiérarchiques.' },
    { label: 'Communication', text: 'Des changements insuffisamment expliqués.' },
    { label: 'Formation & implication', text: 'Associer les salariés dès le départ.' },
  ] satisfies LabeledText[],
  takeaway: 'La technologie seule ne suffit pas : la réussite dépend des personnes et de l’accompagnement.',
};

export const conclusionContent = {
  title: 'Une organisation qui apprend est une organisation qui évolue.',
  summary: [
    { label: 'Le changement', text: 'évoluer et s’adapter.' },
    { label: "L'innovation", text: 'créer de nouvelles solutions.' },
    { label: "L'apprentissage", text: 'développer les connaissances et les compétences.' },
  ] satisfies LabeledText[],
  finalQuestion: "Comment construire une organisation capable d'apprendre, d'innover et de s'adapter en permanence ?",
  thanks: 'Merci pour votre attention.',
};

export const questionsContent = {
  title: 'Questions & échanges',
  lead: 'Vos questions, vos exemples, vos expériences.',
  creditsLabel: 'Présentation conçue et présentée par',
};
