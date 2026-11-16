import type { SlideId, SpeakerNote } from './types';

export const speakerNotes: Record<SlideId, SpeakerNote> = {
  intro: {
    intro:
      "Laisser l'objet lumineux apparaître quelques secondes en silence, puis avancer (Espace) : la caméra s'approche et le titre se révèle.",
    say: [
      'Bonjour à toutes et à tous. Nous sommes Aya Yakoubi et Hassna Elhaddajy, et nous allons vous présenter notre exposé de sociologie des organisations.',
      "Notre sujet : le changement, l'innovation et l'apprentissage dans les organisations.",
      "Ces trois notions sont souvent étudiées séparément. Notre objectif est de montrer qu'elles forment un même mouvement : celui d'une organisation qui évolue.",
      "Ce noyau lumineux symbolise l'organisation ; les personnes qui apparaissent autour de lui rappellent qu'une organisation, ce sont d'abord ses membres.",
    ],
    example:
      "On peut demander à la salle : « Qui a déjà vécu un changement dans un stage, un emploi ou même ici, à l'école ? » — cela ancre le sujet dans l'expérience.",
    transition: 'Commençons par une question simple… mais pas si évidente.',
    cues: ['Écran d’ouverture : objet seul, ambiance.', 'Approche caméra + titre, noms et module.'],
  },
  question: {
    intro: "Lire la question lentement, puis laisser un temps de silence (3 à 5 secondes) pour que l'auditoire réfléchisse.",
    say: [
      "À gauche, une organisation figée : une structure parfaitement ordonnée, mais immobile.",
      "À droite, une organisation évolutive : ses éléments bougent, se relient, se réorganisent.",
      "La question n'est pas de savoir laquelle est « meilleure » : toute organisation a besoin de stabilité. La question est : qu'est-ce qui permet à certaines d'évoluer quand leur environnement change ?",
      "Révéler ensuite notre fil conducteur : changer, innover, apprendre.",
    ],
    example:
      "Deux entreprises d'un même secteur face à l'arrivée du numérique : l'une forme ses équipes et adapte son organisation, l'autre attend… et perd progressivement ses clients.",
    transition: "Pour répondre, il faut d'abord comprendre ce qu'est réellement le changement organisationnel.",
    cues: ['La question et les deux mondes.', 'Révélation du fil conducteur : changer, innover, apprendre.'],
  },
  change: {
    intro: "Partir de la définition, puis insister sur la lecture sociologique : changer une organisation, c'est changer des relations entre des acteurs.",
    say: [
      'Le changement organisationnel est une transformation durable : il touche la structure, les processus, les technologies, la culture ou les comportements.',
      "En sociologie des organisations, on rappelle avec Crozier et Friedberg qu'une organisation est un système d'acteurs : changer, c'est redistribuer des règles, des marges de liberté et du pouvoir.",
      "Les causes sont externes (technologie, concurrence, lois, attentes sociales) ou internes (nouvelle stratégie, performance, compétences, attentes des salariés).",
      "Le changement peut être planifié — préparé et piloté — ou non planifié, imposé par une crise.",
      "Kurt Lewin propose trois phases : décristallisation (remettre en cause l'existant), changement (adopter de nouvelles pratiques), recristallisation (stabiliser les nouvelles pratiques).",
    ],
    example:
      "Changement planifié : une entreprise qui déploie un logiciel de gestion RH avec un calendrier et des formations. Changement non planifié : le passage brutal au travail et à l'enseignement à distance pendant la crise sanitaire de 2020.",
    transition: "Mais le changement ne se produit pas toujours au même niveau ni au même rythme. Voyons ses différentes formes.",
    cues: ['Définition + regard sociologique.', 'Facteurs externes et internes.', 'Planifié / non planifié + modèle de Lewin ; la hiérarchie devient réseau.'],
  },
  'change-types': {
    intro: "Présenter les niveaux un par un, à chaque apparition d'une strate dans la scène 3D.",
    say: [
      "Niveau individuel : une personne apprend un nouvel outil, adopte de nouvelles habitudes ou change d'attitude.",
      "Niveau du groupe : une équipe change sa façon de coopérer, de se répartir le travail ou de prendre des décisions.",
      "Niveau organisationnel : c'est l'ensemble — structure, stratégie, culture — qui se transforme.",
      "Ces niveaux sont liés : un changement organisationnel ne réussit que s'il est approprié par les groupes et les individus.",
      "Deux rythmes : incrémental, par petites améliorations dans le cadre existant ; transformationnel, une rupture qui redéfinit le fonctionnement.",
    ],
    example:
      "Incrémental : simplifier progressivement les étapes d'un processus de recrutement. Transformationnel : abandonner les dossiers papier pour un système d'information RH entièrement numérique.",
    transition: "Quel que soit le niveau, un obstacle revient toujours : la résistance au changement.",
    cues: ['Strate individuelle.', 'Strate du groupe.', 'Strate organisationnelle.', 'Rythme incrémental (petits pas).', 'Rythme transformationnel (rupture).'],
  },
  resistance: {
    intro: "Montrer le flux lumineux qui bute contre les barrières : c'est la transformation qui rencontre la résistance.",
    say: [
      "Première idée clé : la résistance n'est pas irrationnelle. Selon Crozier et Friedberg, chaque acteur défend sa marge de liberté et ses zones d'incertitude.",
      "Les causes principales : la peur de l'incertitude, le manque de communication, la peur de perdre le contrôle, le poids de la culture organisationnelle, et le manque d'implication.",
      "Chaque barrière de la scène correspond à l'une de ces causes (on peut survoler une barrière ou une cause pour la mettre en évidence).",
      "Puis révéler les leviers : la communication explique le pourquoi, la formation donne les moyens d'agir, la participation associe les salariés.",
      "L'étude classique de Coch et French (1948) a montré que les groupes associés à la conception d'un changement l'acceptaient mieux.",
    ],
    example:
      "Une administration introduit un nouvel outil de gestion des congés sans explication : rumeurs, contournements, retour au papier. La même introduction, accompagnée d'une réunion d'information, d'une formation et d'utilisateurs-relais, passe beaucoup mieux.",
    transition:
      "Lever les résistances permet au changement d'avancer. Mais pour changer, il faut aussi des solutions nouvelles : c'est le rôle de l'innovation.",
    cues: ['Le flux bloqué par cinq barrières (les causes).', 'Les leviers ouvrent les barrières : le flux passe.'],
  },
  innovation: {
    intro: "Partir de la scène : des idées dispersées. Une idée seule n'est pas encore une innovation.",
    say: [
      "L'innovation est la mise en œuvre d'une idée nouvelle — produit, méthode ou organisation — qui est adoptée et qui crée de la valeur.",
      "Schumpeter parlait de « nouvelles combinaisons » : innover, c'est souvent combiner autrement des éléments existants.",
      "La créativité produit des idées ; l'innovation les transforme en pratiques réelles. Le sociologue Norbert Alter insiste : une invention ne devient innovation que lorsqu'elle est appropriée par les acteurs.",
      "On distingue l'innovation de produit, de procédé, organisationnelle et technologique.",
    ],
    example:
      "Une idée de plateforme de formation en ligne reste une idée tant que personne ne l'utilise ; elle devient une innovation quand les salariés l'adoptent réellement dans leur parcours de formation.",
    transition: "Concrètement, qu'est-ce que l'innovation change dans la vie d'une organisation ?",
    cues: ['Idées dispersées : définition.', 'Les idées se connectent : créativité vs innovation.', 'Une nouvelle structure émerge : les quatre formes.'],
  },
  'innovation-orgs': {
    intro: "La scène montre une organisation-système : chaque plateforme est un bénéfice, irrigué par le noyau d'innovation.",
    say: [
      "Productivité : faire mieux avec les mêmes ressources.",
      "Compétitivité : se distinguer et rester pertinent face aux autres organisations.",
      "Efficacité : des processus plus simples, moins de tâches inutiles.",
      "Expérience collaborateur : de meilleurs outils et conditions de travail — un enjeu central pour les RH.",
      "Adaptabilité : réagir plus vite aux changements de l'environnement.",
      "Avec Everett Rogers, on rappelle qu'une innovation se diffuse progressivement : innovateurs, adopteurs précoces, majorité, puis retardataires. Le rôle des RH est d'accompagner cette diffusion.",
    ],
    example:
      "Dans un établissement d'enseignement, une plateforme pédagogique permet de partager les cours, de rendre des devoirs en ligne et de suivre les étudiants : gain de temps pour les enseignants, meilleure organisation pour les étudiants.",
    transition: "Mais innover ne suffit pas : encore faut-il que l'organisation apprenne de ses innovations. Passons à l'apprentissage organisationnel.",
    cues: ['Les cinq bénéfices (survol possible pour mettre en évidence une plateforme).', 'Exemples concrets + diffusion selon Rogers.'],
  },
  learning: {
    intro: "La graine qui devient arbre : l'apprentissage commence chez l'individu, puis se ramifie dans le collectif et l'organisation.",
    say: [
      "Apprentissage individuel : une personne acquiert des savoirs et des compétences.",
      "Apprentissage collectif : l'équipe partage, confronte ses expériences et construit des solutions ensemble.",
      "Apprentissage organisationnel : les savoirs sont intégrés dans les règles, les procédures, les outils et la culture — ils restent même quand les personnes partent.",
      "Les mécanismes : partage des connaissances (Nonaka et Takeuchi montrent l'importance de rendre transmissibles les savoirs tacites), retour d'expérience, amélioration continue.",
      "Argyris et Schön distinguent l'apprentissage en simple boucle (corriger l'action) et en double boucle (questionner les règles et hypothèses elles-mêmes).",
    ],
    example:
      "Simple boucle : trop d'erreurs dans les fiches de paie, on ajoute un contrôle. Double boucle : on se demande pourquoi le processus produit des erreurs et on le repense entièrement avec les équipes.",
    transition: "Certaines organisations font de cet apprentissage leur principe de fonctionnement : ce sont les organisations apprenantes.",
    cues: ['Graine : apprentissage individuel.', 'Branches : apprentissage collectif.', 'Canopée connectée : apprentissage organisationnel.', 'Le savoir circule : mécanismes.', 'Les deux boucles d’Argyris & Schön.'],
  },
  'learning-org': {
    intro: "Introduire Peter Senge et son ouvrage de 1990, The Fifth Discipline.",
    say: [
      "Pour Senge, une organisation apprenante est une organisation où les personnes développent en permanence leur capacité à apprendre ensemble.",
      "On la reconnaît à cinq traits : partage des savoirs, formation continue, collaboration, feedback et adaptabilité.",
      "Senge propose cinq disciplines : la maîtrise personnelle, les modèles mentaux, la vision partagée, l'apprentissage en équipe… et la pensée systémique.",
      "La pensée systémique est la « cinquième discipline » : elle relie toutes les autres. Dans la scène, elle est au centre et se connecte aux quatre autres.",
    ],
    example:
      "Une entreprise qui organise des retours d'expérience après chaque projet, encourage le mentorat entre anciens et nouveaux salariés, et partage une vision claire de ses objectifs, s'inscrit dans cette logique.",
    transition: "Nous avons vu le changement, l'innovation et l'apprentissage. Il est temps de montrer comment ils s'articulent.",
    cues: ['Définition + cinq traits.', 'Les quatre premières disciplines s’allument.', 'La pensée systémique relie l’ensemble.'],
  },
  relationship: {
    intro: "Scène centrale de l'exposé : avancer lentement, une connexion à la fois.",
    say: [
      "Le changement crée le besoin de s'adapter : nouvelles contraintes, nouvelles attentes.",
      "L'innovation apporte des solutions nouvelles pour répondre à ce besoin.",
      "L'apprentissage permet de comprendre ces solutions, de les améliorer et de pérenniser la transformation.",
      "Et une organisation qui a appris est capable d'aborder un nouveau changement : le cycle recommence.",
      "Ce n'est pas un cercle fermé mais une spirale : à chaque tour, l'organisation repart d'un niveau de compétence plus élevé.",
    ],
    example:
      "La digitalisation d'un service RH : le changement (dématérialisation) crée un besoin ; l'innovation (un SIRH) apporte une solution ; l'apprentissage (formation, retours d'expérience) permet de bien l'utiliser ; l'organisation est alors prête pour l'étape suivante, par exemple l'analyse des données RH.",
    transition: "Voyons maintenant comment ce cycle se manifeste dans le contexte marocain.",
    cues: ['Trois structures séparées.', 'Changement → Innovation.', 'Innovation → Apprentissage.', 'Apprentissage → Nouveau changement.', 'La spirale de l’écosystème.'],
  },
  morocco: {
    intro: "Le zellige, motif traditionnel, se transforme progressivement en réseau numérique : tradition et transformation coexistent.",
    say: [
      "Au Maroc, de nombreuses organisations — publiques et privées — engagent une transformation numérique : démarches administratives en ligne, dématérialisation des services.",
      "La stratégie nationale « Maroc Digital 2030 » fixe un cadre à cette transformation (à présenter comme un cadre général, sans chiffres non vérifiés).",
      "Côté RH : SIRH, recrutement en ligne, formation à distance. Dans l'enseignement supérieur, la crise de 2020 a accéléré l'usage des plateformes en ligne et de l'enseignement hybride.",
      "Les défis rejoignent la théorie : résistance aux nouvelles technologies, déficit de compétences numériques, cultures parfois très hiérarchiques, communication insuffisante, et besoin de formation et d'implication.",
      "Conclusion de la diapositive : la technologie ne suffit pas, c'est l'accompagnement humain qui fait la réussite.",
    ],
    example:
      "Exemple vécu à l'EST : le passage aux cours à distance en 2020 a demandé aux enseignants et aux étudiants d'apprendre de nouveaux outils très rapidement — un changement non planifié, une innovation pédagogique et un apprentissage collectif.",
    transition: "Il est temps de rassembler toutes ces idées.",
    cues: ['Exemples d’évolutions.', 'Les défis.'],
  },
  conclusion: {
    intro: "Les éléments des scènes précédentes convergent en une seule structure : c'est le message de la conclusion.",
    say: [
      "Le changement, c'est évoluer et s'adapter.",
      "L'innovation, c'est créer de nouvelles solutions.",
      "L'apprentissage, c'est développer les connaissances et les compétences.",
      "Ensemble, ils forment la capacité d'une organisation à durer : une organisation qui apprend est une organisation qui évolue.",
      "Poser la question finale et laisser un temps de réflexion, puis remercier.",
    ],
    example:
      "Pour un futur professionnel des RH, cela signifie : accompagner le changement, encourager l'innovation et organiser l'apprentissage — formation, partage, retour d'expérience.",
    transition: 'Merci pour votre attention. Nous laissons à l’écran nos références, puis place à vos questions.',
    cues: ['Phrase-clé et synthèse des trois concepts.', 'Question finale.', 'Remerciements.'],
  },
  bibliography: {
    intro: "Présenter rapidement les auteurs fondateurs mobilisés dans l'exposé.",
    say: [
      "Lewin pour le changement, Crozier et Friedberg pour l'analyse sociologique des acteurs, Rogers et Alter pour l'innovation, Argyris et Schön, Nonaka et Takeuchi, et Senge pour l'apprentissage.",
    ],
    example: 'Inviter les étudiants intéressés à consulter L’acteur et le système (Crozier & Friedberg), très accessible en français.',
    transition: 'Place maintenant à vos questions.',
  },
  questions: {
    intro: 'Laisser cet écran pendant les échanges.',
    say: [
      "Remercier à nouveau le professeur et les camarades.",
      "Pistes de questions possibles : la résistance au changement est-elle toujours négative ? Peut-on innover sans changer ? Comment mesurer l'apprentissage organisationnel ?",
    ],
    example:
      "Si une question porte sur la résistance : rappeler qu'elle peut être utile — elle signale souvent un problème réel dans le projet de changement.",
    transition: 'Fin de la présentation.',
  },
};
