import React, { lazy, Suspense, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Brain, BriefcaseBusiness, GitFork, HeartPulse, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/landing/LandingHeader';
import Footer from '@/components/Footer';

const AuthModal = lazy(() => import('@/components/AuthModal'));

const baseUrl = 'https://www.genogy-app.com';
const description = "Genogy est l'outil en ligne pour créer des génogrammes cliniques professionnels. Conçu pour psychologues, thérapeutes et travailleurs sociaux. Gratuit en bêta.";

type AuthView = 'login' | 'signup';

const SeoShell: React.FC<{
  title: string;
  canonicalPath: string;
  children: React.ReactNode;
}> = ({ title, canonicalPath, children }) => {
  const [authModal, setAuthModal] = useState<{ open: boolean; view: AuthView }>({ open: false, view: 'login' });
  const canonical = `${baseUrl}${canonicalPath}`;

  return (
    <div className="min-h-screen bg-page-bg text-foreground">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={`${baseUrl}/og-image.webp`} />
      </Helmet>
      <LandingHeader onAuth={(view) => setAuthModal({ open: true, view })} />
      {children}
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

const Hero: React.FC<{ eyebrow: string; title: string; intro: string; icon: React.ReactNode }> = ({ eyebrow, title, intro, icon }) => (
  <section className="border-b border-border bg-card">
    <div className="mx-auto max-w-5xl px-6 py-16 lg:py-20">
      <div className="mb-4 flex items-center gap-2 text-primary">
        {icon}
        <span className="text-sm font-semibold uppercase tracking-wider">{eyebrow}</span>
      </div>
      <h1 className="mb-5 max-w-4xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{title}</h1>
      <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">{intro}</p>
    </div>
  </section>
);

export const ResourcesPage: React.FC = () => (
  <SeoShell title="Ressources génogramme — guides pratiques | Genogy" canonicalPath="/ressources">
    <Hero
      eyebrow="Ressources"
      icon={<BookOpen className="h-5 w-5" />}
      title="Guides pour comprendre et créer un génogramme en ligne"
      intro="Retrouvez les premiers articles Genogy pour apprendre à structurer un génogramme clinique, choisir les bons symboles et présenter une carte familiale exploitable en entretien."
    />
    <main className="mx-auto max-w-5xl px-6 py-14 lg:py-18">
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { title: 'Comment préparer un génogramme avant un entretien ?', path: '/comment-faire-un-genogramme', text: 'Les informations à recueillir, les générations à représenter et les pièges à éviter au démarrage.' },
          { title: 'Symboles McGoldrick : les bases à connaître', path: '/symboles-genogramme', text: 'Carrés, cercles, unions, séparations, décès, liens émotionnels et pathologies : le socle visuel du génogramme.' },
          { title: 'Génogramme clinique : usages en psychologie et travail social', path: '/genogramme-psychologie', text: 'Pourquoi la représentation familiale aide à formuler des hypothèses et à clarifier les dynamiques relationnelles.' },
        ].map((article) => (
          <article key={article.path} className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-3 text-xl font-bold leading-snug">{article.title}</h2>
            <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{article.text}</p>
            <Link to={article.path} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              Lire l’article <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </div>
    </main>
  </SeoShell>
);

export const SymbolsGenogramPage: React.FC = () => (
  <SeoShell title="Symboles génogramme McGoldrick — guide complet | Genogy" canonicalPath="/symboles-genogramme">
    <Hero
      eyebrow="Symboles McGoldrick"
      icon={<GitFork className="h-5 w-5" />}
      title="Les symboles du génogramme : personnes, unions, filiations et liens émotionnels"
      intro="Un génogramme efficace repose sur des conventions visuelles stables. Cette page résume les symboles McGoldrick les plus utilisés dans les pratiques cliniques et médico-sociales."
    />
    <main className="mx-auto max-w-4xl px-6 py-14">
      <div className="space-y-10 text-muted-foreground">
        <section>
          <h2 className="mb-4 text-2xl font-bold text-foreground">Symboles des personnes</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            <li><strong className="text-foreground">Carré</strong> — homme ou identité masculine.</li>
            <li><strong className="text-foreground">Cercle</strong> — femme ou identité féminine.</li>
            <li><strong className="text-foreground">Losange</strong> — genre non spécifié, intersexe ou information inconnue.</li>
            <li><strong className="text-foreground">Croix sur le symbole</strong> — personne décédée.</li>
          </ul>
        </section>
        <section>
          <h2 className="mb-4 text-2xl font-bold text-foreground">Unions, séparations et filiations</h2>
          <p className="leading-relaxed">La ligne horizontale représente une union, la ligne verticale indique la filiation parent-enfant. Les séparations, divorces, remariages, adoptions ou grossesses interrompues sont indiqués par des marqueurs spécifiques afin de conserver une lecture clinique claire.</p>
        </section>
        <section>
          <h2 className="mb-4 text-2xl font-bold text-foreground">Liens émotionnels et pathologies</h2>
          <p className="leading-relaxed">Les relations fusionnelles, conflictuelles, distantes, coupées ou violentes complètent la structure familiale. Genogy permet aussi d’ajouter des pathologies visibles par couleur pour repérer rapidement des antécédents ou répétitions transgénérationnelles.</p>
        </section>
      </div>
    </main>
  </SeoShell>
);

export const GenogramPsychologyPage: React.FC = () => (
  <SeoShell title="Génogramme en psychologie — outil clinique | Genogy" canonicalPath="/genogramme-psychologie">
    <Hero
      eyebrow="Psychologie"
      icon={<Brain className="h-5 w-5" />}
      title="Un outil de génogramme pour psychologues et thérapeutes"
      intro="Genogy aide les professionnels de la psychologie à représenter la structure familiale, les liens émotionnels, les événements marquants et les hypothèses cliniques en quelques minutes."
    />
    <main className="mx-auto grid max-w-5xl gap-8 px-6 py-14 lg:grid-cols-3">
      {[
        ['Anamnèse structurée', 'Visualisez rapidement les générations, alliances, ruptures et personnes ressources pendant l’entretien.'],
        ['Hypothèses cliniques', 'Repérez les répétitions, loyautés, conflits, deuils, séparations ou dynamiques transgénérationnelles.'],
        ['Support partageable', 'Exportez un génogramme clair pour vos notes, supervisions ou échanges interdisciplinaires.'],
      ].map(([title, text]) => (
        <section key={title} className="rounded-lg border border-border bg-card p-6">
          <HeartPulse className="mb-4 h-7 w-7 text-primary" />
          <h2 className="mb-3 text-xl font-bold">{title}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
        </section>
      ))}
    </main>
  </SeoShell>
);

export const GenogramSocialWorkPage: React.FC = () => (
  <SeoShell title="Génogramme pour le travail social | Genogy" canonicalPath="/genogramme-travail-social">
    <Hero
      eyebrow="Travail social"
      icon={<BriefcaseBusiness className="h-5 w-5" />}
      title="Créer des génogrammes lisibles pour l’accompagnement social"
      intro="Genogy permet aux travailleurs sociaux, éducateurs spécialisés et équipes médico-sociales de clarifier les situations familiales complexes et de partager une lecture commune."
    />
    <main className="mx-auto max-w-5xl px-6 py-14">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-lg border border-border bg-card p-6">
          <Users className="mb-4 h-8 w-8 text-primary" />
          <h2 className="mb-3 text-2xl font-bold">Pour quelles situations ?</h2>
          <p className="leading-relaxed text-muted-foreground">Protection de l’enfance, accompagnement familial, insertion, handicap, santé mentale, coordination d’équipe : le génogramme rend visibles les ressources et les points de fragilité.</p>
        </section>
        <section className="space-y-4 text-muted-foreground">
          <h2 className="text-2xl font-bold text-foreground">Ce que Genogy apporte aux équipes</h2>
          <ul className="space-y-3">
            <li>Une carte familiale propre, compréhensible par plusieurs intervenants.</li>
            <li>Des notes et pathologies associées au dossier familial.</li>
            <li>Un export pour préparer réunions, synthèses ou transmissions.</li>
            <li>Un accès en ligne sans logiciel lourd à installer.</li>
          </ul>
          <Button asChild variant="brand" className="rounded-full px-7">
            <Link to="/">Découvrir Genogy</Link>
          </Button>
        </section>
      </div>
    </main>
  </SeoShell>
);