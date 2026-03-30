import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pencil, CheckCircle, MousePointerClick, UserRound, Link2, UserPlus, User, Move, BoxSelect, Hand } from 'lucide-react';
import { FamilyMember } from '@/types/genogram';
import type { ContextualTutoStep } from '@/hooks/useContextualTutorial';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/** Reusable cursor icon — clean black with subtle shadow */
const TutoCursor = ({ size = 28 }: { size?: number }) => (
  <div className="relative" style={{ width: size, height: size, filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.25))' }}>
    <MousePointerClick
      className="absolute inset-0 text-white"
      style={{ width: size, height: size }}
      strokeWidth={3.5}
    />
    <MousePointerClick
      className="absolute inset-0 text-foreground"
      style={{ width: size, height: size }}
      strokeWidth={2}
    />
  </div>
);

interface TipConfig {
  icon: React.ReactNode;
  title: string;
  description: string;
  padding: number;
}

function useTips(): Record<Exclude<ContextualTutoStep, null>, TipConfig> {
  const { t } = useLanguage();
  return useMemo(() => ({
    'card-intro': {
      icon: <MousePointerClick className="w-5 h-5" />,
      title: t.contextualTutorial.cardIntroTitle,
      description: t.contextualTutorial.cardIntroDesc,
      padding: 14,
    },
    'card-selected': {
      icon: <Pencil className="w-5 h-5" />,
      title: t.contextualTutorial.cardSelectedTitle,
      description: t.contextualTutorial.cardSelectedDesc,
      padding: 14,
    },
    'edit-hint': {
      icon: <CheckCircle className="w-5 h-5" />,
      title: t.contextualTutorial.editHintTitle,
      description: t.contextualTutorial.editHintDesc,
      padding: 14,
    },
    'parent-intro': {
      icon: <UserRound className="w-5 h-5" />,
      title: t.contextualTutorial.parentIntroTitle,
      description: t.contextualTutorial.parentIntroDesc,
      padding: 14,
    },
    'parent-selected': {
      icon: <Pencil className="w-5 h-5" />,
      title: t.contextualTutorial.parentSelectedTitle,
      description: t.contextualTutorial.parentSelectedDesc,
      padding: 14,
    },
    'link-click-dot': {
      icon: <Link2 className="w-5 h-5" />,
      title: t.contextualTutorial.linkClickDotTitle,
      description: t.contextualTutorial.linkClickDotDesc,
      padding: 14,
    },
    'link-drag-release': {
      icon: <Link2 className="w-5 h-5" />,
      title: t.contextualTutorial.linkDragReleaseTitle,
      description: t.contextualTutorial.linkDragReleaseDesc,
      padding: 24,
    },
    'multi-select': {
      icon: <BoxSelect className="w-5 h-5" />,
      title: t.contextualTutorial.multiSelectTitle,
      description: t.contextualTutorial.multiSelectDesc,
      padding: 14,
    },
    'multi-drag': {
      icon: <Move className="w-5 h-5" />,
      title: t.contextualTutorial.multiDragTitle,
      description: t.contextualTutorial.multiDragDesc,
      padding: 14,
    },
  }), [t]);
}

interface ContextualTutorialProps {
  currentStep: ContextualTutoStep;
  firstMember: FamilyMember | null;
  fatherMember: FamilyMember | null;
  siblingMember?: FamilyMember | null;
  drawerOpen?: boolean;
  onFinish: () => void;
}

const ContextualTutorial: React.FC<ContextualTutorialProps> = ({
  currentStep, firstMember, fatherMember, siblingMember, drawerOpen = false, onFinish,
}) => {
  const [tipHidden, setTipHidden] = useState(false);
  const [spotlight, setSpotlight] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [editBtnPos, setEditBtnPos] = useState<{ top: number; left: number } | null>(null);
  const [linkDragPositions, setLinkDragPositions] = useState<{ fromX: number; fromY: number; toX: number; toY: number } | null>(null);
  const [closestDotPos, setClosestDotPos] = useState<{ x: number; y: number } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [tipDragOffset, setTipDragOffset] = useState<{ x: number; y: number } | null>(null);
  const tipDragRef = useRef<{ startX: number; startY: number; origLeft: number; origTop: number } | null>(null);
  const rafRef = useRef(0);

  const tip = currentStep ? TIPS[currentStep] : null;

  // Reset tipHidden when step changes
  const prevStepRef = useRef(currentStep);
  useEffect(() => {
    if (currentStep !== prevStepRef.current) {
      setTipHidden(false);
      setTipDragOffset(null);
      prevStepRef.current = currentStep;
    }
  }, [currentStep]);

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
      } else if (currentStep === 'link-click-dot') {
        // Highlight only the closest anchor dot, not the whole card
        if (fatherMember && firstMember) {
          const fatherEl = document.querySelector(`[data-member-card="${fatherMember.id}"]`);
          const childEl = document.querySelector(`[data-member-card="${firstMember.id}"]`);
          if (fatherEl && childEl) {
            const childRect = childEl.getBoundingClientRect();
            const childCx = childRect.left + childRect.width / 2;
            const childCy = childRect.top + childRect.height / 2;

            // Query actual rendered dot elements inside the father card
            const dotEls = fatherEl.querySelectorAll('.rounded-full.cursor-crosshair');
            let best: { x: number; y: number } | null = null;
            let bestDist = Infinity;
            dotEls.forEach((dotEl) => {
              const dr = dotEl.getBoundingClientRect();
              const cx = dr.left + dr.width / 2;
              const cy = dr.top + dr.height / 2;
              const dist = Math.hypot(cx - childCx, cy - childCy);
              if (dist < bestDist) { bestDist = dist; best = { x: cx, y: cy }; }
            });

            if (best) {
              setClosestDotPos(best);
              const dotRadius = 24;
              setSpotlight({
                top: best.y - dotRadius,
                left: best.x - dotRadius,
                width: dotRadius * 2,
                height: dotRadius * 2,
              });
            } else {
              setSpotlight(null);
              setClosestDotPos(null);
            }
          } else {
            setSpotlight(null);
            setClosestDotPos(null);
          }
        } else {
          setClosestDotPos(null);
        }
        setEditBtnPos(null);
        setLinkDragPositions(null);
      } else if (currentStep === 'link-drag-release') {
        // Highlight only the child card to show where to drop
        if (firstMember) {
          const piEl = document.querySelector(`[data-member-card="${firstMember.id}"]`);
          if (piEl) {
            const piRect = piEl.getBoundingClientRect();
            setSpotlight({
              top: piRect.top - padding,
              left: piRect.left - padding,
              width: piRect.width + padding * 2,
              height: piRect.height + padding * 2,
            });
          } else {
            setSpotlight(null);
          }
        }
        setEditBtnPos(null);
        setLinkDragPositions(null);
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
      // Default: top-right of the canvas (same as normal steps)
      const sheetWidth = drawerOpen ? 400 : 0;
      return { right: sheetWidth + 24, top: 80, transform: 'none' };
    }
    
    // For edit-hint, position tooltip just left of the drawer, vertically centered on drawer
    if (currentStep === 'edit-hint') {
      const drawerLeft = spotlight.left;
      const tooltipW = 320;
      return {
        left: Math.max(16, drawerLeft - tooltipW - 16),
        top: Math.max(80, spotlight.top + spotlight.height / 2 - 60),
        transform: 'none',
      };
    }

    // For all non-drawer steps: fixed top-right of the canvas
    const sheetWidth = drawerOpen ? 400 : 0;
    return {
      right: sheetWidth + 24,
      top: 80,
      transform: 'none',
    };
  }, [spotlight, currentStep, drawerOpen]);

  if (!currentStep || !tip || (drawerOpen && currentStep !== 'edit-hint')) return null;

  return (
    <AnimatePresence mode="wait">
      <React.Fragment key={currentStep}>
        {/* Overlay with spotlight cutout — skip dark overlay during edit-hint to keep drawer interactive */}
        {/* Click-outside catchers (without blocking spotlight target) */}
        {currentStep !== 'edit-hint' && currentStep !== 'link-click-dot' && currentStep !== 'link-drag-release' && currentStep !== 'multi-select' && currentStep !== 'multi-drag' && !drawerOpen && (
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
          {/* Dark overlay with spotlight cutout for edit-hint (drawer highlight) */}
          {currentStep === 'edit-hint' && spotlight && (
            <svg className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <mask id="ctx-tuto-mask-edit">
                  <rect width="100%" height="100%" fill="white" />
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
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="rgba(0,0,0,0.45)" mask="url(#ctx-tuto-mask-edit)" />
            </svg>
          )}

          {currentStep !== 'edit-hint' && currentStep !== 'link-click-dot' && currentStep !== 'link-drag-release' && currentStep !== 'multi-select' && currentStep !== 'multi-drag' && (
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
                <TutoCursor />
              </motion.div>
            </motion.div>
          )}

          {/* Animated drag cursor for drag-card step */}
          {currentStep === 'multi-drag' && spotlight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="fixed pointer-events-none z-[102]"
              style={{
                top: spotlight.top + spotlight.height * 0.45,
                left: spotlight.left + spotlight.width * 0.4,
              }}
            >
              {/* Curved trail path */}
              <svg className="absolute overflow-visible" width="1" height="1" style={{ pointerEvents: 'none', top: 14, left: 14 }}>
                <motion.path
                  d="M 0,0 C 30,-40 80,-50 120,-20"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 0.5, 0.5, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    times: [0, 0.35, 0.65, 1],
                  }}
                />
                {/* Destination dot */}
                <motion.circle
                  cx={120} cy={-20} r={4}
                  fill="hsl(var(--primary))"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 0, 0.6, 0.6, 0], scale: [0, 0, 1, 1, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    times: [0, 0.3, 0.4, 0.65, 1],
                  }}
                />
              </svg>
              {/* Hand cursor following the curve */}
              <motion.div
                animate={{
                  x: [0, 30, 80, 120, 120, 0],
                  y: [0, -25, -45, -20, -20, 0],
                  rotate: [0, -8, -5, 0, 0, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  times: [0, 0.15, 0.25, 0.35, 0.65, 1],
                }}
              >
                <div className="relative" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }}>
                  <Hand
                    className="text-white"
                    style={{ width: 32, height: 32 }}
                    strokeWidth={3.5}
                  />
                  <Hand
                    className="absolute inset-0 text-foreground"
                    style={{ width: 32, height: 32 }}
                    strokeWidth={2}
                  />
                </div>
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
                <TutoCursor />
              </motion.div>
            </motion.div>
          )}

          {/* Animated pointing cursor for link-click-dot → points at a dot on the card */}
          {currentStep === 'link-click-dot' && closestDotPos && (
            <>
              {/* Pulsing ring on the anchor dot */}
              <motion.div
                className="absolute pointer-events-none z-[102]"
                style={{
                  top: closestDotPos.y,
                  left: closestDotPos.x,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-6 h-6 rounded-full border-2 border-primary"
                />
              </motion.div>
              <motion.div
                className="absolute pointer-events-none z-[102]"
                style={{
                  top: closestDotPos.y,
                  left: closestDotPos.x,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <motion.div
                  animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-4 h-4 rounded-full bg-primary"
                />
              </motion.div>
              {/* Cursor pointing at the dot */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 20 }}
                className="absolute pointer-events-none z-[102]"
                style={{
                  top: closestDotPos.y + 10,
                  left: closestDotPos.x + 10,
                }}
              >
                <motion.div
                  animate={{ x: [-2, 2, -2], y: [-2, 2, -2] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <TutoCursor size={32} />
                </motion.div>
              </motion.div>
            </>
          )}

          {/* link-drag-release: label above child card spotlight */}
          {currentStep === 'link-drag-release' && spotlight && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
              className="absolute pointer-events-none z-[102] flex items-center justify-center"
              style={{
                left: spotlight.left + spotlight.width / 2,
                top: spotlight.top - 12,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <motion.span
                animate={{ scale: [1, 1.08, 1], opacity: [0.9, 1, 0.9] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-lg"
              >
                Relâchez ici
              </motion.span>
            </motion.div>
          )}
        </motion.div>

        {/* Tooltip — hidden during link-drag-release (only spotlight on child) */}
        {currentStep !== 'link-drag-release' && !tipHidden && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 8 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className={`fixed z-[101] max-w-[90vw] pointer-events-auto cursor-grab active:cursor-grabbing ${currentStep === 'edit-hint' ? 'w-[320px]' : 'w-[240px]'}`}
          style={tipDragOffset ? { left: tipDragOffset.x, top: tipDragOffset.y, transform: 'none' } : cardStyle}
          onClick={e => e.stopPropagation()}
          onMouseDown={(e) => {
            if ((e.target as HTMLElement).closest('button')) return;
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            tipDragRef.current = { startX: e.clientX, startY: e.clientY, origLeft: rect.left, origTop: rect.top };
            const onMove = (ev: MouseEvent) => {
              if (!tipDragRef.current) return;
              setTipDragOffset({
                x: tipDragRef.current.origLeft + (ev.clientX - tipDragRef.current.startX),
                y: tipDragRef.current.origTop + (ev.clientY - tipDragRef.current.startY),
              });
            };
            const onUp = () => {
              tipDragRef.current = null;
              window.removeEventListener('mousemove', onMove);
              window.removeEventListener('mouseup', onUp);
            };
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
          }}
        >
          <div className={`backdrop-blur-xl border overflow-hidden ${currentStep === 'edit-hint' ? 'bg-card/85 border-border rounded-2xl shadow-2xl' : 'bg-white/80 dark:bg-card/75 border-white/50 dark:border-white/20 rounded-lg shadow-md'}`}>
            {/* Drag handle indicator */}
            <div className="flex justify-center pt-2 pb-0">
              <div className="w-8 h-1 rounded-full bg-muted-foreground/20" />
            </div>
            <button
              onClick={() => setTipHidden(true)}
              className={`absolute flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10 ${currentStep === 'edit-hint' ? 'top-3 right-3 w-7 h-7' : 'top-2 right-2 w-5 h-5'}`}
            >
              <X className={currentStep === 'edit-hint' ? 'w-4 h-4' : 'w-3 h-3'} />
            </button>

            <div className={currentStep === 'edit-hint' ? 'px-5 pb-5 pt-2' : 'px-3 pb-3 pt-1'}>
              <div className="flex items-start gap-3">
                <motion.div
                  key={`icon-${currentStep}`}
                  initial={{ scale: 0.6, opacity: 0, rotate: -20 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                  className={`flex items-center justify-center shrink-0 text-primary ${currentStep === 'edit-hint' ? 'w-10 h-10 rounded-xl bg-primary/10' : 'w-6 h-6 rounded-md bg-primary/8'}`}
                >
                  {currentStep === 'edit-hint' ? tip.icon : <span className="scale-75">{tip.icon}</span>}
                </motion.div>
                <div className={`flex-1 min-w-0 ${currentStep === 'edit-hint' ? 'pr-6' : 'pr-4'}`}>
                  <span className="text-[11px] uppercase tracking-widest font-semibold text-primary/60 mb-1 block">Tutoriel</span>
                  <motion.h3
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={currentStep === 'edit-hint' ? 'text-sm font-semibold text-foreground mb-1' : 'text-sm font-semibold text-foreground mb-0.5'}
                  >
                    {tip.title}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 }}
                    className={currentStep === 'edit-hint' ? 'text-[13px] text-muted-foreground leading-relaxed' : 'text-[13px] text-muted-foreground/80 leading-relaxed'}
                  >
                    {tip.description}
                  </motion.p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        )}
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
