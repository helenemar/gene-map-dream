import React, { useState, useEffect } from 'react';
import { FamilyMember } from '@/types/genogram';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const [profession, setProfession] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  useEffect(() => {
    if (member) {
      setFirstName(member.firstName);
      setLastName(member.lastName);
      setBirthYear(member.birthYear ? String(member.birthYear) : '');
      setProfession(member.profession);
      setGender(member.gender);
    }
  }, [member]);

  if (!member) return null;

  const currentYear = new Date().getFullYear();
  const parsedBirthYear = parseInt(birthYear, 10);
  const age = parsedBirthYear && !isNaN(parsedBirthYear) ? currentYear - parsedBirthYear : 0;

  const handleSave = () => {
    onSave({
      ...member,
      firstName: firstName || 'Nouveau',
      lastName: lastName || member.lastName,
      birthYear: parsedBirthYear && !isNaN(parsedBirthYear) ? parsedBirthYear : currentYear - 30,
      age: age || 30,
      profession,
      gender,
    });
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-[320px] sm:w-[360px]">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-base font-semibold">Nouveau membre</SheetTitle>
          <p className="text-sm text-muted-foreground">Saisissez les informations du membre</p>
        </SheetHeader>

        <Separator />

        <div className="flex flex-col gap-5 pt-5">
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
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Profession</Label>
            <Input className="h-9" placeholder="ex: Médecin" value={profession} onChange={(e) => setProfession(e.target.value)} />
          </div>

          <Button onClick={handleSave} className="mt-2 w-full">
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
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MemberEditDrawer;
