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
          <h2 id="definition">Définition du génogramme</h2>
          <p>
            Un <strong>génogramme</strong> est une représentation graphique de la structure familiale d'un individu, étendue sur au moins trois générations. Développé par <strong>Monica McGoldrick</strong> et Randy Gerson dans les années 1980, le génogramme va bien au-delà d'un simple <em>arbre généalogique</em>.
          </p>
          <p>
            Là où l'arbre généalogique se limite à la filiation biologique, le génogramme intègre quatre dimensions clés :
          </p>

          <div className="not-prose grid sm:grid-cols-2 gap-4 my-8">
            {[
              { title: 'Relations émotionnelles', desc: 'Fusion, conflit, distance, coupure, alliance entre les membres.' },
              { title: 'Pathologies', desc: 'Maladies cardiovasculaires, dépression, addictions, troubles mentaux.' },
              { title: 'Événements de vie', desc: 'Décès, divorces, adoptions, migrations, traumatismes.' },
              { title: 'Schémas transgénérationnels', desc: 'Répétitions, loyautés invisibles et héritages familiaux.' },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all">
                <p className="font-semibold text-foreground mb-1">{item.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <h2 id="symboles">Symboles standardisés (McGoldrick)</h2>
          <p>Le génogramme utilise un système de symboles codifiés internationalement.</p>

          <div className="not-prose grid grid-cols-2 sm:grid-cols-3 gap-3 my-8">
            {[
              { symbol: <div className="size-8 border-2 border-foreground" />, label: 'Homme' },
              { symbol: <div className="size-8 rounded-full border-2 border-foreground" />, label: 'Femme' },
              { symbol: <div className="size-8 border-2 border-foreground rotate-45" />, label: 'Genre non spécifié' },
              { symbol: <div className="relative size-8 border-2 border-foreground"><div className="absolute inset-0 flex items-center justify-center text-foreground text-xl font-bold">×</div></div>, label: 'Personne décédée' },
              { symbol: <div className="w-10 h-0.5 bg-foreground" />, label: 'Union' },
              { symbol: <div className="relative w-10 h-0.5 bg-foreground"><div className="absolute -top-1.5 left-3 w-0.5 h-3 bg-foreground" /><div className="absolute -top-1.5 right-3 w-0.5 h-3 bg-foreground" /></div>, label: 'Divorce' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-5 aspect-square">
                <div className="flex items-center justify-center h-10">{item.symbol}</div>
                <p className="text-xs text-center text-muted-foreground font-medium">{item.label}</p>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            Et les liens émotionnels : <strong className="text-foreground">ondulé</strong> (fusionnel), <strong className="text-foreground">zigzag</strong> (conflit), <strong className="text-foreground">pointillé</strong> (distant), <strong className="text-foreground">coupé</strong> (rupture).
          </p>

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

          <h2 id="difference">Génogramme vs arbre généalogique</h2>
          <div className="not-prose my-8 overflow-hidden rounded-2xl border border-border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-4 font-semibold">Critère</th>
                  <th className="text-left p-4 font-semibold">Arbre généalogique</th>
                  <th className="text-left p-4 font-semibold text-primary">Génogramme</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Objectif', 'Retracer la lignée', 'Analyser les dynamiques familiales'],
                  ['Relations émotionnelles', 'Non', 'Oui (fusion, conflit, distance…)'],
                  ['Pathologies', 'Non', 'Oui (médicales et psychologiques)'],
                  ['Événements de vie', 'Naissance, décès', 'Divorces, adoptions, migrations…'],
                  ['Usage professionnel', 'Généalogie amateur', 'Psychologie, travail social, thérapie'],
                  ['Symboles', 'Variable', 'Norme McGoldrick internationale'],
                ].map(([k, a, b]) => (
                  <tr key={k} className="border-t border-border">
                    <td className="p-4 font-medium text-foreground">{k}</td>
                    <td className="p-4 text-muted-foreground">{a}</td>
                    <td className="p-4 text-foreground bg-primary/5">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 id="usages">À quoi sert un génogramme ?</h2>
          <p>Le génogramme est un outil clinique utilisé quotidiennement par :</p>

          <div className="not-prose grid sm:grid-cols-2 gap-3 my-8">
            {[
              { role: 'Psychologues cliniciens', desc: 'Comprendre le contexte familial du patient.' },
              { role: 'Thérapeutes familiaux', desc: 'Visualiser les dynamiques systémiques.' },
              { role: 'Travailleurs sociaux', desc: 'Évaluer les situations familiales complexes.' },
              { role: 'Éducateurs spécialisés', desc: 'Accompagner enfants et adolescents.' },
              { role: 'Psychiatres', desc: 'Repérer les antécédents familiaux.' },
              { role: 'Médiateurs familiaux', desc: 'Clarifier les positions de chacun.' },
            ].map((p) => (
              <div key={p.role} className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
                <div className="size-2 rounded-full bg-primary mt-2 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground text-sm">{p.role}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

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

          <h2 id="creer">Comment créer un génogramme en ligne ?</h2>
          <p>Avec <strong>Genogy</strong>, créer un génogramme en ligne se fait en 5 étapes :</p>

          <div className="not-prose my-8 space-y-3">
            {[
              ['Inscrivez-vous', 'Gratuitement, accès complet pendant la bêta.'],
              ['Ajoutez les membres', 'Avec leurs informations cliniques et biographiques.'],
              ['Définissez les unions', 'Enfants et relations de filiation.'],
              ['Enrichissez', 'Liens émotionnels, pathologies et notes cliniques.'],
              ['Exportez & partagez', 'PDF, PNG ou lien sécurisé.'],
            ].map(([title, desc], i) => (
              <div key={title} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-center size-9 shrink-0 rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {i + 1}
                </div>
                <div className="pt-1">
                  <p className="font-semibold text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA final */}
          <div className="not-prose mt-16 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-brand-orange/10 p-8 lg:p-10 text-center">
            <h3 className="text-2xl lg:text-3xl font-extrabold tracking-tight mb-3">
              Prêt à créer votre premier génogramme ?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Outil pensé par une psychologue clinicienne, gratuit pendant la bêta.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="brand" size="lg" onClick={() => openAuth('signup')} className="rounded-full px-8">
                Créer mon génogramme gratuitement
              </Button>
              <Link to="/comment-faire-un-genogramme">
                <Button variant="outline" size="lg" className="rounded-full px-8">
                  Guide pas à pas →
                </Button>
              </Link>
            </div>
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
