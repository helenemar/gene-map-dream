import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, Scale, ShieldCheck, FileDown, Users, Clock, Network, AlertTriangle } from 'lucide-react';
import LandingHeader from '@/components/landing/LandingHeader';
import Footer from '@/components/Footer';
import SeoLinks from '@/components/SeoLinks';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const AuthModal = lazy(() => import('@/components/AuthModal'));

type Lang = 'fr' | 'en' | 'de';

const SITE_URL = 'https://www.genogy-app.com';

const PATHS: Record<Lang, string> = {
  fr: '/blog/genogramme-professionnels-justice',
  en: '/blog/genogram-justice-professionals',
  de: '/blog/genogramm-justizfachkraefte',
};

type Content = {
  title: string;
  description: string;
  ogLocale: string;
  langTag: string;
  htmlLang: string;
  eyebrow: string;
  h1: string;
  intro: string[];
  cta: string;
  audienceTitle: string;
  audienceItems: string[];
  whyTitle: string;
  whyItems: { icon: React.ReactNode; title: string; text: string }[];
  featuresTitle: string;
  featuresItems: { icon: React.ReactNode; title: string; text: string }[];
  workflowTitle: string;
  workflowSteps: { title: string; text: string }[];
  closingTitle: string;
  closingBody: string[];
  finalCta: string;
  faqTitle: string;
  faq: { q: string; a: string }[];
  related: { label: string; href: string }[];
  breadcrumbHome: string;
};

const CONTENT: Record<Lang, Content> = {
  fr: {
    title: 'Le génogramme au service des professionnels de la justice | Genogy',
    description:
      "Comment le génogramme aide les professionnels de la justice (PJJ, SPIP, contrôleurs judiciaires, médiateurs familiaux) à structurer l'évaluation familiale, gagner du temps en rédaction et faciliter la communication pluridisciplinaire.",
    ogLocale: 'fr_FR',
    langTag: 'fr',
    htmlLang: 'fr',
    eyebrow: 'Pratiques professionnelles · Justice',
    h1: 'Le génogramme au service des professionnels de la justice',
    intro: [
      "Dans les services de la PJJ, du SPIP, auprès des contrôleurs judiciaires ou des médiateurs familiaux, comprendre rapidement le système familial d'une personne est un enjeu quotidien. Le génogramme offre une représentation visuelle synthétique des liens, des ruptures et des dynamiques transgénérationnelles utiles à l'évaluation et à la prise de décision.",
      "Genogy met à disposition un outil pensé pour les pratiques professionnelles : symboles cliniques McGoldrick, indicateurs de violences et de traumatismes, export PDF prêt à intégrer aux rapports, et hébergement européen conforme RGPD.",
    ],
    cta: 'Créer mon premier génogramme',
    audienceTitle: 'À qui s\'adresse cet article',
    audienceItems: [
      'Éducateurs et personnels de la Protection judiciaire de la jeunesse (PJJ)',
      'Conseillers pénitentiaires d\'insertion et de probation (SPIP)',
      'Contrôleurs judiciaires socio-éducatifs',
      'Médiateurs familiaux et délégués du procureur',
      'Travailleurs sociaux intervenant en milieu judiciaire',
    ],
    whyTitle: 'Pourquoi utiliser un génogramme dans un cadre judiciaire ?',
    whyItems: [
      {
        icon: <Network className="h-5 w-5" />,
        title: 'Visualiser les schémas transgénérationnels',
        text: 'Répétitions de placements, séparations, incarcérations, conduites à risque : le génogramme rend lisibles les patterns familiaux qui éclairent une situation individuelle.',
      },
      {
        icon: <Users className="h-5 w-5" />,
        title: 'Structurer l\'évaluation familiale',
        text: 'Cartographier les liens (parents, fratrie, conjoints, enfants placés ou confiés) permet d\'identifier ressources mobilisables, risques et zones d\'alliance ou de rupture.',
      },
      {
        icon: <Clock className="h-5 w-5" />,
        title: 'Gagner du temps en rédaction',
        text: 'Une figure claire en début de rapport remplace plusieurs paragraphes descriptifs et accélère la lecture par les magistrats et partenaires.',
      },
      {
        icon: <Scale className="h-5 w-5" />,
        title: 'Faciliter la communication pluridisciplinaire',
        text: 'Le génogramme constitue un support partagé en commission, en synthèse ou en audience : tous les intervenants disposent du même cadre visuel.',
      },
    ],
    featuresTitle: 'Ce que Genogy apporte aux professionnels de la justice',
    featuresItems: [
      {
        icon: <Network className="h-5 w-5" />,
        title: 'Symboles cliniques McGoldrick',
        text: 'Standards reconnus pour représenter unions, séparations, décès, filiations adoptives, jumeaux et événements périnataux.',
      },
      {
        icon: <AlertTriangle className="h-5 w-5" />,
        title: 'Indicateurs de violences et traumatismes',
        text: 'Marquage dédié des violences psychologiques, physiques ou sexuelles, ruptures, conflits et événements traumatiques utiles à l\'évaluation.',
      },
      {
        icon: <FileDown className="h-5 w-5" />,
        title: 'Export PDF prêt pour le rapport',
        text: 'Export haute résolution intégrable directement dans une note, un rapport éducatif, une enquête sociale ou une expertise.',
      },
      {
        icon: <ShieldCheck className="h-5 w-5" />,
        title: 'Hébergement européen conforme RGPD',
        text: 'Données chiffrées, hébergement en Europe, contrôle d\'accès strict : adapté aux exigences de confidentialité du secteur judiciaire.',
      },
      {
        icon: <Clock className="h-5 w-5" />,
        title: 'Gratuit pendant la bêta',
        text: 'Accès complet sans abonnement pendant la phase bêta pour tester l\'outil dans vos pratiques avant tout engagement.',
      },
    ],
    workflowTitle: 'Une méthode en quatre temps pour la pratique judiciaire',
    workflowSteps: [
      { title: '1. Recueillir les données', text: 'Identité, fratrie, parents, conjoints, enfants, mesures de placement et événements judiciaires significatifs sur trois générations.' },
      { title: '2. Cartographier les liens', text: 'Unions, séparations, ruptures, conflits, alliances et liens de soin ou de conflit, avec dates clés.' },
      { title: '3. Annoter les éléments cliniques', text: 'Pathologies, addictions, violences, suivis, mesures éducatives ou pénales en cours.' },
      { title: '4. Exporter et partager', text: 'Génération du PDF intégré au rapport ou diffusion sécurisée par lien à l\'équipe pluridisciplinaire.' },
    ],
    closingTitle: 'Un outil au service de votre rigueur professionnelle',
    closingBody: [
      "Le génogramme ne remplace pas l'analyse clinique ou éducative : il l'objective, la structure et la rend communicable. C'est précisément ce dont les services judiciaires ont besoin pour articuler évaluation, décision et accompagnement.",
      "Genogy est conçu pour s'intégrer à vos pratiques sans installation, avec un niveau de confidentialité compatible avec les exigences du secteur.",
    ],
    finalCta: 'Créer mon premier génogramme',
    faqTitle: 'Questions fréquentes',
    faq: [
      {
        q: 'Le génogramme a-t-il une valeur juridique ?',
        a: 'Le génogramme est un outil d\'évaluation et de communication professionnelle. Il n\'a pas de valeur juridique en soi, mais il appuie utilement les rapports éducatifs, sociaux et expertises présentés à l\'autorité judiciaire.',
      },
      {
        q: 'Mes données sont-elles protégées ?',
        a: 'Oui. Les données sont chiffrées, hébergées en Europe et soumises au RGPD. Vous contrôlez les accès et les partages depuis votre tableau de bord.',
      },
      {
        q: 'Genogy est-il adapté au cadre PJJ ou SPIP ?',
        a: 'Oui : symboles cliniques, indicateurs de violences et traumatismes, export PDF, partage sécurisé et hébergement européen répondent aux contraintes des services judiciaires socio-éducatifs.',
      },
    ],
    related: [
      { label: '→ Symboles du génogramme : guide complet', href: '/symboles-genogramme' },
      { label: '→ Le génogramme en travail social', href: '/genogramme-travail-social' },
      { label: '→ Toutes les ressources', href: '/ressources' },
    ],
    breadcrumbHome: 'Accueil',
  },
  en: {
    title: 'Genograms for justice professionals | Genogy',
    description:
      'How genograms help justice professionals (juvenile probation, probation officers, judicial supervisors, family mediators) structure family assessments, save time on reports and improve multidisciplinary communication.',
    ogLocale: 'en_US',
    langTag: 'en',
    htmlLang: 'en',
    eyebrow: 'Professional practice · Justice',
    h1: 'Genograms for justice professionals',
    intro: [
      'In juvenile justice services, probation departments, judicial supervision and family mediation, quickly understanding a person\'s family system is a daily challenge. Genograms offer a synthetic visual representation of bonds, ruptures and intergenerational dynamics relevant to assessment and decision-making.',
      'Genogy provides a tool designed for professional practice: McGoldrick clinical symbols, trauma and violence indicators, ready-to-use PDF export, and GDPR-compliant European hosting.',
    ],
    cta: 'Create my first genogram',
    audienceTitle: 'Who is this article for',
    audienceItems: [
      'Juvenile justice educators and case workers',
      'Probation and reentry officers',
      'Judicial supervisors with a socio-educational role',
      'Family mediators and prosecutor delegates',
      'Social workers operating in judicial settings',
    ],
    whyTitle: 'Why use a genogram in a justice setting?',
    whyItems: [
      {
        icon: <Network className="h-5 w-5" />,
        title: 'Visualize intergenerational patterns',
        text: 'Repeated placements, separations, incarcerations, risk behaviors: the genogram makes family patterns legible and clarifies an individual situation.',
      },
      {
        icon: <Users className="h-5 w-5" />,
        title: 'Structure family assessments',
        text: 'Mapping bonds (parents, siblings, partners, placed or fostered children) reveals available resources, risks, and zones of alliance or rupture.',
      },
      {
        icon: <Clock className="h-5 w-5" />,
        title: 'Save time on report writing',
        text: 'A clear figure at the start of a report replaces several descriptive paragraphs and speeds up reading by judges and partners.',
      },
      {
        icon: <Scale className="h-5 w-5" />,
        title: 'Support multidisciplinary communication',
        text: 'The genogram becomes a shared support in case meetings, syntheses or hearings: every stakeholder works with the same visual reference.',
      },
    ],
    featuresTitle: 'What Genogy brings to justice professionals',
    featuresItems: [
      {
        icon: <Network className="h-5 w-5" />,
        title: 'McGoldrick clinical symbols',
        text: 'Recognised standards for unions, separations, deaths, adoptive filiations, twins and perinatal events.',
      },
      {
        icon: <AlertTriangle className="h-5 w-5" />,
        title: 'Trauma and violence indicators',
        text: 'Dedicated tagging for psychological, physical or sexual violence, ruptures, conflicts and traumatic events relevant to assessment.',
      },
      {
        icon: <FileDown className="h-5 w-5" />,
        title: 'Report-ready PDF export',
        text: 'High-resolution export to embed directly in a note, an educational report, a social inquiry or an expert assessment.',
      },
      {
        icon: <ShieldCheck className="h-5 w-5" />,
        title: 'GDPR-compliant European hosting',
        text: 'Encrypted data, European hosting and strict access control: aligned with the confidentiality requirements of the justice sector.',
      },
      {
        icon: <Clock className="h-5 w-5" />,
        title: 'Free during beta',
        text: 'Full access without subscription during the beta phase, so you can test the tool in your practice before any commitment.',
      },
    ],
    workflowTitle: 'A four-step method for justice practice',
    workflowSteps: [
      { title: '1. Collect data', text: 'Identity, siblings, parents, partners, children, placement measures and significant judicial events across three generations.' },
      { title: '2. Map the bonds', text: 'Unions, separations, ruptures, conflicts, alliances and care or conflict ties, with key dates.' },
      { title: '3. Annotate clinical elements', text: 'Pathologies, addictions, violence, ongoing follow-ups, educational or criminal measures in progress.' },
      { title: '4. Export and share', text: 'Generate the PDF embedded in the report or share securely via link with the multidisciplinary team.' },
    ],
    closingTitle: 'A tool that serves your professional rigor',
    closingBody: [
      'A genogram does not replace clinical or educational analysis: it objectifies it, structures it and makes it communicable. That is precisely what justice services need to articulate assessment, decision and support.',
      'Genogy is designed to fit your practice without installation, with a level of confidentiality compatible with sector requirements.',
    ],
    finalCta: 'Create my first genogram',
    faqTitle: 'Frequently asked questions',
    faq: [
      {
        q: 'Does a genogram have legal value?',
        a: 'A genogram is an assessment and communication tool. It has no legal value on its own, but it usefully supports the educational, social and expert reports submitted to judicial authorities.',
      },
      {
        q: 'Is my data protected?',
        a: 'Yes. Data is encrypted, hosted in Europe and subject to GDPR. You control access and sharing from your dashboard.',
      },
      {
        q: 'Is Genogy suitable for probation or juvenile justice settings?',
        a: 'Yes: clinical symbols, violence and trauma indicators, PDF export, secure sharing and European hosting all match the constraints of judicial socio-educational services.',
      },
    ],
    related: [
      { label: '→ Genogram symbols: complete guide', href: '/en/genogram-symbols' },
      { label: '→ Genograms in social work', href: '/en/genogram-social-work' },
      { label: '→ All resources', href: '/en/resources' },
    ],
    breadcrumbHome: 'Home',
  },
  de: {
    title: 'Genogramm für Justizfachkräfte | Genogy',
    description:
      'Wie das Genogramm Justizfachkräften (Jugendgerichtshilfe, Bewährungshilfe, Justizaufsicht, Familienmediatoren) hilft, Familienbewertungen zu strukturieren, Berichte schneller zu verfassen und die interdisziplinäre Kommunikation zu fördern.',
    ogLocale: 'de_DE',
    langTag: 'de',
    htmlLang: 'de',
    eyebrow: 'Berufspraxis · Justiz',
    h1: 'Das Genogramm im Dienst der Justizfachkräfte',
    intro: [
      'In Diensten der Jugendgerichtshilfe, der Bewährungshilfe, in der Justizaufsicht oder in der Familienmediation ist es eine tägliche Herausforderung, das Familiensystem einer Person schnell zu verstehen. Das Genogramm bietet eine synthetische visuelle Darstellung von Beziehungen, Brüchen und transgenerationellen Dynamiken, die für Bewertung und Entscheidungsfindung relevant sind.',
      'Genogy stellt ein Werkzeug bereit, das für die Berufspraxis konzipiert ist: klinische McGoldrick-Symbole, Indikatoren für Gewalt und Trauma, gebrauchsfertiger PDF-Export und DSGVO-konformes europäisches Hosting.',
    ],
    cta: 'Mein erstes Genogramm erstellen',
    audienceTitle: 'An wen richtet sich dieser Artikel',
    audienceItems: [
      'Pädagogische Fachkräfte der Jugendgerichtshilfe',
      'Bewährungs- und Wiedereingliederungshelfer',
      'Justizaufsichtspersonen mit sozialpädagogischer Funktion',
      'Familienmediatoren und Beauftragte der Staatsanwaltschaft',
      'Sozialarbeiter im justiziellen Kontext',
    ],
    whyTitle: 'Warum ein Genogramm im justiziellen Kontext nutzen?',
    whyItems: [
      {
        icon: <Network className="h-5 w-5" />,
        title: 'Transgenerationelle Muster sichtbar machen',
        text: 'Wiederholte Unterbringungen, Trennungen, Inhaftierungen, Risikoverhalten: Das Genogramm macht familiäre Muster lesbar und klärt eine Einzelsituation.',
      },
      {
        icon: <Users className="h-5 w-5" />,
        title: 'Familienbewertung strukturieren',
        text: 'Die Kartierung von Beziehungen (Eltern, Geschwister, Partner, untergebrachte Kinder) zeigt verfügbare Ressourcen, Risiken und Zonen von Allianz oder Bruch.',
      },
      {
        icon: <Clock className="h-5 w-5" />,
        title: 'Zeit beim Verfassen von Berichten sparen',
        text: 'Eine klare Darstellung am Anfang eines Berichts ersetzt mehrere beschreibende Absätze und beschleunigt die Lektüre durch Richter und Partner.',
      },
      {
        icon: <Scale className="h-5 w-5" />,
        title: 'Interdisziplinäre Kommunikation unterstützen',
        text: 'Das Genogramm dient als gemeinsame Grundlage in Fallkonferenzen, Synthesen oder Anhörungen: Alle Beteiligten arbeiten mit derselben visuellen Referenz.',
      },
    ],
    featuresTitle: 'Was Genogy Justizfachkräften bietet',
    featuresItems: [
      {
        icon: <Network className="h-5 w-5" />,
        title: 'Klinische McGoldrick-Symbole',
        text: 'Anerkannte Standards für Partnerschaften, Trennungen, Todesfälle, Adoptionen, Zwillinge und perinatale Ereignisse.',
      },
      {
        icon: <AlertTriangle className="h-5 w-5" />,
        title: 'Indikatoren für Gewalt und Trauma',
        text: 'Eigene Markierung für psychische, körperliche oder sexuelle Gewalt, Brüche, Konflikte und traumatische Ereignisse, relevant für die Bewertung.',
      },
      {
        icon: <FileDown className="h-5 w-5" />,
        title: 'PDF-Export für Berichte',
        text: 'Hochauflösender Export zur direkten Einbindung in Vermerke, pädagogische Berichte, Sozialberichte oder Gutachten.',
      },
      {
        icon: <ShieldCheck className="h-5 w-5" />,
        title: 'DSGVO-konformes europäisches Hosting',
        text: 'Verschlüsselte Daten, Hosting in Europa und strikte Zugriffskontrolle: passend zu den Vertraulichkeitsanforderungen des Justizsektors.',
      },
      {
        icon: <Clock className="h-5 w-5" />,
        title: 'Kostenlos während der Beta',
        text: 'Voller Zugang ohne Abonnement während der Beta-Phase, um das Werkzeug vor jeder Verpflichtung in Ihrer Praxis zu testen.',
      },
    ],
    workflowTitle: 'Eine Methode in vier Schritten für die Justizpraxis',
    workflowSteps: [
      { title: '1. Daten erheben', text: 'Identität, Geschwister, Eltern, Partner, Kinder, Unterbringungsmaßnahmen und bedeutende justizielle Ereignisse über drei Generationen.' },
      { title: '2. Beziehungen kartieren', text: 'Partnerschaften, Trennungen, Brüche, Konflikte, Allianzen und Pflege- oder Konfliktbeziehungen mit zentralen Daten.' },
      { title: '3. Klinische Elemente annotieren', text: 'Pathologien, Suchterkrankungen, Gewalt, laufende Begleitungen, pädagogische oder strafrechtliche Maßnahmen.' },
      { title: '4. Exportieren und teilen', text: 'Erzeugen des PDFs zur Einbindung in den Bericht oder sicheres Teilen per Link mit dem interdisziplinären Team.' },
    ],
    closingTitle: 'Ein Werkzeug im Dienst Ihrer professionellen Sorgfalt',
    closingBody: [
      'Das Genogramm ersetzt weder die klinische noch die pädagogische Analyse: Es objektiviert sie, strukturiert sie und macht sie kommunizierbar. Genau das brauchen Justizdienste, um Bewertung, Entscheidung und Begleitung zu verbinden.',
      'Genogy ist darauf ausgelegt, sich ohne Installation in Ihre Praxis einzufügen, mit einem Vertraulichkeitsniveau, das den Anforderungen des Sektors entspricht.',
    ],
    finalCta: 'Mein erstes Genogramm erstellen',
    faqTitle: 'Häufige Fragen',
    faq: [
      {
        q: 'Hat das Genogramm einen rechtlichen Wert?',
        a: 'Das Genogramm ist ein Bewertungs- und Kommunikationsinstrument. Es hat für sich genommen keinen rechtlichen Wert, unterstützt aber pädagogische, soziale und gutachterliche Berichte für die Justizbehörden.',
      },
      {
        q: 'Sind meine Daten geschützt?',
        a: 'Ja. Die Daten sind verschlüsselt, in Europa gehostet und der DSGVO unterworfen. Sie kontrollieren Zugriffe und Freigaben über Ihr Dashboard.',
      },
      {
        q: 'Ist Genogy für Bewährungshilfe oder Jugendgerichtshilfe geeignet?',
        a: 'Ja: klinische Symbole, Gewalt- und Traumaindikatoren, PDF-Export, sicheres Teilen und europäisches Hosting passen zu den Anforderungen sozialpädagogischer Justizdienste.',
      },
    ],
    related: [
      { label: '→ Genogramm-Symbole: vollständiger Leitfaden', href: '/de/genogramm-symbole' },
      { label: '→ Genogramm in der Sozialarbeit', href: '/de/genogramm-sozialarbeit' },
      { label: '→ Alle Ressourcen', href: '/de/ressourcen' },
    ],
    breadcrumbHome: 'Startseite',
  },
};

interface Props {
  lang: Lang;
}

const BlogJusticeArticle: React.FC<Props> = ({ lang }) => {
  const c = CONTENT[lang];
  const { setLang } = useLanguage();
  const [authModal, setAuthModal] = useState<{ open: boolean; view: 'login' | 'signup' }>({
    open: false,
    view: 'signup',
  });

  useEffect(() => {
    setLang(lang);
  }, [lang, setLang]);

  const pageUrl = `${SITE_URL}${PATHS[lang]}`;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${pageUrl}#article`,
    headline: c.h1,
    description: c.description,
    inLanguage: c.langTag,
    mainEntityOfPage: pageUrl,
    author: { '@type': 'Organization', name: 'Genogy', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'Genogy',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon-192.webp` },
    },
    image: `${SITE_URL}/og-image.webp`,
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    inLanguage: c.langTag,
    mainEntity: c.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: c.breadcrumbHome,
        item: lang === 'fr' ? `${SITE_URL}/` : `${SITE_URL}/${lang}`,
      },
      { '@type': 'ListItem', position: 2, name: c.h1, item: pageUrl },
    ],
  };

  return (
    <div className="min-h-screen bg-page-bg text-foreground">
      <Helmet>
        <html lang={c.htmlLang} />
        <title>{c.title}</title>
        <meta name="description" content={c.description} />

        {/* Open Graph */}
        <meta property="og:site_name" content="Genogy" />
        <meta property="og:title" content={c.title} />
        <meta property="og:description" content={c.description} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content={c.ogLocale} />
        {(['fr_FR', 'en_US', 'de_DE'] as const)
          .filter((alt) => alt !== c.ogLocale)
          .map((alt) => (
            <meta key={alt} property="og:locale:alternate" content={alt} />
          ))}
        <meta property="og:image" content={`${SITE_URL}/og-image.webp`} />
        <meta property="og:image:secure_url" content={`${SITE_URL}/og-image.webp`} />
        <meta property="og:image:type" content="image/webp" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={c.h1} />

        {/* Article-specific Open Graph */}
        <meta property="article:published_time" content="2026-04-27T00:00:00+00:00" />
        <meta property="article:modified_time" content="2026-04-27T00:00:00+00:00" />
        <meta property="article:author" content="Genogy" />
        <meta property="article:section" content={c.eyebrow} />
        <meta property="article:tag" content="genogram" />
        <meta property="article:tag" content="justice" />
        <meta property="article:tag" content="PJJ" />
        <meta property="article:tag" content="SPIP" />
        <meta property="article:tag" content="family assessment" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={c.title} />
        <meta name="twitter:description" content={c.description} />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.webp`} />
        <meta name="twitter:image:alt" content={c.h1} />

        {/* Crawling */}
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1" />
        <meta name="author" content="Genogy" />

        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>
      <SeoLinks pageKey="blogJustice" locale={lang} />
      <LandingHeader onAuth={(view) => setAuthModal({ open: true, view })} />

      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-6 py-16 lg:py-20">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <Scale className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">{c.eyebrow}</span>
          </div>
          <h1 className="mb-5 max-w-4xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {c.h1}
          </h1>
          <div className="space-y-4">
            {c.intro.map((p) => (
              <p key={p} className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
          </div>
          <div className="mt-8">
            <Button size="lg" onClick={() => setAuthModal({ open: true, view: 'signup' })}>
              {c.cta}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-6 py-14">
        <article className="space-y-14">
          {/* Audience */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">{c.audienceTitle}</h2>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              {c.audienceItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Why */}
          <section>
            <h2 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">{c.whyTitle}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {c.whyItems.map((item) => (
                <div key={item.title} className="rounded-lg border border-border bg-card p-5">
                  <div className="mb-2 flex items-center gap-2 text-primary">
                    {item.icon}
                    <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section>
            <h2 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">{c.featuresTitle}</h2>
            <div className="space-y-4">
              {c.featuresItems.map((item) => (
                <div key={item.title} className="rounded-lg border border-border bg-card p-5">
                  <div className="mb-2 flex items-center gap-2 text-primary">
                    {item.icon}
                    <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Workflow */}
          <section>
            <h2 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">{c.workflowTitle}</h2>
            <ol className="space-y-4">
              {c.workflowSteps.map((step) => (
                <li key={step.title} className="rounded-lg border border-border bg-card p-5">
                  <h3 className="mb-2 text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.text}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Closing */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">{c.closingTitle}</h2>
            <div className="space-y-4">
              {c.closingBody.map((p) => (
                <p key={p} className="leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </div>
            <div className="mt-6">
              <Button size="lg" onClick={() => setAuthModal({ open: true, view: 'signup' })}>
                {c.finalCta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">{c.faqTitle}</h2>
            <div className="space-y-6">
              {c.faq.map((item) => (
                <div key={item.q}>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{item.q}</h3>
                  <p className="leading-relaxed text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related */}
          <section className="rounded-lg border border-border bg-card p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              {c.related.map((r) => (
                <Link key={r.href} to={r.href} className="text-primary hover:underline">
                  {r.label}
                </Link>
              ))}
            </div>
          </section>
        </article>
      </main>

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

export const BlogJusticeArticleFr = () => <BlogJusticeArticle lang="fr" />;
export const BlogJusticeArticleEn = () => <BlogJusticeArticle lang="en" />;
export const BlogJusticeArticleDe = () => <BlogJusticeArticle lang="de" />;

export default BlogJusticeArticle;
