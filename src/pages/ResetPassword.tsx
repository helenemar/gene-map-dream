import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import gogyIcon from '@/assets/genogy-icon.webp';
import { useLanguage } from '@/contexts/LanguageContext';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;
    
    // Check hash for recovery type (legacy implicit flow)
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }
    
    // Check query params for PKCE code flow
    if (search.includes('code=') || search.includes('type=recovery')) {
      setIsRecovery(true);
    }

    // Listen for PASSWORD_RECOVERY event (set up BEFORE getSession)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
      // Also treat SIGNED_IN with a session on this page as recovery
      if (event === 'SIGNED_IN' && session) {
        setIsRecovery(true);
      }
    });

    // Then check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error(t.resetPassword.passwordsDontMatch);
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success(t.resetPassword.passwordUpdated);
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || t.resetPassword.updateError);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <img src={gogyIcon} alt="Genogy" className="w-12 h-12 mx-auto mb-4" />
          <p className="text-muted-foreground">{t.resetPassword.invalidLink}</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            {t.resetPassword.backToLogin}
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
          <h1 className="text-xl font-bold text-foreground">{t.resetPassword.newPassword}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t.resetPassword.chooseSecure}</p>
        </div>

        <form onSubmit={handleReset} className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-password">{t.resetPassword.newPasswordLabel}</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">{t.resetPassword.confirmPassword}</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? t.resetPassword.updating : t.resetPassword.updatePassword}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
