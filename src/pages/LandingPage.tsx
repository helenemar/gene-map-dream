import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import gogyIcon from '@/assets/genogy-icon.svg';
import heroComposition from '@/assets/hero-mockup-composition.png';
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
  const [authModal, setAuthModal] = useState<{ open: boolean; view: 'login' | 'signup' }>({ open: false, view: 'login' });

  const openAuth = (view: 'login' | 'signup') => {
    if (user) { navigate('/dashboard'); return; }
    setAuthModal({ open: true, view });
  };

  return (
    <div className="min-h-screen bg-[#FFFFF5] text-foreground">
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
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-5" onClick={() => openAuth('login')}>
              Connexion
            </Button>
            <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 rounded-lg px-5" onClick={() => openAuth('signup')}>
              Inscription
            </Button>
          </div>
        </div>
      </header>

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-12 lg:px-24 pt-14 pb-20 lg:pt-16 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left – copy */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <img src={gogyIcon} alt="" className="w-[64px] h-[64px] mb-6" />

              <h1 className="text-[1.6rem] lg:text-[2rem] font-extrabold leading-[1.08] tracking-[-0.01em] mb-4 whitespace-nowrap">
                Le meilleur outil en ligne pour
                <br />
                créer des{' '}
                <span className="text-primary">génogrammes</span>
                <br />
                professionnels
              </h1>

              <p className="text-muted-foreground text-[14px] leading-[1.5] mb-1 max-w-[420px]">
                Cartographiez les relations familiales et émotionnelles
                <br className="hidden sm:block" />
                de vos patients ou clients.
              </p>
              <p className="text-foreground/50 text-[12.5px] leading-[1.5] mb-6 max-w-[420px]">
                Conçu pour les psychologues, travailleurs sociaux, thérapeutes et
                <br className="hidden sm:block" />
                professionnels de l'accompagnement.
              </p>

              <div className="flex items-center gap-4">
                <Button variant="brand" size="lg" onClick={() => openAuth('signup')} className="gap-2 px-8 rounded-full">
                  Accéder à la version BETA
                </Button>
                <Button variant="outline" size="lg" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="border-primary text-primary bg-transparent hover:bg-primary/5 rounded-full px-8">
                  Découvrir l'outil
                </Button>
              </div>
            </motion.div>

            {/* Right – Mockup Composition */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:block"
            >
              <img
                src={heroComposition}
                alt="Captures d'écran du Dashboard et de l'Éditeur de génogrammes Genogy"
                className="w-full h-auto"
                style={{
                  filter: 'drop-shadow(0 20px 40px hsl(var(--foreground) / 0.08)) drop-shadow(0 8px 16px hsl(var(--foreground) / 0.04))',
                }}
                loading="eager"
              />
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
            onClick={() => openAuth('signup')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            Commencer gratuitement
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <Footer />

      {/* ═══════════ AUTH MODAL ═══════════ */}
      <AuthModal
        open={authModal.open}
        onClose={() => setAuthModal({ ...authModal, open: false })}
        defaultView={authModal.view}
      />
    </div>
  );
};

export default LandingPage;
