import React from 'react';
import { Union, UnionStatus } from '@/types/genogram';
import { Gem, HeartCrack, Unlink } from 'lucide-react';

interface RelationshipBadgeProps {
  union: Union;
  x: number;
  y: number;
  /** Offset badge above slash marks for divorce/separation */
  offsetForMark?: boolean;
  onClick?: () => void;
}

const STATUS_CONFIG: Record<UnionStatus, { icon: React.ReactNode; label: string }> = {
  married: { icon: <Gem size={10} />, label: 'Mariage' },
  common_law: { icon: <Gem size={10} />, label: 'Union libre' },
  separated: { icon: <HeartCrack size={10} />, label: 'Séparation' },
  divorced: { icon: <Unlink size={10} />, label: 'Divorce' },
  widowed: { icon: <Gem size={10} />, label: 'Veuvage' },
};

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

  const config = STATUS_CONFIG[union.status];
  // Shift badge above slash marks for separated/divorced
  const yOffset = offsetForMark ? -18 : 14;

  const items: { icon: React.ReactNode; text: string }[] = [];
  if (hasMarriage) {
    items.push({ icon: <Gem size={10} className="shrink-0" />, text: `${union.marriageYear}` });
  }
  if (hasDivorce) {
    items.push({ icon: <HeartCrack size={10} className="shrink-0" />, text: `${union.divorceYear}` });
  }

  const badgeWidth = items.length === 1 ? 68 : 130;
  const badgeHeight = 22;

  return (
    <foreignObject
      x={x - badgeWidth / 2}
      y={y + yOffset - badgeHeight / 2}
      width={badgeWidth}
      height={badgeHeight}
      style={{ overflow: 'visible', pointerEvents: 'auto' }}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-background border border-border shadow-sm cursor-pointer hover:shadow-md hover:border-foreground/20 transition-all duration-150 select-none"
        style={{ fontSize: '10px', lineHeight: '14px', whiteSpace: 'nowrap' }}
      >
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-0.5 text-muted-foreground">
            {item.icon}
            <span className="font-medium">{item.text}</span>
          </span>
        ))}
      </div>
    </foreignObject>
  );
};

export default RelationshipBadge;
