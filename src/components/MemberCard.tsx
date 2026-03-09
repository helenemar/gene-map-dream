import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FamilyMember } from '@/types/genogram';
import type { DynamicPathology } from '@/hooks/usePathologies';
import MemberIcon from '@/components/MemberIcon';
import CreateMemberDropdown, { RelationshipChoice, DisabledOptions } from '@/components/CreateMemberDropdown';
import { Plus, PencilLine, Link, X, Eye, UserPlus, FileText, HeartHandshake, HelpCircle, Lock, Unlock } from 'lucide-react';


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
  /** Fade-out animation before cascade deletion */
  isFadingOut?: boolean;
  /** Search: dimmed when search active but this card doesn't match */
  searchDimmed?: boolean;
  /** Search: glowing when this card matches search */
  searchHighlighted?: boolean;
  /** Presentation mode: hide controls, disable drag, click opens view */
  presentationMode?: boolean;
  /** Compact mode: smaller card for bio parents when adoptive parents exist */
  compact?: boolean;
  onSelect?: (id: string) => void;
  onDragStart?: (id: string, e: React.MouseEvent) => void;
  onCreateRelated?: (id: string, relationship: RelationshipChoice) => void;
  onEdit?: (id: string) => void;
  onToggleLock?: (id: string) => void;
  disabledOptions?: DisabledOptions;
  /** Dynamic pathologies from DB for color resolution */
  dynamicPathologies?: DynamicPathology[];
  showParentSplit?: boolean;
  /** Member is a child in an adoption union */
  isAdopted?: boolean;
  onView?: (id: string) => void;
  onHover?: (id: string | null) => void;
  onLinkDragStart?: (id: string, e: React.MouseEvent) => void;
  /** Called when user wants to cancel anchor-active and go back to selected */
  onCancelAnchor?: (id: string) => void;
  /** Click handler for the card body (used by MemberNode to separate card clicks from action button clicks) */
  onCardClick?: () => void;
  /** Double-click handler for the card body */
  onCardDoubleClick?: () => void;
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
  isFadingOut = false,
  searchDimmed = false,
  searchHighlighted = false,
  presentationMode = false,
  compact = false,
  onSelect,
  onDragStart,
  onCreateRelated,
  onEdit,
  onToggleLock,
  onView,
  onHover,
  onLinkDragStart,
  onCancelAnchor,
  onCardClick,
  onCardDoubleClick,
  disabledOptions,
  dynamicPathologies = [],
  showParentSplit = false,
  isAdopted = false,
}) => {
  const isDeceased = !!member.deathYear;
  const isPlaceholder = !!member.isPlaceholder;
  const isDraft = !!member.isDraft;
  const isPerinatal = !!member.perinatalType;
  const memberPathologies = dynamicPathologies.filter(p => member.pathologies.includes(p.id));

  // Internal anchor-active state for static/DS usage
  const [internalAnchorActive, setInternalAnchorActive] = useState(false);

  // Derive effective state
  const activeState: MemberCardState =
    internalAnchorActive && isStatic ? 'anchor-active' :
    isSelected && state === 'default' ? 'selected' : state;

  const isHighlighted = activeState === 'hover' || activeState === 'selected' || activeState === 'anchor-active' || isLinkTarget;
  const showDots = !presentationMode && (activeState === 'selected' || activeState === 'anchor-active' || isLinkTarget);
  const dotsFilled = activeState === 'anchor-active';

  // Border & ring logic (no collision outline)
  const borderClasses = isLinkTarget
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
          relative overflow-visible flex items-center ${compact ? 'gap-2' : 'gap-3'} rounded-xl bg-card shadow-sm transition-all
          ${(isPlaceholder || isDraft) ? 'border-2 border-dashed' : 'border'}
          ${isStatic ? '' : 'cursor-grab active:cursor-grabbing'}
          ${(isPlaceholder || isDraft) && !isHighlighted ? 'border-muted-foreground/30' : borderClasses}
          ${searchHighlighted ? 'border-2 border-primary ring-4 ring-primary/25' : ''}
          ${compact ? 'opacity-75' : ''}
        `}
        style={{
          minWidth: compact ? 160 : MEMBER_CARD_W,
          width: 'fit-content',
          padding: compact ? '8px 12px' : '12px 16px',
          transform: compact ? 'scale(0.85)' : undefined,
          transformOrigin: 'center center',
          ...(searchHighlighted ? { boxShadow: '0 0 20px hsl(var(--primary) / 0.35), 0 0 40px hsl(var(--primary) / 0.15)' } : {}),
        }}
      >
        {/* Lock indicator removed — managed via floating lock panel */}
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

        {/* Icon with pathology fills, placeholder, or draft */}
        <div className={`relative ${compact ? 'w-9 h-9' : 'w-12 h-12'} shrink-0 flex items-center justify-center`}>
          {isPlaceholder ? (
            <div className={`${compact ? 'w-9 h-9' : 'w-12 h-12'} flex items-center justify-center ${
              member.gender === 'female' ? 'rounded-full' : 'rounded'
            } bg-muted/30`}>
              <Plus className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-muted-foreground/40`} />
            </div>
          ) : isDraft ? (
            <div className={`${compact ? 'w-9 h-9' : 'w-12 h-12'} flex items-center justify-center ${
              member.gender === 'female' ? 'rounded-full' : 'rounded'
            } bg-muted/20 border border-dashed border-muted-foreground/20`}>
              <PencilLine className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-muted-foreground/30`} />
            </div>
          ) : isPerinatal ? (
            <MemberIcon
              gender={member.gender}
              perinatalType={member.perinatalType}
              size={compact ? 36 : 48}
              className="text-foreground"
            />
          ) : (
            <MemberIcon
              gender={member.gender}
              isGay={member.isGay}
              isBisexual={member.isBisexual}
              isTransgender={member.isTransgender}
              isDead={isDeceased}
              pathologyColors={memberPathologies.map(p => p.color_hex)}
              size={compact ? 36 : 48}
              className="text-foreground"
              isIndexPatient={member.isIndexPatient}
            />
          )}
        </div>

        {/* Info block */}
        <div className="min-w-0 flex-1">
          {isPlaceholder ? (
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-sm text-muted-foreground/50 italic whitespace-nowrap">Ajouter le parent</span>
              <span className="text-[11px] text-muted-foreground/30">Cliquer pour compléter</span>
            </div>
          ) : isDraft ? (
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-sm text-muted-foreground/60 whitespace-nowrap">
                {member.isAdoptiveParent ? 'Parent adoptif' : 'Parent'}
              </span>
              <span className="text-[11px] text-muted-foreground/30 italic">
                {member.isAdoptiveParent ? 'À compléter' : 'Cliquer pour éditer'}
              </span>
            </div>
          ) : isPerinatal ? (
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-sm text-foreground whitespace-nowrap">
                {member.perinatalType === 'pregnancy' ? 'Grossesse' :
                 member.perinatalType === 'miscarriage' ? 'Grossesse interrompue' :
                 member.perinatalType === 'abortion' ? 'IVG' : 'Mortinaissance'}
              </span>
              {member.birthYear > 0 && (
                <span className="text-[11px] text-muted-foreground">{member.birthYearUnsure ? '~' : ''}{member.birthYear}</span>
              )}
            </div>
          ) : (
            <>
              {/* Header: Prénom left, badges right — space-between */}
               <div className="flex items-center justify-between gap-2">
                <div className="flex items-baseline gap-1 min-w-0">
                  <span className="font-semibold text-sm text-foreground whitespace-nowrap">
                    {member.firstName.split(',')[0].trim()}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[11px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                    {isDeceased && member.deathYear ? `${member.deathYear - member.birthYear} ans` : `${member.age} ans`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="whitespace-nowrap">
                  {member.birthYearUnsure ? '~' : ''}{member.birthYear}{member.deathYear ? ` - ${member.deathYearUnsure ? '~' : ''}${member.deathYear}` : ' -'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="whitespace-nowrap">{member.isRetired ? (member.gender === 'female' ? 'Retraitée' : 'Retraité') : member.profession}</span>
                {member.notes && (
                  <FileText className="w-3 h-3 text-primary/60 shrink-0" />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {activeState === 'selected' && !presentationMode && (
        <motion.div
          className="flex items-center gap-2 justify-center mt-2 nopan nodrag"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <CreateMemberDropdown onSelect={(choice) => onCreateRelated?.(member.id, choice)} disabledOptions={disabledOptions} showParentSplit={showParentSplit}>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-soft hover:bg-primary/90 transition-colors nopan nodrag"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Créer un membre
            </button>
          </CreateMemberDropdown>
          <button
            onClick={(e) => { e.stopPropagation(); onView?.(member.id); }}
            onPointerDown={(e) => e.stopPropagation()}
            className="w-8 h-8 min-w-[40px] min-h-[40px] rounded-full bg-card border border-border shadow-soft flex items-center justify-center hover:bg-accent transition-colors"
          >
            <Eye className="w-4 h-4 text-foreground" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(member.id); }}
            onPointerDown={(e) => e.stopPropagation()}
            className="w-8 h-8 min-w-[40px] min-h-[40px] rounded-full bg-card border border-border shadow-soft flex items-center justify-center hover:bg-accent transition-colors"
          >
            <PencilLine className="w-4 h-4 text-foreground" />
          </button>
        </motion.div>
      )}

      {/* Action menu — State: Anchor-Active */}
      {activeState === 'anchor-active' && !presentationMode && (
        <div className="flex items-center gap-2 justify-center mt-2 nopan nodrag" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
          <button
            onMouseDown={(e) => {
              e.stopPropagation();
              onLinkDragStart?.(member.id, e);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-soft hover:bg-primary/90 transition-colors cursor-crosshair"
            title="Maintenir et glisser vers une autre carte"
          >
            <Link className="w-3.5 h-3.5" />
            Créer un lien
          </button>
          <button
            onClick={handleCancelAnchor}
            onPointerDown={(e) => e.stopPropagation()}
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
      data-member-card
      className="absolute select-none"
      animate={{
        left: member.x,
        top: member.y,
        opacity: isFadingOut ? 0 : searchDimmed ? 0.12 : 1,
        scale: isFadingOut ? 0.85 : 1,
      }}
      transition={isFadingOut
        ? { duration: 0.3, ease: 'easeOut' }
        : isAnimating
          ? { type: 'spring', stiffness: 80, damping: 18, mass: 0.8 }
          : { duration: 0 }
      }
      style={{ zIndex: isFadingOut ? 5 : 10, pointerEvents: isFadingOut ? 'none' : 'auto' }}
      onMouseDown={(e) => {
        e.stopPropagation();
        if (!presentationMode) onDragStart?.(member.id, e);
      }}
      onClick={() => {
        if (presentationMode) {
          if (!isPlaceholder && !isDraft) onView?.(member.id);
        } else if (isPlaceholder || isDraft) {
          onEdit?.(member.id);
        } else {
          onSelect?.(member.id);
        }
      }}
      onDoubleClick={() => {
        if (!presentationMode && !isPlaceholder && !isDraft) {
          onView?.(member.id);
        }
      }}
      onMouseEnter={() => onHover?.(member.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      {cardContent}
    </motion.div>
  );
};

export default MemberCard;
