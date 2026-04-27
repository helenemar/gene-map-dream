export type TwinType = 'monozygotic' | 'dizygotic';

/** Perinatal member types — rendered as triangle-based symbols */
export type PerinatalType = 'pregnancy' | 'miscarriage' | 'abortion' | 'stillborn';

export type GenderIdentity = 'cisgender' | 'transgender';
export type SexualOrientation = 'heterosexual' | 'homosexual' | 'bisexual';

export const GENDER_IDENTITY_OPTIONS: { id: GenderIdentity; label: string }[] = [
  { id: 'transgender', label: 'Transgenre' },
];

export const SEXUAL_ORIENTATION_OPTIONS: { id: SexualOrientation; labelM: string; labelF: string }[] = [
  { id: 'homosexual', labelM: 'Homosexuel', labelF: 'Homosexuelle' },
  { id: 'bisexual', labelM: 'Bisexuel', labelF: 'Bisexuelle' },
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
  isRetired?: boolean;
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
  /** Perinatal type — overrides normal rendering with triangle-based symbols */
  perinatalType?: PerinatalType;
  /** When true, auto-layout (Réorganiser) will not move this member */
  locked?: boolean;
  /** Index patient (proposant) — rendered with double border */
  isIndexPatient?: boolean;
  /** Unknown member — identity is undisclosed; renders as '?' with no details */
  isUnknown?: boolean;
  /** Trauma indicator — renders a small red lightning bolt on the symbol */
  hasTrauma?: boolean;
  /** Free-text description of the traumatic event(s) experienced */
  traumaNotes?: string;
  /** List of trauma labels (from global catalog or user catalog or free text) */
  traumas?: string[];
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
  /** Année de rencontre */
  meetingYear?: number;
  meetingYearUnsure?: boolean;
  /** Année de l'événement (mariage, union libre, etc.) */
  eventYear?: number;
  eventYearUnsure?: boolean;
  /** Année de fin (divorce, séparation, veuvage, etc.) */
  endYear?: number;
  endYearUnsure?: boolean;
  /** @deprecated use meetingYear */
  marriageYear?: number;
  /** @deprecated use endYear */
  divorceYear?: number;
  children: string[]; // member IDs
  /** If true, children in this union are adopted (dashed filiation line with tick) */
  isAdoption?: boolean;
  /** Free-text clinical notes about this union */
  notes?: string;
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
  | 'close' | 'fusional' | 'distant' | 'conflictual' | 'ambivalent' 
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

export const EMOTIONAL_LINK_TYPES: { id: EmotionalLinkType; label: string; color: string; description: string; category: 'relational' | 'abusive' }[] = [
  { id: 'close', label: 'Proche', color: 'link-fusional', description: 'Relation proche', category: 'relational' },
  { id: 'fusional', label: 'Fusionnel', color: 'link-fusional', description: 'Relation très proche, symbiose', category: 'relational' },
  { id: 'distant', label: 'Distant', color: 'link-distant', description: 'Éloignement émotionnel', category: 'relational' },
  { id: 'conflictual', label: 'Conflit', color: 'link-conflictual', description: 'Relation conflictuelle', category: 'relational' },
  { id: 'ambivalent', label: 'Ambivalent', color: 'link-ambivalent', description: 'Proche et conflictuel à la fois', category: 'relational' },
  { id: 'cutoff', label: 'Lien rompu', color: 'link-cutoff', description: 'Rupture totale de contact', category: 'relational' },
  { id: 'violence', label: 'Violence', color: 'link-violence', description: 'Relation violente', category: 'abusive' },
  { id: 'emotional_abuse', label: 'Violences psychologiques', color: 'link-emotional-abuse', description: 'Manipulation, emprise psychologique', category: 'abusive' },
  { id: 'physical_violence', label: 'Violences physiques', color: 'link-physical-violence', description: 'Violences corporelles', category: 'abusive' },
  { id: 'sexual_abuse', label: 'Violences sexuelles', color: 'link-sexual-abuse', description: 'Violences à caractère sexuel', category: 'abusive' },
  { id: 'neglect', label: 'Négligence', color: 'link-neglect', description: 'Manque de soins ou d\'attention', category: 'abusive' },
  { id: 'controlling', label: 'Contrôlant', color: 'link-controlling', description: 'Comportement de contrôle', category: 'abusive' },
];
