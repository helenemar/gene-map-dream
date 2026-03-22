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

/** Build date label with unsure markers */
function getDateLabel(union: Union): string | null {
  const parts: string[] = [];

  const meetingYear = union.meetingYear;
  const eventYear = union.eventYear ?? union.marriageYear;
  const endYear = union.endYear ?? union.divorceYear;

  if (meetingYear) {
    const unsure = union.meetingYearUnsure ? '~' : '';
    parts.push(`R: ${unsure}${meetingYear}`);
  }
  if (eventYear) {
    const prefix =
      union.status === 'married' ? 'M' :
      union.status === 'divorced' ? 'D' :
      union.status === 'separated' ? 'S' :
      union.status === 'widowed' ? 'V' :
      union.status === 'common_law' ? 'UL' :
      union.status === 'love_affair' ? 'L' : 'E';
    const unsure = union.eventYearUnsure ? '~' : '';
    parts.push(`${prefix}: ${unsure}${eventYear}`);
  }
  if (endYear && !['separated', 'divorced', 'widowed'].includes(union.status)) {
    const unsure = union.endYearUnsure ? '~' : '';
    parts.push(`F: ${unsure}${endYear}`);
  }
  return parts.length > 0 ? parts.join('   ') : null;
}

function hasStatusIcon(status: UnionStatus): boolean {
  return ['divorced', 'separated', 'widowed', 'love_affair', 'common_law'].includes(status);
}

/*
 * ─── Atomic UnionBadge ─────────────────────────────────────────────
 */

const PILL_H = 32;
const PILL_RX = 16;
const PILL_PAD_X = 12;
const ICON_R = 14;
const ICON_D = ICON_R * 2;
const GAP = 4;
const FONT_SIZE = 11;

const UnionBadge: React.FC<UnionBadgeProps> = ({ union, x, y, onClick }) => {
  const label = getDateLabel(union);
  const showIcon = hasStatusIcon(union.status);
  const hasNotes = !!(union.notes && union.notes.trim().length > 0);

  if (!label && !showIcon && !hasNotes) return null;

  const pillW = label ? Math.max(label.length * 7.2 + PILL_PAD_X * 2, 56) : 0;
  const blockW = Math.max(pillW, showIcon ? ICON_D : 0);

  // Always place the pill ABOVE the union line
  const pillY = showIcon ? -(PILL_H + GAP) : 0;
  const iconCenterLocal = showIcon ? ICON_R : 0;

  const groupX = x - blockW / 2;
  // Position so that: with icon → icon centered on line, pill above; without icon → pill above line
  const EXTRA_LIFT = 10;
  const groupY = showIcon ? y - ICON_R - EXTRA_LIFT : y - PILL_H - GAP - EXTRA_LIFT;

  const stroke = 'hsl(var(--border))';
  const bg = 'hsl(var(--card))';

  return (
    <g
      transform={`translate(${groupX}, ${groupY})`}
      style={{ cursor: 'pointer', pointerEvents: 'auto' }}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
    >
      <defs>
        <filter id={`badge-shadow-${union.id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="rgba(0,0,0,0.08)" />
        </filter>
      </defs>

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
            strokeWidth={1.2}
            strokeOpacity={0.7}
            filter={`url(#badge-shadow-${union.id})`}
          />
          <text
            x={blockW / 2}
            y={pillY + PILL_H / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fill="hsl(var(--foreground))"
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

      {showIcon && (
        <>
          <circle
            cx={blockW / 2}
            cy={iconCenterLocal}
            r={ICON_R}
            fill={bg}
            stroke={stroke}
            strokeWidth={0.8}
            strokeOpacity={0.5}
          />
          <circle
            cx={blockW / 2}
            cy={iconCenterLocal + 0.5}
            r={ICON_R + 0.5}
            fill="none"
            stroke="hsla(0,0%,0%,0.06)"
            strokeWidth={1.5}
          />
          <g transform={`translate(${blockW / 2 - 8}, ${iconCenterLocal - 8})`}>
            <StatusIcon status={union.status} size={16} />
          </g>
        </>
      )}

      {hasNotes && (() => {
        const noteY = showIcon
          ? iconCenterLocal + ICON_R + 6
          : label
            ? pillY + PILL_H + 6
            : 0;
        const noteSize = 12;
        return (
          <g transform={`translate(${blockW / 2 - noteSize / 2}, ${noteY})`}>
            <rect
              x={-2}
              y={-2}
              width={noteSize + 4}
              height={noteSize + 4}
              rx={4}
              fill={bg}
              stroke={stroke}
              strokeWidth={0.6}
              strokeOpacity={0.4}
            />
            <svg width={noteSize} height={noteSize} viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              <path d="M10 13h4" />
              <path d="M10 17h4" />
            </svg>
          </g>
        );
      })()}
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
    eventYear: marriageYear,
    endYear,
    // Legacy compat
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
