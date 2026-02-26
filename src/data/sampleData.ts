import { FamilyMember, Relationship, EmotionalLink, Union } from '@/types/genogram';

export const SAMPLE_MEMBERS: FamilyMember[] = [
  // ── Génération 0 (Grands-parents) ──
  {
    id: 'gp-m', firstName: 'Robert', lastName: 'Duval',
    birthYear: 1940, deathYear: 2015, age: 75, profession: 'Instituteur',
    gender: 'male', x: 0, y: 0, pathologies: ['cardiovascular'],
  },
  {
    id: 'gp-f', firstName: 'Jeanne', lastName: 'Martin',
    birthYear: 1942, age: 83, profession: 'Infirmière',
    gender: 'female', x: 300, y: 0, pathologies: [],
  },

  // ── Génération 1 (Parents — 3 enfants) ──
  {
    id: 'p1', firstName: 'Michel', lastName: 'Duval',
    birthYear: 1965, age: 60, profession: 'Architecte',
    gender: 'male', x: 0, y: 350, pathologies: [],
  },
  {
    id: 'p1-w', firstName: 'Claire', lastName: 'Berger',
    birthYear: 1967, age: 58, profession: 'Avocate',
    gender: 'female', x: 250, y: 350, pathologies: ['depression'],
  },
  {
    id: 'p2', firstName: 'Anne', lastName: 'Duval',
    birthYear: 1968, age: 57, profession: 'Médecin',
    gender: 'female', x: 500, y: 350, pathologies: [],
  },
  {
    id: 'p2-h', firstName: 'Laurent', lastName: 'Petit',
    birthYear: 1966, age: 59, profession: 'Ingénieur',
    gender: 'male', x: 750, y: 350, pathologies: ['diabetes'],
  },
  {
    id: 'p3', firstName: 'Pierre', lastName: 'Duval',
    birthYear: 1972, age: 53, profession: 'Professeur',
    gender: 'male', x: 1000, y: 350, pathologies: ['addiction'],
  },

  // ── Génération 2 (Petits-enfants — 3 enfants de Michel, 2 d'Anne) ──
  {
    id: 'c1', firstName: 'Emma', lastName: 'Duval',
    birthYear: 1992, age: 33, profession: 'Designer',
    gender: 'female', x: 0, y: 700, pathologies: [],
  },
  {
    id: 'c2', firstName: 'Lucas', lastName: 'Duval',
    birthYear: 1995, age: 30, profession: 'Développeur',
    gender: 'male', x: 250, y: 700, pathologies: [],
  },
  {
    id: 'c3', firstName: 'Chloé', lastName: 'Duval',
    birthYear: 1998, age: 27, profession: 'Étudiante',
    gender: 'female', x: 500, y: 700, pathologies: ['bipolar'],
  },
  {
    id: 'c4', firstName: 'Hugo', lastName: 'Petit',
    birthYear: 1994, age: 31, profession: 'Chirurgien',
    gender: 'male', x: 750, y: 700, pathologies: [],
  },
  {
    id: 'c5', firstName: 'Léa', lastName: 'Petit',
    birthYear: 1997, age: 28, profession: 'Journaliste',
    gender: 'female', x: 1000, y: 700, pathologies: [],
  },

  // ── Génération 3 (Arrière-petits-enfants — 2 enfants d'Emma) ──
  {
    id: 'gc1', firstName: 'Théo', lastName: 'Moreau',
    birthYear: 2020, age: 5, profession: '',
    gender: 'male', x: 0, y: 1050, pathologies: [],
  },
  {
    id: 'gc2', firstName: 'Jade', lastName: 'Moreau',
    birthYear: 2022, age: 3, profession: '',
    gender: 'female', x: 250, y: 1050, pathologies: [],
  },
];

export const SAMPLE_UNIONS: Union[] = [
  // Gen 0: Robert + Jeanne → 3 enfants
  {
    id: 'u-gp', partner1: 'gp-m', partner2: 'gp-f',
    status: 'widowed', marriageYear: 1963,
    children: ['p1', 'p2', 'p3'],
  },
  // Gen 1: Michel + Claire → 3 enfants
  {
    id: 'u-p1', partner1: 'p1', partner2: 'p1-w',
    status: 'married', marriageYear: 1990,
    children: ['c1', 'c2', 'c3'],
  },
  // Gen 1: Laurent + Anne → 2 enfants
  {
    id: 'u-p2', partner1: 'p2-h', partner2: 'p2',
    status: 'divorced', marriageYear: 1992, divorceYear: 2010,
    children: ['c4', 'c5'],
  },
  // Gen 2: Emma + conjoint implicite → 2 enfants
  {
    id: 'u-c1', partner1: 'c2', partner2: 'c1',
    status: 'common_law', marriageYear: 2018,
    children: ['gc1', 'gc2'],
  },
];

/** @deprecated */
export const SAMPLE_RELATIONSHIPS: Relationship[] = [];

export const SAMPLE_EMOTIONAL_LINKS: EmotionalLink[] = [
  { id: 'e1', from: 'p1', to: 'p2', type: 'fusional' },
  { id: 'e2', from: 'c1', to: 'c3', type: 'conflictual' },
  { id: 'e3', from: 'p3', to: 'gp-m', type: 'distant' },
  { id: 'e4', from: 'c4', to: 'c5', type: 'fusional' },
];
