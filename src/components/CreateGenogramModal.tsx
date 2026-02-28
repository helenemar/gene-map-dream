import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

type Gender = 'male' | 'female' | 'non-binary';

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Homme' },
  { value: 'female', label: 'Femme' },
  { value: 'non-binary', label: 'Non-binaire' },
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

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setGender('female');
    setBirthDate('');
  };

  const isValid = firstName.trim().length > 0 && lastName.trim().length > 0 && birthDate.length > 0;

  const handleCreate = async () => {
    if (!user || !isValid || creating) return;
    setCreating(true);

    try {
      const birthYear = new Date(birthDate).getFullYear();
      const age = new Date().getFullYear() - birthYear;

      const patientMember = {
        id: `m-${Date.now()}`,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        birthYear,
        age,
        profession: '',
        gender,
        x: 0,
        y: 0,
        pathologies: [],
      };

      const genogramName = `${lastName.trim()} – ${firstName.trim()}`;

      const { data, error } = await supabase
        .from('genograms')
        .insert({
          user_id: user.id,
          name: genogramName,
          data: { members: [patientMember], unions: [], emotionalLinks: [] },
        })
        .select('id')
        .single();

      if (error) throw error;

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
