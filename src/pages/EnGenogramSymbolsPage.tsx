import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, GitFork } from 'lucide-react';
import LandingHeader from '@/components/landing/LandingHeader';
import Footer from '@/components/Footer';
import SeoLinks from '@/components/SeoLinks';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const AuthModal = lazy(() => import('@/components/AuthModal'));

const PAGE_PATH = '/en/genogram-symbols';
const PAGE_URL = `https://www.genogy-app.com${PAGE_PATH}`;
const PAGE_TITLE = 'Genogram Symbols: The Complete McGoldrick Reference Guide | Genogy';
const PAGE_DESCRIPTION =
  'A complete reference of genogram symbols following the McGoldrick standard: gender, relationships, emotional bonds, medical conditions and clinical annotations.';

type SymbolRow = { symbol: string; label: string };

const individualGender: SymbolRow[] = [
  { symbol: '◻', label: 'Square = male' },
  { symbol: '◯', label: 'Circle = female' },
  { symbol: '◇', label: 'Diamond = unknown or non-binary gender' },
  { symbol: '◻ / ◯ ✕', label: 'Square or circle with an X through it = deceased' },
];

const perinatal: SymbolRow[] = [
  { symbol: '△', label: 'Small triangle = pregnancy' },
  { symbol: '⬤', label: 'Small filled circle = miscarriage' },
  { symbol: '✚', label: 'Small cross = stillbirth' },
  { symbol: '▲', label: 'Small filled triangle = abortion' },
];

const couples: SymbolRow[] = [
  { symbol: '———', label: 'Single horizontal line = married couple' },
  { symbol: '═══', label: 'Double horizontal line = common-law / cohabiting' },
  { symbol: '- - -', label: 'Dashed horizontal line = dating / engaged' },
  { symbol: '∿∿∿', label: 'Zigzag line = separated' },
  { symbol: '—//—', label: 'Two slash marks on line = divorced' },
];

const children: SymbolRow[] = [
  { symbol: '│', label: 'Vertical line descending from couple line = biological child' },
  { symbol: '┊', label: 'Dashed vertical line = adopted child' },
  { symbol: '∧', label: 'Two lines close together = twins' },
  { symbol: '⬤', label: 'Filled circle/square = foster child' },
];

const positiveBonds: SymbolRow[] = [
  { symbol: '═══', label: 'Two parallel lines = close relationship' },
  { symbol: '≡≡≡', label: 'Three parallel lines = enmeshed / fused relationship' },
];

const conflictBonds: SymbolRow[] = [
  { symbol: '∿∿∿', label: 'Jagged / zigzag line between individuals = conflict' },
  { symbol: '⌇⌇⌇', label: 'Dashed zigzag = hostility or distant-conflict' },
];

const disconnection: SymbolRow[] = [
  { symbol: '- - -', label: 'Single dashed line = distant relationship' },
  { symbol: '— ⫶ —', label: 'Cut line (gap) = emotional cutoff' },
];

const SymbolTable: React.FC<{ rows: SymbolRow[] }> = ({ rows }) => (
  <div className="overflow-hidden rounded-lg border border-border bg-card">
    <table className="w-full">
      <tbody>
        {rows.map((row, idx) => (
          <tr key={row.label} className={idx !== rows.length - 1 ? 'border-b border-border' : ''}>
            <td className="w-24 px-5 py-4 text-center text-2xl font-semibold text-primary">{row.symbol}</td>
            <td className="px-5 py-4 text-base leading-relaxed text-foreground">{row.label}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const faq = [
  {
    q: 'What are the standard genogram symbols?',
    a: 'The standard genogram symbols were established by Monica McGoldrick and Randy Gerson in their 1985 work "Genograms in Family Assessment." They include gender symbols, relationship lines, and emotional bond notations. Genogy follows these standards.',
  },
  {
    q: 'Are genogram symbols universal?',
    a: 'McGoldrick symbols are widely adopted across clinical disciplines in North America, Europe, and beyond. Some variation exists between institutions, but the core symbol set is consistent.',
  },
  {
    q: 'Can I create a genogram with these symbols online?',
    a: 'Yes — Genogy lets you create clinical genograms online using all McGoldrick symbols, without any software to install. Start free at genogy-app.com.',
  },
];

const EnGenogramSymbolsPage: React.FC = () => {
  const { setLang } = useLanguage();
  const [authModal, setAuthModal] = useState<{ open: boolean; view: 'login' | 'signup' }>({ open: false, view: 'signup' });

  useEffect(() => {
    setLang('en');
  }, [setLang]);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${PAGE_URL}#article`,
    headline: 'Genogram Symbols: The Complete McGoldrick Reference Guide',
    description: PAGE_DESCRIPTION,
    inLanguage: 'en',
    mainEntityOfPage: PAGE_URL,
    author: { '@type': 'Organization', name: 'Genogy', url: 'https://www.genogy-app.com' },
    publisher: {
      '@type': 'Organization',
      name: 'Genogy',
      url: 'https://www.genogy-app.com',
      logo: { '@type': 'ImageObject', url: 'https://www.genogy-app.com/icon-192.webp' },
    },
    image: 'https://www.genogy-app.com/og-image.webp',
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${PAGE_URL}#faq`,
    inLanguage: 'en',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${PAGE_URL}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.genogy-app.com/en' },
      { '@type': 'ListItem', position: 2, name: 'Resources', item: 'https://www.genogy-app.com/en/resources' },
      { '@type': 'ListItem', position: 3, name: 'Genogram Symbols', item: PAGE_URL },
    ],
  };

  return (
    <div className="min-h-screen bg-page-bg text-foreground">
      <Helmet>
        <html lang="en" />
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <meta
          name="keywords"
          content="genogram symbols, McGoldrick symbols, clinical genogram, family therapy symbols, emotional relationship symbols, genogram notation"
        />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image" content="https://www.genogy-app.com/og-image.webp" />
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>
      <SeoLinks pageKey="symbols" locale="en" />
      <LandingHeader onAuth={(view) => setAuthModal({ open: true, view })} />

      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-6 py-16 lg:py-20">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <GitFork className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">McGoldrick Reference</span>
          </div>
          <h1 className="mb-5 max-w-4xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Genogram Symbols: The Complete McGoldrick Reference Guide
          </h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
            A genogram uses a standardized set of symbols to represent family members, relationships,
            and medical or emotional information across generations. This guide covers every symbol
            used in clinical practice, following the McGoldrick notation system adopted by
            psychologists, family therapists, and social workers worldwide.
          </p>
          <div className="mt-8">
            <Button size="lg" onClick={() => setAuthModal({ open: true, view: 'signup' })}>
              Create your genogram for free on Genogy
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-6 py-14">
        <article className="space-y-14">
          {/* Individual Symbols */}
          <section>
            <h2 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">Individual Symbols</h2>

            <h3 className="mb-3 text-xl font-semibold text-foreground">Gender symbols</h3>
            <SymbolTable rows={individualGender} />

            <h3 className="mb-3 mt-8 text-xl font-semibold text-foreground">Pregnancy and miscarriage</h3>
            <SymbolTable rows={perinatal} />
          </section>

          {/* Relationship Symbols */}
          <section>
            <h2 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">Relationship Symbols</h2>

            <h3 className="mb-3 text-xl font-semibold text-foreground">Couple relationships</h3>
            <SymbolTable rows={couples} />

            <h3 className="mb-3 mt-8 text-xl font-semibold text-foreground">Children</h3>
            <SymbolTable rows={children} />
          </section>

          {/* Emotional Relationship Symbols */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">Emotional Relationship Symbols</h2>
            <p className="mb-6 leading-relaxed text-muted-foreground">
              Beyond family structure, genograms represent the emotional quality of relationships
              between individuals. These symbols follow the McGoldrick clinical standard.
            </p>

            <h3 className="mb-3 text-xl font-semibold text-foreground">Positive bonds</h3>
            <SymbolTable rows={positiveBonds} />

            <h3 className="mb-3 mt-8 text-xl font-semibold text-foreground">Conflictual bonds</h3>
            <SymbolTable rows={conflictBonds} />

            <h3 className="mb-3 mt-8 text-xl font-semibold text-foreground">Disconnection</h3>
            <SymbolTable rows={disconnection} />
          </section>

          {/* Medical and Psychiatric Symbols */}
          <section>
            <h2 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">Medical and Psychiatric Symbols</h2>

            <h3 className="mb-3 text-xl font-semibold text-foreground">How to annotate conditions</h3>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              In a clinical genogram, medical or psychiatric conditions are noted directly on or
              beside the individual's symbol. Common annotations include:
            </p>
            <ul className="mb-6 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Abbreviations inside the symbol (e.g. "dep" for depression, "alc" for alcohol dependency)</li>
              <li>Color coding per condition category</li>
              <li>A legend displayed alongside the genogram</li>
            </ul>

            <h3 className="mb-3 text-xl font-semibold text-foreground">Common conditions represented</h3>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Addiction (alcohol, substances)</li>
              <li>Depression and anxiety disorders</li>
              <li>Cancer and cardiovascular disease</li>
              <li>Diabetes</li>
              <li>Schizophrenia and bipolar disorder</li>
            </ul>
          </section>

          {/* How to Use */}
          <section>
            <h2 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">How to Use Genogram Symbols in Practice</h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              In clinical settings, genograms are used across at least three generations. The
              identified patient or client is typically marked with a double outline. Significant
              life events (divorce, migration, death) are noted with the year alongside the relevant
              symbol.
            </p>
            <p className="mb-6 leading-relaxed text-muted-foreground">
              Genogy implements all McGoldrick symbols natively. You can add emotional relationships,
              tag medical conditions, and annotate events directly in the editor — no manual drawing
              required.
            </p>
            <Button size="lg" onClick={() => setAuthModal({ open: true, view: 'signup' })}>
              Try Genogy free — no installation needed
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faq.map((item) => (
                <div key={item.q}>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{item.q}</h3>
                  <p className="leading-relaxed text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related */}
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-3 text-xl font-bold text-foreground">Continue exploring</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link to="/en/what-is-a-genogram" className="text-primary hover:underline">
                → What is a genogram?
              </Link>
              <Link to="/en/how-to-create-a-genogram" className="text-primary hover:underline">
                → How to create a genogram
              </Link>
              <Link to="/en/genogram-psychology" className="text-primary hover:underline">
                → Genograms in psychology
              </Link>
              <Link to="/en/resources" className="text-primary hover:underline">
                → All resources
              </Link>
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

export default EnGenogramSymbolsPage;
