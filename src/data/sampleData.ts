import { FamilyMember, Relationship, EmotionalLink, Union } from '@/types/genogram';

export const SAMPLE_MEMBERS: FamilyMember[] = [
  // ── Génération 0 (Grands-parents) ──
  {
    id: 'gp-m', firstName: 'Henri', lastName: 'Lefèvre',
    birthYear: 1945, deathYear: 2020, age: 75, profession: 'Menuisier',
    gender: 'male', x: 0, y: 0, pathologies: ['cardiovascular', 'diabetes'],
  },
  {
    id: 'gp-f', firstName: 'Madeleine', lastName: 'Roux',
    birthYear: 1948, age: 78, profession: 'Couturière',
    gender: 'female', x: 300, y: 0, pathologies: ['cancer'],
  },

  // ── Génération 1 (Parents — 2 enfants) ──
  {
    id: 'p1', firstName: 'Philippe', lastName: 'Lefèvre',
    birthYear: 1970, age: 56, profession: 'Comptable',
    gender: 'male', x: 0, y: 350, pathologies: ['addiction'],
  },
  {
    id: 'p1-w', firstName: 'Nathalie', lastName: 'Girard',
    birthYear: 1972, age: 54, profession: 'Enseignante',
    gender: 'female', x: 250, y: 350, pathologies: ['depression'],
  },
  {
    id: 'p2', firstName: 'Sylvie', lastName: 'Lefèvre',
    birthYear: 1974, age: 52, profession: 'Pharmacienne',
    gender: 'female', x: 500, y: 350, pathologies: ['neurodegeneration', 'depression'],
  },

  // ── Génération 2 (Petits-enfants — 3 enfants de Philippe) ──
  {
    id: 'c1', firstName: 'Julien', lastName: 'Lefèvre',
    birthYear: 1998, age: 28, profession: 'Kinésithérapeute',
    gender: 'male', x: 0, y: 700, pathologies: ['bipolar'],
  },
  {
    id: 'c2', firstName: 'Camille', lastName: 'Lefèvre',
    birthYear: 2001, age: 25, profession: 'Graphiste',
    gender: 'female', x: 250, y: 700, pathologies: [],
  },
  {
    id: 'c3', firstName: 'Raphaël', lastName: 'Lefèvre',
    birthYear: 2004, age: 22, profession: 'Étudiant',
    gender: 'male', x: 500, y: 700, pathologies: ['psychogenic'],
  },
];

export const SAMPLE_UNIONS: Union[] = [
  // Gen 0: Henri + Madeleine → 2 enfants
  {
    id: 'u-gp', partner1: 'gp-m', partner2: 'gp-f',
    status: 'widowed', marriageYear: 1968,
    children: ['p1', 'p2'],
  },
  // Gen 1: Philippe + Nathalie → 3 enfants
  {
    id: 'u-p1', partner1: 'p1', partner2: 'p1-w',
    status: 'married', marriageYear: 1996,
    children: ['c1', 'c2', 'c3'],
  },
];

/** @deprecated */
export const SAMPLE_RELATIONSHIPS: Relationship[] = [];

export const SAMPLE_EMOTIONAL_LINKS: EmotionalLink[] = [
  { id: 'e1', from: 'p1', to: 'p2', type: 'fusional' },
  { id: 'e2', from: 'c1', to: 'c3', type: 'conflictual' },
];
