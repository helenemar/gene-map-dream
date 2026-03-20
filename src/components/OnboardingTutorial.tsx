import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Move, ZoomIn, MousePointer2, Link, RotateCcw } from 'lucide-react';

interface OnboardingStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  shortcut?: string;
}

const STEPS: OnboardingStep[] = [
  {
    icon: <Move className="w-6 h-6" />,
    title: 'Se déplacer',
    description: 'Faites glisser avec deux doigts sur le trackpad, ou maintenez Espace + clic gauche pour naviguer sur le canevas.',
    shortcut: 'Espace + Glisser',
  },
  {
    icon: <ZoomIn className="w-6 h-6" />,
    title: 'Zoomer / Dézoomer',
    description: 'Pincez avec deux doigts sur le trackpad, ou utilisez les boutons +/− en bas de l\'écran.',
    shortcut: 'Pincer / Ctrl + Molette',
  },
  {
    icon: <MousePointer2 className="w-6 h-6" />,
    title: 'Déplacer un membre',
    description: 'Cliquez et faites glisser une carte pour la repositionner. Les guides intelligents vous aident à aligner les membres.',
  },
  {
    icon: <Link className="w-6 h-6" />,
    title: 'Créer un lien',
    description: 'Survolez une carte et glissez depuis un point d\'ancrage (●) vers un autre membre pour créer un lien émotionnel.',
  },
  {
    icon: <RotateCcw className="w-6 h-6" />,
    title: 'Annuler / Rétablir',
    description: 'Utilisez Ctrl+Z pour annuler et Ctrl+Shift+Z pour rétablir vos actions.',
    shortcut: 'Ctrl+Z / Ctrl+Shift+Z',
  },
];

interface OnboardingTutorialProps {
  active: boolean;
  step: number;
  onNext: () => void;
  onPrev: () => void;
  onFinish: () => void;
}

/** Welcome modal (step 0 is a special intro) then step-by-step tips */
const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  active, step, onNext, onPrev, onFinish,
}) => {
  if (!active) return null;

  const isIntro = step === 0;
  const tipIndex = step - 1;
  const isLastStep = step === STEPS.length;
  const currentTip = STEPS[tipIndex];

  return (
    <AnimatePresence>
      {active && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={onFinish}
          />

          {/* Card */}
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed z-[101] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] max-w-[90vw]"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Close button */}
              <button
                onClick={onFinish}
                className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {isIntro ? (
                /* ── Welcome screen ── */
                <div className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MousePointer2 className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground mb-2">
                    Bienvenue dans l'éditeur
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    Découvrez les contrôles essentiels pour naviguer et construire votre génogramme.
                  </p>
                  <button
                    onClick={onNext}
                    className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    C'est parti
                  </button>
                  <button
                    onClick={onFinish}
                    className="w-full mt-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Passer le tutoriel
                  </button>
                </div>
              ) : (
                /* ── Step detail ── */
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                      {currentTip.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-foreground mb-1">
                        {currentTip.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {currentTip.description}
                      </p>
                      {currentTip.shortcut && (
                        <div className="mt-2">
                          <span className="inline-block text-xs font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                            {currentTip.shortcut}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress dots */}
                  <div className="flex items-center justify-center gap-1.5 mb-4">
                    {STEPS.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-200 ${
                          i === tipIndex
                            ? 'w-5 bg-primary'
                            : i < tipIndex
                              ? 'w-1.5 bg-primary/40'
                              : 'w-1.5 bg-border'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={onPrev}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Précédent
                    </button>

                    <span className="text-xs text-muted-foreground tabular-nums">
                      {tipIndex + 1} / {STEPS.length}
                    </span>

                    {isLastStep ? (
                      <button
                        onClick={onFinish}
                        className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        Terminer
                      </button>
                    ) : (
                      <button
                        onClick={onNext}
                        className="flex items-center gap-1 text-sm text-primary font-medium hover:text-primary/80 transition-colors"
                      >
                        Suivant
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OnboardingTutorial;
