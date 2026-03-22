import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import gogyIcon from '@/assets/genogy-icon.svg';
import heroComposition from '@/assets/hero-mockup-composition.png';
import aboutIllustration from '@/assets/about-illustration.png';
import abstract160 from '@/assets/abstract-160.svg';
import abstract122 from '@/assets/abstract-122.svg';
import abstract206 from '@/assets/abstract-206.svg';
import abstract65 from '@/assets/abstract-65.svg';
import {
  Brain, Heart, GraduationCap, Stethoscope, Users, BookOpen,
  ArrowRight, ChevronDown,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '@/components/Footer';
import { useLanguage, Lang } from '@/contexts/LanguageContext';

const AUDIENCE_ICONS = [
  <Brain className="w-5 h-5" />,
  <Heart className="w-5 h-5" />,
  <BookOpen className="w-5 h-5" />,
  <Users className="w-5 h-5" />,
  <Stethoscope className="w-5 h-5" />,
  <GraduationCap className="w-5 h-5" />,
];

const ABSTRACT_IMAGES = [abstract160, abstract122, abstract206, abstract65];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [authModal, setAuthModal] = useState<{
    open: boolean;
    view: 'login' | 'signup';
  }>({ open: false, view: 'login' });

  React.useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  const openAuth = (view: 'login' | 'signup') => {
    if (user) { navigate('/dashboard'); return; }
    setAuthModal({ open: true, view });
  };

  return (
    <div className="min-h-screen bg-page-bg text-foreground">
      <Helmet>
        <title>{t.landing.metaTitle}</title>
        <meta name="description" content={t.landing.metaDesc} />
        <link rel="canonical" href="https://genogy.app/" />
      </Helmet>

      {/* ═══════════ STICKY HEADER ═══════════ */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between h-16 px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={gogyIcon} alt="Genogy" className="w-8 h-8" />
            <span className="text-[15px] font-semibold tracking-tight">Genogy</span>
          </Link>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-lg gap-1.5 px-2.5 h-9">
                  {lang === 'fr' ? (
                    <svg viewBox="0 0 36 24" className="w-5 h-3.5 rounded-[2px] overflow-hidden" aria-hidden="true">
                      <rect width="12" height="24" fill="#002395" />
                      <rect x="12" width="12" height="24" fill="#fff" />
                      <rect x="24" width="12" height="24" fill="#ED2939" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 36 24" className="w-5 h-3.5 rounded-[2px] overflow-hidden" aria-hidden="true">
                      <rect width="36" height="24" fill="#012169" />
                      <path d="M0,0 L36,24 M36,0 L0,24" stroke="#fff" strokeWidth="4" />
                      <path d="M0,0 L36,24 M36,0 L0,24" stroke="#C8102E" strokeWidth="2.5" />
                      <path d="M18,0 V24 M0,12 H36" stroke="#fff" strokeWidth="6" />
                      <path d="M18,0 V24 M0,12 H36" stroke="#C8102E" strokeWidth="3.5" />
                    </svg>
                  )}
                  <span className="text-xs font-medium">{lang.toUpperCase()}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[140px]">
                <DropdownMenuItem onClick={() => setLang('fr')} className="gap-2.5 cursor-pointer">
                  <svg viewBox="0 0 36 24" className="w-5 h-3.5 rounded-[2px] overflow-hidden shrink-0" aria-hidden="true">
                    <rect width="12" height="24" fill="#002395" />
                    <rect x="12" width="12" height="24" fill="#fff" />
                    <rect x="24" width="12" height="24" fill="#ED2939" />
                  </svg>
                  <span className={lang === 'fr' ? 'font-semibold' : ''}>Français</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLang('en')} className="gap-2.5 cursor-pointer">
                  <svg viewBox="0 0 36 24" className="w-5 h-3.5 rounded-[2px] overflow-hidden shrink-0" aria-hidden="true">
                    <rect width="36" height="24" fill="#012169" />
                    <path d="M0,0 L36,24 M36,0 L0,24" stroke="#fff" strokeWidth="4" />
                    <path d="M0,0 L36,24 M36,0 L0,24" stroke="#C8102E" strokeWidth="2.5" />
                    <path d="M18,0 V24 M0,12 H36" stroke="#fff" strokeWidth="6" />
                    <path d="M18,0 V24 M0,12 H36" stroke="#C8102E" strokeWidth="3.5" />
                  </svg>
                  <span className={lang === 'en' ? 'font-semibold' : ''}>English</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-5" onClick={() => openAuth('login')}>
              {t.landing.login}
            </Button>
            <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 rounded-lg px-5" onClick={() => openAuth('signup')}>
              {t.landing.signup}
            </Button>
          </div>
        </div>
      </header>

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-12 lg:px-24 pt-14 pb-20 lg:pt-16 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <img src={gogyIcon} alt="" className="w-[64px] h-[64px] mb-6" />

              <h1 className="text-[1.6rem] lg:text-[2rem] font-extrabold leading-[1.08] tracking-[-0.01em] mb-4 whitespace-nowrap">
                {t.landing.heroTitle1}
                <br />
                {t.landing.heroTitle2}{' '}
                <span className="text-primary">{t.landing.heroTitle4}</span>
                <br />
                {t.landing.heroTitle3}
              </h1>

              <p className="text-muted-foreground text-[14px] leading-[1.5] mb-1 max-w-[420px]">
                {t.landing.heroSub1}
                <br className="hidden sm:block" />
                {t.landing.heroSub2}
              </p>
              <p className="text-foreground/50 text-[12.5px] leading-[1.5] mb-6 max-w-[420px]">
                {t.landing.heroSub3}
                <br className="hidden sm:block" />
                {t.landing.heroSub4}
              </p>

              <div className="flex items-center gap-4">
                <Button variant="brand" size="lg" onClick={() => openAuth('signup')} className="gap-2 px-8 rounded-full">
                  {t.landing.ctaBeta}
                </Button>
                <Button variant="outline" size="lg" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="border-primary text-primary bg-transparent hover:bg-primary/5 rounded-full px-8">
                  {t.landing.ctaDiscover}
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:block"
            >
              <img
                src={heroComposition}
                alt={t.landing.heroImgAlt}
                className="w-full h-auto"
                style={{
                  filter: 'drop-shadow(0 20px 40px hsl(var(--foreground) / 0.08)) drop-shadow(0 8px 16px hsl(var(--foreground) / 0.04))',
                }}
                loading="eager"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 max-w-xl">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              {t.landing.featuresTitle}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t.landing.featuresSub}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {t.landing.features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <img src={ABSTRACT_IMAGES[i]} alt="" className="w-14 h-14 mb-5" />
                <h3 className="text-[15px] font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ ABOUT ═══════════ */}
      <section className="py-20 lg:py-28 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="dot-grid rounded-xl border border-border p-8 flex items-center justify-center"
            >
              <img src={aboutIllustration} alt={t.landing.aboutImgAlt} className="w-full h-auto max-w-md" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">
                {t.landing.aboutTitle}
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed text-[15px]">
                <p>{t.landing.aboutP1}</p>
                <p>{t.landing.aboutP2}</p>
                <p>{t.landing.aboutP3}</p>
                <p>{t.landing.aboutP4}</p>
                <p>{t.landing.aboutP5}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ TARGET AUDIENCE ═══════════ */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-muted-foreground text-sm mb-2">{t.landing.audienceLabel}</p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              {t.landing.audienceTitle}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {t.landing.audience.map((title, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border hover:shadow-card transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {AUDIENCE_ICONS[i]}
                </div>
                <span className="font-medium text-sm text-foreground">{title}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section id="faq" className="py-20 lg:py-28 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 max-w-xl">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">{t.landing.faqTitle}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t.landing.faqSub}
            </p>
          </div>

          <div className="divide-y divide-border">
            {t.landing.faq.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="grid lg:grid-cols-2 gap-4 lg:gap-16 py-8 first:pt-0 last:pb-0"
              >
                <h3 className="font-semibold text-foreground text-[15px] lg:text-base">{item.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="py-20 lg:py-28 bg-foreground text-background">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            {t.landing.ctaTitle}
          </h2>
          <p className="text-background/60 mb-8 max-w-lg mx-auto">
            {t.landing.ctaSub}
          </p>
          <Button
            size="xl"
            onClick={() => openAuth('signup')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            {t.landing.ctaButton}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      <Footer />

      <AuthModal
        open={authModal.open}
        onClose={() => setAuthModal({ ...authModal, open: false })}
        defaultView={authModal.view}
      />
    </div>
  );
};

export default LandingPage;
