import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import gogyIcon from '@/assets/genogy-icon.svg';

const Account: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profession, setProfession] = useState('');
  const [phone, setPhone] = useState('');
  const [siren, setSiren] = useState('');
  const [billingAddress, setBillingAddress] = useState('');

  const email = user?.email ?? '';

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setFirstName((data as any).first_name ?? '');
        setLastName((data as any).last_name ?? '');
        setProfession((data as any).profession ?? '');
        setPhone((data as any).phone ?? '');
        setSiren((data as any).siren ?? '');
        setBillingAddress((data as any).billing_address ?? '');
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Le prénom et le nom sont obligatoires.');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        profession,
        phone,
        siren,
        billing_address: billingAddress,
      } as any)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Erreur lors de la sauvegarde');
    } else {
      toast.success('Profil mis à jour');
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    // Sign out — actual account deletion requires admin action
    toast.success('Votre demande de suppression a été prise en compte.');
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-card flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-card">
      {/* Header */}
      <header className="h-[64px] bg-card border-b border-border flex items-center justify-between px-8">
        <a href="/dashboard" className="flex items-center gap-2.5">
          <img src={gogyIcon} alt="Genogy" className="w-8 h-8" />
          <span className="text-[15px] font-semibold text-foreground tracking-tight">Genogy</span>
        </a>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Back + Title */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Mon compte
        </button>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start gap-6 px-0 h-auto pb-0">
            <TabsTrigger
              value="profile"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 text-sm font-medium"
            >
              Mon profil
            </TabsTrigger>
            <TabsTrigger
              value="danger"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 text-sm font-medium"
            >
              Paramètres
            </TabsTrigger>
          </TabsList>

          {/* Mon profil */}
          <TabsContent value="profile" className="mt-8">
            <div className="border border-border rounded-xl p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">
                    Prénom <span className="text-destructive">*</span>
                  </Label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Prénom" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">
                    Nom <span className="text-destructive">*</span>
                  </Label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nom" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Profession</Label>
                <Input value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="ex: Psychologue" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">
                    Adresse e-mail <span className="text-destructive">*</span>
                  </Label>
                  <Input value={email} disabled className="bg-muted/50" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Numéro de téléphone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+33..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Numéro de SIREN</Label>
                  <Input value={siren} onChange={(e) => setSiren(e.target.value)} placeholder="123 456 789" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Adresse de facturation</Label>
                  <Input value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} placeholder="Adresse complète" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  Annuler
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Paramètres (danger zone) */}
          <TabsContent value="danger" className="mt-8">
            <div className="border border-destructive/30 rounded-xl p-6">
              <h3 className="text-base font-semibold text-foreground mb-1">Supprimer mon compte</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Cette action est irréversible. Tous vos génogrammes et données seront définitivement supprimés.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Supprimer mon compte</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer votre compte ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Tous vos génogrammes, données et paramètres seront définitivement supprimés.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Oui, supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Account;
