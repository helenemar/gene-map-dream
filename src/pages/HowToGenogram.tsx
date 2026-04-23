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

const stepIcons = [
  <UserPlus className="w-6 h-6" />,
  <MousePointerClick className="w-6 h-6" />,
  <Users className="w-6 h-6" />,
  <GitBranch className="w-6 h-6" />,
  <Heart className="w-6 h-6" />,
  <Stethoscope className="w-6 h-6" />,
  <FileDown className="w-6 h-6" />,
];

const HowToGenogram: React.FC = () => {
  const { t } = useLanguage();
  const h = t.howToGenogram;
  const [authModal, setAuthModal] = React.useState<{ open: boolean; view: 'login' | 'signup' }>({ open: false, view: 'login' });

  const openAuth = (view: 'login' | 'signup') => setAuthModal({ open: true, view });

  return (
    <div className="min-h-screen bg-page-bg text-foreground">
      <Helmet>
        <title>{h.metaTitle}</title>
        <meta name="description" content={h.metaDesc} />
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
          '@type': 'HowTo',
          name: h.heroTitle.replace('\n', ' '),
          description: h.heroDesc,
          totalTime: 'PT15M',
          tool: { '@type': 'HowToTool', name: 'Genogy' },
          step: h.steps.map((s, i) => ({
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
              <span className="text-primary text-sm font-semibold uppercase tracking-wider">{h.badge}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-[2.8rem] font-extrabold tracking-tight leading-[1.1] mb-5">
              {h.heroTitle.split('\n').map((line, i) => (
                <React.Fragment key={i}>{i > 0 && <br className="hidden sm:block" />}{line}</React.Fragment>
              ))}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8">
              {h.heroDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="brand" size="lg" onClick={() => openAuth('signup')} className="rounded-full px-8 gap-2">
                {h.ctaCreate} <ArrowRight className="w-4 h-4" />
              </Button>
              <Link to="/genogramme">
                <Button variant="outline" size="lg" className="rounded-full px-8 border-primary text-primary">
                  {h.ctaWhat}
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
                {h.whyTitle}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {h.whyDesc}
              </p>
              <div className="space-y-3">
                {h.whyItems.map((item, i) => (
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
                alt={h.whyImgAlt}
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
            {h.stepsTitle}
          </h2>
          <p className="text-muted-foreground text-center mb-14 max-w-xl mx-auto">
            {h.stepsSub}
          </p>

          <div className="space-y-10">
            {h.steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="relative"
              >
                {i < h.steps.length - 1 && (
                  <div className="absolute left-[23px] top-[56px] bottom-[-40px] w-px bg-gradient-to-b from-primary/20 to-transparent hidden sm:block" />
                )}
                <div className="flex gap-5">
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center relative">
                      {stepIcons[i]}
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold mb-2 text-foreground">
                      {h.stepLabel} {i + 1} : {step.title}
                    </h3>
                    <div className="text-[15px] text-muted-foreground leading-relaxed space-y-2">
                      <p>{step.content}</p>

                      {/* List items (step 3) */}
                      {step.listItems && (
                        <ul className="space-y-1.5 mt-3">
                          {step.listItems.map((item, j) => (
                            <li key={j} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Grid items (step 4) */}
                      {step.gridItems && (
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          {step.gridItems.map((u, j) => (
                            <div key={j} className="rounded-lg border border-border bg-card p-3">
                              <span className="text-sm font-semibold text-foreground">{u.label}</span>
                              <span className="text-xs text-muted-foreground block mt-0.5">{u.desc}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Emotional labels (step 5) */}
                      {i === 4 && (
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {h.emotionalLabels.map((rel, j) => (
                            <div key={j} className="flex items-center gap-2 text-sm">
                              <span className={`w-2.5 h-2.5 rounded-full ${rel.color} shrink-0`} />
                              {rel.label}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Pathology tags (step 6) */}
                      {i === 5 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {h.pathologyTags.map((p, j) => (
                            <span key={j} className="text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                              {p}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Export items (step 7) */}
                      {i === 6 && (
                        <div className="space-y-2 mt-3">
                          {h.exportItems.map((e, j) => (
                            <div key={j} className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                              <Share2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                              <div>
                                <span className="text-sm font-semibold text-foreground">{e.label}</span>
                                <span className="text-xs text-muted-foreground block">{e.desc}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
            <h2 className="text-2xl font-bold tracking-tight">{h.tipsTitle}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {h.tips.map((tip, i) => (
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
            {h.ctaEndTitle}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            {h.ctaEndDesc}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="brand" size="lg" onClick={() => openAuth('signup')} className="rounded-full px-8 gap-2">
              {h.ctaEndButton} <ArrowRight className="w-4 h-4" />
            </Button>
            <Link to="/genogramme">
              <Button variant="outline" size="lg" className="rounded-full px-8 border-primary text-primary">
                {h.ctaEndLink}
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
