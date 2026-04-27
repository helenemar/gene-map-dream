import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/landing/LandingHeader';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import AuthModal from '@/components/AuthModal';
import SeoLinks from '@/components/SeoLinks';
import genogramOverview from '@/assets/screens/genogram-overview.png';
import memberSheet from '@/assets/screens/member-sheet.png';
import emotionalLinkModal from '@/assets/screens/emotional-link-modal.png';

const GenogramDefinition: React.FC = () => {
  const { t } = useLanguage();
  const [authModal, setAuthModal] = React.useState<{ open: boolean; view: 'login' | 'signup' }>({ open: false, view: 'login' });

  const openAuth = (view: 'login' | 'signup') => setAuthModal({ open: true, view });

  return (
    <div className="min-h-screen bg-page-bg text-foreground">
      <Helmet>
        <title>Qu'est-ce qu'un génogramme ? Définition, symboles et exemples | Genogy</title>
        <meta name="description" content="Définition complète du génogramme : symboles McGoldrick, différences avec l'arbre généalogique, usages cliniques en psychologie et travail social." />
        <meta property="og:title" content="Qu'est-ce qu'un génogramme ? Définition, symboles et exemples | Genogy" />
        <meta property="og:description" content="Définition complète du génogramme : symboles McGoldrick, différences avec l'arbre généalogique, usages cliniques." />
        <meta property="og:url" content="https://www.genogy-app.com/genogramme" />
        <meta property="og:image" content="https://www.genogy-app.com/og-image.webp" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: "Qu'est-ce qu'un génogramme ? Définition, symboles et exemples",
          description: "Guide complet sur le génogramme : définition, symboles McGoldrick, différences avec l'arbre généalogique, et utilisation en psychologie clinique.",
          author: { '@type': 'Organization', name: 'Genogy' },
          publisher: { '@type': 'Organization', name: 'Genogy', url: 'https://www.genogy-app.com' },
          datePublished: '2025-01-15',
          dateModified: '2026-03-30',
          mainEntityOfPage: 'https://www.genogy-app.com/genogramme',
        })}</script>
      </Helmet>
      <SeoLinks pageKey="whatIs" locale="fr" />

      <LandingHeader onAuth={openAuth} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-brand-orange/5" />
        <div className="absolute inset-0 -z-10 [background-image:radial-gradient(hsl(var(--primary)/0.08)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="max-w-5xl mx-auto px-6 py-20 lg:py-28">
          <nav aria-label="Fil d'ariane" className="mb-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Qu'est-ce qu'un génogramme ?</span>
          </nav>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-5">
            <span className="size-1.5 rounded-full bg-primary" />
            Guide complet · 8 min de lecture
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.05]">
            Qu'est-ce qu'un <span className="text-primary">génogramme</span> ?
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Définition, symboles standardisés McGoldrick, différences avec l'arbre généalogique et méthode pour créer un génogramme en ligne.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="brand" size="lg" onClick={() => openAuth('signup')} className="rounded-full px-7">
              Créer mon génogramme
            </Button>
            <Link to="/comment-faire-un-genogramme">
              <Button variant="outline" size="lg" className="rounded-full px-7">
                Guide pas à pas →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-6 py-16 lg:py-20">
        <figure className="mb-14 -mt-32 lg:-mt-40 rounded-2xl overflow-hidden border border-border shadow-2xl bg-card">
          <img
            src={genogramOverview}
            alt="Aperçu d'un génogramme clinique réalisé avec Genogy : trois générations, liens familiaux, pathologies et liens émotionnels"
            className="w-full h-auto"
            loading="lazy"
          />
          <figcaption className="px-5 py-3 text-sm text-muted-foreground border-t border-border bg-card">
            Exemple de génogramme clinique sur 3 générations dans l'éditeur Genogy.
          </figcaption>
        </figure>

        {/* Sommaire */}
        <aside className="mb-14 rounded-2xl border border-border bg-card/50 p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Au sommaire</p>
          <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <li><a href="#definition" className="text-foreground hover:text-primary transition-colors">1. Définition du génogramme</a></li>
            <li><a href="#symboles" className="text-foreground hover:text-primary transition-colors">2. Symboles McGoldrick</a></li>
            <li><a href="#difference" className="text-foreground hover:text-primary transition-colors">3. vs Arbre généalogique</a></li>
            <li><a href="#usages" className="text-foreground hover:text-primary transition-colors">4. À quoi ça sert ?</a></li>
            <li><a href="#creer" className="text-foreground hover:text-primary transition-colors">5. Créer en ligne</a></li>
          </ol>
        </aside>

        <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-headings:font-extrabold prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-table:overflow-hidden prose-table:rounded-xl prose-table:border prose-table:border-border prose-th:bg-muted/40 prose-th:text-foreground prose-td:border-border">
          <h2>Définition du génogramme</h2>
          <p>
            Un <strong>génogramme</strong> est une représentation graphique de la structure familiale d'un individu, étendue sur au moins trois générations. Développé par <strong>Monica McGoldrick</strong> et Randy Gerson dans les années 1980, le génogramme va bien au-delà d'un simple <em>arbre généalogique</em>.
          </p>
          <p>
            Là où l'arbre généalogique se limite à la filiation biologique (parents, grands-parents, enfants), le génogramme intègre :
          </p>
          <ul>
            <li>Les <strong>relations émotionnelles</strong> entre les membres (fusion, conflit, distance, coupure, alliance…)</li>
            <li>Les <strong>pathologies médicales et psychologiques</strong> (maladies cardiovasculaires, dépression, addictions…)</li>
            <li>Les <strong>événements de vie marquants</strong> (décès, divorces, adoptions, migrations…)</li>
            <li>Les <strong>schémas transgénérationnels</strong> et répétitions familiales</li>
          </ul>

          <h2>Symboles standardisés du génogramme (McGoldrick)</h2>
          <p>Le génogramme utilise un système de symboles codifiés internationalement :</p>
          <ul>
            <li><strong>Carré</strong> — Homme</li>
            <li><strong>Cercle</strong> — Femme</li>
            <li><strong>Losange</strong> — Genre non spécifié ou intersexe</li>
            <li><strong>Croix (X)</strong> — Personne décédée</li>
            <li><strong>Ligne horizontale pleine</strong> — Union (mariage, concubinage)</li>
            <li><strong>Ligne horizontale avec barres</strong> — Séparation ou divorce</li>
            <li><strong>Lignes verticales</strong> — Filiation (parents-enfants)</li>
            <li><strong>Lignes ondulées</strong> — Relation fusionnelle</li>
            <li><strong>Lignes en zigzag</strong> — Relation conflictuelle</li>
            <li><strong>Lignes pointillées</strong> — Relation distante</li>
            <li><strong>Lignes coupées</strong> — Rupture relationnelle</li>
          </ul>

          <figure className="not-prose my-10 rounded-2xl overflow-hidden border border-border shadow-sm bg-card">
            <img
              src={emotionalLinkModal}
              alt="Sélecteur de types de liens émotionnels dans Genogy : fusionnel, distant, conflit, ambivalent, lien rompu, violences"
              className="w-full h-auto"
              loading="lazy"
            />
            <figcaption className="px-5 py-3 text-sm text-muted-foreground border-t border-border bg-card">
              Catalogue des liens émotionnels (standard McGoldrick) disponibles dans Genogy.
            </figcaption>
          </figure>

          <h2>Différence entre génogramme et arbre généalogique</h2>
          <table>
            <thead>
              <tr><th>Critère</th><th>Arbre généalogique</th><th>Génogramme</th></tr>
            </thead>
            <tbody>
              <tr><td>Objectif</td><td>Retracer la lignée familiale</td><td>Analyser les dynamiques familiales</td></tr>
              <tr><td>Relations émotionnelles</td><td>Non</td><td>Oui (fusion, conflit, distance…)</td></tr>
              <tr><td>Pathologies</td><td>Non</td><td>Oui (médicales et psychologiques)</td></tr>
              <tr><td>Événements de vie</td><td>Naissance, décès</td><td>Divorces, adoptions, migrations…</td></tr>
              <tr><td>Usage professionnel</td><td>Généalogie amateur</td><td>Psychologie, travail social, thérapie</td></tr>
              <tr><td>Symboles standardisés</td><td>Variable</td><td>Norme McGoldrick internationale</td></tr>
            </tbody>
          </table>

          <h2>À quoi sert un génogramme ?</h2>
          <p>Le génogramme est un outil clinique utilisé quotidiennement par :</p>
          <ul>
            <li><strong>Les psychologues cliniciens</strong> pour comprendre le contexte familial d'un patient</li>
            <li><strong>Les thérapeutes familiaux</strong> pour visualiser les dynamiques systémiques</li>
            <li><strong>Les travailleurs sociaux</strong> pour évaluer les situations familiales complexes</li>
            <li><strong>Les éducateurs spécialisés</strong> pour accompagner les enfants et adolescents</li>
            <li><strong>Les psychiatres</strong> pour repérer les antécédents familiaux de troubles mentaux</li>
          </ul>
          <p>
            Le génogramme permet de repérer les <strong>transmissions transgénérationnelles</strong>, qu'elles soient positives (résilience, talents) ou problématiques (violence, addictions, schémas d'abandon).
          </p>

          <figure className="not-prose my-10 rounded-2xl overflow-hidden border border-border shadow-sm bg-card">
            <img
              src={memberSheet}
              alt="Fiche membre détaillée dans Genogy : identité, dates, pathologies, relations de couple et liens émotionnels"
              className="w-full h-auto"
              loading="lazy"
            />
            <figcaption className="px-5 py-3 text-sm text-muted-foreground border-t border-border bg-card">
              Fiche membre clinique : identité, dates, pathologies et liens émotionnels.
            </figcaption>
          </figure>

          <h2>Comment créer un génogramme en ligne ?</h2>
          <p>
            Avec <strong>Genogy</strong>, créer un génogramme en ligne est simple et rapide :
          </p>
          <ol>
            <li><strong>Inscrivez-vous</strong> gratuitement (accès complet pendant la bêta)</li>
            <li><strong>Ajoutez les membres</strong> de la famille avec leurs informations</li>
            <li><strong>Définissez les unions</strong>, les enfants et les relations de filiation</li>
            <li><strong>Enrichissez</strong> avec les liens émotionnels, les pathologies et les notes cliniques</li>
            <li><strong>Exportez</strong> en PDF ou PNG, ou partagez via un lien sécurisé</li>
          </ol>

          <div className="not-prose mt-10 flex flex-col sm:flex-row gap-4">
            <Button variant="brand" size="lg" onClick={() => openAuth('signup')} className="rounded-full px-8">
              Créer mon génogramme gratuitement
            </Button>
            <Link to="/comment-faire-un-genogramme">
              <Button variant="outline" size="lg" className="rounded-full px-8 border-primary text-primary">
                Guide pas à pas →
              </Button>
            </Link>
          </div>
        </div>
      </article>

      <Footer />

      <AuthModal
        open={authModal.open}
        onClose={() => setAuthModal({ ...authModal, open: false })}
        defaultView={authModal.view}
      />
    </div>
  );
};

export default GenogramDefinition;
