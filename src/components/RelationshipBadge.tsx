import React from 'react';
import { Union } from '@/types/genogram';

interface RelationshipBadgeProps {
  union: Union;
  x: number;
  y: number;
  /** Offset badge above slash marks for divorce/separation */
  offsetForMark?: boolean;
  onClick?: () => void;
}

const RelationshipBadge: React.FC<RelationshipBadgeProps> = ({
  union,
  x,
  y,
  offsetForMark = false,
  onClick,
}) => {
  const meetingYear = union.meetingYear;
  const eventYear = union.eventYear ?? union.marriageYear;
  const endYear = union.endYear ?? union.divorceYear;

  const hasAny = !!meetingYear || !!eventYear || !!endYear;
  if (!hasAny) return null;

  const parts: string[] = [];
  if (meetingYear) {
    const u = union.meetingYearUnsure ? '~' : '';
    parts.push(`R: ${u}${meetingYear}`);
  }
  if (eventYear) {
    const prefix = union.status === 'married' ? 'M' : 'E';
    const u = union.eventYearUnsure ? '~' : '';
    parts.push(`${prefix}: ${u}${eventYear}`);
  }
  if (endYear) {
    const u = union.endYearUnsure ? '~' : '';
    parts.push(`F: ${u}${endYear}`);
  }
  const label = parts.join('    ');

  const badgeWidth = parts.length <= 1 ? 64 : parts.length === 2 ? 120 : 180;
  const badgeHeight = 24;
  const yOffset = offsetForMark ? -22 : -badgeHeight / 2;

  return (
    <foreignObject
      x={x - badgeWidth / 2}
      y={y + yOffset}
      width={badgeWidth}
      height={badgeHeight}
      style={{ overflow: 'visible', pointerEvents: 'auto' }}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        className="inline-flex items-center justify-center w-full h-full rounded-full bg-background border border-border/60 shadow-sm cursor-pointer hover:shadow-md hover:border-foreground/20 transition-all duration-150 select-none"
        style={{ fontSize: '10px', lineHeight: '14px', whiteSpace: 'nowrap' }}
      >
        <span className="text-muted-foreground font-medium tracking-wide">{label}</span>
      </div>
    </foreignObject>
  );
};

export default RelationshipBadge;
