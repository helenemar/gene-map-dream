import React from 'react';
import { FamilyMember, PATHOLOGIES } from '@/types/genogram';

interface MemberCardProps {
  member: FamilyMember;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onDragStart?: (id: string, e: React.MouseEvent) => void;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, isSelected, onSelect, onDragStart }) => {
  const isDeceased = !!member.deathYear;
  const memberPathologies = PATHOLOGIES.filter(p => member.pathologies.includes(p.id));

  const shapeClass = member.gender === 'male'
    ? 'rounded-sm'
    : 'rounded-full';

  return (
    <div
      className="absolute cursor-grab active:cursor-grabbing select-none"
      style={{ left: member.x, top: member.y }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onDragStart?.(member.id, e);
      }}
      onClick={() => onSelect?.(member.id)}
    >
      <div className={`flex items-center gap-3 ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''} rounded-xl p-1 transition-shadow`}>
        {/* Avatar shape */}
        <div className={`relative w-12 h-12 border-2 flex items-center justify-center shrink-0 ${shapeClass} ${isDeceased ? 'border-foreground/40' : 'border-foreground/20'} bg-card`}>
          {/* Pathology color quadrants */}
          {memberPathologies.length > 0 && (
            <div className={`absolute inset-0.5 overflow-hidden ${shapeClass}`}>
              {memberPathologies.map((p, i) => (
                <div
                  key={p.id}
                  className={`absolute bg-${p.color}`}
                  style={{
                    width: '50%',
                    height: '50%',
                    top: i < 2 ? 0 : '50%',
                    left: i % 2 === 0 ? 0 : '50%',
                  }}
                />
              ))}
            </div>
          )}
          {isDeceased && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-[2px] bg-foreground/40 rotate-45 absolute" />
              <div className="w-full h-[2px] bg-foreground/40 -rotate-45 absolute" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">{member.firstName}</span>
            <span className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              {member.age} ans
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {member.birthYear}{member.deathYear ? ` - ${member.deathYear}` : ' -'}
          </div>
          <div className="text-xs text-muted-foreground">{member.profession}</div>
        </div>
      </div>
    </div>
  );
};

export default MemberCard;
