import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pencil, CheckCircle, MousePointerClick, UserRound, Link2, UserPlus, User, Move, BoxSelect, Hand } from 'lucide-react';
import { FamilyMember } from '@/types/genogram';
import type { ContextualTutoStep } from '@/hooks/useContextualTutorial';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/** Reusable cursor icon — dark fill, white stroke outline, soft shadow */
const TutoCursor = ({ size = 36 }: { size?: number }) => (
  <div className="relative" style={{ width: size, height: size, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}>
    {/* White outline layer behind */}
    <MousePointerClick
      className="absolute inset-0 text-white"
      style={{ width: size, height: size }}
      strokeWidth={4}
    />
    {/* Dark foreground layer */}
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
    title: 'Remplissez les informations',
    description: 'Complétez les champs (prénom, dates, profession…) puis fermez le panneau pour continuer.',
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
  'link-click-dot': {
    icon: <Link2 className="w-5 h-5" />,
    title: 'Cliquez sur un point d\'ancrage',
    description: 'Cliquez sur un des points (●) sur le bord de la carte du parent 1 et maintenez le clic.',
    padding: 14,
  },
  'link-drag-release': {
    icon: <Link2 className="w-5 h-5" />,
    title: 'Glissez vers l\'enfant',
    description: 'Maintenez le clic et glissez vers la carte de l\'enfant, puis relâchez pour créer le lien émotionnel.',
    padding: 24,
  },
  'create-select-pi': {
    icon: <UserRound className="w-5 h-5" />,
    title: 'Sélectionnez le membre de base',
    description: 'Cliquez sur la carte du membre de base pour le sélectionner.',
    padding: 14,
  },
  'create-click-button': {
    icon: <UserPlus className="w-5 h-5" />,
    title: 'Créer un membre',
    description: 'Cliquez sur le bouton « Créer un membre » sous la carte.',
    padding: 8,
  },
  'create-pick-sibling': {
    icon: <User className="w-5 h-5" />,
    title: 'Choisissez « Frère/Sœur »',
    description: 'Sélectionnez « Frère/Sœur » dans le menu déroulant.',
    padding: 8,
  },
  'drag-card': {
    icon: <Move className="w-5 h-5" />,
    title: 'Déplacez une carte',
    description: 'Cliquez et maintenez sur une carte, puis glissez-la pour la repositionner sur le canevas.',
    padding: 14,
  },
  'multi-select': {
    icon: <BoxSelect className="w-5 h-5" />,
    title: 'Sélection multiple',
    description: 'Tracez un rectangle sur le canevas avec la souris, ou maintenez ⇧ Shift et cliquez sur plusieurs cartes pour les sélectionner.',
    padding: 14,
  },
  'union-select-both': {
    icon: <Link2 className="w-5 h-5" />,
    title: 'Sélectionnez les deux parents',
    description: 'Cliquez sur le parent 1, puis maintenez ⇧ Shift et cliquez sur le parent 2.',
    padding: 14,
  },
  'union-click-button': {
    icon: <Link2 className="w-5 h-5" />,
    title: 'Créer l\'union',
    description: 'Cliquez sur le bouton « Créer une union » qui apparaît entre les deux cartes.',
    padding: 8,
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
  const [tipHidden, setTipHidden] = useState(false);
  const [spotlight, setSpotlight] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [editBtnPos, setEditBtnPos] = useState<{ top: number; left: number } | null>(null);
  const [linkDragPositions, setLinkDragPositions] = useState<{ fromX: number; fromY: number; toX: number; toY: number } | null>(null);
  const [closestDotPos, setClosestDotPos] = useState<{ x: number; y: number } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const rafRef = useRef(0);

  const tip = currentStep ? TIPS[currentStep] : null;

  // Reset tipHidden when step changes
  const prevStepRef = useRef(currentStep);
  useEffect(() => {
    if (currentStep !== prevStepRef.current) {
      setTipHidden(false);
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
      } else if (currentStep === 'create-click-button') {
        // Spotlight the "Créer un membre" button under the father card
        if (fatherMember) {
          const el = document.querySelector(`[data-member-card="${fatherMember.id}"]`);
          if (el) {
            // Find the "Créer un membre" button (it's the one with UserPlus icon)
            const btns = el.parentElement?.querySelectorAll('button');
            let createBtn: Element | null = null;
            btns?.forEach(b => {
              if (b.textContent?.includes('Créer')) createBtn = b;
            });
            if (createBtn) {
              const btnRect = (createBtn as HTMLElement).getBoundingClientRect();
              setSpotlight({
                top: btnRect.top - padding,
                left: btnRect.left - padding,
                width: btnRect.width + padding * 2,
                height: btnRect.height + padding * 2,
              });
              setEditBtnPos({ top: btnRect.top + btnRect.height / 2, left: btnRect.left + btnRect.width / 2 });
            } else {
              // Fallback: highlight the card
              const rect = el.getBoundingClientRect();
              setSpotlight({ top: rect.top - padding, left: rect.left - padding, width: rect.width + padding * 2, height: rect.height + padding * 2 });
              setEditBtnPos(null);
            }
          } else {
            setSpotlight(null);
          }
        }
        setLinkDragPositions(null);
      } else if (currentStep === 'create-pick-sibling') {
        // Spotlight the dropdown menu content
        const dropdownContent = document.querySelector('[role="menu"]');
        if (dropdownContent) {
          const rect = dropdownContent.getBoundingClientRect();
          setSpotlight({
            top: rect.top - padding,
            left: rect.left - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
          });
        } else {
          setSpotlight(null);
        }
        setEditBtnPos(null);
        setLinkDragPositions(null);
      } else if (currentStep === 'union-select-both') {
        // Highlight both parent cards
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
          } else {
            setSpotlight(null);
          }
        }
        setEditBtnPos(null);
        setLinkDragPositions(null);
      } else if (currentStep === 'union-click-button') {
        // Highlight the floating "Créer une union" button
        // It's a fixed-position button with text "Créer une union"
        const allBtns = document.querySelectorAll('button');
        let unionBtn: Element | null = null;
        allBtns.forEach(b => {
          if (b.textContent?.includes('Créer une union') || b.textContent?.includes("Modifier l'union")) unionBtn = b;
        });
        if (unionBtn) {
          const rect = (unionBtn as HTMLElement).getBoundingClientRect();
          setSpotlight({
            top: rect.top - padding,
            left: rect.left - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
          });
          setEditBtnPos({ top: rect.top + rect.height / 2, left: rect.left + rect.width / 2 });
        } else {
          setSpotlight(null);
          setEditBtnPos(null);
        }
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
      return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
    }
    
    // For edit-hint, position tooltip centered vertically, just left of the drawer
    if (currentStep === 'edit-hint') {
      const drawerLeft = spotlight.left;
      return {
        left: Math.max(16, drawerLeft - 340),
        top: '50%',
        transform: 'translateY(-50%)',
      };
    }

    // For link-click-dot, prefer right of cards, fallback below
    if (currentStep === 'link-click-dot' && firstMember && fatherMember) {
      const piEl = document.querySelector(`[data-member-card="${firstMember.id}"]`);
      const fatherEl = document.querySelector(`[data-member-card="${fatherMember.id}"]`);
      if (piEl && fatherEl) {
        const piRect = piEl.getBoundingClientRect();
        const fatherRect = fatherEl.getBoundingClientRect();
        const rightEdge = Math.max(piRect.right, fatherRect.right);
        const topY = Math.min(piRect.top, fatherRect.top);
        const sheetW = drawerOpen ? 400 : 0;
        const rightAvail = window.innerWidth - rightEdge - sheetW;
        if (rightAvail > 350) {
          return {
            left: rightEdge + 20,
            top: Math.max(16, topY),
            transform: 'none',
          };
        }
        // Fallback: below cards
        const bottomY = Math.max(piRect.bottom, fatherRect.bottom) + 24;
        const centerX = (Math.min(piRect.left, fatherRect.left) + Math.max(piRect.right, fatherRect.right)) / 2;
        return {
          left: Math.max(16, Math.min(centerX - 160, window.innerWidth - sheetW - 340)),
          top: Math.min(bottomY, window.innerHeight - 120),
          transform: 'none',
        };
      }
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
        {currentStep !== 'edit-hint' && currentStep !== 'link-click-dot' && currentStep !== 'link-drag-release' && currentStep !== 'create-click-button' && currentStep !== 'create-pick-sibling' && currentStep !== 'drag-card' && currentStep !== 'multi-select' && currentStep !== 'union-click-button' && !drawerOpen && (
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

          {currentStep !== 'edit-hint' && currentStep !== 'link-click-dot' && currentStep !== 'link-drag-release' && currentStep !== 'create-click-button' && currentStep !== 'create-pick-sibling' && currentStep !== 'drag-card' && currentStep !== 'multi-select' && currentStep !== 'union-click-button' && (
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
          {spotlight && (currentStep === 'card-intro' || currentStep === 'parent-intro' || currentStep === 'create-select-pi') && (
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
          {currentStep === 'drag-card' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="fixed pointer-events-none z-[102]"
              style={{
                top: '50%',
                left: '40%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <motion.div
                animate={{
                  x: [0, 80, 80, 0],
                  y: [0, -30, -30, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  times: [0, 0.4, 0.6, 1],
                }}
              >
                <div className="relative" style={{ filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.35))' }}>
                  <Hand
                    className="text-white"
                    style={{ width: 40, height: 40 }}
                    strokeWidth={3.5}
                  />
                  <Hand
                    className="absolute inset-0 text-foreground"
                    style={{ width: 40, height: 40 }}
                    strokeWidth={2}
                  />
                </div>
              </motion.div>
              {/* Trail line showing drag path */}
              <svg className="absolute top-0 left-0 overflow-visible" width="1" height="1" style={{ pointerEvents: 'none' }}>
                <motion.line
                  x1={20} y1={20}
                  x2={100} y2={-10}
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.4, 0.4, 0] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    times: [0, 0.3, 0.6, 1],
                  }}
                />
              </svg>
            </motion.div>
          )}

          {/* Animated marquee rectangle for multi-select step */}
          {currentStep === 'multi-select' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="fixed pointer-events-none z-[102]"
              style={{
                top: '45%',
                left: '35%',
              }}
            >
              {/* Cursor hand that moves diagonally to draw rectangle */}
              <motion.div
                animate={{
                  x: [0, 120, 120, 0],
                  y: [0, 80, 80, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  times: [0, 0.4, 0.7, 1],
                }}
              >
                <div className="relative" style={{ filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.35))' }}>
                  <MousePointerClick
                    className="text-white"
                    style={{ width: 36, height: 36 }}
                    strokeWidth={4}
                  />
                  <MousePointerClick
                    className="absolute inset-0 text-foreground"
                    style={{ width: 36, height: 36 }}
                    strokeWidth={2}
                  />
                </div>
              </motion.div>
              {/* Animated selection rectangle */}
              <svg className="absolute top-0 left-0 overflow-visible" width="1" height="1" style={{ pointerEvents: 'none' }}>
                <motion.rect
                  x={4}
                  y={4}
                  initial={{ width: 0, height: 0, opacity: 0 }}
                  animate={{
                    width: [0, 120, 120, 0],
                    height: [0, 80, 80, 0],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    times: [0, 0.4, 0.7, 1],
                  }}
                  fill="hsl(var(--primary) / 0.08)"
                  stroke="hsl(var(--primary))"
                  strokeWidth={1.5}
                  strokeDasharray="6 3"
                  rx={4}
                />
              </svg>
            </motion.div>
          )}

          {/* Animated pointing cursor for card-selected / parent-selected → points at edit button */}
          {editBtnPos && (currentStep === 'card-selected' || currentStep === 'parent-selected' || currentStep === 'create-click-button' || currentStep === 'union-click-button') && (
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
          className="fixed z-[101] w-[320px] max-w-[90vw] pointer-events-auto"
          style={cardStyle}
          onClick={e => e.stopPropagation()}
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            <button
              onClick={() => setTipHidden(true)}
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
