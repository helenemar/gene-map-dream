import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/landing/LandingHeader';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import AuthModal from '@/components/AuthModal';

const GenogramDefinition: React.FC = () => {
  const { t } = useLanguage();
  const [authModal, setAuthModal] = React.useState<{ open: boolean; view: 'login' | 'signup' }>({ open: false, view: 'login' });

  const openAuth = (view: 'login' | 'signup') => setAuthModal({ open: true, view });

  return (
    <div className="min-h-screen bg-page-bg text-foreground">
      <Helmet>
        <title>Qu'est-ce qu'un génogramme ? Définition, symboles et exemples | Genogy</title>
        <meta name="description" content="Genogy est l'outil en ligne pour créer des génogrammes cliniques professionnels. Conçu pour psychologues, thérapeutes et travailleurs sociaux. Gratuit en bêta." />
        <link rel="canonical" href="https://www.genogy-app.com/" />
        <link rel="alternate" hrefLang="fr" href="https://www.genogy-app.com/" />
        <link rel="alternate" hrefLang="en" href="https://www.genogy-app.com/en" />
        <link rel="alternate" hrefLang="de" href="https://www.genogy-app.com/de" />
        <link rel="alternate" hrefLang="x-default" href="https://www.genogy-app.com/" />
        <meta property="og:title" content="Genogy — outil pour créer des génogrammes cliniques professionnels" />
        <meta property="og:description" content="Genogy est l'outil en ligne pour créer des génogrammes cliniques professionnels. Conçu pour psychologues, thérapeutes et travailleurs sociaux. Gratuit en bêta." />
        <meta property="og:url" content="https://www.genogy-app.com/" />
        <meta property="og:image" content="https://www.genogy-app.com/og-image.png" />
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

      <LandingHeader onAuth={openAuth} />

      <article className="max-w-3xl mx-auto px-6 py-16 lg:py-24">
        <header className="mb-12">
          <p className="text-primary text-sm font-medium mb-3">Guide complet</p>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">
            Qu'est-ce qu'un génogramme ?
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Définition, symboles standardisés, différences avec l'arbre généalogique et comment créer un génogramme en ligne.
          </p>
        </header>

        <div className="prose prose-lg max-w-none dark:prose-invert">
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
