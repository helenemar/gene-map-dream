import React from 'react';
import { Union, UnionStatus } from '@/types/genogram';

interface UnionBadgeProps {
  union: Union;
  x: number;
  y: number;
  onClick?: () => void;
}

/** SVG status icon for the circular badge */
export const StatusIcon: React.FC<{ status: UnionStatus; size?: number }> = ({ status, size = 20 }) => {
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

/** Get label for the date row */
function getDateLabel(union: Union): string | null {
  const parts: string[] = [];
  if (union.marriageYear) {
    const prefix = union.status === 'married' ? 'M' : 'R';
    parts.push(`${prefix}: ${union.marriageYear}`);
  }
  if (union.divorceYear) {
    const prefix =
      union.status === 'widowed' ? 'V' :
      union.status === 'divorced' ? 'D' :
      union.status === 'separated' ? 'S' : 'V';
    parts.push(`${prefix}: ${union.divorceYear}`);
  }
  return parts.length > 0 ? parts.join('   ') : null;
}

function hasStatusIcon(status: UnionStatus): boolean {
  return ['divorced', 'separated', 'widowed', 'love_affair', 'common_law'].includes(status);
}

/*
 * ─── Atomic UnionBadge ─────────────────────────────────────────────
 *
 * Renders a SINGLE fused vertical block centered exactly on the union
 * line midpoint (x, y). The pill sits on top, and the icon circle
 * overlaps the pill's bottom edge so they read as one object.
 *
 * The entire group uses a pure-SVG approach (rect + text + circle)
 * to avoid foreignObject alignment quirks across browsers.
 */

const PILL_H = 32;
const PILL_RX = 16;
const PILL_PAD_X = 12;   // horizontal padding each side
const ICON_R = 14;       // circle radius
const ICON_D = ICON_R * 2;
const OVERLAP = 0;
const GAP = 4;           // gap between pill bottom and icon top
const FONT_SIZE = 11;

const UnionBadge: React.FC<UnionBadgeProps> = ({ union, x, y, onClick }) => {
  const label = getDateLabel(union);
  const showIcon = hasStatusIcon(union.status);

  if (!label && !showIcon) return null;

  // Hug-content width: char width × count + padding (7.2px per char at font-size 11)
  const pillW = label ? Math.max(label.length * 7.2 + PILL_PAD_X * 2, 56) : 0;
  const blockW = Math.max(pillW, showIcon ? ICON_D : 0);

  // Layout: icon center ON the union line Y, pill ABOVE with a gap
  const pillY = showIcon ? -(PILL_H + GAP) : 0;
  const iconCenterLocal = showIcon ? ICON_R : 0;

  // Group positioned so icon center aligns with line Y
  const groupX = x - blockW / 2;
  const groupY = showIcon ? y - ICON_R : y - PILL_H / 2;

  const stroke = 'hsl(var(--border))';
  const bg = 'hsl(var(--card))';

  return (
    <g
      transform={`translate(${groupX}, ${groupY})`}
      style={{ cursor: 'pointer', pointerEvents: 'auto' }}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
    >
      {/* Drop shadow filter */}
      <defs>
        <filter id={`badge-shadow-${union.id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="rgba(0,0,0,0.08)" />
        </filter>
      </defs>

      {/* ── Date pill ── */}
      {label && (
        <>
          <rect
            x={(blockW - pillW) / 2}
            y={pillY}
            width={pillW}
            height={PILL_H}
            rx={PILL_RX}
            fill={bg}
            stroke={stroke}
            strokeWidth={0.8}
            strokeOpacity={0.4}
            filter={`url(#badge-shadow-${union.id})`}
          />
          <text
            x={blockW / 2}
            y={pillY + PILL_H / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fill="hsl(var(--muted-foreground))"
            fontSize={FONT_SIZE}
            fontWeight={600}
            fontFamily="Inter, system-ui, -apple-system, sans-serif"
            letterSpacing="0.03em"
            style={{ userSelect: 'none' }}
          >
            {label}
          </text>
        </>
      )}

      {/* ── Icon circle (overlapping pill bottom) ── */}
      {showIcon && (
        <>
          {/* White opaque background — hides the union line behind it */}
          <circle
            cx={blockW / 2}
            cy={iconCenterLocal}
            r={ICON_R}
            fill={bg}
            stroke={stroke}
            strokeWidth={0.8}
            strokeOpacity={0.5}
          />
          {/* Drop shadow simulation */}
          <circle
            cx={blockW / 2}
            cy={iconCenterLocal + 0.5}
            r={ICON_R + 0.5}
            fill="none"
            stroke="hsla(0,0%,0%,0.06)"
            strokeWidth={1.5}
          />
          {/* Icon positioned inside the circle */}
          <g transform={`translate(${blockW / 2 - 8}, ${iconCenterLocal - 8})`}>
            <StatusIcon status={union.status} size={16} />
          </g>
        </>
      )}
    </g>
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

  const label = getDateLabel(union);
  const showIcon = hasStatusIcon(status);
  const pillW = label ? Math.max(label.length * 6.8 + PILL_PAD_X * 2, 56) : 0;
  const blockW = Math.max(pillW, showIcon ? ICON_D : 0, 50);
  const totalH = (label ? PILL_H : 0) + (showIcon ? ICON_D + (label ? GAP : 0) : 0);

  return (
    <svg width={blockW + 8} height={totalH + 8} className="shrink-0">
      <g transform="translate(4, 4)">
        {label && (
          <>
            <rect
              x={(blockW - pillW) / 2}
              y={0}
              width={pillW}
              height={PILL_H}
              rx={PILL_RX}
              fill="hsl(var(--card))"
              stroke="hsl(var(--border))"
              strokeWidth={0.8}
              strokeOpacity={0.5}
            />
            <text
              x={blockW / 2}
              y={PILL_H / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fill="hsl(var(--muted-foreground))"
              fontSize={FONT_SIZE}
              fontWeight={600}
              fontFamily="Inter, system-ui, -apple-system, sans-serif"
              letterSpacing="0.03em"
            >
              {label}
            </text>
          </>
        )}
        {showIcon && (() => {
          const iconCY = label ? PILL_H + GAP + ICON_R : ICON_R;
          return (
            <>
              <circle
                cx={blockW / 2}
                cy={iconCY}
                r={ICON_R}
                fill="hsl(var(--card))"
                stroke="hsl(var(--border))"
                strokeWidth={0.8}
                strokeOpacity={0.5}
              />
              <g transform={`translate(${blockW / 2 - 8}, ${iconCY - 8})`}>
                <StatusIcon status={status} size={16} />
              </g>
            </>
          );
        })()}
      </g>
    </svg>
  );
};
