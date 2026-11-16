export interface Reference {
  authors: string;
  year: string;
  title: string;
  /** Journal / publisher details */
  details: string;
  /** Which part of the presentation draws on it */
  usedFor: string;
}

/**
 * Foundational, verifiable references. Only well-established bibliographic
 * information is given (no page ranges), to avoid any approximation.
 */
export const bibliography: Reference[] = [
  {
    authors: 'Argyris, C. & Schön, D. A.',
    year: '1978',
    title: 'Organizational Learning: A Theory of Action Perspective',
    details: 'Reading (MA), Addison-Wesley.',
    usedFor: 'Apprentissage en simple et double boucle',
  },
  {
    authors: 'Alter, N.',
    year: '2000',
    title: "L'innovation ordinaire",
    details: 'Paris, Presses Universitaires de France.',
    usedFor: "Innovation et appropriation par les acteurs",
  },
  {
    authors: 'Bernoux, P.',
    year: '1985',
    title: 'La sociologie des organisations',
    details: 'Paris, Éditions du Seuil.',
    usedFor: 'Cadre général de la sociologie des organisations',
  },
  {
    authors: 'Coch, L. & French, J. R. P.',
    year: '1948',
    title: 'Overcoming Resistance to Change',
    details: 'Human Relations, vol. 1, n° 4.',
    usedFor: 'La participation comme levier face à la résistance',
  },
  {
    authors: 'Crozier, M. & Friedberg, E.',
    year: '1977',
    title: "L'acteur et le système",
    details: 'Paris, Éditions du Seuil.',
    usedFor: 'Acteurs, pouvoir et résistance au changement',
  },
  {
    authors: 'Lewin, K.',
    year: '1947',
    title: 'Frontiers in Group Dynamics',
    details: 'Human Relations, vol. 1, n° 1.',
    usedFor: 'Décristallisation, changement, recristallisation',
  },
  {
    authors: 'Nonaka, I. & Takeuchi, H.',
    year: '1995',
    title: 'The Knowledge-Creating Company',
    details: 'New York, Oxford University Press.',
    usedFor: 'Savoirs tacites et explicites, partage des connaissances',
  },
  {
    authors: 'Rogers, E. M.',
    year: '1962',
    title: 'Diffusion of Innovations',
    details: 'New York, Free Press (5ᵉ éd. 2003).',
    usedFor: 'Diffusion des innovations',
  },
  {
    authors: 'Schumpeter, J. A.',
    year: '1934',
    title: 'The Theory of Economic Development',
    details: 'Cambridge (MA), Harvard University Press (éd. originale allemande 1911).',
    usedFor: 'Innovation comme « nouvelles combinaisons »',
  },
  {
    authors: 'Senge, P. M.',
    year: '1990',
    title: 'The Fifth Discipline: The Art and Practice of the Learning Organization',
    details: 'New York, Doubleday / Currency.',
    usedFor: 'Organisation apprenante et cinq disciplines',
  },
];
