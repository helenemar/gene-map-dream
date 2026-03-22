import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import gogyIcon from '@/assets/genogy-icon.svg';
import { Mail, ArrowLeft, X, Check, Eye, EyeOff } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

type AuthView = 'login' | 'signup' | 'forgot-password' | 'success';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultView?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose, defaultView = 'login' }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [view, setView] = useState<AuthView>(defaultView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (open) {
      setView(defaultView);
      setError('');
      setEmail('');
      setPassword('');
      setFullName('');
      setShowPassword(false);
    }
  }, [open, defaultView]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      onClose();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? t.auth.invalidCredentials : err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: fullName },
        },
      });
      if (error) throw error;
      toast.success(`${t.auth.welcomeToast} ${fullName} ! 🎉`);
      onClose();
      navigate('/dashboard');
    } catch (err: any) {
      if (err.message.includes('already registered')) {
        setError(t.auth.alreadyRegistered);
      } else if (err.message.includes('at least 6')) {
        setError(t.auth.passwordMinLength);
      } else {
        setError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success(t.auth.resetEmailSent);
      setView('login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    const { error } = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
    if (error) toast.error(error.message || t.auth.googleError);
  };

  if (!open) return null;

  const overlayVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, damping: 25, stiffness: 300 } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.15 } },
  };
  const contentVariants = {
    hidden: { opacity: 0, x: 10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, x: -10, transition: { duration: 0.15 } },
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4" initial="hidden" animate="visible" exit="hidden">
          <motion.div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" variants={overlayVariants} onClick={onClose} />

          <motion.div className="relative z-10 w-full max-w-[420px] bg-card rounded-3xl shadow-2xl border border-border overflow-hidden" variants={modalVariants}>
            <button onClick={onClose} className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>

            <div className="p-8">
              <AnimatePresence mode="wait">
                {view === 'login' && (
                  <motion.div key="login" variants={contentVariants} initial="hidden" animate="visible" exit="exit">
                    <div className="flex flex-col items-center mb-6">
                      <img src={gogyIcon} alt="Genogy" className="w-12 h-12 mb-4" />
                      <h2 className="text-xl font-bold text-foreground">{t.auth.welcomeBack}</h2>
                      <p className="text-sm text-muted-foreground mt-1">{t.auth.accessGenograms}</p>
                    </div>

                    <div className="space-y-2.5 mb-5">
                      <Button variant="outline" className="w-full gap-2.5 h-11 rounded-xl" onClick={handleGoogleAuth}>
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        {t.auth.continueGoogle}
                      </Button>
                    </div>

                    <div className="relative mb-5">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                      <div className="relative flex justify-center text-xs"><span className="bg-card px-3 text-muted-foreground">{t.auth.orByEmail}</span></div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-3.5">
                      <div className="space-y-1.5">
                        <Label htmlFor="login-email">{t.auth.email}</Label>
                        <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@cabinet.com" required className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="login-password">{t.auth.password}</Label>
                          <button type="button" onClick={() => { setError(''); setView('forgot-password'); }} className="text-xs text-primary hover:underline">
                            {t.auth.forgotPassword}
                          </button>
                        </div>
                        <div className="relative">
                          <Input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="h-11 rounded-xl pr-10" />
                          <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {error && <p className="text-sm text-destructive">{error}</p>}

                      <Button type="submit" className="w-full h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90" disabled={submitting}>
                        {submitting ? t.auth.logging : t.auth.login}
                      </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground mt-5">
                      {t.auth.noAccount}{' '}
                      <button onClick={() => { setError(''); setView('signup'); }} className="text-primary font-medium hover:underline">
                        {t.auth.createAccount}
                      </button>
                    </p>
                  </motion.div>
                )}

                {view === 'signup' && (
                  <motion.div key="signup" variants={contentVariants} initial="hidden" animate="visible" exit="exit">
                    <div className="flex flex-col items-center mb-6">
                      <img src={gogyIcon} alt="Genogy" className="w-12 h-12 mb-4" />
                      <h2 className="text-xl font-bold text-foreground">{t.auth.joinGenogy}</h2>
                      <p className="text-sm text-muted-foreground mt-1">{t.auth.startCreating}</p>
                    </div>

                    <div className="space-y-2.5 mb-5">
                      <Button variant="outline" className="w-full gap-2.5 h-11 rounded-xl" onClick={handleGoogleAuth}>
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        {t.auth.continueGoogle}
                      </Button>
                    </div>

                    <div className="relative mb-5">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                      <div className="relative flex justify-center text-xs"><span className="bg-card px-3 text-muted-foreground">{t.auth.orByEmail}</span></div>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-3.5">
                      <div className="space-y-1.5">
                        <Label htmlFor="signup-name">{t.auth.fullName}</Label>
                        <Input id="signup-name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Dr. Marie Dupont" required className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="signup-email">{t.auth.email}</Label>
                        <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@cabinet.com" required className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="signup-password">{t.auth.password}</Label>
                        <div className="relative">
                          <Input id="signup-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.auth.minCharsPlaceholder} required minLength={6} className="h-11 rounded-xl pr-10" />
                          <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {error && <p className="text-sm text-destructive">{error}</p>}

                      <Button type="submit" className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" disabled={submitting}>
                        {submitting ? t.auth.creating : t.auth.createMyAccount}
                      </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground mt-5">
                      {t.auth.hasAccount}{' '}
                      <button onClick={() => { setError(''); setView('login'); }} className="text-primary font-medium hover:underline">
                        {t.auth.login}
                      </button>
                    </p>
                  </motion.div>
                )}

                {view === 'forgot-password' && (
                  <motion.div key="forgot" variants={contentVariants} initial="hidden" animate="visible" exit="exit">
                    <button onClick={() => { setError(''); setView('login'); }} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5">
                      <ArrowLeft className="w-3.5 h-3.5" /> {t.common.back}
                    </button>

                    <div className="flex flex-col items-center mb-6">
                      <img src={gogyIcon} alt="Genogy" className="w-12 h-12 mb-4" />
                      <h2 className="text-xl font-bold text-foreground">{t.auth.forgotPasswordTitle}</h2>
                      <p className="text-sm text-muted-foreground mt-1">{t.auth.forgotPasswordSub}</p>
                    </div>

                    <form onSubmit={handleForgotPassword} className="space-y-3.5">
                      <div className="space-y-1.5">
                        <Label htmlFor="reset-email">{t.auth.email}</Label>
                        <Input id="reset-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@cabinet.com" required className="h-11 rounded-xl" />
                      </div>

                      {error && <p className="text-sm text-destructive">{error}</p>}

                      <Button type="submit" className="w-full h-11 rounded-xl gap-2" disabled={submitting}>
                        <Mail className="w-4 h-4" />
                        {submitting ? t.auth.sending : t.auth.resetPassword}
                      </Button>
                    </form>
                  </motion.div>
                )}

                {view === 'success' && (
                  <motion.div key="success" variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="text-center">
                    <div className="flex flex-col items-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Check className="w-8 h-8 text-primary" />
                      </div>
                      <img src={gogyIcon} alt="Genogy" className="w-10 h-10 mb-3" />
                      <h2 className="text-xl font-bold text-foreground">{t.auth.welcomeGenogy}</h2>
                      <p className="text-sm text-muted-foreground mt-2 max-w-[280px]">{t.auth.checkEmail}</p>
                    </div>

                    <Button className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => { setView('login'); setError(''); }}>
                      {t.auth.login}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
