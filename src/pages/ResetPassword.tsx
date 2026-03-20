import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import gogyIcon from '@/assets/genogy-icon.svg';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }

    // Check if already authenticated via recovery (race condition: event fired before mount)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsRecovery(true);
      }
    });

    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Mot de passe mis à jour !');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <img src={gogyIcon} alt="Genogy" className="w-12 h-12 mx-auto mb-4" />
          <p className="text-muted-foreground">Lien de réinitialisation invalide ou expiré.</p>
          <Button onClick={() => navigate('/auth')} className="mt-4">
            Retour à la connexion
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src={gogyIcon} alt="Genogy" className="w-14 h-14 mb-4" />
          <h1 className="text-xl font-bold text-foreground">Nouveau mot de passe</h1>
          <p className="text-sm text-muted-foreground mt-1">Choisissez un nouveau mot de passe sécurisé</p>
        </div>

        <form onSubmit={handleReset} className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-password">Nouveau mot de passe</Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
