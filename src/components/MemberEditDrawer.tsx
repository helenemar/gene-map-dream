import React, { useState, useEffect, useCallback } from 'react';
import { FamilyMember, TwinType, EmotionalLink, EmotionalLinkType, EMOTIONAL_LINK_TYPES, Union, UnionStatus, FAMILY_LINK_TYPES, GenderIdentity, SexualOrientation, GENDER_IDENTITY_OPTIONS, SEXUAL_ORIENTATION_OPTIONS } from '@/types/genogram';
import type { DynamicPathology } from '@/hooks/usePathologies';
import AddPathologyModal from '@/components/AddPathologyModal';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Heart, Pencil, FileText, Check, HelpCircle, Plus, ChevronRight, Fingerprint, Activity, Zap } from 'lucide-react';
import MemberAvatarUpload from '@/components/MemberAvatarUpload';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import MemberIcon from '@/components/MemberIcon';
import TraumaTagInput from '@/components/TraumaTagInput';

interface MemberEditDrawerProps {
  member: FamilyMember | null;
  open: boolean;
  onClose: () => void;
  onSave: (updated: FamilyMember) => void;
  onDelete?: (id: string) => void;
  emotionalLinks?: EmotionalLink[];
  members?: FamilyMember[];
  unions?: Union[];
  dynamicPathologies?: DynamicPathology[];
  onAddPathology?: (name: string, colorHex: string) => Promise<{ data: any; error: any } | undefined>;
  onDeletePathology?: (id: string) => Promise<void>;
  onUpdateEmotionalLink?: (linkId: string, newType: EmotionalLinkType) => void;
  onDeleteEmotionalLink?: (linkId: string) => void;
  onUpdateUnion?: (unionId: string, updates: Partial<Union>) => void;
  onLiveUpdate?: (updated: FamilyMember) => void;
  initialEditing?: boolean;
  genogramId?: string;
}

const MemberEditDrawer: React.FC<MemberEditDrawerProps> = ({
  member, open, onClose, onSave, onDelete,
  emotionalLinks = [], members: allMembers = [], unions = [],
  dynamicPathologies = [], onAddPathology, onDeletePathology,
  onUpdateEmotionalLink, onDeleteEmotionalLink, onUpdateUnion, onLiveUpdate,
  initialEditing = true, genogramId,
}) => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(initialEditing);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthName, setBirthName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [deathYear, setDeathYear] = useState('');
  const [profession, setProfession] = useState('');
  const [isRetired, setIsRetired] = useState(false);
  const [gender, setGender] = useState<'male' | 'female' | 'non-binary'>('male');
  const [genderIdentity, setGenderIdentity] = useState<GenderIdentity>('cisgender');
  const [genderIdentityCustom, setGenderIdentityCustom] = useState('');
  const [sexualOrientation, setSexualOrientation] = useState<SexualOrientation>('heterosexual');
  const [sexualOrientationCustom, setSexualOrientationCustom] = useState('');
  const isGay = sexualOrientation === 'homosexual';
  const isBisexual = sexualOrientation === 'bisexual';
  const isTransgender = genderIdentity === 'transgender';
  const [selectedPathologies, setSelectedPathologies] = useState<string[]>([]);
  const [twinGroup, setTwinGroup] = useState('');
  const [twinType, setTwinType] = useState<TwinType | ''>('');
  const [notes, setNotes] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [isStillborn, setIsStillborn] = useState(false);
  const [hasTrauma, setHasTrauma] = useState(false);
  const [traumaNotes, setTraumaNotes] = useState('');
  const [traumas, setTraumas] = useState<string[]>([]);
  const [isUnknown, setIsUnknown] = useState(false);

  const [birthYearUnsure, setBirthYearUnsure] = useState(false);
  const [deathYearUnsure, setDeathYearUnsure] = useState(false);
  const [addPathologyModalOpen, setAddPathologyModalOpen] = useState(false);

  // Translated labels for family link types
  const familyLinkLabel = (id: UnionStatus): string => {
    const key = id as keyof typeof t.familyLinks;
    return t.familyLinks[key] || id;
  };

  // Translated labels for emotional link types
  const emotionalLinkLabel = (id: EmotionalLinkType): string => {
    const key = id as keyof typeof t.emotionalLinkTypes;
    return t.emotionalLinkTypes[key] || id;
  };

  // Translated gender identity label
  const genderIdentityLabel = (id: GenderIdentity): string => {
    if (id === 'transgender') return t.memberEdit.transgender;
    return id;
  };

  // Translated sexual orientation label
  const sexualOrientationLabel = (id: SexualOrientation, g: 'male' | 'female' | 'non-binary'): string => {
    if (id === 'homosexual') return g === 'female' ? t.memberEdit.homosexualF : t.memberEdit.homosexualM;
    if (id === 'bisexual') return g === 'female' ? t.memberEdit.bisexualF : t.memberEdit.bisexualM;
    return id;
  };

  useEffect(() => {
    if (member) {
      setIsEditing(initialEditing);
      setFirstName(member.firstName);
      setLastName(member.lastName);
      setBirthName(member.birthName || '');
      setBirthYear(member.birthYear ? String(member.birthYear) : '');
      setBirthYearUnsure(!!member.birthYearUnsure);
      setDeathYear(member.deathYear ? String(member.deathYear) : '');
      setDeathYearUnsure(!!member.deathYearUnsure);
      setProfession(member.profession);
      setIsRetired(!!member.isRetired);
      setGender(member.gender);
      setGenderIdentity(member.genderIdentity ?? (member.isTransgender ? 'transgender' : 'cisgender'));
      setGenderIdentityCustom(member.genderIdentityCustom ?? '');
      setSexualOrientation(
        member.sexualOrientation ??
        (member.isGay ? 'homosexual' : member.isBisexual ? 'bisexual' : 'heterosexual')
      );
      setSexualOrientationCustom(member.sexualOrientationCustom ?? '');
      setSelectedPathologies(member.pathologies || []);
      setTwinGroup(member.twinGroup || '');
      setTwinType(member.twinType || '');
      setNotes(member.notes || '');
      setAvatar(member.avatar);
      setIsStillborn(member.perinatalType === 'stillborn');
      setHasTrauma(!!member.hasTrauma);
      setTraumaNotes(member.traumaNotes || '');
      setTraumas(member.traumas || []);
      setIsUnknown(!!member.isUnknown);
    }
  }, [member]);

  const currentYear = new Date().getFullYear();
  const parsedBirthYear = parseInt(birthYear, 10);
  const parsedDeathYear = deathYear ? parseInt(deathYear, 10) : undefined;
  const age = parsedBirthYear && !isNaN(parsedBirthYear)
    ? (parsedDeathYear && !isNaN(parsedDeathYear) ? parsedDeathYear - parsedBirthYear : currentYear - parsedBirthYear)
    : 0;

  const isDeceased = !!deathYear;
  const isExisting = member ? (member.firstName !== 'Nouveau' && member.firstName !== '') : false;

  const buildMember = useCallback((): FamilyMember | null => {
    if (!member) return null;
    if (isUnknown && !member.isIndexPatient) {
      return {
        ...member,
        firstName: '',
        lastName: '',
        birthName: undefined,
        birthYear: 0,
        birthYearUnsure: undefined,
        deathYear: undefined,
        deathYearUnsure: undefined,
        age: 0,
        profession: '',
        isRetired: undefined,
        gender,
        isGay: false,
        isBisexual: false,
        isTransgender: false,
        genderIdentity: 'cisgender',
        genderIdentityCustom: undefined,
        sexualOrientation: 'heterosexual',
        sexualOrientationCustom: undefined,
        pathologies: [],
        twinGroup: undefined,
        twinType: undefined,
        notes: undefined,
        avatar: undefined,
        hasTrauma: undefined,
        traumaNotes: undefined,
        traumas: undefined,
        isUnknown: true,
        isDraft: false,
        isPlaceholder: false,
      };
    }
    return {
      ...member,
      firstName: firstName || '',
      lastName: lastName || member.lastName,
      birthName: birthName || undefined,
      birthYear: parsedBirthYear && !isNaN(parsedBirthYear) ? parsedBirthYear : 0,
      birthYearUnsure: birthYearUnsure || undefined,
      deathYear: parsedDeathYear && !isNaN(parsedDeathYear) ? parsedDeathYear : undefined,
      deathYearUnsure: deathYearUnsure || undefined,
      age: age || 30,
      profession,
      isRetired: isRetired || undefined,
      gender,
      isGay,
      isBisexual,
      isTransgender,
      genderIdentity,
      genderIdentityCustom: undefined,
      sexualOrientation,
      sexualOrientationCustom: undefined,
      pathologies: selectedPathologies,
      twinGroup: twinGroup || undefined,
      twinType: (twinType as TwinType) || undefined,
      perinatalType: isStillborn ? 'stillborn' : (twinGroup ? undefined : member.perinatalType),
      notes: notes || undefined,
      avatar: avatar || undefined,
      hasTrauma: hasTrauma || undefined,
      traumaNotes: hasTrauma && traumaNotes ? traumaNotes : undefined,
      traumas: hasTrauma && traumas.length > 0 ? traumas : undefined,
      isUnknown: undefined,
      isDraft: false,
    };
  }, [member, isUnknown, firstName, lastName, birthName, parsedBirthYear, parsedDeathYear, birthYearUnsure, deathYearUnsure, age, profession, isRetired, gender, isGay, isBisexual, isTransgender, genderIdentity, genderIdentityCustom, sexualOrientation, sexualOrientationCustom, selectedPathologies, twinGroup, twinType, isStillborn, notes, avatar, hasTrauma, traumaNotes, traumas, currentYear]);

  useEffect(() => {
    if (open && member && onLiveUpdate) {
      const updated = buildMember();
      if (updated) onLiveUpdate(updated);
    }
  }, [firstName, lastName, birthName, birthYear, deathYear, birthYearUnsure, deathYearUnsure, profession, isRetired, gender, genderIdentity, genderIdentityCustom, sexualOrientation, sexualOrientationCustom, selectedPathologies, twinGroup, twinType, isStillborn, notes, avatar, hasTrauma, traumaNotes, traumas, isUnknown]);

  if (!member) return null;

  const togglePathology = (id: string) => {
    setSelectedPathologies(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    const updated = buildMember();
    if (updated) onSave(updated);
    onClose();
  };

  const memberUnions = unions.filter(u => u.partner1 === member.id || u.partner2 === member.id);

  const isPerinatal = !!member.perinatalType;

  const perinatalLabel =
    member.perinatalType === 'pregnancy' ? t.memberEdit.pregnancy :
    member.perinatalType === 'miscarriage' ? t.memberEdit.miscarriage :
    member.perinatalType === 'abortion' ? t.memberEdit.abortion :
    member.perinatalType === 'stillborn' ? t.memberEdit.stillborn : '';

  // ── Perinatal-specific drawer ──
  if (isPerinatal) {
    const handlePerinatalSave = () => {
      if (!member) return;
      const updated: FamilyMember = {
        ...member,
        birthYear: parsedBirthYear && !isNaN(parsedBirthYear) ? parsedBirthYear : 0,
        birthYearUnsure: birthYearUnsure || undefined,
        isDraft: member.isDraft ?? false,
      };
      onSave(updated);
      onClose();
    };

    return (
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent side="right" className="w-[340px] sm:w-[380px] p-0 flex flex-col border-l border-border/50 bg-card" onInteractOutside={(e) => e.preventDefault()}>
          <div className="px-4 pt-4 pb-3 pr-14">
            <SheetHeader>
              <SheetTitle className="text-sm font-semibold">{perinatalLabel}</SheetTitle>
            </SheetHeader>

            <div className="flex items-center gap-3 mt-3 px-3 py-2.5 rounded-xl bg-accent/20 border border-border/50">
              <div className="shrink-0">
                <MemberIcon
                  gender={member.gender}
                  perinatalType={member.perinatalType}
                  size={44}
                  className="text-foreground"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{perinatalLabel}</p>
                {parsedBirthYear > 0 && (
                  <p className="text-xs text-muted-foreground">{birthYearUnsure ? '~' : ''}{birthYear}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-4 p-6">
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {t.memberEdit.eventYear}
              </Label>
              <div className="flex items-center gap-1">
                <Input
                  className="h-8 text-sm border-border/50 bg-card focus-visible:ring-primary/30 flex-1"
                  type="number"
                  placeholder="ex: 2020"
                  min={1900}
                  max={2100}
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  autoFocus
                />
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setBirthYearUnsure(prev => !prev)}
                        className={`shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                          birthYearUnsure
                            ? 'bg-primary/10 border-primary/30 text-primary'
                            : 'border-border/50 text-muted-foreground/40 hover:text-muted-foreground hover:border-border'
                        }`}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {birthYearUnsure ? t.memberEdit.dateMarkedUncertain : t.memberEdit.markUncertain}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button onClick={handlePerinatalSave} size="sm" className="flex-1">
                <Check className="w-3.5 h-3.5 mr-1.5" />
                {t.common.save}
              </Button>
              {onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t.memberEdit.deleteEvent}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t.memberEdit.irreversible}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => { onDelete(member.id); onClose(); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {t.common.delete}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-[340px] sm:w-[380px] p-0 flex flex-col border-l border-border/50 bg-card" data-member-edit-drawer onInteractOutside={(e) => e.preventDefault()}>
        {/* ── Header with live preview ── */}
        <div className="px-4 pt-4 pb-3 pr-14">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle className="text-sm font-semibold">
                {!isEditing ? t.memberEdit.memberSheet : isExisting ? t.memberEdit.editMember : t.memberEdit.newMember}
              </SheetTitle>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5 h-8 font-medium border-primary/30 text-primary hover:bg-primary/10 hover:text-primary mr-1"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  {t.memberEdit.edit}
                </Button>
              )}
            </div>
          </SheetHeader>

        </div>

        <Separator />

        <ScrollArea className="flex-1 px-3">
          {isEditing ? (
            <div className="flex flex-col gap-5 py-4 px-3">
              {/* ── Unknown member toggle ── */}
              {!member.isIndexPatient && (
                <label className="flex items-center gap-2 cursor-pointer -mb-1">
                  <Checkbox
                    checked={isUnknown}
                    onCheckedChange={(v) => setIsUnknown(v === true)}
                  />
                  <span className="text-xs text-muted-foreground">
                    Membre inconnu
                  </span>
                </label>
              )}

              {!isUnknown && (<>
              {/* ── Photo ── */}
              <div className="flex flex-col gap-1">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t.memberEdit.photo}
                </Label>
                {genogramId ? (
                  <MemberAvatarUpload
                    memberId={member.id}
                    genogramId={genogramId}
                    currentAvatar={avatar}
                    onAvatarChange={setAvatar}
                    size={56}
                  />
                ) : (
                  <p className="text-[10px] text-muted-foreground/50 italic">{t.memberEdit.saveForPhoto}</p>
                )}
              </div>

              {/* ── Identity ── */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{t.memberEdit.firstNames}</Label>
                  <Input className="h-8 text-sm border-border/50 bg-card focus-visible:ring-primary/30" placeholder="ex: Marie, Jeanne" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus disabled={member.isIndexPatient} />
                  <span className="text-[9px] text-muted-foreground/60">{t.memberEdit.firstNameHint}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{t.memberEdit.lastNameLabel}</Label>
                  <Input className="h-8 text-sm border-border/50 bg-card focus-visible:ring-primary/30" placeholder="ex: Dupont" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={member.isIndexPatient} />
                </div>
              </div>
              {member.isIndexPatient && (
                <p className="text-[9px] text-muted-foreground/60 italic -mt-3 leading-tight">
                  {t.memberEdit.indexPatientNote}
                </p>
              )}

              <div className="flex flex-col gap-1">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t.memberEdit.birthName}
                </Label>
                <Input className="h-8 text-sm border-border/50 bg-card focus-visible:ring-primary/30" placeholder="ex: Martin" value={birthName} onChange={(e) => setBirthName(e.target.value)} />
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{t.memberEdit.genderLabel}</Label>
                <div className="flex h-8 rounded-lg border border-border/50 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`flex-1 text-sm font-medium transition-colors ${
                      gender === 'female'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    {t.memberEdit.female}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`flex-1 text-sm font-medium transition-colors border-l border-border/50 ${
                      gender === 'male'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    {t.memberEdit.male}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{t.memberEdit.profession}</Label>
                <Input className="h-8 text-sm border-border/50 bg-card focus-visible:ring-primary/30" placeholder="ex: Médecin" value={profession} onChange={(e) => setProfession(e.target.value)} />
                <label className="flex items-center gap-2 mt-1 cursor-pointer">
                  <Checkbox checked={isRetired} onCheckedChange={(v) => setIsRetired(v === true)} />
                  <span className="text-xs text-muted-foreground">{gender === 'female' ? t.memberEdit.retiredF : t.memberEdit.retiredM}</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {t.memberEdit.birth}
                    {age > 0 && !isDeceased && (
                      <span className="ml-1 text-[9px] font-normal text-primary/70">({age} {t.memberEdit.yearsOld})</span>
                    )}
                  </Label>
                  <div className="flex items-center gap-1">
                    <Input className="h-8 text-sm border-border/50 bg-card focus-visible:ring-primary/30 flex-1" type="number" placeholder={t.memberEdit.alive} min={1900} max={2100} value={birthYear} onChange={(e) => setBirthYear(e.target.value)} />
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setBirthYearUnsure(prev => !prev)}
                            className={`shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                              birthYearUnsure
                                ? 'bg-primary/10 border-primary/30 text-primary'
                                : 'border-border/50 text-muted-foreground/40 hover:text-muted-foreground hover:border-border'
                            }`}
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          {birthYearUnsure ? t.memberEdit.dateMarkedUncertain : t.memberEdit.markUncertain}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{t.memberEdit.death}</Label>
                  <div className="flex items-center gap-1">
                    <Input className="h-8 text-sm border-border/50 bg-card focus-visible:ring-primary/30 flex-1" type="number" placeholder={t.memberEdit.alive} min={1900} max={2100} value={deathYear} onChange={(e) => setDeathYear(e.target.value)} />
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setDeathYearUnsure(prev => !prev)}
                            className={`shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                              deathYearUnsure
                                ? 'bg-primary/10 border-primary/30 text-primary'
                                : 'border-border/50 text-muted-foreground/40 hover:text-muted-foreground hover:border-border'
                            }`}
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          {deathYearUnsure ? t.memberEdit.dateMarkedUncertain : t.memberEdit.markUncertain}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
              {isDeceased && (
                <p className="text-xs text-muted-foreground -mt-1 ml-1">
                  {t.memberEdit.deceasedAt} {parsedDeathYear && parsedBirthYear ? parsedDeathYear - parsedBirthYear : '?'} {t.memberEdit.yearsOld}
                </p>
              )}

              <Separator className="opacity-50" />

              {/* ── Identity & Orientation + Pathologies (popovers) ── */}
              <div className="flex flex-col gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-3 w-full px-3 py-3 rounded-lg border border-border bg-accent/30 hover:bg-accent/50 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                        <Fingerprint className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex flex-col items-start gap-0.5 flex-1 min-w-0">
                        <span className="text-[11px] font-semibold text-foreground/80 uppercase tracking-wider text-left">
                          {t.memberEdit.genderAndOrientation}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {genderIdentity !== 'cisgender' || sexualOrientation !== 'heterosexual'
                            ? [
                                genderIdentity !== 'cisgender' ? genderIdentityLabel(genderIdentity) : '',
                                sexualOrientation !== 'heterosexual' ? sexualOrientationLabel(sexualOrientation, gender) : '',
                              ].filter(Boolean).join(', ')
                            : '—'}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="left" align="start" sideOffset={8} collisionPadding={16} className="w-[240px] p-3 flex flex-col gap-3 z-[200]">
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">{t.memberEdit.genderIdentity}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {GENDER_IDENTITY_OPTIONS.map(opt => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setGenderIdentity(genderIdentity === opt.id ? 'cisgender' : opt.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                              genderIdentity === opt.id
                                ? 'bg-primary/10 border-primary/30 text-foreground'
                                : 'border-border/50 bg-card text-muted-foreground hover:border-border hover:bg-accent/30'
                            }`}
                          >
                            {genderIdentityLabel(opt.id)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Separator className="opacity-50" />
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">{t.memberEdit.sexualOrientation}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {SEXUAL_ORIENTATION_OPTIONS.map(opt => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setSexualOrientation(sexualOrientation === opt.id ? 'heterosexual' : opt.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                              sexualOrientation === opt.id
                                ? 'bg-primary/10 border-primary/30 text-foreground'
                                : 'border-border/50 bg-card text-muted-foreground hover:border-border hover:bg-accent/30'
                            }`}
                          >
                            {sexualOrientationLabel(opt.id, gender)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-3 w-full px-3 py-3 rounded-lg border border-border bg-accent/30 hover:bg-accent/50 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                        <Activity className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex flex-col items-start gap-0.5 flex-1 min-w-0">
                        <span className="text-[11px] font-semibold text-foreground/80 uppercase tracking-wider">
                          {t.memberEdit.pathologiesLabel}
                        </span>
                        <div className="flex items-center gap-1">
                          {selectedPathologies.length > 0 ? (
                            <>
                              {dynamicPathologies
                                .filter(p => selectedPathologies.includes(p.id))
                                .slice(0, 4)
                                .map(p => (
                                  <span key={p.id} className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: p.color_hex }} />
                                ))}
                              <span className="text-xs text-muted-foreground ml-0.5">{selectedPathologies.length}</span>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                    </button>
                  </PopoverTrigger>
                <PopoverContent
                  side="left"
                  align="start"
                  sideOffset={8}
                  collisionPadding={16}
                  className="w-auto min-w-[280px] max-w-[380px] max-h-[calc(100vh-32px)] p-3 flex flex-col z-[200]"
                >
                  <div className="flex min-h-0 flex-col gap-2">
                    <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                      {t.memberEdit.pathologiesLabel} ({selectedPathologies.length})
                    </span>
                    {dynamicPathologies.length === 0 ? (
                      <p className="text-xs text-muted-foreground/50 italic">{t.memberEdit.noPathologyDefined}</p>
                    ) : (
                      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1">
                        <div className="flex flex-col gap-1">
                          {dynamicPathologies.map(p => (
                            <div
                              key={p.id}
                              className="flex items-center gap-2.5 py-1.5 hover:bg-accent/20 rounded-md px-1 -mx-1 transition-colors group"
                            >
                              <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                                <Checkbox
                                  checked={selectedPathologies.includes(p.id)}
                                  onCheckedChange={() => togglePathology(p.id)}
                                  className="border-primary/40"
                                />
                                <span
                                  className="w-3.5 h-3.5 rounded shrink-0"
                                  style={{ backgroundColor: p.color_hex }}
                                />
                                <span className="text-sm text-foreground whitespace-nowrap">{t.pathologyNames[p.name] ?? p.name}</span>
                              </label>
                              {onDeletePathology && (
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setSelectedPathologies(prev => prev.filter(id => id !== p.id));
                                    await onDeletePathology(p.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all shrink-0"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {onAddPathology && (
                      <button
                        onClick={() => setAddPathologyModalOpen(true)}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-border/60 text-sm text-muted-foreground hover:border-border hover:text-foreground transition-colors mt-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {t.memberEdit.addPathology}
                      </button>
                    )}
                  </div>
                </PopoverContent>
               </Popover>
              </div>

              <AddPathologyModal
                open={addPathologyModalOpen}
                onClose={() => setAddPathologyModalOpen(false)}
                onAdd={async (name, color) => {
                  if (onAddPathology) {
                    const result = await onAddPathology(name, color);
                    if (result?.data) {
                      setSelectedPathologies(prev => [...prev, result.data.id]);
                    }
                  }
                }}
              />

              <Separator className="opacity-50" />

              {/* ── Vécu d'événement(s) traumatogène(s) ── */}
              <div className="flex flex-col gap-2">
                <label className="flex items-center justify-between cursor-pointer gap-2">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3 h-3" style={{ color: '#E24B4A', fill: '#E24B4A' }} strokeWidth={1.5} />
                    Vécu d'événement(s) traumatogène(s)
                  </span>
                  <Switch
                    checked={hasTrauma}
                    onCheckedChange={setHasTrauma}
                  />
                </label>
                {hasTrauma && (
                  <div className="flex flex-col gap-3 p-3 rounded-lg bg-accent/30 border border-border/50">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Type d'événement(s)
                      </Label>
                      <TraumaTagInput
                        values={traumas}
                        onChange={setTraumas}
                        placeholder="Rechercher ou créer (ex: Deuil, Accident…)"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Description (optionnel)
                      </Label>
                      <Textarea
                        className="text-sm border-border/50 bg-card focus-visible:ring-primary/30 min-h-[80px] resize-y"
                        placeholder="Contexte, période, circonstances…"
                        value={traumaNotes}
                        onChange={(e) => setTraumaNotes(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator className="opacity-50" />

              {/* ── Twins / Triplets ── */}
              <div className="flex flex-col gap-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">{t.memberEdit.twins}</span>
                  <Switch
                    checked={!!twinGroup}
                    onCheckedChange={(checked) => setTwinGroup(checked ? 'Jumeaux' : '')}
                  />
                </label>
                {twinGroup && (
                  <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-accent/30 border border-border/50">
                    <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Type</Label>
                    <Select
                      value={twinGroup === 'Triplés' ? 'triplets' : 'twins'}
                      onValueChange={(v) => setTwinGroup(v === 'triplets' ? 'Triplés' : 'Jumeaux')}
                    >
                      <SelectTrigger className="h-8 text-sm border-border/50 bg-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twins">Jumeaux (2)</SelectItem>
                        <SelectItem value="triplets">Triplés (3)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* ── Mortinaissance (for twin/triplet members) ── */}
              {twinGroup && (
                <div className="flex flex-col gap-2">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Mortinaissance</span>
                    <Switch
                      checked={isStillborn}
                      onCheckedChange={setIsStillborn}
                    />
                  </label>
                </div>
              )}

              <Separator className="opacity-50" />

              {/* ── Notes ── */}
              <div className="flex flex-col gap-1">
                <Label className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {t.memberEdit.clinicalNotes}
                </Label>
                <Textarea
                  className="text-sm border-border/50 bg-card focus-visible:ring-primary/30 min-h-[100px] resize-y"
                  placeholder={t.memberEdit.notesPlaceholder}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Separator className="opacity-50" />

              {/* ── Unions (editing) ── */}
              {memberUnions.length > 0 && (
                <div className="flex flex-col gap-3">
                  <span className="text-[11px] font-semibold text-foreground/70 uppercase tracking-wider flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-primary/60" />
                    {t.memberEdit.relations} ({memberUnions.length})
                  </span>
                  {memberUnions.map(union => {
                    const partnerId = union.partner1 === member.id ? union.partner2 : union.partner1;
                    const partner = allMembers.find(m => m.id === partnerId);
                    const partnerName = partner ? `${partner.firstName} ${partner.lastName}` : partnerId;
                    const childCount = union.children.filter(cId => {
                      const child = allMembers.find(m => m.id === cId);
                      return !child?.perinatalType || child.perinatalType === 'stillborn';
                    }).length;
                    return (
                      <div key={union.id} className="flex flex-col gap-3 p-3.5 rounded-xl bg-primary/5 border border-primary/15 shadow-sm">
                        <div className="flex items-center gap-2.5">
                          {partner && (
                            <div className="w-7 h-7 rounded-lg bg-accent/40 flex items-center justify-center shrink-0">
                              <MemberIcon gender={partner.gender} size={18} className="text-foreground" />
                            </div>
                          )}
                          <span className="text-sm font-semibold text-foreground truncate flex-1">{partnerName}</span>
                          {childCount > 0 && (
                            <span className="text-[10px] font-medium text-primary/70 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-0.5 shrink-0">
                              {childCount} {childCount > 1 ? t.memberEdit.childrenPlural : t.memberEdit.children}
                            </span>
                          )}
                        </div>
                        <Select
                          value={union.status}
                          onValueChange={(v) => onUpdateUnion?.(union.id, { status: v as UnionStatus })}
                        >
                          <SelectTrigger className="h-9 text-sm border-border/70 bg-card font-medium">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FAMILY_LINK_TYPES.map(flt => (
                              <SelectItem key={flt.id} value={flt.id} className="text-xs">
                                {flt.icon} {familyLinkLabel(flt.id)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {/* Year fields */}
                        {(() => {
                          const eventLabelMap: Record<UnionStatus, string> = {
                            married: t.memberEdit.marriageYear,
                            common_law: t.memberEdit.commonLawYear,
                            separated: t.memberEdit.separationYear,
                            divorced: t.memberEdit.divorceYear,
                            widowed: t.memberEdit.widowYear,
                            love_affair: t.memberEdit.loveAffairYear,
                          };
                          const hideEnd = ['separated', 'divorced', 'widowed'].includes(union.status);

                          const renderUnsureBtn = (active: boolean, onToggle: () => void) => (
                            <TooltipProvider delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={onToggle}
                                    className={`shrink-0 w-7 h-7 rounded-md border flex items-center justify-center transition-colors ${
                                      active
                                        ? 'bg-primary/10 border-primary/30 text-primary'
                                        : 'border-border/50 text-muted-foreground/40 hover:text-muted-foreground hover:border-border'
                                    }`}
                                  >
                                    <HelpCircle className="w-3 h-3" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  {active ? t.memberEdit.dateMarkedUncertain : t.memberEdit.markUncertain}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );

                          return (
                            <div className="flex flex-col gap-2.5 pt-1">
                              <div className="flex flex-col gap-1">
                                <Label className="text-[10px] font-semibold text-foreground/60 uppercase tracking-wider">{t.memberEdit.meetingYear}</Label>
                                <div className="flex items-center gap-1.5">
                                  <Input
                                    className="h-9 text-sm border-border/70 bg-card flex-1"
                                    type="number"
                                    placeholder="Année"
                                    value={union.meetingYear || ''}
                                    onChange={(e) => onUpdateUnion?.(union.id, { meetingYear: e.target.value ? parseInt(e.target.value) : undefined })}
                                  />
                                  {renderUnsureBtn(
                                    !!union.meetingYearUnsure,
                                    () => onUpdateUnion?.(union.id, { meetingYearUnsure: !union.meetingYearUnsure })
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Label className="text-[10px] font-semibold text-foreground/60 uppercase tracking-wider">{eventLabelMap[union.status]}</Label>
                                <div className="flex items-center gap-1.5">
                                  <Input
                                    className="h-9 text-sm border-border/70 bg-card flex-1"
                                    type="number"
                                    placeholder="Année"
                                    value={(union.eventYear ?? union.marriageYear) || ''}
                                    onChange={(e) => onUpdateUnion?.(union.id, { eventYear: e.target.value ? parseInt(e.target.value) : undefined, marriageYear: e.target.value ? parseInt(e.target.value) : undefined })}
                                  />
                                  {renderUnsureBtn(
                                    !!union.eventYearUnsure,
                                    () => onUpdateUnion?.(union.id, { eventYearUnsure: !union.eventYearUnsure })
                                  )}
                                </div>
                              </div>
                              {!hideEnd && (
                                <div className="flex flex-col gap-1">
                                  <Label className="text-[10px] font-semibold text-foreground/60 uppercase tracking-wider">{t.memberEdit.endYear}</Label>
                                  <div className="flex items-center gap-1.5">
                                    <Input
                                      className="h-9 text-sm border-border/70 bg-card flex-1"
                                      type="number"
                                      placeholder="Année"
                                      value={(union.endYear ?? union.divorceYear) || ''}
                                      onChange={(e) => onUpdateUnion?.(union.id, { endYear: e.target.value ? parseInt(e.target.value) : undefined, divorceYear: e.target.value ? parseInt(e.target.value) : undefined })}
                                    />
                                    {renderUnsureBtn(
                                      !!union.endYearUnsure,
                                      () => onUpdateUnion?.(union.id, { endYearUnsure: !union.endYearUnsure })
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Emotional links (editing) ── */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">{t.memberEdit.emotionalLinksLabel}</span>
                {emotionalLinks.filter(l => l.from === member.id || l.to === member.id).length === 0 ? (
                  <p className="text-xs text-muted-foreground/50">{t.memberEdit.noEmotionalLink}</p>
                ) : (
                  emotionalLinks
                    .filter(l => l.from === member.id || l.to === member.id)
                    .map(link => {
                      const otherId = link.from === member.id ? link.to : link.from;
                      const other = allMembers.find(m => m.id === otherId);
                      const otherName = other ? `${other.firstName} ${other.lastName}` : otherId;
                      return (
                        <div key={link.id} className="flex items-center gap-2 p-2 rounded-lg bg-accent/10 border border-border/30">
                          <div className="flex-1 min-w-0">
                            <Select
                              value={link.type}
                              onValueChange={(v) => onUpdateEmotionalLink?.(link.id, v as EmotionalLinkType)}
                            >
                              <SelectTrigger className="h-7 text-xs border-border/50 bg-card">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {EMOTIONAL_LINK_TYPES.map(elt => (
                                  <SelectItem key={elt.id} value={elt.id} className="text-xs">
                                    {emotionalLinkLabel(elt.id)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <span className="text-[10px] text-muted-foreground mt-0.5 block truncate">{t.common.with} {otherName}</span>
                          </div>
                          <button
                            onClick={() => onDeleteEmotionalLink?.(link.id)}
                            className="shrink-0 w-6 h-6 rounded flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })
                )}
              </div>
              </>)}

              <Separator className="opacity-50" />

              {/* ── Action buttons ── */}
              <div className="flex flex-col items-center gap-3 pb-4 pt-1">
                <Button onClick={handleSave} className="w-full">
                  {t.common.save}
                </Button>
                {onDelete && !member.isIndexPatient && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 transition-colors">
                        <Trash2 className="w-4 h-4" />
                        {t.memberEdit.deleteMember}
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t.memberEdit.deleteMemberTitle}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t.memberEdit.deleteMemberDesc}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { onDelete(member.id); onClose(); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          {t.common.delete}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ) : (
            /* ═══════════════════════════════════════════════
               VIEW MODE — Read-only display
               ═══════════════════════════════════════════════ */
            <div className="flex flex-col gap-3 py-3 px-3">
              {/* Photo */}
              {avatar && (
                <div className="flex flex-col items-start gap-2">
                  <div className="w-36 h-36 rounded-2xl overflow-hidden border border-border/50 shadow-sm">
                    <img src={avatar} alt={`${firstName} ${lastName}`} className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {/* Identity */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">{t.memberEdit.identity}</span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <span className="text-xs text-muted-foreground">{t.memberEdit.firstNames}</span>
                  <span className="text-xs text-foreground font-medium">{firstName || '—'}</span>
                  <span className="text-xs text-muted-foreground">{t.memberEdit.lastNameLabel}</span>
                  <span className="text-xs text-foreground font-medium">{lastName || '—'}</span>
                  {birthName && (
                    <>
                      <span className="text-xs text-muted-foreground">{t.memberEdit.birthName}</span>
                      <span className="text-xs text-foreground font-medium">{birthName}</span>
                    </>
                  )}
                  <span className="text-xs text-muted-foreground">{t.memberEdit.genderLabel}</span>
                  <span className="text-xs text-foreground font-medium">
                    {gender === 'female' ? t.memberEdit.female : gender === 'male' ? t.memberEdit.male : t.memberEdit.nonBinary}
                  </span>
                  <span className="text-xs text-muted-foreground">{t.memberEdit.profession}</span>
                  <span className="text-xs text-foreground font-medium">
                    {isRetired ? (gender === 'female' ? t.memberEdit.retiredF : t.memberEdit.retiredM) : profession || '—'}
                  </span>
                </div>
              </div>

              <Separator className="opacity-50" />

              {/* Dates */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">{t.memberEdit.dates}</span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <span className="text-xs text-muted-foreground">{t.memberEdit.birth}</span>
                  <span className="text-xs text-foreground font-medium">{birthYearUnsure ? '~' : ''}{birthYear || '—'}</span>
                  {isDeceased && (
                    <>
                      <span className="text-xs text-muted-foreground">{t.memberEdit.death}</span>
                      <span className="text-xs text-foreground font-medium">{deathYearUnsure ? '~' : ''}{deathYear}</span>
                      <span className="text-xs text-muted-foreground">{t.memberEdit.ageAtDeath}</span>
                      <span className="text-xs text-foreground font-medium">
                        {parsedDeathYear && parsedBirthYear ? `${parsedDeathYear - parsedBirthYear} ${t.memberEdit.yearsOld}` : '—'}
                      </span>
                    </>
                  )}
                  {!isDeceased && age > 0 && (
                    <>
                      <span className="text-xs text-muted-foreground">{t.memberEdit.age}</span>
                      <span className="text-xs text-foreground font-medium">{age} {t.memberEdit.yearsOld}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Identity & Orientation (view) */}
              {(isTransgender || isGay || isBisexual) && (
                <>
                  <Separator className="opacity-50" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">{t.memberEdit.genderAndOrientation}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {isTransgender && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-accent/30 border border-border/50 text-foreground">{t.memberEdit.transgender}</span>
                      )}
                      {isGay && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-accent/30 border border-border/50 text-foreground">{member.gender === 'female' ? t.memberEdit.homosexualF : t.memberEdit.homosexualM}</span>
                      )}
                      {isBisexual && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-accent/30 border border-border/50 text-foreground">{member.gender === 'female' ? t.memberEdit.bisexualF : t.memberEdit.bisexualM}</span>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Pathologies (view) */}
              {selectedPathologies.length > 0 && (
                <>
                  <Separator className="opacity-50" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">{t.memberEdit.pathologiesLabel}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {dynamicPathologies
                        .filter(p => selectedPathologies.includes(p.id))
                        .map(p => (
                          <span key={p.id} className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border border-border/50 bg-accent/20 text-foreground">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color_hex }} />
                            {t.pathologyNames[p.name] ?? p.name}
                          </span>
                        ))}
                    </div>
                  </div>
                </>
              )}

              {/* Twins (view) */}
              {twinGroup && (
                <>
                  <Separator className="opacity-50" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">{t.memberEdit.twins}</span>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <span className="text-xs text-muted-foreground">{t.memberEdit.group}</span>
                      <span className="text-xs text-foreground font-medium">{twinGroup}</span>
                      {twinType && (
                        <>
                          <span className="text-xs text-muted-foreground">{t.memberEdit.type}</span>
                          <span className="text-xs text-foreground font-medium">
                            {twinType === 'monozygotic' ? t.memberEdit.monozygotic : t.memberEdit.dizygotic}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Unions (view) */}
              {memberUnions.length > 0 && (
                <>
                  <Separator className="opacity-50" />
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">{t.memberEdit.coupleRelations}</span>
                    {memberUnions.map(union => {
                      const partnerId = union.partner1 === member.id ? union.partner2 : union.partner1;
                      const partner = allMembers.find(m => m.id === partnerId);
                      const partnerName = partner ? `${partner.firstName} ${partner.lastName}` : partnerId;
                      return (
                        <div key={union.id} className="flex items-center gap-2 py-1 px-2 rounded-lg bg-accent/10">
                          <Heart className="w-3 h-3 text-primary/60 shrink-0" />
                          <span className="text-sm text-foreground">{familyLinkLabel(union.status)}</span>
                          <span className="text-sm text-muted-foreground">{t.common.with}</span>
                          <span className="text-sm font-medium text-foreground truncate">{partnerName}</span>
                          {(union.eventYear ?? union.marriageYear) && (
                            <span className="text-[10px] text-muted-foreground ml-auto shrink-0">({union.eventYear ?? union.marriageYear})</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Notes (view) */}
              {notes && (
                <>
                  <Separator className="opacity-50" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {t.memberEdit.clinicalNotes}
                    </span>
                    <div className="rounded-xl bg-accent/20 border border-border/40 px-3 py-2.5">
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed"
                         dangerouslySetInnerHTML={{
                           __html: notes
                             .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                             .replace(/\*(.*?)\*/g, '<em>$1</em>')
                             .replace(/^- (.+)$/gm, '• $1')
                         }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ── Emotional links (read-only) ── */}
              {member && (() => {
                const memberLinks = emotionalLinks.filter(l => l.from === member.id || l.to === member.id);
                if (memberLinks.length === 0) return null;
                return (
                  <>
                    <Separator className="opacity-50" />
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">{t.memberEdit.emotionalLinksLabel}</span>
                      <div className="flex flex-col gap-1">
                        {memberLinks.map(link => {
                          const otherId = link.from === member.id ? link.to : link.from;
                          const other = allMembers.find(m => m.id === otherId);
                          const otherName = other ? `${other.firstName} ${other.lastName}` : otherId;
                          return (
                            <div key={link.id} className="flex items-center gap-2 py-1 px-2 rounded-lg bg-accent/10">
                              <span className="text-sm text-foreground">{emotionalLinkLabel(link.type)}</span>
                              <span className="text-sm text-muted-foreground">{t.common.with}</span>
                              <span className="text-sm font-medium text-foreground truncate">{otherName}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                );
              })()}

              <div className="h-6" />
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default MemberEditDrawer;
