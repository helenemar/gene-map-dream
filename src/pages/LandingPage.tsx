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
import WhyWeCreatedSection from '@/components/landing/WhyWeCreatedSection';
import CtaSection from '@/components/landing/CtaSection';
import Footer from '@/components/Footer';
import SeoLinks from '@/components/SeoLinks';

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

  const pagePath = forceLang === 'en' ? '/en' : forceLang === 'de' ? '/de' : '/';
  const pageUrl = `https://www.genogy-app.com${pagePath === '/' ? '/' : pagePath}`;
  const pageLanguage = forceLang === 'en' ? 'en-US' : forceLang === 'de' ? 'de-DE' : 'fr-FR';
  const inLanguageShort = forceLang === 'en' ? 'en' : forceLang === 'de' ? 'de' : 'fr';

  const jsonLdByLang = {
    fr: {
      description:
        "Genogy est un outil en ligne de création de génogrammes conçu pour les professionnels de la santé mentale. Réalisez des génogrammes cliniques selon les standards McGoldrick. Pensé pour les psychologues, thérapeutes familiaux, travailleurs sociaux et conseillers.",
      audienceType:
        'Psychologues, thérapeutes familiaux, travailleurs sociaux, conseillers, professionnels de la santé mentale',
      featureList: [
        'Création de génogrammes cliniques en ligne',
        'Symboles standardisés McGoldrick',
        'Cartographie des liens émotionnels',
        'Étiquetage des pathologies médicales et psychiatriques',
        'Export PDF et PNG',
        'Partage sécurisé',
      ],
      offerDescription: 'Accès gratuit pendant la phase bêta',
    },
    en: {
      description:
        'Genogy is an online genogram maker built specifically for mental health professionals. Create clinical genograms following McGoldrick standards. Designed for psychologists, family therapists, social workers and counselors.',
      audienceType:
        'Psychologists, family therapists, social workers, counselors, mental health professionals',
      featureList: [
        'Clinical genogram maker online',
        'McGoldrick standardized symbols',
        'Emotional relationship mapping',
        'Medical and psychiatric condition tagging',
        'PDF and PNG export',
        'Secure sharing',
      ],
      offerDescription: 'Free during beta',
    },
    de: {
      description:
        'Genogy ist ein Online-Genogramm-Tool speziell für Fachkräfte der psychischen Gesundheit. Erstellen Sie klinische Genogramme nach den McGoldrick-Standards. Entwickelt für Psychologen, Familientherapeuten, Sozialarbeiter und Berater.',
      audienceType:
        'Psychologen, Familientherapeuten, Sozialarbeiter, Berater, Fachkräfte der psychischen Gesundheit',
      featureList: [
        'Klinisches Genogramm-Tool online',
        'McGoldrick-Standardsymbole',
        'Kartierung emotionaler Beziehungen',
        'Kennzeichnung medizinischer und psychiatrischer Erkrankungen',
        'PDF- und PNG-Export',
        'Sicheres Teilen',
      ],
      offerDescription: 'Kostenlos während der Beta-Phase',
    },
  } as const;

  const localized = jsonLdByLang[inLanguageShort];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${pageUrl}#softwareapplication`,
    name: 'Genogy',
    url: pageUrl,
    applicationCategory: 'HealthApplication',
    applicationSubCategory: 'Clinical genogram software',
    operatingSystem: 'Web',
    browserRequirements: 'Requires JavaScript',
    inLanguage: inLanguageShort,
    description: localized.description,
    isAccessibleForFree: true,
    audience: {
      '@type': 'Audience',
      audienceType: localized.audienceType,
    },
    featureList: localized.featureList,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      description: localized.offerDescription,
    },
    creator: {
      '@type': 'Organization',
      name: 'Genogy',
      url: 'https://www.genogy-app.com',
    },
    screenshot: 'https://www.genogy-app.com/og-image.webp',
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    inLanguage: pageLanguage,
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
    url: pageUrl,
    description: t.landing.metaDesc,
    inLanguage: pageLanguage,
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
        <html lang={forceLang ?? 'fr'} />
        <title>{t.landing.metaTitle}</title>
        <meta name="description" content={t.landing.metaDesc} />
        <meta name="keywords" content="génogramme, génogramme en ligne, faire un génogramme, comment faire un génogramme, outil génogramme, génogramme site web, génogramme psychologie, arbre familial émotionnel, genogram online" />
        <meta property="og:title" content={t.landing.metaTitle} />
        <meta property="og:description" content={t.landing.metaDesc} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:locale" content={pageLanguage.replace('-', '_')} />
        <meta property="og:image" content="https://www.genogy-app.com/og-image.webp" />
        <script type="application/ld+json">{JSON.stringify(websiteJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(howToJsonLd)}</script>
      </Helmet>
      <SeoLinks pageKey="home" locale={forceLang ?? 'fr'} />

      <LandingHeader onAuth={openAuth} />
      <HeroSection onAuth={openAuth} />
      <GuideBlock />
      <FeaturesSection />
      <StepsSection />
      <AboutSection />
      <AudienceSection />
      {!forceLang && <WhyWeCreatedSection />}
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
