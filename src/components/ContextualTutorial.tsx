import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MousePointer, UserPlus, Link2 } from 'lucide-react';
import { FamilyMember } from '@/types/genogram';
import type { ContextualTutoStep } from '@/hooks/useContextualTutorial';

interface TipConfig {
  icon: React.ReactNode;
  title: string;
  description: string;
  padding: number;
}

const TIPS: Record<Exclude<ContextualTutoStep, null>, TipConfig> = {
  'card-intro': {
    icon: <MousePointer className="w-5 h-5" />,
    title: 'Votre premier membre',
    description: 'Cliquez sur la carte pour la sélectionner et découvrir les actions disponibles.',
    padding: 14,
  },
  'card-selected': {
    icon: <UserPlus className="w-5 h-5" />,
    title: 'Actions disponibles',
    description: 'Utilisez ✏️ pour modifier les informations ou ➕ pour ajouter un parent, enfant ou conjoint.',
    padding: 14,
  },
  'anchor-hint': {
    icon: <Link2 className="w-5 h-5" />,
    title: 'Liens émotionnels',
    description: 'Cliquez sur 🔗 pour activer les points d\'ancrage, puis glissez vers un autre membre pour créer un lien.',
    padding: 24,
  },
};

interface ContextualTutorialProps {
  currentStep: ContextualTutoStep;
  firstMember: FamilyMember | null;
  onFinish: () => void;
}

const ContextualTutorial: React.FC<ContextualTutorialProps> = ({
  currentStep, firstMember, onFinish,
}) => {
  const [spotlight, setSpotlight] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const rafRef = useRef(0);

  const tip = currentStep ? TIPS[currentStep] : null;

  // Track DOM element position
  useEffect(() => {
    if (!currentStep || !firstMember) { setSpotlight(null); return; }

    const padding = tip?.padding ?? 14;

    const update = () => {
      const el = document.querySelector(`[data-member-card="${firstMember.id}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        setSpotlight({
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        });
      } else {
        setSpotlight(null);
      }
      rafRef.current = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(rafRef.current);
  }, [currentStep, firstMember, tip]);

  // Tooltip position
  const cardStyle = useMemo((): React.CSSProperties => {
    if (!spotlight) {
      return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
    }
    const rightSpace = window.innerWidth - (spotlight.left + spotlight.width);
    if (rightSpace > 370) {
      return {
        left: spotlight.left + spotlight.width + 16,
        top: Math.max(16, spotlight.top),
        transform: 'none',
      };
    }
    return {
      left: Math.max(16, spotlight.left),
      top: spotlight.top + spotlight.height + 16,
      transform: 'none',
    };
  }, [spotlight]);

  if (!currentStep || !tip) return null;

  return (
    <AnimatePresence mode="wait">
      <React.Fragment key={currentStep}>
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
                    rx={16}
                    fill="black"
                  />
                )}
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask="url(#ctx-tuto-mask)" />
          </svg>

          {/* Tutorial-specific highlight — dashed animated border, distinct from selection */}
          {spotlight && (
            <motion.div
              key={`ring-${currentStep}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute pointer-events-none"
              style={{
                top: spotlight.top,
                left: spotlight.left,
                width: spotlight.width,
                height: spotlight.height,
                borderRadius: 18,
              }}
            >
              {/* Dashed border — visually distinct from purple selection ring */}
              <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
                <rect
                  x={1} y={1}
                  width={spotlight.width - 2}
                  height={spotlight.height - 2}
                  rx={17}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  strokeDasharray="8 6"
                  strokeLinecap="round"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0" to="-28"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </rect>
              </svg>
              {/* Soft glow */}
              <motion.div
                animate={{ opacity: [0.3, 0.12, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -inset-1 rounded-[20px]"
                style={{ boxShadow: '0 0 28px 8px hsl(var(--primary) / 0.2)' }}
              />
            </motion.div>
          )}
        </motion.div>

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 8 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="fixed z-[101] w-[320px] max-w-[90vw] pointer-events-auto"
          style={cardStyle}
          onClick={e => e.stopPropagation()}
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            <button
              onClick={onFinish}
              className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-5">
              <div className="flex items-start gap-3">
                <motion.div
                  key={`icon-${currentStep}`}
                  initial={{ scale: 0.6, opacity: 0, rotate: -20 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                  className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary"
                >
                  {tip.icon}
                </motion.div>
                <div className="flex-1 min-w-0 pr-6">
                  <motion.h3
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm font-semibold text-foreground mb-1"
                  >
                    {tip.title}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 }}
                    className="text-[13px] text-muted-foreground leading-relaxed"
                  >
                    {tip.description}
                  </motion.p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </React.Fragment>
    </AnimatePresence>
  );
};

export default ContextualTutorial;
