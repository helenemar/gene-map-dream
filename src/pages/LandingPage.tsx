import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import gogyIcon from '@/assets/genogy-icon.svg';
import heroMockup from '@/assets/hero-mockup.png';
import abstract160 from '@/assets/abstract-160.svg';
import abstract122 from '@/assets/abstract-122.svg';
import abstract206 from '@/assets/abstract-206.svg';
import abstract65 from '@/assets/abstract-65.svg';
import {
  MousePointerClick, Globe, Layers, Brain, Heart, GraduationCap, Stethoscope,
  ChevronDown, ArrowRight, Atom,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '@/components/Footer';

/* ────────────────────────────────────────────── */
/*  FAQ data                                      */
/* ────────────────────────────────────────────── */
const FAQ_ITEMS = [
  {
    q: "Puis-je utiliser l'outil sans créer de compte ?",
    a: "Non, un compte gratuit est nécessaire pour sauvegarder vos génogrammes de manière sécurisée dans le cloud.",
  },
  {
    q: 'Mes données sont-elles sécurisées ?',
    a: "Oui. Toutes vos données sont chiffrées et stockées de manière sécurisée. Seul vous avez accès à vos génogrammes grâce à des politiques d'accès strictes.",
  },
  {
    q: "L'outil est-il gratuit ?",
    a: "Genogy est actuellement en version Beta et entièrement gratuit. Profitez de toutes les fonctionnalités sans frais pendant cette période.",
  },
  {
    q: 'Puis-je exporter mes génogrammes ?',
    a: "Oui, vous pouvez exporter vos génogrammes en PDF haute résolution pour les intégrer à vos dossiers cliniques.",
  },
  {
    q: "Puis-je collaborer avec d'autres professionnels ?",
    a: "La fonctionnalité collaborative est en cours de développement et sera disponible prochainement.",
  },
];

/* ────────────────────────────────────────────── */
/*  Accordion item                                */
/* ────────────────────────────────────────────── */
const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left text-[15px] font-medium text-foreground hover:text-primary transition-colors"
      >
        {q}
        <ChevronDown className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-40 pb-5' : 'max-h-0'}`}>
        <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────── */
/*  Landing Page                                  */
/* ────────────────────────────────────────────── */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const ctaPath = user ? '/dashboard' : '/auth';

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ═══════════ STICKY HEADER ═══════════ */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={gogyIcon} alt="Genogy" className="w-8 h-8" />
            <span className="text-[15px] font-semibold tracking-tight">Genogy</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="beta" size="sm" className="h-8 px-3 text-[11px] font-bold gap-1.5">
              <Atom className="w-3 h-3" />
              BETA
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
              Connexion
            </Button>
            <Button size="sm" onClick={() => navigate('/auth')}>
              S'inscrire
            </Button>
          </div>
        </div>
      </header>

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left – copy */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl lg:text-[52px] font-extrabold leading-[1.1] tracking-tight mb-6">
                Le meilleur outil en ligne pour créer des{' '}
                <span className="text-primary">génogrammes professionnels</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                Cartographiez les relations familiales et émotionnelles de vos patients ou clients en quelques clics. Conçu par et pour les professionnels de santé.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" onClick={() => navigate(ctaPath)} className="gap-2">
                  Démarrer votre premier génogramme
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                  Découvrir l'outil
                </Button>
              </div>
            </motion.div>

            {/* Right – mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="rounded-xl overflow-hidden border border-border shadow-lg bg-card">
                <img
                  src={heroMockup}
                  alt="Aperçu de l'éditeur de génogrammes Genogy"
                  className="w-full h-auto"
                  loading="eager"
                />
              </div>
              {/* Decorative glow */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section id="features" className="py-20 lg:py-28 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              Pourquoi utiliser notre outil ?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              L'outil le plus simple et le plus complet pour créer et gérer vos génogrammes cliniques.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <MousePointerClick className="w-6 h-6" />,
                abstract: abstract160,
                title: 'Simple et intuitif',
                desc: "Interface pensée pour la fluidité clinique. Glissez, reliez et annotez en quelques clics, sans formation technique.",
              },
              {
                icon: <Globe className="w-6 h-6" />,
                abstract: abstract122,
                title: '100% en ligne',
                desc: "Accédez à vos dossiers partout, en toute sécurité. Vos génogrammes sont synchronisés dans le cloud en temps réel.",
              },
              {
                icon: <Layers className="w-6 h-6" />,
                abstract: abstract206,
                title: 'Fonctionnalités avancées',
                desc: "Liens émotionnels complexes, pathologies détaillées, export PDF haute résolution et bien plus encore.",
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex flex-col items-center text-center p-8 rounded-xl bg-background border border-border hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 rounded-xl bg-primary/5 flex items-center justify-center mb-5">
                  <img src={f.abstract} alt="" className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ ABOUT ═══════════ */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                À propos de Genogy
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Genogy est un outil collaboratif pensé pour les professionnels du soin psychique. Il permet de créer, modifier et partager des génogrammes cliniques en quelques minutes.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Notre mission : démocratiser l'accès aux outils systémiques grâce à une interface moderne, intuitive et accessible à tous les professionnels de la relation d'aide.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="dot-grid rounded-xl border border-border h-80 flex items-center justify-center"
            >
              <img src={abstract65} alt="" className="w-24 h-24 opacity-60" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ TARGET AUDIENCE ═══════════ */}
      <section className="py-20 lg:py-28 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              À qui s'adresse cet outil ?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Genogy est conçu pour tous les professionnels qui travaillent avec les dynamiques familiales et relationnelles.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Brain className="w-6 h-6" />, title: 'Psychologues cliniciens', desc: "Enrichissez vos bilans et suivis thérapeutiques avec des génogrammes détaillés." },
              { icon: <Heart className="w-6 h-6" />, title: 'Assistantes sociales', desc: "Cartographiez les structures familiales pour mieux accompagner vos bénéficiaires." },
              { icon: <Stethoscope className="w-6 h-6" />, title: 'Professionnels de santé mentale', desc: "Visualisez les transmissions intergénérationnelles et les schémas répétitifs." },
              { icon: <GraduationCap className="w-6 h-6" />, title: 'Étudiants en travail social', desc: "Apprenez la pratique du génogramme avec un outil moderne et accessible." },
            ].map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl bg-background border border-border hover:shadow-lg transition-shadow text-center"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  {c.icon}
                </div>
                <h3 className="font-semibold text-[15px] mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section id="faq" className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-center mb-12">FAQ</h2>
          <div className="bg-card border border-border rounded-xl p-6 lg:p-8">
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="py-20 lg:py-28 bg-foreground text-background">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            Prêt à créer votre premier génogramme ?
          </h2>
          <p className="text-background/60 mb-8 max-w-lg mx-auto">
            Rejoignez les professionnels qui utilisent déjà Genogy pour cartographier les relations familiales de leurs patients.
          </p>
          <Button
            size="xl"
            onClick={() => navigate(ctaPath)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            Commencer gratuitement
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <Footer />
    </div>
  );
};

export default LandingPage;
