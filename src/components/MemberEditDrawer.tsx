import React, { useState, useEffect, useCallback } from 'react';
import { FamilyMember, TwinType, EmotionalLink, EmotionalLinkType, EMOTIONAL_LINK_TYPES, Union, UnionStatus, FAMILY_LINK_TYPES, GenderIdentity, SexualOrientation, GENDER_IDENTITY_OPTIONS, SEXUAL_ORIENTATION_OPTIONS } from '@/types/genogram';
import type { DynamicPathology } from '@/hooks/usePathologies';
import AddPathologyModal from '@/components/AddPathologyModal';
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
import { Trash2, Heart, Pencil, FileText, Check, HelpCircle, Plus } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import MemberIcon from '@/components/MemberIcon';

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
  /** Called on every field change for live canvas updates */
  onLiveUpdate?: (updated: FamilyMember) => void;
  /** Start in read-only mode when false */
  initialEditing?: boolean;
}

const MemberEditDrawer: React.FC<MemberEditDrawerProps> = ({
  member, open, onClose, onSave, onDelete,
  emotionalLinks = [], members: allMembers = [], unions = [],
  dynamicPathologies = [], onAddPathology, onDeletePathology,
  onUpdateEmotionalLink, onDeleteEmotionalLink, onUpdateUnion, onLiveUpdate,
  initialEditing = true,
}) => {
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
  // Legacy compat
  const isGay = sexualOrientation === 'homosexual';
  const isBisexual = sexualOrientation === 'bisexual';
  const isTransgender = genderIdentity === 'transgender';
  const [selectedPathologies, setSelectedPathologies] = useState<string[]>([]);
  const [twinGroup, setTwinGroup] = useState('');
  const [twinType, setTwinType] = useState<TwinType | ''>('');
  const [notes, setNotes] = useState('');

  const [birthYearUnsure, setBirthYearUnsure] = useState(false);
  const [deathYearUnsure, setDeathYearUnsure] = useState(false);
  const [addPathologyModalOpen, setAddPathologyModalOpen] = useState(false);

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
      // Migrate legacy fields to new model
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

  /** Build the current member state from form fields */
  const buildMember = useCallback((): FamilyMember | null => {
    if (!member) return null;
    return {
      ...member,
      firstName: firstName || 'Nouveau',
      lastName: lastName || member.lastName,
      birthName: birthName || undefined,
      birthYear: parsedBirthYear && !isNaN(parsedBirthYear) ? parsedBirthYear : currentYear - 30,
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
      notes: notes || undefined,
      isDraft: false,
    };
  }, [member, firstName, lastName, birthName, parsedBirthYear, parsedDeathYear, birthYearUnsure, deathYearUnsure, age, profession, isRetired, gender, isGay, isBisexual, isTransgender, genderIdentity, genderIdentityCustom, sexualOrientation, sexualOrientationCustom, selectedPathologies, twinGroup, twinType, notes, currentYear]);

  /** Fire live update to canvas */
  useEffect(() => {
    if (open && member && onLiveUpdate) {
      const updated = buildMember();
      if (updated) onLiveUpdate(updated);
    }
  }, [firstName, lastName, birthName, birthYear, deathYear, birthYearUnsure, deathYearUnsure, profession, isRetired, gender, genderIdentity, genderIdentityCustom, sexualOrientation, sexualOrientationCustom, selectedPathologies, twinGroup, twinType, notes]);

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

  // Find unions involving this member
  const memberUnions = unions.filter(u => u.partner1 === member.id || u.partner2 === member.id);

  const isPerinatal = !!member.perinatalType;

  const perinatalLabel =
    member.perinatalType === 'pregnancy' ? 'Grossesse' :
    member.perinatalType === 'miscarriage' ? 'Fausse couche' :
    member.perinatalType === 'abortion' ? 'Avortement' :
    member.perinatalType === 'stillborn' ? 'Mort-né' : '';

  // ── Perinatal-specific drawer ──
  if (isPerinatal) {
    const handlePerinatalSave = () => {
      if (!member) return;
      const updated: FamilyMember = {
        ...member,
        birthYear: parsedBirthYear && !isNaN(parsedBirthYear) ? parsedBirthYear : 0,
        birthYearUnsure: birthYearUnsure || undefined,
        isDraft: false,
      };
      onSave(updated);
      onClose();
    };

    return (
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent side="right" className="w-[340px] sm:w-[380px] p-0 flex flex-col border-l border-border/50 bg-card">
          <div className="px-4 pt-4 pb-3 pr-14">
            <SheetHeader>
              <SheetTitle className="text-sm font-semibold">{perinatalLabel}</SheetTitle>
            </SheetHeader>

            {/* Icon preview */}
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
                Année de l'événement
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
                      {birthYearUnsure ? 'Date marquée incertaine' : 'Marquer comme incertain'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button onClick={handlePerinatalSave} size="sm" className="flex-1">
                <Check className="w-3.5 h-3.5 mr-1.5" />
                Enregistrer
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
                      <AlertDialogTitle>Supprimer cet événement ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => { onDelete(member.id); onClose(); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Supprimer
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
      <SheetContent side="right" className="w-[340px] sm:w-[380px] p-0 flex flex-col border-l border-border/50 bg-card">
        {/* ── Header with live preview ── */}
        <div className="px-4 pt-4 pb-3 pr-14">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle className="text-sm font-semibold">
                {!isEditing ? 'Fiche membre' : isExisting ? 'Modifier le membre' : 'Nouveau membre'}
              </SheetTitle>
              {!isEditing && isExisting && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs gap-1.5 h-7 text-muted-foreground hover:text-foreground mr-1"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="w-3 h-3" />
                  Modifier
                </Button>
              )}
            </div>
          </SheetHeader>

          {/* ── Live icon preview ── */}
          <div className="flex items-center gap-3 mt-3 px-3 py-2.5 rounded-xl bg-accent/20 border border-border/50">
            <div className="shrink-0">
              <MemberIcon
                gender={gender}
                isGay={isGay}
                isBisexual={isBisexual}
                isTransgender={isTransgender}
                isDead={isDeceased}
                pathologyColors={
                  dynamicPathologies
                    .filter(p => selectedPathologies.includes(p.id))
                    .map(p => p.color_hex)
                }
                size={44}
                className="text-foreground"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate">
                {firstName || 'Nouveau'} {lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {birthYear || '?'}{isDeceased ? ` - ${deathYear}` : ' -'} · {age > 0 ? `${age} ans` : ''}
              </p>
              <p className="text-xs text-muted-foreground truncate">{profession}</p>
            </div>
          </div>
        </div>

        <Separator />

        <ScrollArea className="flex-1 px-3">
          {isEditing ? (
            /* ═══════════════════════════════════════════════
               EDIT MODE — Inputs & Selects
               ═══════════════════════════════════════════════ */
            <div className="flex flex-col gap-3 py-3 px-3">
              {/* ── Identité – grille 2 colonnes ── */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Prénoms</Label>
                  <Input className="h-8 text-sm border-border/50 bg-card focus-visible:ring-primary/30" placeholder="ex: Marie, Jeanne" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus />
                  <span className="text-[9px] text-muted-foreground/60">Séparez les prénoms par une virgule</span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Nom</Label>
                  <Input className="h-8 text-sm border-border/50 bg-card focus-visible:ring-primary/30" placeholder="ex: Dupont" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Nom de naissance
                </Label>
                <Input className="h-8 text-sm border-border/50 bg-card focus-visible:ring-primary/30" placeholder="ex: Martin" value={birthName} onChange={(e) => setBirthName(e.target.value)} />
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Genre</Label>
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
                    Femme
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
                    Homme
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Profession</Label>
                <Input className="h-8 text-sm border-border/50 bg-card focus-visible:ring-primary/30" placeholder="ex: Médecin" value={profession} onChange={(e) => setProfession(e.target.value)} />
                <label className="flex items-center gap-2 mt-1 cursor-pointer">
                  <Checkbox checked={isRetired} onCheckedChange={(v) => setIsRetired(v === true)} />
                  <span className="text-xs text-muted-foreground">Retraité(e)</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Naissance
                    {age > 0 && !isDeceased && (
                      <span className="ml-1 text-[9px] font-normal text-primary/70">({age} ans)</span>
                    )}
                  </Label>
                  <div className="flex items-center gap-1">
                    <Input className="h-8 text-sm border-border/50 bg-card focus-visible:ring-primary/30 flex-1" type="number" placeholder="1985" min={1900} max={2100} value={birthYear} onChange={(e) => setBirthYear(e.target.value)} />
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
                          {birthYearUnsure ? 'Date marquée incertaine' : 'Marquer comme incertain'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Décès</Label>
                  <div className="flex items-center gap-1">
                    <Input className="h-8 text-sm border-border/50 bg-card focus-visible:ring-primary/30 flex-1" type="number" placeholder="Vivant" min={1900} max={2100} value={deathYear} onChange={(e) => setDeathYear(e.target.value)} />
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
                          {deathYearUnsure ? 'Date marquée incertaine' : 'Marquer comme incertain'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
              {isDeceased && (
