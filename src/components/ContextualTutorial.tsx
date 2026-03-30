import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, MousePointer2, UserPlus, Link2, Pencil } from 'lucide-react';
import { FamilyMember } from '@/types/genogram';

const CARD_W = 220;
const CARD_H = 64;

interface StepConfig {
  icon: React.ReactNode;
  title: string;
  description: string;
  getRect: (member: FamilyMember, zoom: number, pan: { x: number; y: number }, canvasRect: DOMRect) => DOMRect | null;
}

function worldToScreen(wx: number, wy: number, ww: number, wh: number, zoom: number, pan: { x: number; y: number }, canvasRect: DOMRect): DOMRect {
  const sx = wx * zoom + pan.x + canvasRect.left;
  const sy = wy * zoom + pan.y + canvasRect.top;
  return new DOMRect(sx, sy, ww * zoom, wh * zoom);
}

const STEPS: StepConfig[] = [
  {
    icon: <Pencil className="w-5 h-5" />,
    title: 'Votre premier membre',
    description: 'Voici votre carte membre ! Double-cliquez dessus pour modifier ses informations (prénom, nom, date de naissance…).',
    getRect: (m, z, p, cr) => worldToScreen(m.x - 8, m.y - 8, CARD_W + 16, CARD_H + 16, z, p, cr),
  },
  {
    icon: <UserPlus className="w-5 h-5" />,
    title: 'Créer un proche',
    description: 'Sélectionnez le membre puis cliquez sur le bouton ➕ sous la carte pour ajouter un parent, enfant ou conjoint.',
    getRect: (m, z, p, cr) => worldToScreen(m.x - 8, m.y - 8, CARD_W + 16, CARD_H + 70, z, p, cr),
  },
  {
    icon: <Link2 className="w-5 h-5" />,
    title: 'Créer un lien émotionnel',
    description: 'Passez en mode ancrage (🔗) puis glissez depuis un point d\'ancrage de la carte vers un autre membre. Un menu de types de liens apparaîtra.',
    getRect: (m, z, p, cr) => {
      // Highlight the card with extra margin to show anchor dots
      return worldToScreen(m.x - 20, m.y - 20, CARD_W + 40, CARD_H + 40, z, p, cr);
    },
  },
  {
    icon: <MousePointer2 className="w-5 h-5" />,
    title: 'Naviguer sur le canevas',
    description: 'Maintenez Espace + clic pour déplacer le canevas. Utilisez Ctrl + molette pour zoomer. Glissez les cartes pour les repositionner.',
    getRect: () => null, // No spotlight — general tip
  },
];

interface ContextualTutorialProps {
  active: boolean;
  step: number;
  totalSteps: number;
  firstMember: FamilyMember | null;
  zoom: number;
  pan: { x: number; y: number };
  canvasRef: React.RefObject<HTMLDivElement>;
  onNext: () => void;
  onPrev: () => void;
  onFinish: () => void;
}

const ContextualTutorial: React.FC<ContextualTutorialProps> = ({
  active, step, totalSteps, firstMember, zoom, pan, canvasRef, onNext, onPrev, onFinish,
}) => {
  const [spotlight, setSpotlight] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const rafRef = useRef(0);

  const isLastStep = step >= totalSteps - 1;
  const currentStep = STEPS[step];

  // Continuously update spotlight position
  useEffect(() => {
    if (!active || !firstMember) { setSpotlight(null); return; }

    const update = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const cr = canvas.getBoundingClientRect();
      const rect = currentStep?.getRect(firstMember, zoom, pan, cr);
      if (rect) {
        setSpotlight({ top: rect.y, left: rect.x, width: rect.width, height: rect.height });
      } else {
        setSpotlight(null);
      }
      rafRef.current = requestAnimationFrame(update);
    };
    update();

    return () => cancelAnimationFrame(rafRef.current);
  }, [active, step, firstMember, zoom, pan, canvasRef, currentStep]);

  // Position the tooltip card near the spotlight
  const cardStyle = useMemo((): React.CSSProperties => {
    if (!spotlight) {
      return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
    }
    // Position to the right of the spotlight if room, otherwise below
    const rightSpace = window.innerWidth - (spotlight.left + spotlight.width);
    if (rightSpace > 380) {
      return {
        left: spotlight.left + spotlight.width + 16,
        top: spotlight.top,
        transform: 'none',
      };
    }
    return {
      left: spotlight.left,
      top: spotlight.top + spotlight.height + 16,
      transform: 'none',
    };
  }, [spotlight]);

  return (
    <AnimatePresence mode="wait">
      {active && (
        <>
          {/* Overlay with spotlight cutout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] pointer-events-none"
          >
            <svg className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <mask id="ctx-tuto-mask">
                  <rect width="100%" height="100%" fill="white" />
                  {spotlight && (
                    <motion.rect
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      x={spotlight.left}
                      y={spotlight.top}
                      width={spotlight.width}
                      height={spotlight.height}
                      rx={14}
                      fill="black"
                    />
                  )}
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask="url(#ctx-tuto-mask)" />
            </svg>

            {/* Pulsing ring around spotlight */}
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
                  borderRadius: 16,
                  border: '2px solid hsl(var(--primary) / 0.5)',
                  boxShadow: '0 0 24px 6px hsl(var(--primary) / 0.15)',
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.03, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-[16px] border-2 border-primary/30"
                />
              </motion.div>
            )}
          </motion.div>

          {/* Tooltip card */}
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed z-[101] w-[340px] max-w-[90vw] pointer-events-auto"
            style={cardStyle}
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Close */}
              <button
                onClick={onFinish}
                className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <motion.div
                    key={`icon-${step}`}
                    initial={{ scale: 0.6, opacity: 0, rotate: -20 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                    className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary"
                  >
                    {currentStep.icon}
                  </motion.div>
                  <div className="flex-1 min-w-0 pr-6">
                    <motion.h3
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-sm font-semibold text-foreground mb-1"
                    >
                      {currentStep.title}
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 }}
                      className="text-[13px] text-muted-foreground leading-relaxed"
                    >
                      {currentStep.description}
                    </motion.p>
                  </div>
                </div>

                {/* Progress dots */}
                <div className="flex items-center justify-center gap-1.5 mb-3">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        width: i === step ? 18 : 6,
                        backgroundColor: i === step
                          ? 'hsl(var(--primary))'
                          : i < step
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
                  {step > 0 ? (
                    <button
                      onClick={onPrev}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Précédent
                    </button>
                  ) : (
                    <span />
                  )}

                  <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                    {step + 1} / {totalSteps}
                  </span>

                  {isLastStep ? (
                    <button
                      onClick={onFinish}
                      className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      C'est compris !
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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ContextualTutorial;
