import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/landing/LandingHeader';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import AuthModal from '@/components/AuthModal';
import heroComposition from '@/assets/hero-mockup-composition.png';
import { motion } from 'framer-motion';
import { UserPlus, GitBranch, Share2, Heart, Stethoscope, FileDown, MousePointerClick, Users, Lightbulb, CheckCircle2, ArrowRight, BookOpen } from 'lucide-react';

const HowToGenogram: React.FC = () => {
  const { t } = useLanguage();
  const [authModal, setAuthModal] = React.useState<{ open: boolean; view: 'login' | 'signup' }>({ open: false, view: 'login' });

  const openAuth = (view: 'login' | 'signup') => setAuthModal({ open: true, view });

  const steps = [
    {
      icon: <UserPlus className="w-6 h-6" />,
      title: 'Créer votre compte Genogy',
      content: (
        <>
          <p>Rendez-vous sur <strong>genogy.app</strong> et inscrivez-vous en quelques secondes avec votre email ou votre compte Google. L'accès est <strong>gratuit pendant la phase bêta</strong>.</p>
          <p>Depuis votre tableau de bord, cliquez sur <em>« Nouveau génogramme »</em> pour commencer.</p>
        </>
      ),
    },
    {
      icon: <MousePointerClick className="w-6 h-6" />,
      title: 'Identifier le patient index',
      content: (
        <>
          <p>Le <strong>patient index</strong> (ou personne index) est la personne au centre du génogramme, celle pour laquelle vous réalisez l'analyse clinique.</p>
          <p>Renseignez les informations de base : nom, prénom, date de naissance, profession. Ces informations s'affichent directement sur la carte du membre.</p>
        </>
      ),
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Ajouter les membres de la famille',
      content: (
        <>
          <p>Un génogramme couvre généralement <strong>au moins trois générations</strong>. Ajoutez progressivement :</p>
          <ul className="space-y-1.5 mt-3">
            {['Les parents du patient index', 'Les grands-parents maternels et paternels', 'La fratrie (frères et sœurs)', 'Le/la conjoint(e) et les enfants', 'Les oncles, tantes, cousins si pertinent'].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      icon: <GitBranch className="w-6 h-6" />,
      title: 'Définir les unions et filiations',
      content: (
        <>
          <p>Reliez les membres entre eux avec les différents types d'unions :</p>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {[
              { label: 'Mariage', desc: 'Ligne horizontale pleine' },
              { label: 'Concubinage', desc: 'Ligne horizontale pointillée' },
              { label: 'Séparation', desc: 'Une barre oblique' },
              { label: 'Divorce', desc: 'Deux barres obliques' },
            ].map((u, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-3">
                <span className="text-sm font-semibold text-foreground">{u.label}</span>
                <span className="text-xs text-muted-foreground block mt-0.5">{u.desc}</span>
              </div>
            ))}
          </div>
          <p className="mt-3">Les enfants sont reliés aux unions par des lignes verticales descendantes. Genogy gère automatiquement le positionnement des générations.</p>
        </>
      ),
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Ajouter les relations émotionnelles',
      content: (
        <>
          <p>C'est ce qui distingue le génogramme de l'arbre généalogique. Dans Genogy, <strong>glissez d'un membre à un autre</strong> pour créer un lien émotionnel :</p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {[
              { label: 'Fusionnel', color: 'bg-emerald-500' },
              { label: 'Conflictuel', color: 'bg-red-500' },
              { label: 'Distant', color: 'bg-orange-500' },
              { label: 'Coupé / Rompu', color: 'bg-red-500' },
              { label: 'Ambivalent', color: 'bg-emerald-500' },
              { label: 'Violent', color: 'bg-red-500' },
              { label: 'Abus émotionnel', color: 'bg-blue-500' },
              { label: 'Abus sexuel', color: 'bg-purple-500' },
            ].map((rel, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className={`w-2.5 h-2.5 rounded-full ${rel.color} shrink-0`} />
                {rel.label}
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      icon: <Stethoscope className="w-6 h-6" />,
      title: 'Renseigner les pathologies',
      content: (
        <>
          <p>Ajoutez les <strong>pathologies médicales et psychologiques</strong> pour chaque membre concerné. Genogy les affiche avec un code couleur personnalisable :</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {['Cardiovasculaires', 'Cancers', 'Dépression', 'Addictions', 'Neurodégénératives', 'Troubles alimentaires'].map((p, i) => (
              <span key={i} className="text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                {p}
              </span>
            ))}
          </div>
          <p className="mt-3">Vous pouvez créer des <strong>pathologies personnalisées</strong> avec leur propre couleur pour adapter le génogramme à chaque cas clinique.</p>
        </>
      ),
    },
    {
      icon: <FileDown className="w-6 h-6" />,
      title: 'Exporter et partager votre génogramme',
      content: (
        <>
          <p>Une fois votre génogramme terminé :</p>
          <div className="space-y-2 mt-3">
            {[
              { label: 'Export PDF', desc: 'Idéal pour les comptes-rendus et les dossiers patients' },
              { label: 'Export PNG', desc: 'Pour intégrer dans une présentation ou un rapport' },
              { label: 'Lien de partage', desc: 'En lecture seule ou en mode édition collaborative' },
            ].map((e, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                <Share2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="text-sm font-semibold text-foreground">{e.label}</span>
                  <span className="text-xs text-muted-foreground block">{e.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      ),
    },
  ];

  const tips = [
    'Commencez toujours par 3 générations minimum',
    'Placez la génération la plus ancienne en haut',
    'Utilisez les symboles standardisés de McGoldrick',
    'Ajoutez des notes cliniques pour contextualiser',
    'Mettez à jour le génogramme au fil des séances',
    'Utilisez les couleurs pour distinguer les pathologies',
  ];

  return (
    <div className="min-h-screen bg-page-bg text-foreground">
      <Helmet>
        <title>Comment faire un génogramme en ligne ? Guide étape par étape | Genogy</title>
        <meta name="description" content="Apprenez comment faire un génogramme en ligne étape par étape avec Genogy. Guide complet pour psychologues et travailleurs sociaux : symboles, relations, pathologies." />
        <link rel="canonical" href="https://genogy.app/comment-faire-un-genogramme" />
        <meta property="og:title" content="Comment faire un génogramme en ligne ? Guide complet | Genogy" />
        <meta property="og:description" content="Guide étape par étape pour créer un génogramme professionnel en ligne avec Genogy. Symboles McGoldrick, relations émotionnelles et pathologies." />
        <meta property="og:url" content="https://genogy.app/comment-faire-un-genogramme" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'Comment faire un génogramme en ligne',
          description: 'Guide étape par étape pour créer un génogramme professionnel en ligne avec Genogy.',
          totalTime: 'PT15M',
          tool: { '@type': 'HowToTool', name: 'Genogy - Outil de génogramme en ligne' },
          step: steps.map((s, i) => ({
            '@type': 'HowToStep',
            position: i + 1,
            name: s.title,
          })),
        })}</script>
      </Helmet>

      <LandingHeader onAuth={openAuth} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute top-[-120px] left-[-80px] w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 py-16 lg:py-20 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="text-primary text-sm font-semibold uppercase tracking-wider">Guide pratique</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-[2.8rem] font-extrabold tracking-tight leading-[1.1] mb-5">
              Comment faire un génogramme<br className="hidden sm:block" /> en ligne ?
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8">
              Guide étape par étape pour créer votre premier génogramme professionnel avec Genogy. De l'inscription à l'export, tout ce qu'il faut savoir.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="brand" size="lg" onClick={() => openAuth('signup')} className="rounded-full px-8 gap-2">
                Créer mon génogramme <ArrowRight className="w-4 h-4" />
              </Button>
              <Link to="/genogramme">
                <Button variant="outline" size="lg" className="rounded-full px-8 border-primary text-primary">
                  Qu'est-ce qu'un génogramme ?
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why section */}
      <section className="py-16 lg:py-20 border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-5">
                Pourquoi utiliser un outil de génogramme en ligne ?
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Créer un génogramme à la main sur papier est fastidieux, difficile à modifier et impossible à partager facilement.
              </p>
              <div className="space-y-3">
                {[
                  'Créer et modifier en quelques clics',
                  'Sauvegarde automatique en temps réel',
                  'Export en PDF ou PNG',
                  'Partage sécurisé avec les collègues',
                  'Accessible depuis n\'importe quel appareil',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="rounded-2xl overflow-hidden border border-border shadow-lg"
            >
              <img
                src={heroComposition}
                alt="Interface de l'outil de génogramme en ligne Genogy"
                className="w-full h-auto"
                loading="lazy"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-center mb-4">
            7 étapes pour créer votre génogramme
          </h2>
          <p className="text-muted-foreground text-center mb-14 max-w-xl mx-auto">
            Suivez ce guide pas à pas pour réaliser un génogramme complet et professionnel.
          </p>

          <div className="space-y-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="relative"
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="absolute left-[23px] top-[56px] bottom-[-40px] w-px bg-gradient-to-b from-primary/20 to-transparent hidden sm:block" />
                )}
                <div className="flex gap-5">
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center relative">
                      {step.icon}
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold mb-2 text-foreground">
                      Étape {i + 1} : {step.title}
                    </h3>
                    <div className="text-[15px] text-muted-foreground leading-relaxed space-y-2">
                      {step.content}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="py-16 lg:py-20 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Conseils pour un bon génogramme</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tips.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-background border border-border"
              >
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-foreground font-medium">{tip}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-4">
            Prêt à créer votre génogramme ?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Rejoignez les professionnels qui utilisent Genogy pour cartographier les relations familiales et émotionnelles de leurs patients. Accès gratuit pendant la bêta.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="brand" size="lg" onClick={() => openAuth('signup')} className="rounded-full px-8 gap-2">
              Essayer Genogy gratuitement <ArrowRight className="w-4 h-4" />
            </Button>
            <Link to="/genogramme">
              <Button variant="outline" size="lg" className="rounded-full px-8 border-primary text-primary">
                ← Qu'est-ce qu'un génogramme ?
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <AuthModal
        open={authModal.open}
        onClose={() => setAuthModal({ ...authModal, open: false })}
        defaultView={authModal.view}
      />
    </div>
  );
};

export default HowToGenogram;
