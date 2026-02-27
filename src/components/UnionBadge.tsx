import React from 'react';
import { Union, UnionStatus } from '@/types/genogram';

interface UnionBadgeProps {
  union: Union;
  x: number;
  y: number;
  onClick?: () => void;
}

/** SVG status icon for the circular badge */
const StatusIcon: React.FC<{ status: UnionStatus; size?: number }> = ({ status, size = 20 }) => {
  const half = size / 2;
  const stroke = 'hsl(var(--foreground))';
  const sw = 1.8;

  switch (status) {
    case 'divorced':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <line x1={half - 4} y1={half + 5} x2={half + 1} y2={half - 5} stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <line x1={half - 1} y1={half + 5} x2={half + 4} y2={half - 5} stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case 'separated':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <line x1={half + 3} y1={half - 5} x2={half - 3} y2={half + 5} stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case 'widowed':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <line x1={half - 4} y1={half - 4} x2={half + 4} y2={half + 4} stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <line x1={half + 4} y1={half - 4} x2={half - 4} y2={half + 4} stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case 'love_affair':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <path
            d={`M ${half} ${half + 4} 
               C ${half - 1} ${half + 2}, ${half - 5} ${half - 1}, ${half - 4} ${half - 3}
               C ${half - 3} ${half - 5}, ${half} ${half - 5}, ${half} ${half - 2}
               C ${half} ${half - 5}, ${half + 3} ${half - 5}, ${half + 4} ${half - 3}
               C ${half + 5} ${half - 1}, ${half + 1} ${half + 2}, ${half} ${half + 4} Z`}
            fill="none"
            stroke={stroke}
            strokeWidth={1.2}
            strokeDasharray="2 1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'common_law':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={half} cy={half} r={4} fill="none" stroke={stroke} strokeWidth={sw} />
        </svg>
      );
    default:
      return null;
  }
};

/** Get label for the date row: R = Rencontre/Marriage, V = Veuvage, D = Divorce, S = Séparation */
function getDateLabel(union: Union): string | null {
  const parts: string[] = [];
  if (union.marriageYear) parts.push(`R: ${union.marriageYear}`);
  if (union.divorceYear) {
    const prefix =
      union.status === 'widowed' ? 'V' :
      union.status === 'divorced' ? 'D' :
      union.status === 'separated' ? 'S' : 'V';
    parts.push(`${prefix}: ${union.divorceYear}`);
  }
  return parts.length > 0 ? parts.join('    ') : null;
}

/** Check if a status needs a visual icon overlay */
function hasStatusIcon(status: UnionStatus): boolean {
  return ['divorced', 'separated', 'widowed', 'love_affair', 'common_law'].includes(status);
}

const UnionBadge: React.FC<UnionBadgeProps> = ({ union, x, y, onClick }) => {
  const label = getDateLabel(union);
  const showIcon = hasStatusIcon(union.status);

  if (!label && !showIcon) return null;

  const badgeWidth = label ? (label.length > 12 ? 130 : 80) : 0;
  const badgeHeight = 22;
  const iconSize = 28;
  const totalHeight = (label ? badgeHeight + 4 : 0) + (showIcon ? iconSize + 2 : 0);

  // Position: center badge on the union line point, shifted below
  const baseY = y + 6;

  return (
    <foreignObject
      x={x - Math.max(badgeWidth, iconSize) / 2 - 4}
      y={baseY}
      width={Math.max(badgeWidth, iconSize) + 8}
      height={totalHeight + 8}
      style={{ overflow: 'visible', pointerEvents: 'auto' }}
    >
      <div
        className="flex flex-col items-center gap-1 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        {/* Text pill */}
        {label && (
          <div
            className="inline-flex items-center justify-center rounded-full bg-card border border-border/60 shadow-sm hover:shadow-md hover:border-foreground/20 transition-all duration-150 select-none px-2.5"
            style={{ height: `${badgeHeight}px`, fontSize: '10px', lineHeight: '14px', whiteSpace: 'nowrap' }}
          >
            <span className="text-muted-foreground font-medium tracking-wide">{label}</span>
          </div>
        )}

        {/* Status icon circle */}
        {showIcon && (
          <div
            className="flex items-center justify-center rounded-full bg-card border border-border/50 shadow-soft hover:shadow-md transition-all duration-150"
            style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
          >
            <StatusIcon status={union.status} size={18} />
          </div>
        )}
      </div>
    </foreignObject>
  );
};

export default UnionBadge;

/* ── Design System Preview ─────────────────────────────────── */

export const UnionBadgePreview: React.FC<{ status: UnionStatus; marriageYear?: number; endYear?: number }> = ({
  status,
  marriageYear = 1981,
  endYear,
}) => {
  const union: Union = {
    id: 'preview',
    partner1: '',
    partner2: '',
    status,
    marriageYear,
    divorceYear: endYear,
    children: [],
  };

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Text pill */}
      {(marriageYear || endYear) && (
        <div
          className="inline-flex items-center justify-center rounded-full bg-card border border-border/60 shadow-sm px-2.5 select-none"
          style={{ height: '22px', fontSize: '10px', lineHeight: '14px', whiteSpace: 'nowrap' }}
        >
          <span className="text-muted-foreground font-medium tracking-wide">
            {getDateLabel(union)}
          </span>
        </div>
      )}

      {/* Status icon */}
      {hasStatusIcon(status) && (
        <div
          className="flex items-center justify-center rounded-full bg-card border border-border/50 shadow-soft"
          style={{ width: '28px', height: '28px' }}
        >
          <StatusIcon status={status} size={18} />
        </div>
      )}
    </div>
  );
};
