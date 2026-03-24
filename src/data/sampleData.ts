import { FamilyMember, Relationship, EmotionalLink, Union } from '@/types/genogram';

export const SAMPLE_MEMBERS: FamilyMember[] = [
  // ══════════ Génération 0 — Arrière-grands-parents ══════════
  {
    id: 'agp-m1', firstName: 'Auguste', lastName: 'Moreau',
    birthYear: 1920, deathYear: 1998, age: 78, profession: 'Agriculteur',
    gender: 'male', x: 0, y: 0, pathologies: ['cardiovascular'],
  },
  {
    id: 'agp-f1', firstName: 'Germaine', lastName: 'Petit',
    birthYear: 1924, deathYear: 2005, age: 81, profession: 'Institutrice',
    gender: 'female', x: 300, y: 0, pathologies: ['neurodegeneration'],
  },
  {
    id: 'agp-m2', firstName: 'René', lastName: 'Bernard',
    birthYear: 1918, deathYear: 1990, age: 72, profession: 'Charpentier',
    gender: 'male', x: 700, y: 0, pathologies: ['addiction', 'cardiovascular'],
  },
  {
    id: 'agp-f2', firstName: 'Odette', lastName: 'Faure',
    birthYear: 1922, deathYear: 2010, age: 88, profession: 'Sage-femme',
    gender: 'female', x: 1000, y: 0, pathologies: ['cancer'],
  },

  // ══════════ Génération 1 — Grands-parents ══════════
  {
    id: 'gp-m', firstName: 'Henri', lastName: 'Moreau',
    birthYear: 1945, deathYear: 2020, age: 75, profession: 'Menuisier',
    gender: 'male', x: 100, y: 350, pathologies: ['cardiovascular', 'diabetes'],
  },
  {
    id: 'gp-f', firstName: 'Madeleine', lastName: 'Bernard',
    birthName: 'Bernard',
    birthYear: 1948, age: 78, profession: 'Couturière',
    gender: 'female', x: 400, y: 350, pathologies: ['cancer', 'depression'],
  },
  {
    id: 'gp-m2', firstName: 'Raymond', lastName: 'Lefèvre',
    birthYear: 1942, deathYear: 2018, age: 76, profession: 'Médecin',
    gender: 'male', x: 800, y: 350, pathologies: ['neurodegeneration'],
  },
  {
    id: 'gp-f2', firstName: 'Jacqueline', lastName: 'Duval',
    birthName: 'Duval',
    birthYear: 1946, age: 80, profession: 'Pharmacienne',
    gender: 'female', x: 1100, y: 350, pathologies: [],
  },

  // ══════════ Génération 2 — Parents + oncles/tantes ══════════
  // Branche paternelle
  {
    id: 'p1', firstName: 'Philippe', lastName: 'Moreau',
    birthYear: 1970, age: 56, profession: 'Comptable',
    gender: 'male', x: 0, y: 700, pathologies: ['addiction'],
  },
  {
    id: 'p1-w', firstName: 'Nathalie', lastName: 'Lefèvre',
    birthName: 'Lefèvre',
    birthYear: 1972, age: 54, profession: 'Psychologue',
    gender: 'female', x: 250, y: 700, pathologies: ['depression'],
  },
  {
    id: 'p2', firstName: 'Sylvie', lastName: 'Moreau',
    birthYear: 1974, age: 52, profession: 'Avocate',
    gender: 'female', x: 550, y: 700, pathologies: ['bipolar'],
  },
  {
    id: 'p2-h', firstName: 'Marc', lastName: 'Dupont',
    birthYear: 1971, age: 55, profession: 'Ingénieur',
    gender: 'male', x: 450, y: 700, pathologies: [],
  },
  // Frère décédé jeune (fausse couche maternel)
  {
    id: 'p-miscarriage', firstName: '', lastName: 'Moreau',
    birthYear: 1968, age: 0, profession: '',
    gender: 'male', x: 650, y: 700, pathologies: [],
    perinatalType: 'miscarriage',
  },

  // Branche maternelle
  {
    id: 'p3', firstName: 'François', lastName: 'Lefèvre',
    birthYear: 1968, age: 58, profession: 'Notaire',
    gender: 'male', x: 800, y: 700, pathologies: ['cardiovascular'],
  },
  {
    id: 'p3-w', firstName: 'Catherine', lastName: 'Roux',
    birthName: 'Roux',
    birthYear: 1970, age: 56, profession: 'Enseignante',
    gender: 'female', x: 1050, y: 700, pathologies: [],
  },
  {
    id: 'p4', firstName: 'Isabelle', lastName: 'Lefèvre',
    birthYear: 1975, age: 51, profession: 'Infirmière',
    gender: 'female', x: 1250, y: 700, pathologies: ['psychogenic'],
    sexualOrientation: 'homosexual',
  },
  {
    id: 'p4-w', firstName: 'Valérie', lastName: 'Simon',
    birthYear: 1977, age: 49, profession: 'Architecte',
    gender: 'female', x: 1450, y: 700, pathologies: [],
  },

  // ══════════ Génération 3 — Enfants (sujet + cousins) ══════════
  // Enfants de Philippe + Nathalie
  {
    id: 'c1', firstName: 'Julien', lastName: 'Moreau',
    birthYear: 1998, age: 28, profession: 'Kinésithérapeute',
    gender: 'male', x: 0, y: 1050, pathologies: ['bipolar'],
    isIndexPatient: true,
  },
  {
    id: 'c1-w', firstName: 'Léa', lastName: 'Martin',
    birthYear: 1999, age: 27, profession: 'Infirmière',
    gender: 'female', x: 250, y: 1050, pathologies: [],
  },
  // Jumelles monozygotes
  {
    id: 'c2', firstName: 'Camille', lastName: 'Moreau',
    birthYear: 2001, age: 25, profession: 'Graphiste',
    gender: 'female', x: 450, y: 1050, pathologies: [],
    twinGroup: 'twin-1', twinType: 'monozygotic',
  },
  {
    id: 'c2b', firstName: 'Clara', lastName: 'Moreau',
    birthYear: 2001, age: 25, profession: 'Architecte',
    gender: 'female', x: 650, y: 1050, pathologies: ['psychogenic', 'depression'],
    twinGroup: 'twin-1', twinType: 'monozygotic',
  },

  // Enfants de Sylvie + Marc
  {
    id: 'c3', firstName: 'Lucas', lastName: 'Dupont',
    birthYear: 2000, age: 26, profession: 'Développeur',
    gender: 'male', x: 400, y: 1050, pathologies: ['addiction'],
  },
  {
    id: 'c4', firstName: 'Emma', lastName: 'Dupont',
    birthYear: 2003, age: 23, profession: 'Étudiante en médecine',
    gender: 'female', x: 600, y: 1050, pathologies: [],
  },

  // Enfants de François + Catherine
  {
    id: 'c5', firstName: 'Antoine', lastName: 'Lefèvre',
    birthYear: 1996, age: 30, profession: 'Chirurgien',
    gender: 'male', x: 800, y: 1050, pathologies: [],
  },
  {
    id: 'c5-w', firstName: 'Sophie', lastName: 'Girard',
    birthYear: 1997, age: 29, profession: 'Sage-femme',
    gender: 'female', x: 1050, y: 1050, pathologies: [],
  },
  // Jumeaux dizygotes
  {
    id: 'c6', firstName: 'Thomas', lastName: 'Lefèvre',
    birthYear: 2002, age: 24, profession: 'Musicien',
    gender: 'male', x: 1100, y: 1050, pathologies: ['depression'],
    twinGroup: 'twin-2', twinType: 'dizygotic',
  },
  {
    id: 'c6b', firstName: 'Marine', lastName: 'Lefèvre',
    birthYear: 2002, age: 24, profession: 'Journaliste',
    gender: 'female', x: 1300, y: 1050, pathologies: [],
    twinGroup: 'twin-2', twinType: 'dizygotic',
  },

  // Enfant adopté d'Isabelle + Valérie
  {
    id: 'c7', firstName: 'Liam', lastName: 'Simon-Lefèvre',
    birthYear: 2015, age: 11, profession: '',
    gender: 'male', x: 1350, y: 1050, pathologies: [],
  },

  // Grossesse en cours (Isabelle + Valérie)
  {
    id: 'c8-preg', firstName: '', lastName: '',
    birthYear: 2026, age: 0, profession: '',
    gender: 'female', x: 1500, y: 1050, pathologies: [],
    perinatalType: 'pregnancy',
  },

  // ══════════ Génération 4 — Petits-enfants ══════════
  {
    id: 'gc1', firstName: 'Théo', lastName: 'Moreau',
    birthYear: 2024, age: 2, profession: '',
    gender: 'male', x: 50, y: 1400, pathologies: [],
  },
  {
    id: 'gc2', firstName: 'Rose', lastName: 'Moreau',
    birthYear: 2026, age: 0, profession: '',
    gender: 'female', x: 250, y: 1400, pathologies: [],
  },
  // Mort-né d'Antoine + Sophie
  {
    id: 'gc3-still', firstName: '', lastName: 'Lefèvre',
    birthYear: 2023, age: 0, profession: '',
    gender: 'male', x: 900, y: 1400, pathologies: [],
    perinatalType: 'stillborn',
  },
  {
    id: 'gc4', firstName: 'Agathe', lastName: 'Lefèvre',
    birthYear: 2025, age: 1, profession: '',
    gender: 'female', x: 1050, y: 1400, pathologies: [],
  },
];

export const SAMPLE_UNIONS: Union[] = [
  // Gen 0 — Arrière-grands-parents
  {
    id: 'u-agp1', partner1: 'agp-m1', partner2: 'agp-f1',
    status: 'widowed', eventYear: 1943, endYear: 1998,
    children: ['gp-m'],
  },
  {
    id: 'u-agp2', partner1: 'agp-m2', partner2: 'agp-f2',
    status: 'widowed', eventYear: 1940, endYear: 1990,
    children: ['gp-f'],
  },

  // Gen 1 — Grands-parents
  {
    id: 'u-gp1', partner1: 'gp-m', partner2: 'gp-f',
    status: 'widowed', eventYear: 1968, endYear: 2020,
    children: ['p1', 'p2', 'p-miscarriage'],
  },
  {
    id: 'u-gp2', partner1: 'gp-m2', partner2: 'gp-f2',
    status: 'widowed', eventYear: 1965, endYear: 2018,
    children: ['p3', 'p4'],
  },

  // Gen 2 — Parents
  {
    id: 'u-p1', partner1: 'p1', partner2: 'p1-w',
    status: 'divorced', eventYear: 1996, endYear: 2015,
    children: ['c1', 'c2', 'c2b'],
  },
  {
    id: 'u-p2', partner1: 'p2-h', partner2: 'p2',
    status: 'separated', eventYear: 1998, endYear: 2021,
    children: ['c3', 'c4'],
  },
  {
    id: 'u-p3', partner1: 'p3', partner2: 'p3-w',
    status: 'married', eventYear: 1994,
    children: ['c5', 'c6', 'c6b'],
  },
  {
    id: 'u-p4', partner1: 'p4', partner2: 'p4-w',
    status: 'common_law', eventYear: 2010,
    children: ['c7', 'c8-preg'],
    isAdoption: true,
  },

  // Gen 3
  {
    id: 'u-c1', partner1: 'c1', partner2: 'c1-w',
    status: 'love_affair', meetingYear: 2020, eventYear: 2022,
    children: ['gc1', 'gc2'],
  },
  {
    id: 'u-c5', partner1: 'c5', partner2: 'c5-w',
    status: 'married', eventYear: 2021,
    children: ['gc3-still', 'gc4'],
  },
];

/** @deprecated */
export const SAMPLE_RELATIONSHIPS: Relationship[] = [];

export const SAMPLE_EMOTIONAL_LINKS: EmotionalLink[] = [
  { id: 'e1', from: 'p1', to: 'p2', type: 'fusional' },
  { id: 'e2', from: 'c1', to: 'c2', type: 'conflictual' },
  { id: 'e3', from: 'gp-f', to: 'gc1', type: 'fusional' },
  { id: 'e4', from: 'p1', to: 'c1', type: 'distant' },
  { id: 'e5', from: 'p2', to: 'p2-h', type: 'conflictual' },
  { id: 'e6', from: 'c2', to: 'c2b', type: 'fusional' },
  { id: 'e7', from: 'p4', to: 'gp-f2', type: 'cutoff' },
  { id: 'e8', from: 'p1', to: 'gp-m', type: 'violence' },
  { id: 'e9', from: 'c3', to: 'p2-h', type: 'ambivalent' },
  { id: 'e10', from: 'p3', to: 'p4', type: 'controlling' },
];
