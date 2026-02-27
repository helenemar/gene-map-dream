import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import gogyIcon from '@/assets/genogy-icon.svg';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, KeyRound, Wand2, ArrowLeft } from 'lucide-react';

type AuthTab = 'login' | 'signup' | 'magic-link' | 'forgot-password';

const Auth: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (tab === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success('Vérifiez votre email pour confirmer votre inscription !');
      }
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      toast.success('Lien de connexion envoyé ! Vérifiez votre boîte mail.');
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success('Email de réinitialisation envoyé !');
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  const titles: Record<AuthTab, { h1: string; sub: string }> = {
    login: { h1: 'Connexion', sub: 'Accédez à vos génogrammes' },
    signup: { h1: 'Créer un compte', sub: 'Commencez à créer vos génogrammes' },
    'magic-link': { h1: 'Connexion sans mot de passe', sub: 'Recevez un lien magique par email' },
    'forgot-password': { h1: 'Mot de passe oublié', sub: 'Nous vous enverrons un lien de réinitialisation' },
  };

  const showBackButton = tab === 'magic-link' || tab === 'forgot-password';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-8">
          <img src={gogyIcon} alt="Genogy" className="w-14 h-14 mb-4" />
          <h1 className="text-xl font-bold text-foreground">{titles[tab].h1}</h1>
          <p className="text-sm text-muted-foreground mt-1">{titles[tab].sub}</p>
        </div>

        {/* Tab switcher for login/signup */}
        {(tab === 'login' || tab === 'signup') && (
          <div className="flex gap-1 bg-muted rounded-full p-1 mb-6">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${
                tab === 'login'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setTab('signup')}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${
                tab === 'signup'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Inscription
            </button>
          </div>
        )}

        {/* Back button for sub-views */}
        {showBackButton && (
          <button
            onClick={() => setTab('login')}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour
          </button>
        )}

        {/* ─── Login / Signup form ─── */}
        {(tab === 'login' || tab === 'signup') && (
          <form onSubmit={handleEmailPassword} className="bg-card border border-border rounded-2xl p-6 space-y-4">
            {tab === 'signup' && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Nom complet</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Marie Dupont"
                  required
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@cabinet.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                {tab === 'login' && (
                  <button
                    type="button"
                    onClick={() => setTab('forgot-password')}
                    className="text-xs text-primary hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full rounded-full gap-2" disabled={submitting}>
              <KeyRound className="w-4 h-4" />
              {submitting
                ? 'Chargement…'
                : tab === 'login'
                  ? 'Se connecter'
                  : "S'inscrire"}
            </Button>

            {tab === 'login' && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-3 text-muted-foreground">ou</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full gap-2"
                  onClick={() => setTab('magic-link')}
                >
                  <Wand2 className="w-4 h-4" />
                  Connexion par Magic Link
                </Button>
              </>
            )}
          </form>
        )}

        {/* ─── Magic Link form ─── */}
        {tab === 'magic-link' && (
          <form onSubmit={handleMagicLink} className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="magic-email">Email</Label>
              <Input
                id="magic-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@cabinet.com"
                required
              />
            </div>
            <Button type="submit" className="w-full rounded-full gap-2" disabled={submitting}>
              <Mail className="w-4 h-4" />
              {submitting ? 'Envoi en cours…' : 'Envoyer le lien magique'}
            </Button>
          </form>
        )}

        {/* ─── Forgot Password form ─── */}
        {tab === 'forgot-password' && (
          <form onSubmit={handleForgotPassword} className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@cabinet.com"
                required
              />
            </div>
            <Button type="submit" className="w-full rounded-full gap-2" disabled={submitting}>
              <Mail className="w-4 h-4" />
              {submitting ? 'Envoi en cours…' : 'Réinitialiser le mot de passe'}
            </Button>
          </form>
        )}

        {/* Bottom toggle */}
        {(tab === 'login' || tab === 'signup') && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            {tab === 'login' ? "Pas encore de compte ?" : 'Déjà un compte ?'}{' '}
            <button
              onClick={() => setTab(tab === 'login' ? 'signup' : 'login')}
              className="text-primary font-medium hover:underline"
            >
              {tab === 'login' ? "S'inscrire" : 'Se connecter'}
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default Auth;
