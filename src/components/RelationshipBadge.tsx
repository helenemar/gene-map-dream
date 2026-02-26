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
  const hasMarriage = !!union.marriageYear;
  const hasDivorce = !!union.divorceYear;
  if (!hasMarriage && !hasDivorce) return null;

  // Build label: "R: 1981  V: 2018"
  const parts: string[] = [];
  if (hasMarriage) parts.push(`R: ${union.marriageYear}`);
  if (hasDivorce) parts.push(`V: ${union.divorceYear}`);
  const label = parts.join('    ');

  const badgeWidth = parts.length === 1 ? 64 : 120;
  const badgeHeight = 24;
  // Place above status marks for divorce/separation, else below line
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
