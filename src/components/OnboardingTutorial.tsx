import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Move, ZoomIn, MousePointer2, Link, RotateCcw, UserPlus, Pencil, Heart, Search } from 'lucide-react';
import STEP_ANIMATIONS, { LinkAnimation } from '@/components/OnboardingAnimations';
import { useLanguage } from '@/contexts/LanguageContext';

const STEP_ICONS = [
  <Move className="w-6 h-6" />,
  <ZoomIn className="w-6 h-6" />,
  <UserPlus className="w-6 h-6" />,
  <Pencil className="w-6 h-6" />,
  <MousePointer2 className="w-6 h-6" />,
  <Link className="w-6 h-6" />,
  <Heart className="w-6 h-6" />,
  <Search className="w-6 h-6" />,
  <RotateCcw className="w-6 h-6" />,
];

const SPOTLIGHT_SELECTORS = [
  '[data-onboarding="canvas"]',
  '[data-onboarding="zoom-controls"]',
  '[data-onboarding="canvas"]',
  '[data-onboarding="canvas"]',
  '[data-onboarding="canvas"]',
  '[data-onboarding="canvas"]',
  '[data-onboarding="canvas"]',
  '[data-onboarding="search-bar"]',
  '[data-onboarding="undo-redo"]',
];

const CARD_POSITIONS = [
  'bottom', 'top', 'bottom', 'bottom', 'bottom', 'bottom', 'bottom', 'bottom', 'bottom',
];

interface SpotlightRect {
  top: number; left: number; width: number; height: number;
}

/** Returns a DOMRect-like object for the target element */
function getSpotlightRect(selector?: string): SpotlightRect | null {
  if (!selector) return null;
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const pad = 8;
  return {
    top: r.top - pad,
    left: r.left - pad,
    width: r.width + pad * 2,
    height: r.height + pad * 2,
  };
}

/** Compute card position relative to spotlight */
function getCardStyle(): React.CSSProperties {
  return {
    right: 16,
    bottom: 16,
    left: 'auto',
    top: 'auto',
    transform: 'none',
  };
}

interface OnboardingTutorialProps {
  active: boolean;
  step: number;
  onNext: () => void;
  onPrev: () => void;
  onFinish: () => void;
  onDismiss: () => void;
}

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  active, step, onNext, onPrev, onFinish, onDismiss,
}) => {
  const { t } = useLanguage();
  const steps = t.onboarding.steps;
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const rafRef = useRef<number>(0);

  const isIntro = step === 0;
  const tipIndex = step - 1;
  const isLastStep = step === steps.length;
  const currentStep = steps[tipIndex];

  // Update spotlight rect on step changes & window resize
  useEffect(() => {
    if (!active || isIntro) { setSpotlight(null); return; }
    const selector = SPOTLIGHT_SELECTORS[tipIndex];

    const update = () => {
      setSpotlight(getSpotlightRect(selector));
      rafRef.current = requestAnimationFrame(update);
    };
    update();
    const timeout = setTimeout(() => cancelAnimationFrame(rafRef.current), 600);

    const onResize = () => setSpotlight(getSpotlightRect(selector));
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timeout);
      window.removeEventListener('resize', onResize);
    };
  }, [active, step, isIntro, tipIndex]);

  if (!active) return null;

  const cardStyle = getCardStyle();

  return (
    <AnimatePresence mode="wait">
      {active && (
        <>
          {/* ── SVG spotlight overlay ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`fixed inset-0 z-[100] ${isIntro ? 'pointer-events-auto' : 'pointer-events-none'}`}
          >
            <svg className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <mask id="onboarding-mask">
                  <rect width="100%" height="100%" fill="white" />
                  {spotlight && (
                    <motion.rect
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      x={spotlight.left}
                      y={spotlight.top}
                      width={spotlight.width}
                      height={spotlight.height}
                      rx={12}
                      fill="black"
                    />
                  )}
                </mask>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="rgba(0,0,0,0.6)"
                mask="url(#onboarding-mask)"
              />
            </svg>

            {/* Spotlight ring pulse */}
            {spotlight && (
              <motion.div
                key={`ring-${step}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute pointer-events-none"
                style={{
                  top: spotlight.top - 3,
                  left: spotlight.left - 3,
                  width: spotlight.width + 6,
                  height: spotlight.height + 6,
                  borderRadius: 14,
                  border: '2px solid hsl(var(--primary) / 0.5)',
                  boxShadow: '0 0 20px 4px hsl(var(--primary) / 0.15)',
                }}
              >
                {/* Breathing pulse ring */}
                <motion.div
                  animate={{ scale: [1, 1.04, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-[14px] border-2 border-primary/30"
                />
              </motion.div>
            )}
          </motion.div>

          {/* ── Tooltip card ── */}
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.92, y: isIntro ? 10 : 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed z-[101] w-[360px] max-w-[90vw] max-h-[calc(100vh-2rem)] pointer-events-auto"
            style={cardStyle}
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-full overflow-y-auto">
              {/* Close */}
              <button
                onClick={onFinish}
                className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {isIntro ? (
                <div className="p-6 text-center">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                    className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"
                  >
                    <MousePointer2 className="w-7 h-7 text-primary" />
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-lg font-semibold text-foreground mb-2"
                  >
                    {t.onboarding.welcomeTitle}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="text-sm text-muted-foreground mb-6 leading-relaxed"
                  >
                    {t.onboarding.welcomeDesc}
                  </motion.p>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
                    <button
                      onClick={onNext}
                      className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      {t.onboarding.letsGo}
                    </button>
                    <button
                      onClick={onFinish}
                      className="w-full mt-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t.onboarding.skipTutorial}
                    </button>
                    <button
                      onClick={onDismiss}
                      className="w-full mt-1 py-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                    >
                      {t.onboarding.neverShow}
                    </button>
                  </motion.div>
                </div>
              ) : (
                <div className="p-5">
                  <div className="flex items-start gap-3.5 mb-4">
                    <motion.div
                      key={`icon-${step}`}
                      initial={{ scale: 0.6, opacity: 0, rotate: -20 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                      className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary"
                    >
                      {STEP_ICONS[tipIndex]}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <motion.h3
                        key={`title-${step}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 }}
                        className="text-sm font-semibold text-foreground mb-1"
                      >
                        {currentStep?.title}
                      </motion.h3>
                      <motion.p
                        key={`desc-${step}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-[13px] text-muted-foreground leading-relaxed whitespace-pre-line"
                      >
                        {currentStep?.description}
                      </motion.p>
                      {currentStep?.shortcut && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="mt-2"
                        >
                          <span className="inline-block text-xs font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                            {currentStep.shortcut}
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Animated illustration */}
                  <motion.div
                    key={`anim-${step}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.3 }}
                    className="mb-4"
                  >
                    {(() => {
                      // Special case: LinkAnimation (step 5) needs translated labels
                      if (tipIndex === 5) {
                        return <LinkAnimation labels={{ select: t.onboarding.linkAnimSelect, drag: t.onboarding.linkAnimDrag, choose: t.onboarding.linkAnimChoose }} />;
                      }
                      const Anim = STEP_ANIMATIONS[tipIndex];
                      return Anim ? <Anim /> : null;
                    })()}
                  </motion.div>

                  {/* Progress dots */}
                  <div className="flex items-center justify-center gap-1.5 mb-3.5">
                    {steps.map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          width: i === tipIndex ? 20 : 6,
                          backgroundColor: i === tipIndex
                            ? 'hsl(var(--primary))'
                            : i < tipIndex
                              ? 'hsl(var(--primary) / 0.4)'
                              : 'hsl(var(--border))',
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="h-1.5 rounded-full"
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
                      {t.onboarding.previous}
                    </button>

                    <span className="text-xs text-muted-foreground tabular-nums">
                      {tipIndex + 1} / {steps.length}
                    </span>

                    {isLastStep ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={onDismiss}
                          className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {t.onboarding.neverShow}
                        </button>
                        <button
                          onClick={onFinish}
                          className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                          {t.onboarding.finish}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={onNext}
                        className="flex items-center gap-1 text-sm text-primary font-medium hover:text-primary/80 transition-colors"
                      >
                        {t.onboarding.next}
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
