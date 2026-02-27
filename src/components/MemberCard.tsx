import React from 'react';
import { motion } from 'framer-motion';
import { FamilyMember, PATHOLOGIES } from '@/types/genogram';
import MemberIcon from '@/components/MemberIcon';
import { Plus, Pencil, Link } from 'lucide-react';

/**
 * 4 visual states:
 *   default        – grey border, no shadow, no anchors, no buttons
 *   hover          – purple border + subtle halo
 *   selected       – purple border + halo + anchor dots (outline) + action buttons
 *   anchor-active  – same as selected but anchor dots are filled (drag mode)
 */
export type MemberCardState = 'default' | 'hover' | 'selected' | 'anchor-active';

/** Fixed card width — must match CARD_W in GenogramEditor */
export const MEMBER_CARD_W = 250;

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
}

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
}) => {
  const isDeceased = !!member.deathYear;
  const memberPathologies = PATHOLOGIES.filter(p => member.pathologies.includes(p.id));

  // Derive effective state: if selected via prop but state not explicitly set beyond default
  const activeState: MemberCardState =
    isSelected && state === 'default' ? 'selected' : state;

  const isHighlighted = activeState === 'hover' || activeState === 'selected' || activeState === 'anchor-active' || isLinkTarget;
  const showAnchors = activeState === 'selected' || activeState === 'anchor-active';
  const showActions = activeState === 'selected' || activeState === 'anchor-active';
  const anchorsFilled = activeState === 'anchor-active';

  // Border & ring logic
  const borderClasses = isColliding
    ? 'border-destructive ring-2 ring-destructive/30'
    : isLinkTarget
      ? 'border-primary ring-2 ring-primary/40'
      : isHighlighted
        ? 'border-primary ring-2 ring-primary/30'
        : 'border-border';

  const cardContent = (
    <>
      {/* Anchor points — visible in selected & anchor-active */}
      {showAnchors && (
        <>
          {(['top', 'bottom', 'left', 'right'] as const).map(side => {
            const posClass =
              side === 'top'    ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' :
              side === 'bottom' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' :
              side === 'left'   ? 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2' :
                                  'right-0 top-1/2 translate-x-1/2 -translate-y-1/2';
            return (
              <div
                key={side}
                className={`absolute ${posClass} w-2.5 h-2.5 rounded-full border-2 border-primary z-10 cursor-crosshair transition-colors ${
                  anchorsFilled ? 'bg-primary' : 'bg-card'
                }`}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onLinkDragStart?.(member.id, e);
                }}
              />
            );
          })}
        </>
      )}

      {/* Card body — fixed width */}
      <div
        className={`
          relative flex items-center gap-3 rounded-xl p-2 bg-card border transition-all ${isStatic ? '' : 'cursor-grab active:cursor-grabbing'}
          ${activeState === 'default' ? '' : ''} ${borderClasses}
        `}
        style={{ width: MEMBER_CARD_W }}
      >
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

        {/* Info — overflow ellipsis */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-sm text-foreground truncate">{member.firstName}</span>
            <span className="text-[11px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0">
              {member.age} ans
            </span>
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {member.birthYear}{member.deathYear ? ` - ${member.deathYear}` : ' -'}
          </div>
          <div className="text-xs text-muted-foreground truncate">{member.profession}</div>
        </div>
      </div>

      {/* Action buttons (Selected & Anchor-active states) */}
      {showActions && (
        <div className="flex items-center gap-2 justify-center mt-2">
          <button
            onClick={(e) => { e.stopPropagation(); onCreateRelated?.(member.id); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-soft hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Créer un membre
          </button>
          <button
            onMouseDown={(e) => { e.stopPropagation(); onLinkDragStart?.(member.id, e); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-foreground text-xs font-semibold shadow-soft hover:bg-accent transition-colors cursor-crosshair"
            title="Maintenir et glisser vers une autre carte"
          >
            <Link className="w-3.5 h-3.5" />
            Créer un lien
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(member.id); }}
            className="w-8 h-8 rounded-full bg-card border border-border shadow-soft flex items-center justify-center hover:bg-accent transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-foreground" />
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
      style={{ zIndex: 2 }}
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
