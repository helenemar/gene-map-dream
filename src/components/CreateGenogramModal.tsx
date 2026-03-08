import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { DEFAULT_PATHOLOGIES } from '@/constants/defaultPathologies';

type Gender = 'male' | 'female' | 'non-binary';

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Homme' },
  { value: 'female', label: 'Femme' },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateGenogramModal: React.FC<Props> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<Gender>('female');
  const [birthDate, setBirthDate] = useState('');
  const [isAdopted, setIsAdopted] = useState(false);

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setGender('female');
    setBirthDate('');
    setIsAdopted(false);
  };

  const isValid = firstName.trim().length > 0 && lastName.trim().length > 0 && birthDate.length > 0;

  const handleCreate = async () => {
    if (!user || !isValid || creating) return;
    setCreating(true);

    try {
      const birthYear = new Date(birthDate).getFullYear();
      const age = new Date().getFullYear() - birthYear;
      const now = Date.now();

      const patientId = `m-${now}`;
      const fatherId = `m-${now + 1}`;
      const motherId = `m-${now + 2}`;
      const unionId = `u-${now}`;

      const patientMember = {
        id: patientId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        birthYear,
        age,
        profession: '',
        gender,
        x: 0,
        y: 0,
        pathologies: [],
        isIndexPatient: true,
      };

      const fatherMember = {
        id: fatherId,
        firstName: '',
        lastName: isAdopted ? '' : lastName.trim(),
        birthYear: 0,
        age: 0,
        profession: '',
        gender: 'male' as Gender,
        x: -140,
        y: -200,
        pathologies: [],
        isDraft: true,
        isAdoptiveParent: isAdopted,
      };

      const motherMember = {
        id: motherId,
        firstName: '',
        lastName: '',
        birthYear: 0,
        age: 0,
        profession: '',
        gender: 'female' as Gender,
        x: 140,
        y: -200,
        pathologies: [],
        isDraft: true,
        isAdoptiveParent: isAdopted,
      };

      const parentUnion = {
        id: unionId,
        partner1: fatherId,
        partner2: motherId,
        status: 'married' as const,
        children: [patientId],
        isAdoption: isAdopted,
      };

      const genogramName = `${lastName.trim()} – ${firstName.trim()}`;

      const { data, error } = await supabase
        .from('genograms')
        .insert({
          user_id: user.id,
          name: genogramName,
          data: {
            members: [patientMember, fatherMember, motherMember],
            unions: [parentUnion],
            emotionalLinks: [],
          },
        })
        .select('id')
        .single();

      if (error) throw error;

      // Seed default pathologies for this genogram
      const pathologyRows = DEFAULT_PATHOLOGIES.map(p => ({
        genogram_id: data.id,
        name: p.name,
        color_hex: p.color_hex,
      }));
      await supabase.from('pathologies').insert(pathologyRows);

      queryClient.invalidateQueries({ queryKey: ['genograms'] });
      resetForm();
      onOpenChange(false);

      toast.success(`Génogramme créé avec le patient ${lastName.trim()}`);
      navigate(`/editor/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!creating) { onOpenChange(v); if (!v) resetForm(); } }}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Nouveau fichier</DialogTitle>
          <DialogDescription>
            Renseignez les informations du patient index pour créer votre génogramme.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cg-firstName">Prénom *</Label>
              <Input
                id="cg-firstName"
                placeholder="Prénom"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cg-lastName">Nom *</Label>
              <Input
                id="cg-lastName"
                placeholder="Nom"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Genre *</Label>
            <div className="flex gap-2">
              {GENDER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGender(opt.value)}
                  className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-colors ${
                    gender === opt.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:bg-accent'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cg-birthDate">Date de naissance *</Label>
            <Input
              id="cg-birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2.5 py-1">
            <Checkbox
              id="cg-adopted"
              checked={isAdopted}
              onCheckedChange={(checked) => setIsAdopted(checked === true)}
            />
            <Label htmlFor="cg-adopted" className="text-sm font-normal cursor-pointer">
              Patient adopté
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { onOpenChange(false); resetForm(); }} disabled={creating}>
            Annuler
          </Button>
          <Button onClick={handleCreate} disabled={!isValid || creating} className="gap-2">
            {creating ? 'Création…' : 'Créer le génogramme'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGenogramModal;
