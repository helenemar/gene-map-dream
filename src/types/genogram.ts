export interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  birthYear: number;
  deathYear?: number;
  age: number;
  profession: string;
  gender: 'male' | 'female';
  isTransgender?: boolean;
  x: number;
  y: number;
  pathologies: string[];
  avatar?: string;
}

export interface Relationship {
  id: string;
  from: string;
  to: string;
  type: 'couple' | 'parent-child';
  status?: 'married' | 'divorced' | 'separated' | 'widowed' | 'liaison';
  marriageYear?: number;
  divorceYear?: number;
}

export interface EmotionalLink {
  id: string;
  from: string;
  to: string;
  type: 'fusional' | 'distant' | 'conflictual' | 'ambivalent' | 'negligent' | 'coercive' | 'cutoff' | 'violence';
}

export interface Pathology {
  id: string;
  name: string;
  color: string;
}

export const PATHOLOGIES: Pathology[] = [
  { id: 'depression', name: 'Dépression', color: 'pathology-depression' },
  { id: 'cancer', name: 'Cancer', color: 'pathology-cancer' },
  { id: 'addiction', name: 'Addiction', color: 'pathology-addiction' },
  { id: 'bipolar', name: 'Troubles bipolaires', color: 'pathology-bipolar' },
  { id: 'cardiovascular', name: 'Maladies cardiovasculaires', color: 'pathology-cardiovascular' },
  { id: 'diabetes', name: 'Diabète', color: 'pathology-diabetes' },
  { id: 'psychogenic', name: 'Troubles psychogéniques', color: 'pathology-psychogenic' },
  { id: 'neurodegeneration', name: 'Maladies neurodégénératives', color: 'pathology-neurodegeneration' },
];

export const FAMILY_LINK_TYPES = [
  { id: 'divorce', label: 'Divorce', icon: '⊘' },
  { id: 'separation', label: 'Séparation', icon: '∕' },
  { id: 'widowed', label: 'Veuf(ve)', icon: '✕' },
  { id: 'liaison', label: 'Liaison', icon: '♡' },
];

export const EMOTIONAL_LINK_TYPES = [
  { id: 'fusional', label: 'Fusionnel', color: 'link-fusional' },
  { id: 'distant', label: 'Distant', color: 'link-distant' },
  { id: 'conflictual', label: 'Conflictuel', color: 'link-conflictual' },
  { id: 'ambivalent', label: 'Ambivalent', color: 'link-ambivalent' },
  { id: 'negligent', label: 'Négligent', color: 'link-negligent' },
  { id: 'coercive', label: 'Contrôlant', color: 'link-coercive' },
  { id: 'cutoff', label: 'Lien rompu', color: 'link-cutoff' },
  { id: 'violence', label: 'Violence', color: 'link-violence' },
];
