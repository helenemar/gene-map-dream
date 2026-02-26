import React from 'react';
import { FamilyMember, PATHOLOGIES } from '@/types/genogram';
import MemberIcon from '@/components/MemberIcon';
import { Plus, Pencil, Link } from 'lucide-react';

export type MemberCardState = 'default' | 'hover' | 'edition' | 'linkable';

interface MemberCardProps {
  member: FamilyMember;
  isSelected?: boolean;
  isAnimating?: boolean;
  isColliding?: boolean;
  state?: MemberCardState;
  onSelect?: (id: string) => void;
  onDragStart?: (id: string, e: React.MouseEvent) => void;
  onCreateRelated?: (id: string) => void;
  onEdit?: (id: string) => void;
  onHover?: (id: string | null) => void;
}

const MemberCard: React.FC<MemberCardProps> = ({
  member,
  isSelected,
  isAnimating = false,
  isColliding = false,
  state = 'default',
  onSelect,
  onDragStart,
  onCreateRelated,
  onEdit,
  onHover,
}) => {
  const isDeceased = !!member.deathYear;
  const memberPathologies = PATHOLOGIES.filter(p => member.pathologies.includes(p.id));

  const activeState = isSelected && state === 'default' ? 'hover' : state;

  const showRing = activeState === 'hover' || activeState === 'edition' || activeState === 'linkable';
  const showAnchors = activeState === 'edition' || activeState === 'linkable';
  const showActions = activeState === 'edition';
  const showLinkIcon = activeState === 'linkable';

  return (
    <div
      className="absolute select-none"
      style={{
        left: member.x,
        top: member.y,
        zIndex: 2,
        transition: isAnimating ? 'left 0.6s cubic-bezier(0.22, 1, 0.36, 1), top 0.6s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onDragStart?.(member.id, e);
      }}
      onClick={() => onSelect?.(member.id)}
      onMouseEnter={() => onHover?.(member.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Anchor points */}
      {showAnchors && (
        <>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card z-10" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card z-10" />
          <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card z-10" />
          <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card z-10" />
        </>
      )}

      {/* Card body */}
      <div
        className={`
          relative flex items-center gap-3 rounded-xl p-2 bg-card border shadow-card transition-all cursor-grab active:cursor-grabbing
          ${isColliding ? 'border-destructive ring-2 ring-destructive/30' : showRing ? 'border-primary ring-2 ring-primary/30' : 'border-border'}
        `}
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

        {/* Info */}
        <div className="whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">{member.firstName}</span>
            <span className="text-[11px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              {member.age} ans
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {member.birthYear}{member.deathYear ? ` - ${member.deathYear}` : ' -'}
          </div>
          <div className="text-xs text-muted-foreground">{member.profession}</div>
        </div>

        {/* Linkable icon */}
        {showLinkIcon && (
          <div className="ml-1 w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
            <Link className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Floating action buttons (Edition state) */}
      {showActions && (
        <div className="flex items-center gap-2 justify-center mt-2">
          <button
            onClick={(e) => { e.stopPropagation(); onCreateRelated?.(member.id); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-soft hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Create related member
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(member.id); }}
            className="w-8 h-8 rounded-full bg-card border border-border shadow-soft flex items-center justify-center hover:bg-accent transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-foreground" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MemberCard;
