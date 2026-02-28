export type TwinType = 'monozygotic' | 'dizygotic';

export type GenderIdentity = 'cisgender' | 'transgender';
export type SexualOrientation = 'heterosexual' | 'homosexual' | 'bisexual';

export const GENDER_IDENTITY_OPTIONS: { id: GenderIdentity; label: string }[] = [
  { id: 'transgender', label: 'Transgenre' },
];

export const SEXUAL_ORIENTATION_OPTIONS: { id: SexualOrientation; label: string }[] = [
  { id: 'homosexual', label: 'Homosexuel(le)' },
  { id: 'bisexual', label: 'Bisexuel(le)' },
];

export interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  /** Nom de naissance / nom de jeune fille */
  birthName?: string;
  birthYear: number;
  birthYearUnsure?: boolean;
  deathYear?: number;
  deathYearUnsure?: boolean;
  age: number;
  profession: string;
  gender: 'male' | 'female' | 'non-binary';
  /** @deprecated use genderIdentity */
  isTransgender?: boolean;
  /** @deprecated use sexualOrientation */
  isGay?: boolean;
  /** @deprecated use sexualOrientation */
  isBisexual?: boolean;
  genderIdentity?: GenderIdentity;
  genderIdentityCustom?: string;
  sexualOrientation?: SexualOrientation;
  sexualOrientationCustom?: string;
  x: number;
  y: number;
  pathologies: string[];
  avatar?: string;
  isPlaceholder?: boolean;
  twinGroup?: string;
  twinType?: TwinType;
  notes?: string;
  /** Draft member — auto-generated, not yet edited by user */
  isDraft?: boolean;
  /** Marks this member as an adoptive parent (visual label on draft card) */
  isAdoptiveParent?: boolean;
}

export type UnionStatus = 'married' | 'common_law' | 'separated' | 'divorced' | 'widowed' | 'love_affair';

/**
 * A Union represents a couple relationship between two members.
 * Children are linked to the union, not to individual parents.
 */
export interface Union {
  id: string;
  partner1: string;
  partner2: string;
  status: UnionStatus;
  marriageYear?: number;
  divorceYear?: number;
  children: string[]; // member IDs
  /** If true, children in this union are adopted (dashed filiation line with tick) */
  isAdoption?: boolean;
}

/** @deprecated — use Union instead */
export interface Relationship {
  id: string;
  from: string;
  to: string;
  type: 'couple' | 'parent-child';
  status?: 'married' | 'divorced' | 'separated' | 'widowed' | 'liaison';
  marriageYear?: number;
  divorceYear?: number;
}

export type EmotionalLinkType = 
  | 'fusional' | 'distant' | 'conflictual' | 'ambivalent' 
  | 'cutoff' | 'violence' | 'emotional_abuse' | 'physical_violence' 
  | 'sexual_abuse' | 'neglect' | 'controlling';

export interface EmotionalLink {
  id: string;
  from: string;
  to: string;
  type: EmotionalLinkType;
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

export const FAMILY_LINK_TYPES: { id: UnionStatus; label: string; icon: string }[] = [
  { id: 'married', label: 'Mariage', icon: '═' },
  { id: 'common_law', label: 'Union libre', icon: '┄' },
  { id: 'separated', label: 'Séparation', icon: '∕' },
  { id: 'divorced', label: 'Divorce', icon: '⊘' },
  { id: 'widowed', label: 'Veuvage', icon: '✕' },
  { id: 'love_affair', label: 'Liaison', icon: '♡' },
];

export const EMOTIONAL_LINK_TYPES: { id: EmotionalLinkType; label: string; color: string }[] = [
  { id: 'fusional', label: 'Fusionnel', color: 'link-fusional' },
  { id: 'distant', label: 'Distant', color: 'link-distant' },
  { id: 'conflictual', label: 'Conflit', color: 'link-conflictual' },
  { id: 'ambivalent', label: 'Ambivalent', color: 'link-ambivalent' },
  { id: 'cutoff', label: 'Lien rompu', color: 'link-cutoff' },
  { id: 'violence', label: 'Violence', color: 'link-violence' },
  { id: 'emotional_abuse', label: 'Abus émotionnel', color: 'link-emotional-abuse' },
  { id: 'physical_violence', label: 'Violence physique', color: 'link-physical-violence' },
  { id: 'sexual_abuse', label: 'Abus sexuel', color: 'link-sexual-abuse' },
  { id: 'neglect', label: 'Négligence', color: 'link-neglect' },
  { id: 'controlling', label: 'Contrôlant', color: 'link-controlling' },
];
