import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, ShieldCheck, FileDown, Network, Sparkles } from 'lucide-react';
import LandingHeader from '@/components/landing/LandingHeader';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import genogyIcon from '@/assets/genogy-icon.webp';
import genogramOverview from '@/assets/screens/genogram-overview.png';

const PAGE_URL = 'https://www.genogy-app.com/a-propos';
const OG_IMAGE = 'https://www.genogy-app.com/og-image.png?v=genogy-3';

const AboutPage: React.FC = () => {
  const [authModal, setAuthModal] = React.useState<{ open: boolean; view: 'login' | 'signup' }>({ open: false, view: 'signup' });
  const openAuth = (view: 'login' | 'signup') => setAuthModal({ open: true, view });

  return (
    <div className="min-h-screen bg-page-bg text-foreground">
      <Helmet>
        <title>À propos de Genogy — Logiciel de génogrammes cliniques en ligne</title>
        <meta
          name="description"
          content="Genogy est un logiciel en ligne pour créer des génogrammes cliniques selon les standards McGoldrick. Pensé pour psychologues, thérapeutes et travailleurs sociaux. Export PDF, partage sécurisé."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="À propos de Genogy — Logiciel de génogrammes cliniques" />
        <meta property="og:description" content="Logiciel de création de génogrammes cliniques en ligne. Standards McGoldrick, liens émotionnels, export PDF, partage sécurisé." />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="À propos de Genogy" />
        <meta name="twitter:description" content="Le logiciel en ligne pour créer des génogrammes cliniques selon les standards McGoldrick." />
        <meta name="twitter:image" content={OG_IMAGE} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'À propos de Genogy',
          url: PAGE_URL,
          mainEntity: {
            '@type': 'SoftwareApplication',
            name: 'Genogy',
            applicationCategory: 'HealthApplication',
            operatingSystem: 'Web',
            description: "Logiciel en ligne pour créer des génogrammes cliniques selon les standards McGoldrick.",
            url: 'https://www.genogy-app.com/',
            image: 'https://www.genogy-app.com/icon-512.webp?v=genogy-3',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR', availability: 'https://schema.org/InStock' },
            featureList: [
              'Symboles McGoldrick standardisés',
              'Liens émotionnels (fusion, conflit, distance, rupture, violences…)',
              'Pathologies et événements transgénérationnels',
              'Export PDF, PNG et SVG',
              'Partage sécurisé par lien (lecture ou édition)',
            ],
          },
        })}</script>
      </Helmet>

      <LandingHeader onAuth={openAuth} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-brand-orange/5" />
        <div className="absolute inset-0 -z-10 [background-image:radial-gradient(hsl(var(--primary)/0.08)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="max-w-5xl mx-auto px-6 py-20 lg:py-28">
          <nav aria-label="Fil d'ariane" className="mb-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">À propos</span>
          </nav>
          <div className="flex items-center gap-3 mb-6">
            <img src={genogyIcon} alt="Logo Genogy" className="w-10 h-10" />
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              Logiciel clinique · en bêta
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.05]">
            Genogy est le <span className="text-primary">logiciel</span> pour créer vos <span className="text-primary">génogrammes cliniques</span> en ligne.
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-3xl">
            Pensé avec et pour les psychologues, thérapeutes familiaux et travailleurs sociaux, Genogy permet de cartographier en quelques minutes
            les liens familiaux, émotionnels et transgénérationnels de vos patients — selon les standards <strong className="text-foreground">McGoldrick</strong>.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="brand" size="lg" onClick={() => openAuth('signup')} className="rounded-full px-7">
              Commencer un génogramme
            </Button>
            <Link to="/comment-faire-un-genogramme">
              <Button variant="outline" size="lg" className="rounded-full px-7">
                Voir comment ça marche →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Value summary */}
      <section className="max-w-5xl mx-auto px-6 py-16 lg:py-20">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: <Network className="w-5 h-5" />,
              title: 'Cartographier vite et juste',
              desc: 'Membres, unions, filiations, liens émotionnels et pathologies — tout se construit visuellement, sans passer par un logiciel de dessin.',
            },
            {
              icon: <ShieldCheck className="w-5 h-5" />,
              title: 'Standards cliniques',
              desc: 'Symbologie McGoldrick respectée : carrés, ronds, croix de décès, double trait du proposant, événements périnataux, immigration…',
            },
            {
              icon: <FileDown className="w-5 h-5" />,
              title: 'Export PDF & partage',
              desc: 'Exportez chaque dossier en PDF haute qualité pour vos comptes-rendus, ou partagez par lien sécurisé en lecture ou édition.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">{item.icon}</div>
              <p className="font-semibold text-foreground mb-2">{item.title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Proof: visual */}
      <section className="max-w-5xl mx-auto px-6 pb-16 lg:pb-20">
        <figure className="rounded-2xl overflow-hidden border border-border shadow-2xl bg-card">
          <img
            src={genogramOverview}
            alt="Capture d'écran d'un génogramme clinique sur trois générations dans Genogy, avec liens familiaux, émotionnels et pathologies"
            className="w-full h-auto"
            loading="lazy"
          />
          <figcaption className="px-5 py-3 text-sm text-muted-foreground border-t border-border bg-card">
            Un génogramme clinique sur trois générations construit avec Genogy.
          </figcaption>
        </figure>
      </section>

      {/* Why it exists */}
      <section className="max-w-3xl mx-auto px-6 pb-16 lg:pb-20">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6">Pourquoi nous avons construit Genogy</h2>
        <div className="prose prose-lg max-w-none dark:prose-invert prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
          <p>
            Les cliniciens utilisent encore trop souvent du papier, des outils de dessin génériques ou des logiciels institutionnels lourds pour produire un génogramme.
            Le résultat est lent, peu lisible, difficile à mettre à jour entre les séances et impossible à partager proprement.
          </p>
          <p>
            Genogy a été conçu pour faire <strong>une seule chose, très bien</strong> : créer des génogrammes cliniques en ligne, avec la rigueur symbolique attendue
            par la pratique (McGoldrick), et la souplesse d&apos;un outil moderne — auto-layout, liens émotionnels, pathologies colorées,
            événements périnataux, marqueurs d&apos;immigration, double contour du proposant.
          </p>
          <p>
            Vos dossiers sont sauvegardés, modifiables au fil des séances, et exportables en PDF pour vos comptes-rendus.
            Le partage se fait par lien sécurisé — en lecture ou en édition — sans inviter par e-mail.
          </p>
        </div>
      </section>

      {/* Feature checklist as proof */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-8">Ce que Genogy fait, concrètement</h2>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
          {[
            'Symbologie McGoldrick (carrés, ronds, losange, croix de décès, double contour proposant)',
            'Filiation biologique et adoptive distinctes',
            'Liens émotionnels : fusion, conflit, distance, rupture, ambivalent, violences',
            'Pathologies catégorisées par couleur (16 catégories cliniques)',
            'Événements périnataux : grossesse, fausse couche, mortinaissance, ISG',
            'Marqueur d\u2019immigration avec double vague et notes contextuelles',
            'Multi-naissances : jumeaux, triplés, automatisés',
            'Auto-layout intelligent et navigation trackpad fluide',
            'Export PDF, PNG et SVG haute qualité',
            'Partage par lien sécurisé en lecture ou édition',
            'Notes cliniques au niveau du dossier (journal de séance)',
            'Mode présentation pour vos restitutions et supervisions',
          ].map((feature) => (
            <div key={feature} className="flex items-start gap-3 py-2">
              <div className="mt-1 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <p className="text-sm text-foreground leading-relaxed">{feature}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="border-t border-border bg-gradient-to-br from-primary/5 via-transparent to-brand-orange/5">
        <div className="max-w-4xl mx-auto px-6 py-16 lg:py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Prêt à créer votre premier génogramme avec Genogy ?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Gratuit pendant la bêta. Aucune installation, aucune carte bancaire.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="brand" size="lg" onClick={() => openAuth('signup')} className="rounded-full px-8">
              Commencer un génogramme
            </Button>
            <Link to="/genogramme">
              <Button variant="outline" size="lg" className="rounded-full px-8">
                Qu&apos;est-ce qu&apos;un génogramme ?
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <AuthModal
        open={authModal.open}
        onClose={() => setAuthModal((s) => ({ ...s, open: false }))}
        defaultView={authModal.view}
      />
    </div>
  );
};

export default AboutPage;
