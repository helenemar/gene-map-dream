import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FamilyMember, PATHOLOGIES } from '@/types/genogram';
import MemberIcon from '@/components/MemberIcon';
import { Plus, Pencil, Link, X } from 'lucide-react';

/**
 * 4 visual states:
 *   default        – grey border, no shadow, no anchors, no buttons
 *   hover          – purple border + subtle halo
 *   selected       – purple border + halo + corner dots (outline) + action menu [+ Créer un membre] [✎]
 *   anchor-active  – dots filled, menu changes to [🔗 Créer un lien] [X], drag mode
 */
export type MemberCardState = 'default' | 'hover' | 'selected' | 'anchor-active';

/** Min width for layout calculations — actual card uses fit-content */
export const MEMBER_CARD_W = 220;

type AnchorSide = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface MemberCardProps {
  member: FamilyMember;
  isSelected?: boolean;
  isAnimating?: boolean;
  isColliding?: boolean;
  state?: MemberCardState;
  /** When true, renders inline (no absolute positioning or motion) for use in the Design System */
  static?: boolean;
  /** Highlight when a link drag hovers over this card */
  isLinkTarget?: boolean;
  onSelect?: (id: string) => void;
  onDragStart?: (id: string, e: React.MouseEvent) => void;
  onCreateRelated?: (id: string) => void;
  onEdit?: (id: string) => void;
  onHover?: (id: string | null) => void;
  onLinkDragStart?: (id: string, e: React.MouseEvent) => void;
  /** Called when user wants to cancel anchor-active and go back to selected */
  onCancelAnchor?: (id: string) => void;
}

const CORNER_DOTS: { side: AnchorSide; style: React.CSSProperties }[] = [
  { side: 'top-left',     style: { top: -6, left: -6 } },
  { side: 'top-right',    style: { top: -6, right: -6 } },
  { side: 'bottom-left',  style: { bottom: -6, left: -6 } },
  { side: 'bottom-right', style: { bottom: -6, right: -6 } },
];

const MemberCard: React.FC<MemberCardProps> = ({
  member,
  isSelected,
  isAnimating = false,
  isColliding = false,
  state = 'default',
  static: isStatic = false,
  isLinkTarget = false,
  onSelect,
  onDragStart,
  onCreateRelated,
  onEdit,
  onHover,
  onLinkDragStart,
  onCancelAnchor,
}) => {
  const isDeceased = !!member.deathYear;
  const memberPathologies = PATHOLOGIES.filter(p => member.pathologies.includes(p.id));

  // Internal anchor-active state for static/DS usage
  const [internalAnchorActive, setInternalAnchorActive] = useState(false);

  // Derive effective state
  const activeState: MemberCardState =
    internalAnchorActive && isStatic ? 'anchor-active' :
    isSelected && state === 'default' ? 'selected' : state;

  const isHighlighted = activeState === 'hover' || activeState === 'selected' || activeState === 'anchor-active' || isLinkTarget;
  const showDots = activeState === 'selected' || activeState === 'anchor-active' || isLinkTarget;
  const dotsFilled = activeState === 'anchor-active';

  // Border & ring logic
  const borderClasses = isColliding
    ? 'border-destructive ring-2 ring-destructive/30'
    : isLinkTarget
      ? 'border-primary ring-2 ring-primary/40'
      : isHighlighted
        ? 'border-primary ring-2 ring-primary/30'
        : 'border-border';

  const handleDotClick = useCallback((side: AnchorSide, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isStatic) {
      setInternalAnchorActive(true);
      return;
    }
    onLinkDragStart?.(member.id, e);
  }, [isStatic, member.id, onLinkDragStart]);

  const handleCancelAnchor = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isStatic) {
      setInternalAnchorActive(false);
      return;
    }
    onCancelAnchor?.(member.id);
  }, [isStatic, member.id, onCancelAnchor]);

  const cardContent = (
    <>
      {/* Card body — hug contents with min-width, dots inside relative container */}
      <div
        className={`
          relative overflow-visible flex items-center gap-3 rounded-xl bg-card border transition-all
          ${isStatic ? '' : 'cursor-grab active:cursor-grabbing'}
          ${borderClasses}
        `}
        style={{ minWidth: MEMBER_CARD_W, width: 'fit-content', padding: '12px 16px' }}
      >
        {/* Corner anchor dots — absolutely positioned at card corners with negative offset */}
        {showDots && CORNER_DOTS.map(({ side, style }) => (
          <div
            key={side}
            className={`absolute w-4 h-4 rounded-full border-2 border-primary cursor-crosshair transition-all duration-150 ${
              dotsFilled
                ? 'bg-primary scale-125 shadow-[0_0_8px_hsl(var(--primary)/0.5)]'
                : isLinkTarget
                  ? 'bg-primary/20 opacity-50 hover:opacity-100 hover:bg-primary/40 hover:scale-[1.3] hover:shadow-[0_0_10px_hsl(var(--primary)/0.4)]'
                  : 'bg-card hover:bg-primary/30 hover:scale-[1.3] hover:shadow-[0_0_10px_hsl(var(--primary)/0.4)]'
            }`}
            style={style}
            onMouseDown={(e) => handleDotClick(side, e)}
          />
        ))}

        {/* Icon with pathology fills */}
        <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
          <MemberIcon
            gender={member.gender}
            isGay={member.isGay}
            isBisexual={member.isBisexual}
            isTransgender={member.isTransgender}
            isDead={isDeceased}
            pathologyColors={memberPathologies.map(p => `hsl(var(--pathology-${p.id}))`)}
            size={48}
            className="text-foreground"
          />
        </div>

        {/* Info block */}
        <div className="min-w-0 flex-1">
          {/* Header: Prénom left, Âge right — space-between */}
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold text-sm text-foreground whitespace-nowrap">{member.firstName}</span>
            <span className="text-[11px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0">
              {member.age} ans
            </span>
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            {member.birthYear}{member.deathYear ? ` - ${member.deathYear}` : ' -'}
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">{member.profession}</div>
        </div>
      </div>

      {/* Action menu — State: Selected */}
      {activeState === 'selected' && (
        <div className="flex items-center gap-2 justify-center mt-2">
          <button
            onClick={(e) => { e.stopPropagation(); onCreateRelated?.(member.id); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-soft hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Créer un membre
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(member.id); }}
            className="w-8 h-8 rounded-full bg-card border border-border shadow-soft flex items-center justify-center hover:bg-accent transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-foreground" />
          </button>
        </div>
      )}

      {/* Action menu — State: Anchor-Active */}
      {activeState === 'anchor-active' && (
        <div className="flex items-center gap-2 justify-center mt-2">
          <button
            onMouseDown={(e) => {
              e.stopPropagation();
              onLinkDragStart?.(member.id, e);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-soft hover:bg-primary/90 transition-colors cursor-crosshair"
            title="Maintenir et glisser vers une autre carte"
          >
            <Link className="w-3.5 h-3.5" />
            Créer un lien
          </button>
          <button
            onClick={handleCancelAnchor}
            className="w-8 h-8 rounded-full bg-card border border-border shadow-soft flex items-center justify-center hover:bg-destructive/10 hover:border-destructive/30 transition-colors"
            title="Annuler"
          >
            <X className="w-3.5 h-3.5 text-foreground" />
          </button>
        </div>
      )}
    </>
  );

  if (isStatic) {
    return <div className="relative inline-block">{cardContent}</div>;
  }

  return (
    <motion.div
      className="absolute select-none"
      animate={{
        left: member.x,
        top: member.y,
      }}
      transition={isAnimating
        ? { type: 'spring', stiffness: 80, damping: 18, mass: 0.8 }
        : { duration: 0 }
      }
      style={{ zIndex: 10 }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onDragStart?.(member.id, e);
      }}
      onClick={() => onSelect?.(member.id)}
      onMouseEnter={() => onHover?.(member.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      {cardContent}
    </motion.div>
  );
};

export default MemberCard;
