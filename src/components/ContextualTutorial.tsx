import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pencil, CheckCircle, MousePointerClick, UserRound, Link2 } from 'lucide-react';
import { FamilyMember } from '@/types/genogram';
import type { ContextualTutoStep } from '@/hooks/useContextualTutorial';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface TipConfig {
  icon: React.ReactNode;
  title: string;
  description: string;
  padding: number;
}

const TIPS: Record<Exclude<ContextualTutoStep, null>, TipConfig> = {
  'card-intro': {
    icon: <MousePointerClick className="w-5 h-5" />,
    title: 'Sélectionnez le membre',
    description: 'Cliquez sur la carte pour la sélectionner.',
    padding: 14,
  },
  'card-selected': {
    icon: <Pencil className="w-5 h-5" />,
    title: 'Modifier les informations',
    description: 'Cliquez sur le bouton ✏️ pour ouvrir le panneau d\'édition.',
    padding: 14,
  },
  'edit-hint': {
    icon: <CheckCircle className="w-5 h-5" />,
    title: 'Panneau d\'édition',
    description: 'Complétez les informations ici : prénom, dates, pathologies… Fermez le panneau quand vous avez terminé.',
    padding: 14,
  },
  'parent-intro': {
    icon: <UserRound className="w-5 h-5" />,
    title: 'Passez au parent 1',
    description: 'Cliquez maintenant sur la carte du parent 1 pour le sélectionner.',
    padding: 14,
  },
  'parent-selected': {
    icon: <Pencil className="w-5 h-5" />,
    title: 'Modifier le parent 1',
    description: 'Cliquez sur l\'icône ✏️ pour modifier ses informations.',
    padding: 14,
  },
  'link-demo': {
    icon: <Link2 className="w-5 h-5" />,
    title: 'Créer un lien émotionnel',
    description: 'Cliquez sur un point d\'ancrage (●) d\'un membre, maintenez et glissez vers un autre membre pour créer un lien émotionnel.',
    padding: 24,
  },
};

interface ContextualTutorialProps {
  currentStep: ContextualTutoStep;
  firstMember: FamilyMember | null;
  fatherMember: FamilyMember | null;
  drawerOpen?: boolean;
  onFinish: () => void;
}

const ContextualTutorial: React.FC<ContextualTutorialProps> = ({
  currentStep, firstMember, fatherMember, drawerOpen = false, onFinish,
}) => {
  const [spotlight, setSpotlight] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [editBtnPos, setEditBtnPos] = useState<{ top: number; left: number } | null>(null);
  const [linkDragPositions, setLinkDragPositions] = useState<{ fromX: number; fromY: number; toX: number; toY: number } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const rafRef = useRef(0);

  const tip = currentStep ? TIPS[currentStep] : null;

  // Determine which member to target based on step
  const targetMember = (currentStep === 'parent-intro' || currentStep === 'parent-selected')
    ? fatherMember
    : firstMember;

  // Track DOM element position
  useEffect(() => {
    if (!currentStep) { setSpotlight(null); setEditBtnPos(null); setLinkDragPositions(null); return; }

    const padding = tip?.padding ?? 14;

    const update = () => {
      // For edit-hint step, highlight the drawer/sidesheet
      if (currentStep === 'edit-hint') {
        const drawer = document.querySelector('[data-member-edit-drawer]');
        if (drawer) {
          const rect = drawer.getBoundingClientRect();
          setSpotlight({
            top: rect.top - 4,
            left: rect.left - 4,
            width: rect.width + 8,
            height: rect.height + 8,
          });
        } else {
          setSpotlight(null);
        }
        setEditBtnPos(null);
        setLinkDragPositions(null);
      } else if (currentStep === 'link-demo') {
        // Highlight area encompassing both PI and father cards
        if (firstMember && fatherMember) {
          const piEl = document.querySelector(`[data-member-card="${firstMember.id}"]`);
          const fatherEl = document.querySelector(`[data-member-card="${fatherMember.id}"]`);
          if (piEl && fatherEl) {
            const piRect = piEl.getBoundingClientRect();
            const fatherRect = fatherEl.getBoundingClientRect();
            const minX = Math.min(piRect.left, fatherRect.left) - padding;
            const minY = Math.min(piRect.top, fatherRect.top) - padding;
            const maxX = Math.max(piRect.right, fatherRect.right) + padding;
            const maxY = Math.max(piRect.bottom, fatherRect.bottom) + padding;
            setSpotlight({ top: minY, left: minX, width: maxX - minX, height: maxY - minY });

            // Anchor positions: from PI right-side dot to father center
            setLinkDragPositions({
              fromX: piRect.right,
              fromY: piRect.top + piRect.height / 2,
              toX: fatherRect.left + fatherRect.width / 2,
              toY: fatherRect.top + fatherRect.height / 2,
            });
          } else {
            setSpotlight(null);
            setLinkDragPositions(null);
          }
        }
        setEditBtnPos(null);
      } else {
        if (!targetMember) { setSpotlight(null); setEditBtnPos(null); return; }
        const el = document.querySelector(`[data-member-card="${targetMember.id}"]`);
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

        // Track edit button position for card-selected or parent-selected step
        if (currentStep === 'card-selected' || currentStep === 'parent-selected') {
          const btn = document.querySelector(`[data-edit-button="${targetMember.id}"]`);
          if (btn) {
            const btnRect = btn.getBoundingClientRect();
            setEditBtnPos({ top: btnRect.top + btnRect.height / 2, left: btnRect.left + btnRect.width / 2 });
          } else {
            setEditBtnPos(null);
          }
        } else {
          setEditBtnPos(null);
        }
        setLinkDragPositions(null);
      }
      rafRef.current = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(rafRef.current);
  }, [currentStep, targetMember, firstMember, fatherMember, tip]);

  // Tooltip position
  const cardStyle = useMemo((): React.CSSProperties => {
    if (!spotlight) {
      return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
    }
    
    // For edit-hint, position tooltip to the left of the drawer
    if (currentStep === 'edit-hint') {
      return {
        right: spotlight.width + 32,
        top: Math.max(16, spotlight.top + 60),
        transform: 'none',
      };
    }

    // When the sidesheet is open, keep tooltip away from the right panel (~400px)
    const sheetWidth = drawerOpen ? 400 : 0;
    const availableWidth = window.innerWidth - sheetWidth;

    const rightSpace = window.innerWidth - (spotlight.left + spotlight.width);
    if (rightSpace - sheetWidth > 370) {
      return {
        left: spotlight.left + spotlight.width + 16,
        top: Math.max(16, spotlight.top),
        transform: 'none',
      };
    }
    // Place below the spotlight, but clamp horizontally to avoid overlapping the sidesheet
    return {
      left: Math.max(16, Math.min(spotlight.left, availableWidth - 340)),
      top: spotlight.top + spotlight.height + 16,
      transform: 'none',
    };
  }, [spotlight, currentStep, drawerOpen]);

  if (!currentStep || !tip) return null;

  return (
    <AnimatePresence mode="wait">
      <React.Fragment key={currentStep}>
        {/* Overlay with spotlight cutout — skip dark overlay during edit-hint to keep drawer interactive */}
        {/* Click-outside catchers (without blocking spotlight target) */}
        {currentStep !== 'edit-hint' && currentStep !== 'link-demo' && !drawerOpen && (
          spotlight ? (
            <>
              <button
                type="button"
                aria-label="Quitter le tutoriel"
                className="fixed z-[99] pointer-events-auto bg-transparent border-0 p-0 m-0 appearance-none"
                style={{ top: 0, left: 0, width: '100vw', height: Math.max(0, spotlight.top) }}
                onClick={() => setShowConfirm(true)}
              />
              <button
                type="button"
                aria-label="Quitter le tutoriel"
                className="fixed z-[99] pointer-events-auto bg-transparent border-0 p-0 m-0 appearance-none"
                style={{
                  top: spotlight.top + spotlight.height,
                  left: 0,
                  width: '100vw',
                  height: Math.max(0, window.innerHeight - (spotlight.top + spotlight.height)),
                }}
                onClick={() => setShowConfirm(true)}
              />
              <button
                type="button"
                aria-label="Quitter le tutoriel"
                className="fixed z-[99] pointer-events-auto bg-transparent border-0 p-0 m-0 appearance-none"
                style={{
                  top: spotlight.top,
                  left: 0,
                  width: Math.max(0, spotlight.left),
                  height: spotlight.height,
                }}
                onClick={() => setShowConfirm(true)}
              />
              <button
                type="button"
                aria-label="Quitter le tutoriel"
                className="fixed z-[99] pointer-events-auto bg-transparent border-0 p-0 m-0 appearance-none"
                style={{
                  top: spotlight.top,
                  left: spotlight.left + spotlight.width,
                  width: Math.max(0, window.innerWidth - (spotlight.left + spotlight.width)),
                  height: spotlight.height,
                }}
                onClick={() => setShowConfirm(true)}
              />
            </>
          ) : (
            <button
              type="button"
              aria-label="Quitter le tutoriel"
              className="fixed inset-0 z-[99] pointer-events-auto bg-transparent border-0 p-0 m-0 appearance-none"
              onClick={() => setShowConfirm(true)}
            />
          )
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] pointer-events-none"
        >
          {currentStep !== 'edit-hint' && currentStep !== 'link-demo' && (
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
          )}

          {/* Tutorial-specific highlight — dashed animated border */}
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
              <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
                <rect
                  x={1} y={1}
                  width={spotlight.width - 2}
                  height={spotlight.height - 2}
                  rx={17}
                  fill="none"
                  stroke="hsl(var(--primary) / 0.35)"
                  strokeWidth={1.5}
                  strokeDasharray="6 5"
                  strokeLinecap="round"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0" to="-22"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </rect>
              </svg>
              <motion.div
                animate={{ opacity: [0.15, 0.05, 0.15] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -inset-1 rounded-[20px]"
                style={{ boxShadow: '0 0 20px 6px hsl(var(--primary) / 0.1)' }}
              />
            </motion.div>
          )}

          {/* Animated pointing cursor for card-intro and parent-intro */}
          {spotlight && (currentStep === 'card-intro' || currentStep === 'parent-intro') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 20 }}
              className="absolute pointer-events-none z-[102]"
              style={{
                top: spotlight.top + spotlight.height - 24,
                left: spotlight.left + spotlight.width / 2 + 8,
              }}
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <MousePointerClick className="w-9 h-9 text-primary drop-shadow-lg" strokeWidth={2.2} />
              </motion.div>
            </motion.div>
          )}

          {/* Animated pointing cursor for card-selected / parent-selected → points at edit button */}
          {editBtnPos && (currentStep === 'card-selected' || currentStep === 'parent-selected') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
              className="absolute pointer-events-none z-[102]"
              style={{
                top: editBtnPos.top + 4,
                left: editBtnPos.left + 4,
              }}
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <MousePointerClick className="w-9 h-9 text-primary drop-shadow-lg" strokeWidth={2.2} />
              </motion.div>
            </motion.div>
          )}

          {/* Animated drag cursor for link-demo: shows drag from anchor to target */}
          {currentStep === 'link-demo' && linkDragPositions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute pointer-events-none z-[102]"
              style={{ top: 0, left: 0, width: '100%', height: '100%' }}
            >
              {/* Animated drag line */}
              <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
                {/* Static start dot (anchor point) */}
                <circle
                  cx={linkDragPositions.fromX}
                  cy={linkDragPositions.fromY}
                  r={6}
                  fill="hsl(var(--primary))"
                  className="animate-pulse"
                />
                {/* Animated drag path */}
                <motion.line
                  x1={linkDragPositions.fromX}
                  y1={linkDragPositions.fromY}
                  animate={{
                    x2: [linkDragPositions.fromX, linkDragPositions.toX, linkDragPositions.toX, linkDragPositions.fromX],
                    y2: [linkDragPositions.fromY, linkDragPositions.toY, linkDragPositions.toY, linkDragPositions.fromY],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', times: [0, 0.4, 0.7, 1] }}
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                />
                {/* Target snap ring */}
                <motion.circle
                  cx={linkDragPositions.toX}
                  cy={linkDragPositions.toY}
                  r={20}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  animate={{
                    opacity: [0, 0, 0.6, 0.6, 0],
                    scale: [0.5, 0.5, 1, 1, 0.5],
                  }}
                  transition={{ duration: 3, repeat: Infinity, times: [0, 0.3, 0.4, 0.7, 1] }}
                />
              </svg>
              {/* Moving cursor */}
              <motion.div
                className="absolute"
                animate={{
                  left: [linkDragPositions.fromX, linkDragPositions.toX, linkDragPositions.toX, linkDragPositions.fromX],
                  top: [linkDragPositions.fromY, linkDragPositions.toY, linkDragPositions.toY, linkDragPositions.fromY],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', times: [0, 0.4, 0.7, 1] }}
                style={{ marginLeft: 4, marginTop: 4 }}
              >
                <MousePointerClick className="w-8 h-8 text-primary drop-shadow-lg" strokeWidth={2.2} />
              </motion.div>
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

      {/* Confirmation dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="z-[110]">
          <AlertDialogHeader>
            <AlertDialogTitle>Quitter le tutoriel ?</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous vraiment quitter le tutoriel ? Vous pourrez toujours le revoir plus tard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuer le tutoriel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setShowConfirm(false); onFinish(); }}>
              Quitter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AnimatePresence>
  );
};

export default ContextualTutorial;
