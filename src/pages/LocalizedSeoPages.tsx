import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Brain, BriefcaseBusiness, GitFork, HelpCircle, ListChecks, Users } from 'lucide-react';
import LandingHeader from '@/components/landing/LandingHeader';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import SeoLinks from '@/components/SeoLinks';
import type { PageKey as SeoPageKey } from '@/lib/hreflang';

const AuthModal = lazy(() => import('@/components/AuthModal'));

const baseUrl = 'https://www.genogy-app.com';
type Lang = 'en' | 'de';
type AuthView = 'login' | 'signup';
type PageKey = 'resources' | 'symbols' | 'psychology' | 'socialWork' | 'whatIs' | 'howTo' | 'firstSession' | 'clinicalExample' | 'socialCase';

type LocalizedPage = {
  path: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  intro: string;
  sections: Array<{ heading: string; body: string[] }>;
  examples?: Array<{ title: string; text: string }>;
  faq?: Array<{ q: string; a: string }>;
};

const resourcesByLang = {
  en: [
    { title: 'How to prepare a genogram before a session', path: '/en/how-to-create-a-genogram', text: 'Key information to collect, generations to map and common mistakes to avoid.' },
    { title: 'McGoldrick genogram symbols', path: '/en/genogram-symbols', text: 'People, unions, separations, deaths, emotional links and pathologies.' },
    { title: 'Genograms in psychology', path: '/en/genogram-psychology', text: 'How clinicians use family maps to organize hypotheses and relational dynamics.' },
    { title: 'Build a genogram in a first session', path: '/en/resources/first-session-genogram', text: 'A step-by-step method to start without overloading the interview.' },
    { title: 'Clinical genogram example', path: '/en/resources/clinical-genogram-example', text: 'A commented fictional case to understand alliances, ruptures and resources.' },
    { title: 'Social work genogram case study', path: '/en/resources/social-work-genogram-case-study', text: 'Structure a complex family situation for meetings and written summaries.' },
  ],
  de: [
    { title: 'Ein Genogramm vor dem Gespräch vorbereiten', path: '/de/genogramm-erstellen', text: 'Welche Informationen wichtig sind und wie Sie den Einstieg strukturieren.' },
    { title: 'McGoldrick-Genogramm-Symbole', path: '/de/genogramm-symbole', text: 'Personen, Partnerschaften, Trennungen, Todesfälle, emotionale Beziehungen und Erkrankungen.' },
    { title: 'Genogramme in der Psychologie', path: '/de/genogramm-psychologie', text: 'Wie Fachkräfte Familienkarten für Hypothesen und Beziehungsmuster nutzen.' },
    { title: 'Genogramm in der ersten Sitzung erstellen', path: '/de/ressourcen/genogramm-erste-sitzung', text: 'Eine klare Methode für den Einstieg ohne Überfrachtung des Gesprächs.' },
    { title: 'Kommentiertes klinisches Genogramm', path: '/de/ressourcen/klinisches-genogramm-beispiel', text: 'Ein fiktiver Fall zur Lesart von Allianzen, Brüchen und Ressourcen.' },
    { title: 'Genogramm in der Sozialarbeit: Fallbeispiel', path: '/de/ressourcen/genogramm-sozialarbeit-fallbeispiel', text: 'Eine komplexe Familiensituation für Besprechungen und Berichte strukturieren.' },
  ],
};

const pages: Record<Lang, Record<PageKey, LocalizedPage>> = {
  en: {
    resources: {
      path: '/en/resources',
      title: 'Genogram resources — practical guides | Genogy',
      description: 'Practical Genogy guides to create, read and use clinical genograms online.',
      eyebrow: 'Resources',
      h1: 'Guides to understand and create online genograms',
      intro: 'Learn how to structure a clinical genogram, use McGoldrick symbols and present a readable family map during professional sessions.',
      sections: [],
    },
    whatIs: {
      path: '/en/what-is-a-genogram',
      title: 'What is a genogram? | Genogy',
      description: 'A genogram is an advanced family map showing relationships, events and emotional patterns across generations.',
      eyebrow: 'Definition',
      h1: 'What is a genogram?',
      intro: 'A genogram goes beyond a family tree by showing family relationships, emotional links, major life events and recurring patterns.',
      sections: [
        { heading: 'More than a family tree', body: ['A traditional family tree mainly shows ancestry. A genogram adds clinical and relational information such as separations, deaths, adoptions, conflicts, distance, fusion and resources.', 'This makes it useful for psychologists, therapists, social workers and other professionals who need to understand a family system quickly.'] },
        { heading: 'Why create one online?', body: ['An online genogram is easier to update, export and share with colleagues. It also keeps the structure readable when the situation becomes complex.'] },
      ],
    },
    howTo: {
      path: '/en/how-to-create-a-genogram',
      title: 'How to create a genogram online | Genogy',
      description: 'Create an online genogram step by step and map family and emotional relationships clearly.',
      eyebrow: 'Guide',
      h1: 'How to create a genogram online',
      intro: 'Start with the main person, add family members, define relationships, then enrich the map with emotional links and clinical information.',
      sections: [
        { heading: '1. Start with the main person', body: ['Place the index person first, then add parents, siblings, partners and children. Three generations are usually enough for a first clinical overview.'] },
        { heading: '2. Add family and emotional links', body: ['Represent unions, separations, parent-child links and emotional relationships. Keep facts separate from hypotheses so the map stays clinically useful.'] },
        { heading: '3. Export or share', body: ['Use the genogram as a visual support for notes, supervision, team meetings or interdisciplinary work.'] },
      ],
    },
    symbols: {
      path: '/en/genogram-symbols',
      title: 'McGoldrick genogram symbols | Genogy',
      description: 'Understand the main McGoldrick genogram symbols for people, unions, filiations and emotional links.',
      eyebrow: 'Symbols',
      h1: 'Genogram symbols: people, unions and emotional links',
      intro: 'Genograms rely on stable visual conventions. McGoldrick symbols help professionals read family structures consistently.',
      sections: [
        { heading: 'Person symbols', body: ['Squares, circles and diamonds identify people while markers can show death, uncertainty or specific clinical events.'] },
        { heading: 'Family structure', body: ['Horizontal lines show unions. Vertical lines show filiations. Separations, divorces, adoption and perinatal events use specific markers.'] },
        { heading: 'Emotional links', body: ['Conflict, distance, fusion, cut-off or violence can be shown without changing the underlying family structure.'] },
      ],
      faq: [
        { q: 'Do I need to follow McGoldrick symbols strictly?', a: 'They are a shared professional base. Adaptations are possible when they are documented clearly.' },
        { q: 'Can emotional links and pathologies appear together?', a: 'Yes. Pathologies describe people, while emotional links describe relationships.' },
      ],
    },
    psychology: {
      path: '/en/genogram-psychology',
      title: 'Genogram for psychology and therapy | Genogy',
      description: 'Use Genogy to create clinical genograms for psychology, therapy and supervision.',
      eyebrow: 'Psychology',
      h1: 'An online genogram tool for psychologists and therapists',
      intro: 'Genogy helps clinicians represent family structure, emotional links, major events and clinical hypotheses in minutes.',
      sections: [
        { heading: 'Structured assessment', body: ['A genogram helps organize family history while keeping the interview fluid and readable.'] },
        { heading: 'Clinical hypotheses', body: ['Patterns such as losses, separations, alliances and conflicts become easier to identify and discuss.'] },
      ],
    },
    socialWork: {
      path: '/en/genogram-social-work',
      title: 'Genogram for social work | Genogy',
      description: 'Create clear online genograms for social work, child protection and team coordination.',
      eyebrow: 'Social work',
      h1: 'Readable genograms for social work',
      intro: 'Genogy helps social workers and multidisciplinary teams clarify complex family situations and share a common view.',
      sections: [
        { heading: 'Complex situations', body: ['Child protection, family support, disability, mental health and team coordination often require a clear family map.'] },
        { heading: 'Shared understanding', body: ['A readable genogram helps distinguish verified facts, resources, vulnerabilities and questions to explore.'] },
      ],
    },
    firstSession: {
      path: '/en/resources/first-session-genogram', title: 'Build a genogram in a first session | Genogy', description: 'A simple method to start a clinical genogram during a first session.', eyebrow: 'Practical article', h1: 'Build a genogram in a first session', intro: 'Start with a useful structure without turning the session into an administrative questionnaire.', sections: [{ heading: 'Start simple', body: ['Map the index person, close relatives and the most relevant events first.', 'Leave uncertain information open and complete the genogram over time.'] }, { heading: 'Use it clinically', body: ['Once the structure is visible, repeated patterns, missing links and resources become easier to discuss.'] }],
    },
    clinicalExample: {
      path: '/en/resources/clinical-genogram-example', title: 'Clinical genogram example | Genogy', description: 'A commented fictional clinical genogram example to learn how to read family patterns.', eyebrow: 'Example', h1: 'Clinical genogram example', intro: 'A fictional case to understand how a genogram can support clinical thinking.', sections: [{ heading: 'Starting situation', body: ['The map shows a large sibling group, an old parental separation and a grandparent with a central role.'] }, { heading: 'Reading patterns', body: ['Separations across generations can open hypotheses about conflict resolution and loyalties without becoming automatic conclusions.'] }],
    },
    socialCase: {
      path: '/en/resources/social-work-genogram-case-study', title: 'Social work genogram case study | Genogy', description: 'A practical case study for using genograms in social work and team coordination.', eyebrow: 'Case study', h1: 'Social work genogram case study', intro: 'Structure a complex family situation and make it easier to discuss in team meetings.', sections: [{ heading: 'Clarify who matters', body: ['Parents, step-parents, siblings, grandparents, caregivers and institutions can all be represented when they matter in the situation.'] }, { heading: 'Prepare meetings', body: ['A clean export gives professionals a shared basis before discussing actions and decisions.'] }],
    },
  },
  de: {
    resources: { path: '/de/ressourcen', title: 'Genogramm-Ressourcen — praktische Leitfäden | Genogy', description: 'Praktische Genogy-Leitfäden zum Erstellen, Lesen und Nutzen von Online-Genogrammen.', eyebrow: 'Ressourcen', h1: 'Leitfäden zum Verstehen und Erstellen von Online-Genogrammen', intro: 'Lernen Sie, klinische Genogramme zu strukturieren, McGoldrick-Symbole zu nutzen und Familienkarten verständlich darzustellen.', sections: [] },
    whatIs: { path: '/de/was-ist-ein-genogramm', title: 'Was ist ein Genogramm? | Genogy', description: 'Ein Genogramm zeigt familiäre und emotionale Beziehungen, Ereignisse und Muster über Generationen.', eyebrow: 'Definition', h1: 'Was ist ein Genogramm?', intro: 'Ein Genogramm geht über einen Stammbaum hinaus und zeigt familiäre Beziehungen, emotionale Bindungen, Lebensereignisse und wiederkehrende Muster.', sections: [{ heading: 'Mehr als ein Stammbaum', body: ['Ein Stammbaum zeigt vor allem Abstammung. Ein Genogramm ergänzt Beziehungen, Trennungen, Todesfälle, Adoptionen, Konflikte, Distanz und Ressourcen.', 'Dadurch ist es besonders nützlich für Psychologie, Therapie und Sozialarbeit.'] }, { heading: 'Warum online erstellen?', body: ['Ein Online-Genogramm lässt sich leichter aktualisieren, exportieren und im Team teilen.'] }] },
    howTo: { path: '/de/genogramm-erstellen', title: 'Genogramm online erstellen | Genogy', description: 'Erstellen Sie Online-Genogramme Schritt für Schritt und visualisieren Sie familiäre und emotionale Beziehungen.', eyebrow: 'Leitfaden', h1: 'Genogramm online erstellen', intro: 'Beginnen Sie mit der Hauptperson, fügen Sie Familienmitglieder hinzu und ergänzen Sie familiäre und emotionale Beziehungen.', sections: [{ heading: '1. Mit der Hauptperson beginnen', body: ['Platzieren Sie zuerst die Indexperson und ergänzen Sie Eltern, Geschwister, Partner und Kinder.'] }, { heading: '2. Beziehungen ergänzen', body: ['Stellen Sie Partnerschaften, Trennungen, Eltern-Kind-Beziehungen und emotionale Verbindungen klar dar.'] }, { heading: '3. Exportieren oder teilen', body: ['Nutzen Sie das Genogramm für Notizen, Supervision, Fallbesprechungen oder Teamarbeit.'] }] },
    symbols: { path: '/de/genogramm-symbole', title: 'McGoldrick-Genogramm-Symbole | Genogy', description: 'Die wichtigsten McGoldrick-Symbole für Personen, Partnerschaften, Abstammung und emotionale Beziehungen.', eyebrow: 'Symbole', h1: 'Genogramm-Symbole: Personen, Partnerschaften und emotionale Beziehungen', intro: 'Genogramme nutzen stabile visuelle Konventionen, damit Fachkräfte Familienstrukturen konsistent lesen können.', sections: [{ heading: 'Personensymbole', body: ['Quadrate, Kreise und Rauten kennzeichnen Personen; zusätzliche Markierungen zeigen Tod, Unsicherheit oder besondere Ereignisse.'] }, { heading: 'Familienstruktur', body: ['Horizontale Linien zeigen Partnerschaften, vertikale Linien zeigen Abstammung.'] }, { heading: 'Emotionale Beziehungen', body: ['Konflikt, Distanz, Fusion, Kontaktabbruch oder Gewalt können unabhängig von der Struktur dargestellt werden.'] }] },
    psychology: { path: '/de/genogramm-psychologie', title: 'Genogramm für Psychologie und Therapie | Genogy', description: 'Erstellen Sie klinische Online-Genogramme für Psychologie, Therapie und Supervision.', eyebrow: 'Psychologie', h1: 'Ein Online-Genogramm-Tool für Psychologie und Therapie', intro: 'Genogy hilft, Familienstruktur, emotionale Beziehungen, Ereignisse und klinische Hypothesen schnell darzustellen.', sections: [{ heading: 'Strukturierte Anamnese', body: ['Ein Genogramm ordnet Familiengeschichte und hält das Gespräch zugleich lesbar und fokussiert.'] }, { heading: 'Klinische Hypothesen', body: ['Verluste, Trennungen, Allianzen und Konflikte werden leichter sichtbar.'] }] },
    socialWork: { path: '/de/genogramm-sozialarbeit', title: 'Genogramm für die Sozialarbeit | Genogy', description: 'Erstellen Sie klare Online-Genogramme für Sozialarbeit, Kinderschutz und Teamkoordination.', eyebrow: 'Sozialarbeit', h1: 'Lesbare Genogramme für die Sozialarbeit', intro: 'Genogy hilft Fachkräften, komplexe Familiensituationen zu klären und im Team eine gemeinsame Sicht zu teilen.', sections: [{ heading: 'Komplexe Situationen', body: ['Kinderschutz, Familienhilfe, Behinderung, psychische Gesundheit und Koordination benötigen oft eine klare Familienkarte.'] }, { heading: 'Gemeinsames Verständnis', body: ['Ein lesbares Genogramm trennt Fakten, Ressourcen, Risiken und offene Fragen.'] }] },
    firstSession: { path: '/de/ressourcen/genogramm-erste-sitzung', title: 'Genogramm in der ersten Sitzung erstellen | Genogy', description: 'Eine einfache Methode, um ein klinisches Genogramm in der ersten Sitzung zu beginnen.', eyebrow: 'Praxisartikel', h1: 'Genogramm in der ersten Sitzung erstellen', intro: 'Starten Sie mit einer nützlichen Struktur, ohne das Gespräch zu überfrachten.', sections: [{ heading: 'Einfach beginnen', body: ['Erfassen Sie zuerst die Indexperson, wichtige Angehörige und relevante Ereignisse.', 'Unsichere Angaben können offen bleiben und später ergänzt werden.'] }, { heading: 'Klinisch nutzen', body: ['Sobald die Struktur sichtbar ist, lassen sich Muster, Lücken und Ressourcen leichter besprechen.'] }] },
    clinicalExample: { path: '/de/ressourcen/klinisches-genogramm-beispiel', title: 'Klinisches Genogramm: Beispiel | Genogy', description: 'Ein kommentiertes fiktives Beispiel, um familiäre Muster in Genogrammen zu lesen.', eyebrow: 'Beispiel', h1: 'Klinisches Genogramm: Beispiel', intro: 'Ein fiktiver Fall zeigt, wie ein Genogramm klinisches Denken unterstützen kann.', sections: [{ heading: 'Ausgangslage', body: ['Die Karte zeigt eine große Geschwistergruppe, eine frühe Trennung der Eltern und einen wichtigen Großelternteil.'] }, { heading: 'Muster lesen', body: ['Wiederholte Trennungen können Hypothesen eröffnen, ohne automatische Schlussfolgerungen zu erzwingen.'] }] },
    socialCase: { path: '/de/ressourcen/genogramm-sozialarbeit-fallbeispiel', title: 'Genogramm in der Sozialarbeit: Fallbeispiel | Genogy', description: 'Ein praktisches Fallbeispiel für Genogramme in Sozialarbeit und Teamkoordination.', eyebrow: 'Fallbeispiel', h1: 'Genogramm in der Sozialarbeit: Fallbeispiel', intro: 'Strukturieren Sie eine komplexe Familiensituation für Besprechungen und Entscheidungen.', sections: [{ heading: 'Relevante Personen klären', body: ['Eltern, Stiefeltern, Geschwister, Großeltern, Bezugspersonen und Institutionen können sichtbar gemacht werden.'] }, { heading: 'Besprechungen vorbereiten', body: ['Ein sauberer Export schafft eine gemeinsame Grundlage vor Entscheidungen.'] }] },
  },
};

const iconByKey: Record<PageKey, React.ReactNode> = {
  resources: <BookOpen className="h-5 w-5" />,
  symbols: <GitFork className="h-5 w-5" />,
  psychology: <Brain className="h-5 w-5" />,
  socialWork: <BriefcaseBusiness className="h-5 w-5" />,
  whatIs: <HelpCircle className="h-5 w-5" />,
  howTo: <ListChecks className="h-5 w-5" />,
  firstSession: <BookOpen className="h-5 w-5" />,
  clinicalExample: <BookOpen className="h-5 w-5" />,
  socialCase: <Users className="h-5 w-5" />,
};

const buildBreadcrumb = (page: LocalizedPage, lang: Lang) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  '@id': `${baseUrl}${page.path}#breadcrumb`,
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: lang === 'en' ? 'Home' : 'Startseite', item: `${baseUrl}/${lang}` },
    { '@type': 'ListItem', position: 2, name: lang === 'en' ? 'Resources' : 'Ressourcen', item: `${baseUrl}${pages[lang].resources.path}` },
    ...(page.path === pages[lang].resources.path ? [] : [{ '@type': 'ListItem', position: 3, name: page.h1, item: `${baseUrl}${page.path}` }]),
  ],
});

const LocalizedShell: React.FC<{ page: LocalizedPage; lang: Lang; children: React.ReactNode }> = ({ page, lang, children }) => {
  const { setLang } = useLanguage();
  const [authModal, setAuthModal] = useState<{ open: boolean; view: AuthView }>({ open: false, view: 'login' });
  const locale = lang === 'en' ? 'en_US' : 'de_DE';
  const pageUrl = `${baseUrl}${page.path}`;

  useEffect(() => {
    setLang(lang);
  }, [lang, setLang]);

  return (
    <div className="min-h-screen bg-page-bg text-foreground">
      <Helmet>
        <html lang={lang} />
        <title>{page.title}</title>
        <meta name="description" content={page.description} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={page.title} />
        <meta property="og:description" content={page.description} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={`${baseUrl}/og-image.webp`} />
        <meta property="og:locale" content={locale} />
        <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${pageUrl}#webpage`, url: pageUrl, name: page.title, description: page.description, inLanguage: lang === 'en' ? 'en-US' : 'de-DE', breadcrumb: { '@id': `${pageUrl}#breadcrumb` }, isPartOf: { '@type': 'WebSite', '@id': `${baseUrl}/#website`, name: 'Genogy', url: `${baseUrl}/` } })}</script>
        <script type="application/ld+json">{JSON.stringify(buildBreadcrumb(page, lang))}</script>
      </Helmet>
      <LandingHeader onAuth={(view) => setAuthModal({ open: true, view })} />
      {children}
      <Footer />
      {authModal.open && <Suspense fallback={null}><AuthModal open={authModal.open} onClose={() => setAuthModal({ ...authModal, open: false })} defaultView={authModal.view} /></Suspense>}
    </div>
  );
};

const Hero: React.FC<{ page: LocalizedPage; icon: React.ReactNode }> = ({ page, icon }) => (
  <section className="border-b border-border bg-card">
    <div className="mx-auto max-w-5xl px-6 py-16 lg:py-20">
      <div className="mb-4 flex items-center gap-2 text-primary">{icon}<span className="text-sm font-semibold uppercase tracking-wider">{page.eyebrow}</span></div>
      <h1 className="mb-5 max-w-4xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{page.h1}</h1>
      <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">{page.intro}</p>
    </div>
  </section>
);

const LocalizedPageView: React.FC<{ lang: Lang; pageKey: PageKey }> = ({ lang, pageKey }) => {
  const page = pages[lang][pageKey];
  const isResources = pageKey === 'resources';
  const resources = resourcesByLang[lang];

  return (
    <LocalizedShell page={page} lang={lang}>
      <Hero page={page} icon={iconByKey[pageKey]} />
      <main className="mx-auto max-w-5xl px-6 py-14">
        {isResources ? (
          <div className="grid gap-6 md:grid-cols-3">
            {resources.map((article) => (
              <article key={article.path} className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-3 text-xl font-bold leading-snug">{article.title}</h2>
                <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{article.text}</p>
                <Link to={article.path} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                  {lang === 'en' ? 'Read article' : 'Artikel lesen'} <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <article className="mx-auto max-w-4xl space-y-10">
            {page.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="mb-4 text-2xl font-bold text-foreground">{section.heading}</h2>
                <div className="space-y-4 text-muted-foreground">
                  {section.body.map((paragraph) => <p key={paragraph} className="leading-relaxed">{paragraph}</p>)}
                </div>
              </section>
            ))}
          </article>
        )}
      </main>
    </LocalizedShell>
  );
};

export const EnResourcesPage = () => <LocalizedPageView lang="en" pageKey="resources" />;
export const EnWhatIsGenogramPage = () => <LocalizedPageView lang="en" pageKey="whatIs" />;
export const EnHowToGenogramPage = () => <LocalizedPageView lang="en" pageKey="howTo" />;
export const EnSymbolsPage = () => <LocalizedPageView lang="en" pageKey="symbols" />;
export const EnPsychologyPage = () => <LocalizedPageView lang="en" pageKey="psychology" />;
export const EnSocialWorkPage = () => <LocalizedPageView lang="en" pageKey="socialWork" />;
export const EnFirstSessionArticle = () => <LocalizedPageView lang="en" pageKey="firstSession" />;
export const EnClinicalExampleArticle = () => <LocalizedPageView lang="en" pageKey="clinicalExample" />;
export const EnSocialCaseArticle = () => <LocalizedPageView lang="en" pageKey="socialCase" />;

export const DeResourcesPage = () => <LocalizedPageView lang="de" pageKey="resources" />;
export const DeWhatIsGenogramPage = () => <LocalizedPageView lang="de" pageKey="whatIs" />;
export const DeHowToGenogramPage = () => <LocalizedPageView lang="de" pageKey="howTo" />;
export const DeSymbolsPage = () => <LocalizedPageView lang="de" pageKey="symbols" />;
export const DePsychologyPage = () => <LocalizedPageView lang="de" pageKey="psychology" />;
export const DeSocialWorkPage = () => <LocalizedPageView lang="de" pageKey="socialWork" />;
export const DeFirstSessionArticle = () => <LocalizedPageView lang="de" pageKey="firstSession" />;
export const DeClinicalExampleArticle = () => <LocalizedPageView lang="de" pageKey="clinicalExample" />;
export const DeSocialCaseArticle = () => <LocalizedPageView lang="de" pageKey="socialCase" />;
