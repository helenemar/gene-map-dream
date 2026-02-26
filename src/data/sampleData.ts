import { FamilyMember, Relationship, EmotionalLink, Union } from '@/types/genogram';

export const SAMPLE_MEMBERS: FamilyMember[] = [
  // ── Generation 0 (Grands-parents) ──
  {
    id: 'gp1', firstName: 'Henri', lastName: 'Margary',
    birthYear: 1930, deathYear: 1998, age: 68, profession: 'Notaire',
    gender: 'male', x: 100, y: 0, pathologies: ['cardiovascular'],
  },
  {
    id: 'gp2', firstName: 'Madeleine', lastName: 'Beaumont',
    birthYear: 1934, deathYear: 2010, age: 76, profession: 'Institutrice',
    gender: 'female', x: 400, y: 0, pathologies: ['cancer'],
  },
  {
    id: 'gp3', firstName: 'Jean', lastName: 'Jouanolle',
    birthYear: 1928, deathYear: 2005, age: 77, profession: 'Médecin',
    gender: 'male', x: 800, y: 0, pathologies: ['diabetes'],
  },
  {
    id: 'gp4', firstName: 'Suzanne', lastName: 'Moreau',
    birthYear: 1932, age: 93, profession: 'Pharmacienne',
    gender: 'female', x: 1100, y: 0, pathologies: ['neurodegeneration'],
  },

  // ── Stress-test grands-parents (8-children family) ──
  {
    id: 'sgp1', firstName: 'Georges', lastName: 'Fontaine',
    birthYear: 1925, deathYear: 1990, age: 65, profession: 'Agriculteur',
    gender: 'male', x: 1800, y: 0, pathologies: ['cardiovascular'],
  },
  {
    id: 'sgp2', firstName: 'Odette', lastName: 'Girard',
    birthYear: 1928, age: 97, profession: 'Sage-femme',
    gender: 'female', x: 2100, y: 0, pathologies: [],
  },

  // ── Generation 1 (Parents) ──
  {
    id: '1', firstName: 'Philippe', lastName: 'Margary',
    birthYear: 1963, deathYear: 2018, age: 58, profession: 'Dentiste',
    gender: 'male', x: 100, y: 300, pathologies: ['cardiovascular'],
  },
  {
    id: '2', firstName: 'Elisabeth', lastName: 'Jouanolle',
    birthYear: 1962, age: 63, profession: 'Psychologue',
    gender: 'female', x: 400, y: 300, pathologies: [],
  },
  {
    id: '8', firstName: 'Marc', lastName: 'Dupont',
    birthYear: 1958, age: 67, profession: 'Architecte',
    gender: 'male', x: 700, y: 300, pathologies: ['diabetes'],
  },
  {
    id: 'p4', firstName: 'Catherine', lastName: 'Jouanolle',
    birthYear: 1965, age: 60, profession: 'Avocate',
    gender: 'female', x: 1000, y: 300, pathologies: [],
  },
  {
    id: 'p5', firstName: 'Bernard', lastName: 'Leroy',
    birthYear: 1960, deathYear: 2022, age: 62, profession: 'Professeur',
    gender: 'male', x: 1300, y: 300, pathologies: ['depression'],
  },

  // ── Stress-test: 8 children of Georges & Odette ──
  {
    id: 'sf1', firstName: 'André', lastName: 'Fontaine',
    birthYear: 1950, age: 75, profession: 'Menuisier',
    gender: 'male', x: 1600, y: 300, pathologies: [],
  },
  {
    id: 'sf2', firstName: 'Brigitte', lastName: 'Fontaine',
    birthYear: 1952, age: 73, profession: 'Infirmière',
    gender: 'female', x: 1800, y: 300, pathologies: ['cancer'],
  },
  {
    id: 'sf3', firstName: 'Claude', lastName: 'Fontaine',
    birthYear: 1954, age: 71, profession: 'Comptable',
    gender: 'male', x: 2000, y: 300, pathologies: ['diabetes'],
  },
  {
    id: 'sf4', firstName: 'Danielle', lastName: 'Fontaine',
    birthYear: 1956, age: 69, profession: 'Enseignante',
    gender: 'female', x: 2200, y: 300, pathologies: [],
  },
  {
    id: 'sf5', firstName: 'Étienne', lastName: 'Fontaine',
    birthYear: 1958, age: 67, profession: 'Ingénieur',
    gender: 'male', x: 2400, y: 300, pathologies: ['cardiovascular'],
  },
  {
    id: 'sf6', firstName: 'Françoise', lastName: 'Fontaine',
    birthYear: 1960, age: 65, profession: 'Artiste',
    gender: 'female', x: 2600, y: 300, pathologies: ['depression'],
  },
  {
    id: 'sf7', firstName: 'Gérard', lastName: 'Fontaine',
    birthYear: 1962, deathYear: 2020, age: 58, profession: 'Militaire',
    gender: 'male', x: 2800, y: 300, pathologies: ['addiction'],
  },
  {
    id: 'sf8', firstName: 'Héloise', lastName: 'Fontaine',
    birthYear: 1965, age: 60, profession: 'Pharmacienne',
    gender: 'female', x: 3000, y: 300, pathologies: [],
  },

  // ── Stress-test: spouses for 2 of the 8 children ──
  {
    id: 'sf1s', firstName: 'Marie-Claire', lastName: 'Petit',
    birthYear: 1953, age: 72, profession: 'Couturière',
    gender: 'female', x: 1600, y: 300, pathologies: [],
  },
  {
    id: 'sf5s', firstName: 'Nathalie', lastName: 'Blanc',
    birthYear: 1961, age: 64, profession: 'Médecin',
    gender: 'female', x: 2400, y: 300, pathologies: [],
  },

  // ── Stress-test: grandchildren of André ──
  {
    id: 'sgc1', firstName: 'Julien', lastName: 'Fontaine',
    birthYear: 1978, age: 47, profession: 'Développeur',
    gender: 'male', x: 1600, y: 600, pathologies: [],
  },
  {
    id: 'sgc2', firstName: 'Sophie', lastName: 'Fontaine',
    birthYear: 1981, age: 44, profession: 'Architecte',
    gender: 'female', x: 1800, y: 600, pathologies: [],
  },

  // ── Stress-test: grandchildren of Étienne ──
  {
    id: 'sgc3', firstName: 'Maxime', lastName: 'Fontaine',
    birthYear: 1985, age: 40, profession: 'Avocat',
    gender: 'male', x: 2400, y: 600, pathologies: [],
  },

  // ── Generation 2 (Enfants Margary/Jouanolle) ──
  {
    id: '3', firstName: 'François', lastName: 'Margary',
    birthYear: 1989, age: 36, profession: 'Ingénieur',
    gender: 'male', x: 0, y: 600, pathologies: [],
  },
  {
    id: '4', firstName: 'Hélène', lastName: 'Margary',
    birthYear: 1992, age: 33, profession: 'Product Designer',
    gender: 'female', x: 200, y: 600, pathologies: [],
  },
  {
    id: '5', firstName: 'Jona', lastName: 'Machicote',
    birthYear: 1996, age: 28, profession: 'Psychologue',
    gender: 'female', x: 400, y: 600, pathologies: [],
  },
  {
    id: '6', firstName: 'Pierre', lastName: 'Margary',
    birthYear: 1996, age: 29, profession: 'Analyste',
    gender: 'male', x: 600, y: 600, pathologies: [],
  },
  {
    id: '7', firstName: 'Paul', lastName: 'Margary',
    birthYear: 1998, age: 26, profession: 'Data-Scientist',
    gender: 'male', x: 800, y: 600, pathologies: ['addiction'],
  },
  {
    id: '9', firstName: 'Léa', lastName: 'Dupont',
    birthYear: 2005, age: 20, profession: 'Étudiante',
    gender: 'female', x: 1000, y: 600, pathologies: [],
  },
  {
    id: 'c7', firstName: 'Thomas', lastName: 'Leroy',
    birthYear: 1990, age: 35, profession: 'Chirurgien',
    gender: 'male', x: 1200, y: 600, pathologies: [],
  },
  {
    id: 'c8', firstName: 'Marie', lastName: 'Leroy',
    birthYear: 1993, age: 32, profession: 'Journaliste',
    gender: 'female', x: 1400, y: 600, pathologies: ['depression'],
  },
  {
    id: 'c9', firstName: 'Lucas', lastName: 'Leroy',
    birthYear: 1997, age: 28, profession: 'Musicien',
    gender: 'male', x: 1600, y: 600, pathologies: ['addiction', 'bipolar'],
  },
];

/** Union-based model — all 5 statuses + stress-test family */
export const SAMPLE_UNIONS: Union[] = [
  // Gen 0 unions
  {
    id: 'u-gp1', partner1: 'gp1', partner2: 'gp2',
    status: 'widowed', marriageYear: 1955,
    children: ['1'],
  },
  {
    id: 'u-gp2', partner1: 'gp3', partner2: 'gp4',
    status: 'married', marriageYear: 1958,
    children: ['2', 'p4'],
  },
  // Stress-test: 8 children
  {
    id: 'u-sgp', partner1: 'sgp1', partner2: 'sgp2',
    status: 'widowed', marriageYear: 1948,
    children: ['sf1', 'sf2', 'sf3', 'sf4', 'sf5', 'sf6', 'sf7', 'sf8'],
  },
  // Gen 1 unions
  {
    id: 'u1', partner1: '1', partner2: '2',
    status: 'divorced', marriageYear: 1981, divorceYear: 2018,
    children: ['3', '4', '5', '6', '7'],
  },
  {
    id: 'u2', partner1: '2', partner2: '8',
    status: 'common_law', marriageYear: 2020,
    children: ['9'],
  },
  {
    id: 'u3', partner1: 'p4', partner2: 'p5',
    status: 'separated', marriageYear: 1988, divorceYear: 2015,
    children: ['c7', 'c8', 'c9'],
  },
  // Stress-test child unions (André & Étienne married)
  {
    id: 'u-sf1', partner1: 'sf1', partner2: 'sf1s',
    status: 'married', marriageYear: 1975,
    children: ['sgc1', 'sgc2'],
  },
  {
    id: 'u-sf5', partner1: 'sf5', partner2: 'sf5s',
    status: 'married', marriageYear: 1983,
    children: ['sgc3'],
  },
];

/** @deprecated — kept for backward compatibility */
export const SAMPLE_RELATIONSHIPS: Relationship[] = [];

export const SAMPLE_EMOTIONAL_LINKS: EmotionalLink[] = [
  { id: 'e1', from: '1', to: '2', type: 'fusional' },
  { id: 'e2', from: '3', to: '4', type: 'distant' },
  { id: 'e3', from: '5', to: '6', type: 'conflictual' },
  { id: 'e4', from: '4', to: '5', type: 'ambivalent' },
  { id: 'e5', from: '7', to: 'c9', type: 'violence' },
  { id: 'e6', from: 'gp1', to: '1', type: 'fusional' },
  { id: 'e7', from: 'p4', to: 'p5', type: 'cutoff' },
  { id: 'e8', from: 'c7', to: 'c8', type: 'fusional' },
  { id: 'e9', from: '2', to: 'p4', type: 'distant' },
  // Stress-test emotional links crossing filiation lines
  { id: 'e10', from: 'sf1', to: 'sf5', type: 'fusional' },
  { id: 'e11', from: 'sf2', to: 'sf7', type: 'conflictual' },
  { id: 'e12', from: 'sf3', to: 'sf6', type: 'distant' },
];
