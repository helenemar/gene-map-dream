import React, { useState, useEffect } from 'react';
import { FamilyMember, PATHOLOGIES, TwinType } from '@/types/genogram';
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

interface MemberEditDrawerProps {
  member: FamilyMember | null;
  open: boolean;
  onClose: () => void;
  onSave: (updated: FamilyMember) => void;
  onDelete?: (id: string) => void;
}

const MemberEditDrawer: React.FC<MemberEditDrawerProps> = ({ member, open, onClose, onSave, onDelete }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [deathYear, setDeathYear] = useState('');
  const [profession, setProfession] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [isGay, setIsGay] = useState(false);
  const [isBisexual, setIsBisexual] = useState(false);
  const [isTransgender, setIsTransgender] = useState(false);
  const [selectedPathologies, setSelectedPathologies] = useState<string[]>([]);
  const [twinGroup, setTwinGroup] = useState('');
  const [twinType, setTwinType] = useState<TwinType | ''>('');

  useEffect(() => {
    if (member) {
      setFirstName(member.firstName);
      setLastName(member.lastName);
      setBirthYear(member.birthYear ? String(member.birthYear) : '');
      setDeathYear(member.deathYear ? String(member.deathYear) : '');
      setProfession(member.profession);
      setGender(member.gender);
      setIsGay(!!member.isGay);
      setIsBisexual(!!member.isBisexual);
      setIsTransgender(!!member.isTransgender);
      setSelectedPathologies(member.pathologies || []);
      setTwinGroup(member.twinGroup || '');
      setTwinType(member.twinType || '');
    }
  }, [member]);

  if (!member) return null;

  const currentYear = new Date().getFullYear();
  const parsedBirthYear = parseInt(birthYear, 10);
  const parsedDeathYear = deathYear ? parseInt(deathYear, 10) : undefined;
  const age = parsedBirthYear && !isNaN(parsedBirthYear)
    ? (parsedDeathYear && !isNaN(parsedDeathYear) ? parsedDeathYear - parsedBirthYear : currentYear - parsedBirthYear)
    : 0;

  const isDeceased = !!deathYear;
  const isExisting = member.firstName !== 'Nouveau';

  const togglePathology = (id: string) => {
    setSelectedPathologies(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    onSave({
      ...member,
      firstName: firstName || 'Nouveau',
      lastName: lastName || member.lastName,
      birthYear: parsedBirthYear && !isNaN(parsedBirthYear) ? parsedBirthYear : currentYear - 30,
      deathYear: parsedDeathYear && !isNaN(parsedDeathYear) ? parsedDeathYear : undefined,
      age: age || 30,
      profession,
      gender,
      isGay,
      isBisexual,
      isTransgender,
      pathologies: selectedPathologies,
      twinGroup: twinGroup || undefined,
      twinType: (twinType as TwinType) || undefined,
    });
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-[320px] sm:w-[360px] p-0 flex flex-col">
        <div className="px-6 pt-6 pb-4">
          <SheetHeader>
            <SheetTitle className="text-base font-semibold">
              {isExisting ? 'Modifier le membre' : 'Nouveau membre'}
            </SheetTitle>
            <p className="text-sm text-muted-foreground">
              {isExisting ? `${member.firstName} ${member.lastName}` : 'Saisissez les informations du membre'}
            </p>
          </SheetHeader>
        </div>

        <Separator />

        <ScrollArea className="flex-1 px-6">
          <div className="flex flex-col gap-5 py-5">
            {/* ── Identité ── */}
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Genre</Label>
              <Select value={gender} onValueChange={(v) => setGender(v as 'male' | 'female')}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Homme</SelectItem>
                  <SelectItem value="female">Femme</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Prénom</Label>
              <Input className="h-9" placeholder="ex: Marie" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nom</Label>
              <Input className="h-9" placeholder="ex: Dupont" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Année de naissance</Label>
              <Input className="h-9" type="number" placeholder="ex: 1985" min={1900} max={2100} value={birthYear} onChange={(e) => setBirthYear(e.target.value)} />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Année de décès</Label>
              <Input className="h-9" type="number" placeholder="Laisser vide si vivant" min={1900} max={2100} value={deathYear} onChange={(e) => setDeathYear(e.target.value)} />
              {isDeceased && (
                <p className="text-xs text-muted-foreground">⚰️ Décédé(e) — {age} ans</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Profession</Label>
              <Input className="h-9" placeholder="ex: Médecin" value={profession} onChange={(e) => setProfession(e.target.value)} />
            </div>

            <Separator />

            {/* ── Identité de genre & orientation ── */}
            <div className="flex flex-col gap-3">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Identité & Orientation</Label>

              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Personne transgenre</span>
                <Switch checked={isTransgender} onCheckedChange={setIsTransgender} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Homosexuel(le)</span>
                <Switch checked={isGay} onCheckedChange={(v) => { setIsGay(v); if (v) setIsBisexual(false); }} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Bisexuel(le)</span>
                <Switch checked={isBisexual} onCheckedChange={(v) => { setIsBisexual(v); if (v) setIsGay(false); }} />
              </div>
            </div>

            <Separator />

            {/* ── Jumeaux ── */}
            <div className="flex flex-col gap-3">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Jumeaux / Triplés</Label>

              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Groupe de jumeaux</Label>
                <Input
                  className="h-9"
                  placeholder="ex: twin-1 (vide si pas jumeau)"
                  value={twinGroup}
                  onChange={(e) => setTwinGroup(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Les membres partageant le même identifiant seront affichés comme jumeaux/triplés.
                </p>
              </div>

              {twinGroup && (
                <div className="flex flex-col gap-2">
                  <Label className="text-xs text-muted-foreground">Type de jumeaux</Label>
                  <Select value={twinType} onValueChange={(v) => setTwinType(v as TwinType)}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Choisir le type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monozygotic">Monozygote (vrais jumeaux)</SelectItem>
                      <SelectItem value="dizygotic">Dizygote (faux jumeaux)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Separator />

            {/* ── Pathologies ── */}
            <div className="flex flex-col gap-3">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Pathologies ({selectedPathologies.length})
              </Label>
              <div className="flex flex-col gap-2">
                {PATHOLOGIES.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={selectedPathologies.includes(p.id)}
                      onCheckedChange={() => togglePathology(p.id)}
                    />
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: `hsl(var(--pathology-${p.id}))` }}
                    />
                    <span className="text-sm text-foreground">{p.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <Separator />

            <Button onClick={handleSave} className="w-full">
              Enregistrer
            </Button>

            {onDelete && member && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
                    Supprimer ce membre
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer {member.firstName} {member.lastName} ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Le membre sera supprimé du génogramme ainsi que tous ses liens associés.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => { onDelete(member.id); onClose(); }}
                    >
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Bottom spacer for scroll */}
            <div className="h-4" />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default MemberEditDrawer;
