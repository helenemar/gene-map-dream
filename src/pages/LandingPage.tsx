import React, { lazy, Suspense, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LandingHeader from '@/components/landing/LandingHeader';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import StepsSection from '@/components/landing/StepsSection';
import GuideBlock from '@/components/landing/GuideBlock';
import AboutSection from '@/components/landing/AboutSection';
import AudienceSection from '@/components/landing/AudienceSection';
import FaqSection from '@/components/landing/FaqSection';
import CtaSection from '@/components/landing/CtaSection';
import Footer from '@/components/Footer';

const AuthModal = lazy(() => import('@/components/AuthModal'));

const dedupeFaqItems = <T extends { q: string; a: string }>(items: T[]) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = `${item.q.trim().toLocaleLowerCase('fr-FR')}::${item.a.trim().toLocaleLowerCase('fr-FR')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

interface LandingPageProps {
  forceLang?: 'en' | 'de';
}

const LandingPage: React.FC<LandingPageProps> = ({ forceLang }) => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t, lang, setLang } = useLanguage();

  // Auto-detect browser language and redirect new visitors
  React.useEffect(() => {
    if (forceLang) {
      if (lang !== forceLang) setLang(forceLang);
      return;
    }
    // Only auto-redirect if user hasn't manually chosen a language before
    const stored = localStorage.getItem('genogy-lang');
    if (stored) return;
    const browserLang = (navigator.language || '').slice(0, 2).toLowerCase();
    if (browserLang === 'en') {
      setLang('en');
      navigate('/en', { replace: true });
    } else if (browserLang === 'de') {
      setLang('de');
      navigate('/de', { replace: true });
    }
  }, [forceLang]);
  const [authModal, setAuthModal] = useState<{ open: boolean; view: 'login' | 'signup' }>({ open: false, view: 'login' });

  React.useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true });
  }, [user, loading, navigate]);

  const openAuth = (view: 'login' | 'signup') => {
    if (user) { navigate('/dashboard'); return; }
    setAuthModal({ open: true, view });
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': 'https://www.genogy-app.com/#softwareapplication',
    name: 'Genogy',
    url: 'https://www.genogy-app.com/',
    applicationCategory: 'HealthApplication',
    applicationSubCategory: 'Clinical genogram software',
    operatingSystem: 'Web',
    description: t.landing.metaDesc,
    isAccessibleForFree: true,
    audience: {
      '@type': 'Audience',
      audienceType: 'Psychologues, thérapeutes, travailleurs sociaux et professionnels médico-sociaux',
    },
    featureList: [
      'Création de génogrammes cliniques en ligne',
      'Symboles McGoldrick',
      'Liens émotionnels et pathologies',
      'Export PDF et PNG',
      'Partage sécurisé par lien',
    ],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      description: 'Accès gratuit pendant la phase bêta',
    },
    screenshot: 'https://www.genogy-app.com/og-image.webp',
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': 'https://www.genogy-app.com/#faq',
    mainEntity: dedupeFaqItems(t.landing.faq).map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://www.genogy-app.com/#website',
    name: 'Genogy',
    url: 'https://www.genogy-app.com/',
    description: t.landing.metaDesc,
    inLanguage: 'fr-FR',
    publisher: {
      '@type': 'Organization',
      name: 'Genogy',
      url: 'https://www.genogy-app.com/',
      logo: 'https://www.genogy-app.com/icon-192.webp',
    },
  };

  const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Comment faire un génogramme en ligne',
    description: 'Créez votre génogramme professionnel en 3 étapes simples avec Genogy.',
    step: t.landing.steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.title,
      text: step.desc,
    })),
  };

  return (
    <div className="min-h-screen bg-page-bg text-foreground">
      <Helmet>
        <title>{t.landing.metaTitle}</title>
        <meta name="description" content={t.landing.metaDesc} />
        <meta name="keywords" content="génogramme, génogramme en ligne, faire un génogramme, comment faire un génogramme, outil génogramme, génogramme site web, génogramme psychologie, arbre familial émotionnel, genogram online" />
        <link rel="canonical" href="https://www.genogy-app.com/" />
        <link rel="alternate" hrefLang="fr" href="https://www.genogy-app.com/" />
        <link rel="alternate" hrefLang="en" href="https://www.genogy-app.com/en" />
        <link rel="alternate" hrefLang="de" href="https://www.genogy-app.com/de" />
        <link rel="alternate" hrefLang="x-default" href="https://www.genogy-app.com/" />
        <meta property="og:title" content={t.landing.metaTitle} />
        <meta property="og:description" content={t.landing.metaDesc} />
        <meta property="og:url" content="https://www.genogy-app.com/" />
        <meta property="og:image" content="https://www.genogy-app.com/og-image.webp" />
        <script type="application/ld+json">{JSON.stringify(websiteJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(howToJsonLd)}</script>
      </Helmet>

      <LandingHeader onAuth={openAuth} />
      <HeroSection onAuth={openAuth} />
      <GuideBlock />
      <FeaturesSection />
      <StepsSection />
      <AboutSection />
      <AudienceSection />
      <FaqSection />
      <CtaSection onAuth={openAuth} />
      <Footer />

      {authModal.open && (
        <Suspense fallback={null}>
          <AuthModal
            open={authModal.open}
            onClose={() => setAuthModal({ ...authModal, open: false })}
            defaultView={authModal.view}
          />
        </Suspense>
      )}
    </div>
  );
};

export default LandingPage;
