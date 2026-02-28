import React, { useState, useEffect, useCallback } from 'react';
import { FamilyMember, PATHOLOGIES, TwinType, EmotionalLink, EmotionalLinkType, EMOTIONAL_LINK_TYPES, Union, UnionStatus, FAMILY_LINK_TYPES, GenderIdentity, SexualOrientation, GENDER_IDENTITY_OPTIONS, SEXUAL_ORIENTATION_OPTIONS } from '@/types/genogram';
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
import { Trash2, Heart, Pencil, FileText, Check, HelpCircle } from 'lucide-react';
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
  }, [member, firstName, lastName, birthName, parsedBirthYear, parsedDeathYear, birthYearUnsure, deathYearUnsure, age, profession, gender, isGay, isBisexual, isTransgender, genderIdentity, genderIdentityCustom, sexualOrientation, sexualOrientationCustom, selectedPathologies, twinGroup, twinType, notes, currentYear]);

  /** Fire live update to canvas */
  useEffect(() => {
    if (open && member && onLiveUpdate) {
      const updated = buildMember();
      if (updated) onLiveUpdate(updated);
    }
  }, [firstName, lastName, birthName, birthYear, deathYear, birthYearUnsure, deathYearUnsure, profession, gender, genderIdentity, genderIdentityCustom, sexualOrientation, sexualOrientationCustom, selectedPathologies, twinGroup, twinType, notes]);

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
                  PATHOLOGIES
                    .filter(p => selectedPathologies.includes(p.id))
                    .map(p => `hsl(var(--pathology-${p.id}))`)
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
                <Label className={`text-[10px] font-medium uppercase tracking-wider ${gender === 'female' ? 'text-primary' : 'text-muted-foreground'}`}>
                  Nom de naissance / jeune fille
                </Label>
                <Input className="h-8 text-sm border-border/50 bg-card focus-visible:ring-primary/30" placeholder="ex: Martin" value={birthName} onChange={(e) => setBirthName(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Genre</Label>
                  <Select value={gender} onValueChange={(v) => setGender(v as 'male' | 'female' | 'non-binary')}>
                    <SelectTrigger className="h-8 text-sm border-border/50 bg-card"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Homme</SelectItem>
                      <SelectItem value="female">Femme</SelectItem>
                      <SelectItem value="non-binary">Non-binaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Profession</Label>
                  <Input className="h-8 text-sm border-border/50 bg-card focus-visible:ring-primary/30" placeholder="ex: Médecin" value={profession} onChange={(e) => setProfession(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Naissance</Label>
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
                <p className="text-xs text-muted-foreground -mt-1">Décédé(e) — {age} ans</p>
              )}

              <Separator className="opacity-50" />

              {/* ── Identité de genre ── */}
              <div className="flex flex-col gap-2">
                <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Identité de genre</Label>
                <div className="flex flex-wrap gap-2">
                  {GENDER_IDENTITY_OPTIONS.map(opt => {
                    const selected = genderIdentity === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setGenderIdentity(selected ? 'cisgender' : opt.id)}
                        className={`flex items-center gap-1.5 min-h-[32px] px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          selected
                            ? 'bg-primary/10 border-primary/30 text-primary'
                            : 'bg-muted/40 border-transparent text-muted-foreground hover:bg-accent/50'
                        }`}
                      >
                        {selected && <Check className="w-3 h-3 shrink-0" />}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Orientation sexuelle ── */}
              <div className="flex flex-col gap-2">
                <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Orientation sexuelle</Label>
                <div className="flex flex-wrap gap-2">
                  {SEXUAL_ORIENTATION_OPTIONS.map(opt => {
                    const selected = sexualOrientation === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSexualOrientation(selected ? 'heterosexual' : opt.id)}
                        className={`flex items-center gap-1.5 min-h-[32px] px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          selected
                            ? 'bg-primary/10 border-primary/30 text-primary'
                            : 'bg-muted/40 border-transparent text-muted-foreground hover:bg-accent/50'
                        }`}
                      >
                        {selected && <Check className="w-3 h-3 shrink-0" />}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Separator className="opacity-50" />

              {/* ── Relations / Unions ── */}
              <div className="flex flex-col gap-3">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" />
                  Relations ({memberUnions.length})
                </Label>
                {memberUnions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Aucune union. Utilisez le menu « Créer un membre » pour ajouter un conjoint.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {memberUnions.map(union => {
                      const partnerId = union.partner1 === member.id ? union.partner2 : union.partner1;
                      const partner = allMembers.find(m => m.id === partnerId);
                      const partnerName = partner ? (partner.isPlaceholder ? 'Parent inconnu' : `${partner.firstName} ${partner.lastName}`) : partnerId;
                      return (
                        <div key={union.id} className="p-3 rounded-xl bg-accent/30 border border-border/60 flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            {partner && <MemberIcon gender={partner.gender} isDead={!!partner.deathYear} size={24} className="text-foreground shrink-0" />}
                            <span className="text-sm font-medium text-foreground truncate flex-1">{partnerName}</span>
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0">
                              {union.children.length} enfant{union.children.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <Select value={union.status} onValueChange={(v) => onUpdateUnion?.(union.id, { status: v as UnionStatus })}>
                            <SelectTrigger className="h-8 text-xs border-border/40 bg-card"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {FAMILY_LINK_TYPES.map(t => (<SelectItem key={t.id} value={t.id} className="text-xs">{t.icon} {t.label}</SelectItem>))}
                            </SelectContent>
                          </Select>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-muted-foreground uppercase">Année de rencontre</span>
                              <Input className="h-7 text-xs border-border/40 bg-card" type="number" placeholder="—" value={union.marriageYear || ''}
                                onChange={(e) => onUpdateUnion?.(union.id, { marriageYear: e.target.value ? parseInt(e.target.value, 10) : undefined })} />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-muted-foreground uppercase">
                                {union.status === 'divorced' ? 'Divorce' : union.status === 'separated' ? 'Séparation' : union.status === 'widowed' ? 'Veuvage' : 'Fin'}
                              </span>
                              <Input className="h-7 text-xs border-border/40 bg-card" type="number" placeholder="—" value={union.divorceYear || ''}
                                onChange={(e) => onUpdateUnion?.(union.id, { divorceYear: e.target.value ? parseInt(e.target.value, 10) : undefined })} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <Separator className="opacity-50" />

              {/* ── Jumeaux ── */}
              <div className="flex flex-col gap-3">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Jumeaux / Triplés</Label>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">Groupe de jumeaux</Label>
                  <Input className="h-9 border-border/50 bg-card focus-visible:ring-primary/30" placeholder="ex: twin-1 (vide si pas jumeau)" value={twinGroup} onChange={(e) => setTwinGroup(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Les membres partageant le même identifiant seront affichés comme jumeaux/triplés.</p>
                </div>
                {twinGroup && (
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">Type de jumeaux</Label>
                    <Select value={twinType} onValueChange={(v) => setTwinType(v as TwinType)}>
                      <SelectTrigger className="h-9 border-border/50 bg-card"><SelectValue placeholder="Choisir le type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monozygotic">Monozygote (vrais jumeaux)</SelectItem>
                        <SelectItem value="dizygotic">Dizygote (faux jumeaux)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Separator className="opacity-50" />

              {/* ── Pathologies ── */}
              <div className="flex flex-col gap-3">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pathologies ({selectedPathologies.length})</Label>
                <div className="flex flex-col gap-1">
                  {PATHOLOGIES.map((p) => (
                    <label key={p.id} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                      <Checkbox checked={selectedPathologies.includes(p.id)} onCheckedChange={() => togglePathology(p.id)} />
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: `hsl(var(--pathology-${p.id}))` }} />
                      <span className="text-sm text-foreground">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Separator className="opacity-50" />

              {/* ── Notes cliniques ── */}
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Notes cliniques
                </Label>
                <Textarea
                  className="min-h-[80px] text-sm border-border/50 bg-card focus-visible:ring-primary/30 resize-none overflow-hidden"
                  placeholder="Observations, antécédents, contexte familial particulier..."
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    // Auto-resize
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                  onFocus={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                />
              </div>

              {/* ── Liens émotionnels (edit) ── */}
              {member && (() => {
                const memberLinks = emotionalLinks.filter(l => l.from === member.id || l.to === member.id);
                if (memberLinks.length === 0) return (
                  <>
                    <Separator className="opacity-50" />
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Liens émotionnels</Label>
                      <p className="text-xs text-muted-foreground">Aucun lien émotionnel.</p>
                    </div>
                  </>
                );
                return (
                  <>
                    <Separator className="opacity-50" />
                    <div className="flex flex-col gap-3">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Liens émotionnels ({memberLinks.length})</Label>
                      <div className="flex flex-col gap-2">
                        {memberLinks.map(link => {
                          const otherId = link.from === member.id ? link.to : link.from;
                          const other = allMembers.find(m => m.id === otherId);
                          const otherName = other ? `${other.firstName} ${other.lastName}` : otherId;
                          return (
                            <div key={link.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-accent/20 border border-border/40">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground truncate">{otherName}</p>
                                <Select value={link.type} onValueChange={(v) => onUpdateEmotionalLink?.(link.id, v as EmotionalLinkType)}>
                                  <SelectTrigger className="h-7 text-xs mt-1 border-border/40 bg-card"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {EMOTIONAL_LINK_TYPES.map(t => (<SelectItem key={t.id} value={t.id} className="text-xs">{t.label}</SelectItem>))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDeleteEmotionalLink?.(link.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                );
              })()}

              <Separator className="opacity-50" />

              {/* ── Actions ── */}
              <Button onClick={handleSave} className="w-full h-10 font-semibold">Enregistrer</Button>
              {onDelete && member && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer ce membre
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer {firstName || member.firstName} {lastName || member.lastName} ?</AlertDialogTitle>
                      <AlertDialogDescription>Cette action est irréversible. Le membre sera supprimé du génogramme ainsi que tous ses liens associés.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { onDelete(member.id); onClose(); }}>Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <div className="h-6" />
            </div>
          ) : (
            /* ═══════════════════════════════════════════════
               READ MODE — Fiche de synthèse
               ═══════════════════════════════════════════════ */
            <div className="flex flex-col gap-3 py-3 px-3">
              {/* ── Identité ── */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                {firstName && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Prénom</span>
                    <span className="text-sm font-medium text-foreground">{firstName}</span>
                  </div>
                )}
                {lastName && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Nom</span>
                    <span className="text-sm font-medium text-foreground">{lastName}</span>
                  </div>
                )}
                {birthName && birthName !== lastName && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Nom de naissance</span>
                    <span className="text-sm text-foreground">{birthName}</span>
                  </div>
                )}
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Genre</span>
                  <span className="text-sm text-foreground">{gender === 'male' ? 'Homme' : 'Femme'}</span>
                </div>
                {profession && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Profession</span>
                    <span className="text-sm text-foreground">{profession}</span>
                  </div>
                )}
                {birthYear && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Naissance</span>
                    <span className="text-sm text-foreground">{birthYear}</span>
                  </div>
                )}
                {isDeceased && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Décès</span>
                    <span className="text-sm text-foreground">{deathYear} <span className="text-muted-foreground text-xs">({age} ans)</span></span>
                  </div>
                )}
              </div>

              {/* ── Identité & Orientation (read-only) ── */}
              {(genderIdentity !== 'cisgender' || sexualOrientation !== 'heterosexual') && (
                <>
                  <Separator className="opacity-50" />
                  <div className="flex flex-col gap-3">
                    {genderIdentity !== 'cisgender' && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Identité de genre</span>
                        <span className="text-sm font-medium text-foreground">
                          {GENDER_IDENTITY_OPTIONS.find(o => o.id === genderIdentity)?.label}
                        </span>
                      </div>
                    )}
                    {sexualOrientation !== 'heterosexual' && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Orientation sexuelle</span>
                        <span className="text-sm font-medium text-foreground">
                          {SEXUAL_ORIENTATION_OPTIONS.find(o => o.id === sexualOrientation)?.label}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ── Relations (read-only) ── */}
              {memberUnions.length > 0 && (
                <>
                  <Separator className="opacity-50" />
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider flex items-center gap-1.5">
                      <Heart className="w-3 h-3" /> Relations
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {memberUnions.map(union => {
                        const partnerId = union.partner1 === member.id ? union.partner2 : union.partner1;
                        const partner = allMembers.find(m => m.id === partnerId);
                        const partnerName = partner ? (partner.isPlaceholder ? 'Parent inconnu' : `${partner.firstName} ${partner.lastName}`) : partnerId;
                        const linkType = FAMILY_LINK_TYPES.find(t => t.id === union.status);
                        const linkLabel = linkType ? linkType.label : union.status;
                        const yearInfo = union.marriageYear ? ` (${union.marriageYear}${union.divorceYear ? ` - ${union.divorceYear}` : ''})` : '';

                        return (
                          <div key={union.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-accent/10">
                            {partner && <MemberIcon gender={partner.gender} isDead={!!partner.deathYear} size={20} className="text-foreground shrink-0" />}
                            <div className="min-w-0 flex-1">
                              <span className="text-sm text-foreground">{linkLabel}</span>
                              <span className="text-sm text-muted-foreground"> avec </span>
                              <span className="text-sm font-medium text-foreground">{partnerName}</span>
                              {yearInfo && <span className="text-xs text-muted-foreground">{yearInfo}</span>}
                            </div>
                            {union.children.length > 0 && (
                              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0">
                                {union.children.length} enfant{union.children.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* ── Jumeaux (read-only, only if set) ── */}
              {twinGroup && (
                <>
                  <Separator className="opacity-50" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Jumeaux</span>
                    <span className="text-sm text-foreground">
                      Groupe : {twinGroup}
                      {twinType && ` · ${twinType === 'monozygotic' ? 'Monozygote' : 'Dizygote'}`}
                    </span>
                  </div>
                </>
              )}

              {/* ── Pathologies (read-only badges) ── */}
              <Separator className="opacity-50" />
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Pathologies</span>
                {selectedPathologies.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Aucune pathologie renseignée</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {PATHOLOGIES.filter(p => selectedPathologies.includes(p.id)).map(p => (
                      <span
                        key={p.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                        style={{
                          backgroundColor: `hsl(var(--pathology-${p.id}) / 0.15)`,
                          borderColor: `hsl(var(--pathology-${p.id}) / 0.3)`,
                          color: `hsl(var(--pathology-${p.id}))`,
                        }}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `hsl(var(--pathology-${p.id}))` }} />
                        {p.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Notes cliniques (read-only) ── */}
              {notes && (
                <>
                  <Separator className="opacity-50" />
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3 h-3" /> Notes
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

              {/* ── Liens émotionnels (read-only) ── */}
              {member && (() => {
                const memberLinks = emotionalLinks.filter(l => l.from === member.id || l.to === member.id);
                if (memberLinks.length === 0) return null;
                return (
                  <>
                    <Separator className="opacity-50" />
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Liens émotionnels</span>
                      <div className="flex flex-col gap-1">
                        {memberLinks.map(link => {
                          const otherId = link.from === member.id ? link.to : link.from;
                          const other = allMembers.find(m => m.id === otherId);
                          const otherName = other ? `${other.firstName} ${other.lastName}` : otherId;
                          const linkType = EMOTIONAL_LINK_TYPES.find(t => t.id === link.type);
                          return (
                            <div key={link.id} className="flex items-center gap-2 py-1 px-2 rounded-lg bg-accent/10">
                              <span className="text-sm text-foreground">{linkType?.label || link.type}</span>
                              <span className="text-sm text-muted-foreground">avec</span>
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
