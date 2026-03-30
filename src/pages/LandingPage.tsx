import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LandingHeader from '@/components/landing/LandingHeader';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import StepsSection from '@/components/landing/StepsSection';
import AboutSection from '@/components/landing/AboutSection';
import AudienceSection from '@/components/landing/AudienceSection';
import FaqSection from '@/components/landing/FaqSection';
import CtaSection from '@/components/landing/CtaSection';
import Footer from '@/components/Footer';

interface LandingPageProps {
  forceLang?: 'en' | 'de';
}

const LandingPage: React.FC<LandingPageProps> = ({ forceLang }) => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t, lang, setLang } = useLanguage();

  React.useEffect(() => {
    if (forceLang && lang !== forceLang) setLang(forceLang);
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
    name: 'Genogy',
    url: 'https://genogy.app/',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    description: t.landing.metaDesc,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    screenshot: 'https://genogy.app/og-image.png',
    aggregateRating: undefined,
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: t.landing.faq.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
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
        <link rel="canonical" href={`https://genogy.app${forceLang ? `/${forceLang}` : '/'}`} />
        <link rel="alternate" hrefLang="fr" href="https://genogy.app/" />
        <link rel="alternate" hrefLang="en" href="https://genogy.app/en" />
        <link rel="alternate" hrefLang="de" href="https://genogy.app/de" />
        <link rel="alternate" hrefLang="x-default" href="https://genogy.app/" />
        <meta property="og:title" content={t.landing.metaTitle} />
        <meta property="og:description" content={t.landing.metaDesc} />
        <meta property="og:url" content={`https://genogy.app${forceLang ? `/${forceLang}` : '/'}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(howToJsonLd)}</script>
      </Helmet>

      <LandingHeader onAuth={openAuth} />
      <HeroSection onAuth={openAuth} />
      <FeaturesSection />
      <StepsSection />
      <AboutSection />
      <AudienceSection />
      <FaqSection />
      <CtaSection onAuth={openAuth} />
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
