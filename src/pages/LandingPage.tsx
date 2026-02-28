import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import gogyIcon from '@/assets/genogy-icon.svg';
import heroEditor from '@/assets/hero-editor.png';
import heroDashboard from '@/assets/hero-dashboard.png';
import aboutIllustration from '@/assets/about-illustration.png';
import abstract160 from '@/assets/abstract-160.svg';
import abstract122 from '@/assets/abstract-122.svg';
import abstract206 from '@/assets/abstract-206.svg';
import abstract65 from '@/assets/abstract-65.svg';
import {
  Brain, Heart, GraduationCap, Stethoscope, Users, BookOpen,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '@/components/Footer';

/* ────────────────────────────────────────────── */
/*  Data                                          */
/* ────────────────────────────────────────────── */

const FEATURES = [
  {
    abstract: abstract160,
    title: 'Simple et intuitif',
    desc: "Créez un génogramme en quelques clics sans perdre de temps sur la mise en page.",
  },
  {
    abstract: abstract122,
    title: '100 % en ligne',
    desc: "Accessible depuis n'importe quel ordinateur ou tablette disposant d'une connexion internet, aucune installation requise.",
  },
  {
    abstract: abstract206,
    title: 'Fonctionnalités avancées',
    desc: "Ajoutez facilement des pathologies médicales, des liens familiaux et émotionnels, des notes cliniques.",
  },
  {
    abstract: abstract65,
    title: 'Conçu pour les pros',
    desc: "Collaborez avec vos collègues, partagez les fichiers en format PDF et gérez vos patients facilement.",
  },
];

const TARGET_AUDIENCE = [
  { icon: <Brain className="w-5 h-5" />, title: 'Psychologues cliniciens' },
  { icon: <Heart className="w-5 h-5" />, title: 'Thérapeutes familiaux' },
  { icon: <BookOpen className="w-5 h-5" />, title: 'Éducateurs spécialisés' },
  { icon: <Users className="w-5 h-5" />, title: 'Assistants sociaux' },
  { icon: <Stethoscope className="w-5 h-5" />, title: 'Professionnels de santé mentale' },
  { icon: <GraduationCap className="w-5 h-5" />, title: 'Étudiants en travail social ou psychologie' },
];

const FAQ_ITEMS = [
  {
    q: "Qu'est-ce qu'un génogramme ?",
    a: "Un génogramme est une représentation graphique de la structure familiale d'un individu, incluant les relations, conditions de santé et dynamiques émotionnelles.",
  },
  {
    q: "Puis-je utiliser l'outil sans m'abonner ?",
    a: "Oui. Une version gratuite est disponible, avec certaines limitations (nombre de fichiers, options d'export, collaboration...).",
  },
  {
    q: 'Mes données sont-elles sécurisées ?',
    a: "Oui. Toutes vos données sont chiffrées et stockées de manière sécurisée sur des serveurs européens conformes au RGPD.",
  },
  {
    q: "Puis-je collaborer avec d'autres professionnels ?",
    a: "Oui. Les plans Pro, Entreprise et Premium permettent l'ajout de membres à votre équipe.",
  },
];

/* ────────────────────────────────────────────── */
/*  Landing Page                                  */
/* ────────────────────────────────────────────── */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const ctaPath = user ? '/dashboard' : '/auth';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Genogy — Créez vos génogrammes professionnels en ligne</title>
        <meta name="description" content="Genogy est l'outil en ligne le plus simple pour créer des génogrammes professionnels. Cartographiez les relations familiales et émotionnelles de vos patients en quelques clics." />
        <link rel="canonical" href="https://genogy.app/" />
      </Helmet>

      {/* ═══════════ STICKY HEADER ═══════════ */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between h-16 px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={gogyIcon} alt="Genogy" className="w-8 h-8" />
            <span className="text-[15px] font-semibold tracking-tight">Genogy</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-5" onClick={() => navigate('/auth')}>
              Connexion
            </Button>
            <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 rounded-lg px-5" onClick={() => navigate('/auth')}>
              Inscription
            </Button>
          </div>
        </div>
      </header>

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left – copy */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Large logo */}
              <img src={gogyIcon} alt="" className="w-16 h-16 mb-8" />

              <h1 className="text-4xl lg:text-[44px] font-extrabold leading-[1.15] tracking-tight mb-6">
                Le meilleur outil en ligne pour{' '}
                <br className="hidden sm:block" />
                créer des{' '}
                <span className="text-primary">génogrammes</span>
                <br />
                professionnels
              </h1>

              <p className="text-muted-foreground leading-relaxed mb-2 max-w-lg">
                Cartographiez les relations familiales et émotionnelles
                <br className="hidden sm:block" />
                de vos patients ou clients.
              </p>
              <p className="text-foreground/70 text-sm leading-relaxed mb-10 max-w-lg">
                Conçu pour les psychologues, travailleurs sociaux, thérapeutes et
                <br className="hidden sm:block" />
                professionnels de l'accompagnement.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button variant="brand" size="lg" onClick={() => navigate(ctaPath)} className="gap-2 px-8 rounded-full">
                  Accéder à la version BETA
                </Button>
                <Button variant="outline" size="lg" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="border-primary text-primary bg-transparent hover:bg-primary/5 rounded-full px-8">
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
              {/* Two overlapping mockup cards */}
              <div className="relative">
                <div className="rounded-xl overflow-hidden border border-border shadow-lg bg-card rotate-[-2deg] translate-y-4 translate-x-4 absolute inset-0 opacity-60" >
                  <img
                    src={heroDashboard}
                    alt=""
                    className="w-full h-auto"
                    loading="eager"
                  />
                </div>
                <div className="rounded-xl overflow-hidden border border-border shadow-lg bg-card relative z-10">
                  <img
                    src={heroEditor}
                    alt="Aperçu de l'éditeur de génogrammes Genogy"
                    className="w-full h-auto"
                    loading="eager"
                  />
                </div>
              </div>
              {/* Decorative glow */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 max-w-xl">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              Pourquoi utiliser notre outil ?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              L'outil le plus simple et le plus complet pour créer et gérer vos génogrammes cliniques.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <img src={f.abstract} alt="" className="w-14 h-14 mb-5" />
                <h3 className="text-[15px] font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ ABOUT ═══════════ */}
      <section className="py-20 lg:py-28 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left – illustration */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="dot-grid rounded-xl border border-border p-8 flex items-center justify-center"
            >
              <img src={aboutIllustration} alt="Symboles et liens émotionnels d'un génogramme" className="w-full h-auto max-w-md" />
            </motion.div>

            {/* Right – copy */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">
                À propos de Genogy
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed text-[15px]">
                <p>
                  Genogy est un outil numérique conçu pour accompagner les professionnel·les de la relation d'aide dans la création de génogrammes.
                </p>
                <p>
                  Il s'adresse aux psychologues, éducateurs spécialisés, thérapeutes, assistants sociaux, ou tout professionnel intervenant dans un cadre clinique, médico-social ou institutionnel.
                </p>
                <p>
                  Un génogramme, c'est bien plus qu'un arbre généalogique : c'est une carte vivante des liens familiaux, affectifs, pathologiques et intergénérationnels. Il permet de mieux comprendre les contextes de vie, de repérer les transmissions (positives ou problématiques). Genogy facilite la création de génogrammes lisibles, modulables et partageables.
                </p>
                <p>
                  Pensé pour être simple d'utilisation tout en restant rigoureux, l'outil permet d'ajouter des membres, des relations (y compris émotionnelles), des pathologies, des événements marquants, et de personnaliser chaque cas.
                </p>
                <p>
                  Il permet aussi de sauvegarder plusieurs dossiers, de les modifier au fil du temps, et d'exporter les rendus.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ TARGET AUDIENCE ═══════════ */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-muted-foreground text-sm mb-2">Pour les professionnels</p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              À qui s'adresse cet outil ?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {TARGET_AUDIENCE.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border hover:shadow-card transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {c.icon}
                </div>
                <span className="font-medium text-sm text-foreground">{c.title}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section id="faq" className="py-20 lg:py-28 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 max-w-xl">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">FAQ</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les réponses aux questions les plus fréquentes sur Genogy et les génogrammes.
            </p>
          </div>

          <div className="divide-y divide-border">
            {FAQ_ITEMS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="grid lg:grid-cols-2 gap-4 lg:gap-16 py-8 first:pt-0 last:pb-0"
              >
                <h3 className="font-semibold text-foreground text-[15px] lg:text-base">{item.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </motion.div>
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
