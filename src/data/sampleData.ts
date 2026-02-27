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

  // ── Génération 1 (3 enfants) ──
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
  {
    id: 'p2-h', firstName: 'Marc', lastName: 'Dupont',
    birthYear: 1971, age: 55, profession: 'Ingénieur',
    gender: 'male', x: 400, y: 350, pathologies: [],
  },

  // ── Génération 2 (Enfants de Philippe + Nathalie) ──
  {
    id: 'c1', firstName: 'Julien', lastName: 'Lefèvre',
    birthYear: 1998, age: 28, profession: 'Kinésithérapeute',
    gender: 'male', x: 0, y: 700, pathologies: ['bipolar'],
  },
  {
    id: 'c1-w', firstName: 'Léa', lastName: 'Martin',
    birthYear: 1999, age: 27, profession: 'Infirmière',
    gender: 'female', x: 200, y: 700, pathologies: [],
  },
  // Jumelles monozygotes
  {
    id: 'c2', firstName: 'Camille', lastName: 'Lefèvre',
    birthYear: 2001, age: 25, profession: 'Graphiste',
    gender: 'female', x: 250, y: 700, pathologies: [],
    twinGroup: 'twin-1', twinType: 'monozygotic',
  },
  {
    id: 'c2b', firstName: 'Clara', lastName: 'Lefèvre',
    birthYear: 2001, age: 25, profession: 'Architecte',
    gender: 'female', x: 450, y: 700, pathologies: ['psychogenic'],
    twinGroup: 'twin-1', twinType: 'monozygotic',
  },

  // ── Enfants de Sylvie + Marc ──
  {
    id: 'c3', firstName: 'Lucas', lastName: 'Dupont',
    birthYear: 2000, age: 26, profession: 'Développeur',
    gender: 'male', x: 500, y: 700, pathologies: [],
  },
  {
    id: 'c4', firstName: 'Emma', lastName: 'Dupont',
    birthYear: 2003, age: 23, profession: 'Étudiante',
    gender: 'female', x: 700, y: 700, pathologies: ['psychogenic'],
  },

  // ── Génération 3 (Enfants de Julien + Léa) ──
  {
    id: 'gc1', firstName: 'Théo', lastName: 'Lefèvre',
    birthYear: 2024, age: 2, profession: '',
    gender: 'male', x: 0, y: 1050, pathologies: [],
  },
  {
    id: 'gc2', firstName: 'Rose', lastName: 'Lefèvre',
    birthYear: 2026, age: 0, profession: '',
    gender: 'female', x: 200, y: 1050, pathologies: [],
  },
];

export const SAMPLE_UNIONS: Union[] = [
  // Gen 0 → Gen 1
  {
    id: 'u-gp', partner1: 'gp-m', partner2: 'gp-f',
    status: 'widowed', marriageYear: 1968, divorceYear: 2020,
    children: ['p1', 'p2'],
  },
  // Gen 1 → Gen 2 (Philippe — divorcé)
  {
    id: 'u-p1', partner1: 'p1', partner2: 'p1-w',
    status: 'divorced', marriageYear: 1996, divorceYear: 2015,
    children: ['c1', 'c2', 'c2b'],
  },
  // Gen 1 → Gen 2 (Sylvie — séparée)
  {
    id: 'u-p2', partner1: 'p2-h', partner2: 'p2',
    status: 'separated', marriageYear: 1998, divorceYear: 2021,
    children: ['c3', 'c4'],
  },
  // Gen 2 → Gen 3 (Julien — liaison / love affair)
  {
    id: 'u-c1', partner1: 'c1', partner2: 'c1-w',
    status: 'love_affair', marriageYear: 2022,
    children: ['gc1', 'gc2'],
  },
];

/** @deprecated */
export const SAMPLE_RELATIONSHIPS: Relationship[] = [];

export const SAMPLE_EMOTIONAL_LINKS: EmotionalLink[] = [
  { id: 'e1', from: 'p1', to: 'p2', type: 'fusional' },
  { id: 'e2', from: 'c1', to: 'c2', type: 'conflictual' },
  { id: 'e3', from: 'gp-f', to: 'gc1', type: 'fusional' },
];
