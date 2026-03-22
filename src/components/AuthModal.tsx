import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import gogyIcon from '@/assets/genogy-icon.svg';
import { Mail, ArrowLeft, X, Check, Eye, EyeOff } from 'lucide-react';
import { getRedirectOrigin } from '@/utils/redirectUrl';
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
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  React.useEffect(() => {
    if (open) {
      setView(defaultView);
      setError('');
      setEmail('');
      setPassword('');
      setFullName('');
      setShowPassword(false);
      setAcceptPrivacy(false);
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
    if (!acceptPrivacy) {
      setError(t.auth.acceptPrivacyRequired);
      setSubmitting(false);
      return;
    }
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getRedirectOrigin(),
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
        redirectTo: `${getRedirectOrigin()}/reset-password`,
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

                      <div className="flex items-start gap-2.5">
                        <Checkbox
                          id="accept-privacy"
                          checked={acceptPrivacy}
                          onCheckedChange={(checked) => setAcceptPrivacy(checked === true)}
                          className="mt-0.5"
                        />
                        <label htmlFor="accept-privacy" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                          {t.auth.acceptPrivacy}{' '}
                          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            →
                          </a>
                        </label>
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
