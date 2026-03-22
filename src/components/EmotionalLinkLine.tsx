import React, { useState } from 'react';
import { Pencil } from 'lucide-react';
import { EmotionalLinkType } from '@/types/genogram';

interface CardRect {
  x: number;
  y: number;
  w: number;
  h: number;
  id: string;
}

interface EmotionalLinkLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: EmotionalLinkType;
  /** Index of this link within the same pair group (0-based) */
  linkIndex?: number;
  /** Total count of links between the same pair */
  linkCount?: number;
  /** Card rects for collision avoidance */
  cardRects?: CardRect[];
  /** IDs of the two connected members (to exclude from collision) */
  excludeIds?: [string, string];
  onClick?: () => void;
  /** When true, dim this link (card hover mode) */
  dimmed?: boolean;
  /** When true, highlight this link (search match) — overrides dimmed */
  searchHighlighted?: boolean;
  /** When true and not highlighted, heavy dim for search context */
  searchDimmed?: boolean;
}

// ─── Core Bézier Math ───────────────────────────────────────────────

/**
 * Compute quadratic Bézier control point M using the perpendicular formula:
 *   P = midpoint of A→B
 *   M.x = P.x − (y2−y1) × curvature
 *   M.y = P.y + (x2−x1) × curvature
 *
 * The curvature is dynamic:
 *  - Base curvature scales with distance (longer → wider arc)
 *  - Each additional link between the same pair increments by 0.1
 *  - If the straight line A→B crosses a card, curvature ≥ 0.4
 */
function computeControlPoint(
  x1: number, y1: number, x2: number, y2: number,
  linkIndex: number, linkCount: number,
  cardRects: CardRect[], excludeIds: [string, string]
) {
  const px = (x1 + x2) / 2;
  const py = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Base curvature — scales gently with distance for elegant arcs
  let baseCurvature = 0.2 + Math.min(dist * 0.00015, 0.15);

  // Collision check: does segment A→B pass through any card?
  const hasCollision = cardRects.some(r => {
    if (excludeIds.includes(r.id)) return false;
    return segmentIntersectsRect(x1, y1, x2, y2, r.x, r.y, r.w, r.h);
  });
  if (hasCollision) {
    baseCurvature = Math.max(baseCurvature, 0.4);
  }

  // "Onion" offset: alternate sign, increment by 0.1 per link
  const offsetIndex = linkCount <= 1
    ? 0
    : linkIndex - (linkCount - 1) / 2;
  const curvature = baseCurvature + offsetIndex * 0.1;

  const mx = px - dy * curvature;
  const my = py + dx * curvature;

  return { mx, my, px, py, dist };
}

/** Check if line segment (ax,ay)→(bx,by) intersects an axis-aligned rectangle */
function segmentIntersectsRect(
  ax: number, ay: number, bx: number, by: number,
  rx: number, ry: number, rw: number, rh: number
): boolean {
  // Liang–Barsky clipping
  const dx = bx - ax;
  const dy = by - ay;
  const p = [-dx, dx, -dy, dy];
  const q = [ax - rx, rx + rw - ax, ay - ry, ry + rh - ay];
  let u0 = 0, u1 = 1;
  for (let i = 0; i < 4; i++) {
    if (Math.abs(p[i]) < 1e-9) {
      if (q[i] < 0) return false;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) { if (t > u0) u0 = t; }
      else { if (t < u1) u1 = t; }
    }
  }
  return u0 <= u1;
}

// ─── SVG Path Builders ──────────────────────────────────────────────

function qPath(x1: number, y1: number, mx: number, my: number, x2: number, y2: number) {
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
}

/** Parallel Bézier at perpendicular offset */
function parallelQ(
  x1: number, y1: number, mx: number, my: number, x2: number, y2: number,
  offset: number
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return qPath(x1, y1, mx, my, x2, y2);
  const px = (-dy / len) * offset;
  const py = (dx / len) * offset;
  return qPath(x1 + px, y1 + py, mx + px, my + py, x2 + px, y2 + py);
}

/** Zigzag polyline following the Bézier curve */
function zigzagQ(
  x1: number, y1: number, mx: number, my: number, x2: number, y2: number,
  amplitude: number, segments: number, lineOffset = 0
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return `${x1},${y1}`;

  // Apply line offset perpendicular
  let ox1 = x1, oy1 = y1, ox2 = x2, oy2 = y2, omx = mx, omy = my;
  if (lineOffset !== 0) {
    const px = (-dy / len) * lineOffset;
    const py = (dx / len) * lineOffset;
    ox1 += px; oy1 += py; ox2 += px; oy2 += py; omx += px; omy += py;
  }

  const pts: string[] = [];
  for (let i = 0; i <= segments + 1; i++) {
    const t = i / (segments + 1);
    const bx = (1 - t) * (1 - t) * ox1 + 2 * (1 - t) * t * omx + t * t * ox2;
    const by = (1 - t) * (1 - t) * oy1 + 2 * (1 - t) * t * omy + t * t * oy2;

    if (i === 0 || i === segments + 1) {
      pts.push(`${bx},${by}`);
    } else {
      const tx = 2 * ((1 - t) * (omx - ox1) + t * (ox2 - omx));
      const ty = 2 * ((1 - t) * (omy - oy1) + t * (oy2 - omy));
      const tlen = Math.sqrt(tx * tx + ty * ty);
      if (tlen === 0) { pts.push(`${bx},${by}`); continue; }
      const nx = -ty / tlen;
      const ny = tx / tlen;
      const dir = i % 2 === 1 ? 1 : -1;
      pts.push(`${bx + nx * amplitude * dir},${by + ny * amplitude * dir}`);
    }
  }
  return pts.join(' ');
}

/** Arrow head following Bézier tangent at endpoint */
function arrowHead(
  x2: number, y2: number, mx: number, my: number,
  size: number, color: string
) {
  // tangent at t=1: 2*(B - M)
  const tx = 2 * (x2 - mx);
  const ty = 2 * (y2 - my);
  const len = Math.sqrt(tx * tx + ty * ty);
  if (len === 0) return null;
  const ux = tx / len;
  const uy = ty / len;
  const px = -uy;
  const py = ux;
  const left = { x: x2 - ux * size + px * size * 0.5, y: y2 - uy * size + py * size * 0.5 };
  const right = { x: x2 - ux * size - px * size * 0.5, y: y2 - uy * size - py * size * 0.5 };
  return (
    <polygon
      points={`${x2},${y2} ${left.x},${left.y} ${right.x},${right.y}`}
      fill={color}
    />
  );
}

// ─── Main Component ─────────────────────────────────────────────────

const EmotionalLinkLine: React.FC<EmotionalLinkLineProps> = ({
  x1, y1, x2, y2, type, onClick,
  linkIndex = 0, linkCount = 1,
  cardRects = [], excludeIds = ['', ''],
  dimmed = false,
  searchHighlighted = false,
  searchDimmed = false,
}) => {
  const [hovered, setHovered] = useState(false);

  const mainPath = `M ${x1} ${y1} L ${x2} ${y2}`;
  const segments = 16;
  const amp = 6;

  // Straight-line helpers
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const ux = dist > 0 ? dx / dist : 1;
  const uy = dist > 0 ? dy / dist : 0;
  const px = -uy; // perpendicular
  const py = ux;

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  function parallelLine(offset: number) {
    return `M ${x1 + px * offset} ${y1 + py * offset} L ${x2 + px * offset} ${y2 + py * offset}`;
  }

  function zigzagStraight(amplitude: number, segs: number, lineOffset = 0) {
    const ox1 = x1 + px * lineOffset, oy1 = y1 + py * lineOffset;
    const ox2 = x2 + px * lineOffset, oy2 = y2 + py * lineOffset;
    const odx = ox2 - ox1, ody = oy2 - oy1;
    const pts: string[] = [];
    for (let i = 0; i <= segs + 1; i++) {
      const t = i / (segs + 1);
      const bx = ox1 + odx * t;
      const by = oy1 + ody * t;
      if (i === 0 || i === segs + 1) {
        pts.push(`${bx},${by}`);
      } else {
        const dir = i % 2 === 1 ? 1 : -1;
        pts.push(`${bx + px * amplitude * dir},${by + py * amplitude * dir}`);
      }
    }
    return pts.join(' ');
  }

  function straightArrowHead(size: number, color: string) {
    if (dist === 0) return null;
    const left = { x: x2 - ux * size + px * size * 0.5, y: y2 - uy * size + py * size * 0.5 };
    const right = { x: x2 - ux * size - px * size * 0.5, y: y2 - uy * size - py * size * 0.5 };
    return <polygon points={`${x2},${y2} ${left.x},${left.y} ${right.x},${right.y}`} fill={color} />;
  }

  const renderLine = () => {
    switch (type) {
      case 'fusional':
        return (
          <>
            <path d={parallelLine(2)} fill="none" stroke="hsl(var(--link-fusional))" strokeWidth={2} />
            <path d={parallelLine(-2)} fill="none" stroke="hsl(var(--link-fusional))" strokeWidth={2} />
          </>
        );
      case 'distant':
        return <path d={mainPath} fill="none" stroke="hsl(var(--link-distant))" strokeWidth={2} strokeDasharray="8 5" />;
      case 'conflictual':
        return (
          <>
            <path d={parallelLine(2.5)} fill="none" stroke="hsl(var(--link-conflictual))" strokeWidth={2} strokeDasharray="8 5" />
            <path d={parallelLine(-2.5)} fill="none" stroke="hsl(var(--link-conflictual))" strokeWidth={2} strokeDasharray="8 5" />
          </>
        );
      case 'ambivalent':
        return (
          <>
            <path d={mainPath} fill="none" stroke="hsl(var(--link-ambivalent))" strokeWidth={2} />
            <polyline points={zigzagStraight(amp, segments)} fill="none" stroke="hsl(var(--link-conflictual))" strokeWidth={2} />
          </>
        );
      case 'cutoff': {
        const barGap = 4;
        const barH = 10;
        return (
          <>
            <path d={mainPath} fill="none" stroke="hsl(var(--link-cutoff))" strokeWidth={2} strokeDasharray="4 3" />
            <line
              x1={midX - ux * barGap + px * barH} y1={midY - uy * barGap + py * barH}
              x2={midX - ux * barGap - px * barH} y2={midY - uy * barGap - py * barH}
              stroke="hsl(var(--link-cutoff))" strokeWidth={2} />
            <line
              x1={midX + ux * barGap + px * barH} y1={midY + uy * barGap + py * barH}
              x2={midX + ux * barGap - px * barH} y2={midY + uy * barGap - py * barH}
              stroke="hsl(var(--link-cutoff))" strokeWidth={2} />
          </>
        );
      }
      case 'violence':
        return <polyline points={zigzagStraight(amp, segments)} fill="none" stroke="hsl(var(--link-violence))" strokeWidth={2} />;
      case 'emotional_abuse':
        return (
          <>
            <polyline points={zigzagStraight(amp * 0.8, segments, 0)} fill="none" stroke="hsl(var(--link-emotional-abuse))" strokeWidth={2} />
            <polyline points={zigzagStraight(amp * 0.8, segments, 5)} fill="none" stroke="hsl(var(--link-emotional-abuse))" strokeWidth={2} />
            <polyline points={zigzagStraight(amp * 0.8, segments, -5)} fill="none" stroke="hsl(var(--link-emotional-abuse))" strokeWidth={2} />
          </>
        );
      case 'physical_violence':
        return (
          <>
            <path d={mainPath} fill="none" stroke="hsl(var(--link-physical-violence))" strokeWidth={2} />
            <polyline points={zigzagStraight(amp, segments)} fill="none" stroke="hsl(var(--link-physical-violence))" strokeWidth={2} strokeOpacity={0.7} />
          </>
        );
      case 'sexual_abuse':
        return (
          <>
            {[-7, -2.5, 2.5, 7].map((off, i) => (
              <polyline key={i}
                points={zigzagStraight(amp * 0.7, segments, off)}
                fill="none" stroke="hsl(var(--link-sexual-abuse))" strokeWidth={2} />
            ))}
          </>
        );
      case 'neglect':
        return (
          <>
            <path d={mainPath} fill="none" stroke="hsl(var(--link-neglect))" strokeWidth={2} />
            {straightArrowHead(8, 'hsl(var(--link-neglect))')}
          </>
        );
      case 'controlling': {
        const sq = 8;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        return (
          <>
            <path d={mainPath} fill="none" stroke="hsl(var(--link-controlling))" strokeWidth={2} />
            <rect
              x={midX - sq} y={midY - sq} width={sq * 2} height={sq * 2}
              fill="hsl(var(--background))" stroke="hsl(var(--link-controlling))" strokeWidth={2}
              transform={`rotate(${angle}, ${midX}, ${midY})`}
            />
            <line x1={midX - sq * 0.6} y1={midY - sq * 0.6} x2={midX + sq * 0.6} y2={midY + sq * 0.6}
              stroke="hsl(var(--link-controlling))" strokeWidth={2} transform={`rotate(${angle}, ${midX}, ${midY})`} />
            <line x1={midX + sq * 0.6} y1={midY - sq * 0.6} x2={midX - sq * 0.6} y2={midY + sq * 0.6}
              stroke="hsl(var(--link-controlling))" strokeWidth={2} transform={`rotate(${angle}, ${midX}, ${midY})`} />
            {straightArrowHead(8, 'hsl(var(--link-controlling))')}
          </>
        );
      }
      default:
        return null;
    }
  };

  const vizMidX = midX;
  const vizMidY = midY;

  return (
    <g
      className="cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Invisible fat hit area */}
      <path d={mainPath} fill="none" stroke="transparent" strokeWidth={20} />
      {/* Bridge halo — removed for hollow/transparent look */}
      {/* Glow filter for hover */}
      {hovered && (
        <defs>
          <filter id={`glow-${type}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}
      {/* Rendered line — thicker on hover with glow */}
      <g
        style={{
          opacity: searchHighlighted
            ? (hovered ? 1 : 0.95)
            : searchDimmed
              ? 0.06
              : dimmed
                ? 0.1
                : (hovered ? 0.9 : 0.55),
          strokeWidth: searchHighlighted ? 2 : (hovered ? 1.8 : undefined),
          filter: (hovered || searchHighlighted) ? `url(#glow-${type})` : 'none',
        }}
        className="transition-all duration-150"
      >
        {renderLine()}
      </g>
      {/* Hover edit icon */}
      {hovered && (
        <foreignObject x={vizMidX - 14} y={vizMidY - 14} width={28} height={28}>
          <div className="w-7 h-7 rounded-full bg-card border border-border shadow-soft flex items-center justify-center">
            <Pencil className="w-3.5 h-3.5 text-foreground" />
          </div>
        </foreignObject>
      )}
    </g>
  );
};

export default EmotionalLinkLine;

// ─── Static Preview (Design System) ─────────────────────────────────

export const EmotionalLinkPreview: React.FC<{ type: EmotionalLinkType; width?: number; height?: number }> = ({
  type, width = 200, height = 32,
}) => {
  const pad = 10;
  return (
    <svg width={width} height={height} className="shrink-0">
      <EmotionalLinkLineStatic x1={pad} y1={height / 2} x2={width - pad} y2={height / 2} type={type} />
    </svg>
  );
};

/** Non-interactive straight-line preview for design system */
const EmotionalLinkLineStatic: React.FC<{
  x1: number; y1: number; x2: number; y2: number; type: EmotionalLinkType;
}> = ({ x1, y1, x2, y2, type }) => {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const segments = 16;
  const amp = 5;

  function parallelLine(lx1: number, ly1: number, lx2: number, ly2: number, offset: number) {
    const dx = lx2 - lx1;
    const dy = ly2 - ly1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return { x1: lx1, y1: ly1, x2: lx2, y2: ly2 };
    const px = (-dy / len) * offset;
    const py = (dx / len) * offset;
    return { x1: lx1 + px, y1: ly1 + py, x2: lx2 + px, y2: ly2 + py };
  }

  function zigzagPath(ax1: number, ay1: number, ax2: number, ay2: number, a: number, s: number): string {
    const dx = ax2 - ax1;
    const dy = ay2 - ay1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return `M ${ax1} ${ay1}`;
    const ux = dx / len;
    const uy = dy / len;
    const px = -uy;
    const py = ux;
    const pts: string[] = [`${ax1},${ay1}`];
    for (let i = 1; i <= s; i++) {
      const t = i / (s + 1);
      const bx = ax1 + dx * t;
      const by = ay1 + dy * t;
      const dir = i % 2 === 1 ? 1 : -1;
      pts.push(`${bx + px * a * dir},${by + py * a * dir}`);
    }
    pts.push(`${ax2},${ay2}`);
    return pts.join(' ');
  }

  function zigzagPathOffset(ax1: number, ay1: number, ax2: number, ay2: number, a: number, s: number, offset: number): string {
    const p = parallelLine(ax1, ay1, ax2, ay2, offset);
    return zigzagPath(p.x1, p.y1, p.x2, p.y2, a, s);
  }

  function staticArrowHead(ex2: number, ey2: number, ex1: number, ey1: number, size: number, color: string) {
    const dx = ex2 - ex1;
    const dy = ey2 - ey1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return null;
    const ux = dx / len;
    const uy = dy / len;
    const px = -uy;
    const py = ux;
    const left = { x: ex2 - ux * size + px * size * 0.5, y: ey2 - uy * size + py * size * 0.5 };
    const right = { x: ex2 - ux * size - px * size * 0.5, y: ey2 - uy * size - py * size * 0.5 };
    return <polygon points={`${ex2},${ey2} ${left.x},${left.y} ${right.x},${right.y}`} fill={color} />;
  }

  switch (type) {
    case 'fusional': {
      const l1 = parallelLine(x1, y1, x2, y2, 2);
      const l2 = parallelLine(x1, y1, x2, y2, -2);
      return (<g><line {...l1} stroke="hsl(var(--link-fusional))" strokeWidth={2} /><line {...l2} stroke="hsl(var(--link-fusional))" strokeWidth={2} /></g>);
    }
    case 'distant':
      return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--link-distant))" strokeWidth={2} strokeDasharray="8 5" />;
    case 'conflictual': {
      const l1 = parallelLine(x1, y1, x2, y2, 2.5);
      const l2 = parallelLine(x1, y1, x2, y2, -2.5);
      return (<g><line {...l1} stroke="hsl(var(--link-conflictual))" strokeWidth={2} strokeDasharray="8 5" /><line {...l2} stroke="hsl(var(--link-conflictual))" strokeWidth={2} strokeDasharray="8 5" /></g>);
    }
    case 'ambivalent':
      return (<g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--link-ambivalent))" strokeWidth={2} /><polyline points={zigzagPath(x1, y1, x2, y2, amp, segments)} fill="none" stroke="hsl(var(--link-conflictual))" strokeWidth={2} /></g>);
    case 'cutoff': {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const ux = len > 0 ? dx / len : 1;
      const uy = len > 0 ? dy / len : 0;
      const px = -uy;
      const py = ux;
      const barGap = 4;
      const barH = 8;
      return (<g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--link-cutoff))" strokeWidth={2} strokeDasharray="4 3" />
        <line x1={midX - ux * barGap + px * barH} y1={midY - uy * barGap + py * barH} x2={midX - ux * barGap - px * barH} y2={midY - uy * barGap - py * barH} stroke="hsl(var(--link-cutoff))" strokeWidth={2} />
        <line x1={midX + ux * barGap + px * barH} y1={midY + uy * barGap + py * barH} x2={midX + ux * barGap - px * barH} y2={midY + uy * barGap - py * barH} stroke="hsl(var(--link-cutoff))" strokeWidth={2} />
      </g>);
    }
    case 'violence':
      return <polyline points={zigzagPath(x1, y1, x2, y2, amp, segments)} fill="none" stroke="hsl(var(--link-violence))" strokeWidth={2} />;
    case 'emotional_abuse':
      return (<g>{[-4, 0, 4].map((off, i) => (<polyline key={i} points={zigzagPathOffset(x1, y1, x2, y2, amp * 0.7, segments, off)} fill="none" stroke="hsl(var(--link-emotional-abuse))" strokeWidth={2} />))}</g>);
    case 'physical_violence':
      return (<g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--link-physical-violence))" strokeWidth={2} /><polyline points={zigzagPath(x1, y1, x2, y2, amp, segments)} fill="none" stroke="hsl(var(--link-physical-violence))" strokeWidth={2} strokeOpacity={0.7} /></g>);
    case 'sexual_abuse':
      return (<g>{[-6, -2, 2, 6].map((off, i) => (<polyline key={i} points={zigzagPathOffset(x1, y1, x2, y2, amp * 0.6, segments, off)} fill="none" stroke="hsl(var(--link-sexual-abuse))" strokeWidth={2} />))}</g>);
    case 'neglect':
      return (<g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--link-neglect))" strokeWidth={2} />{staticArrowHead(x2, y2, x1, y1, 7, 'hsl(var(--link-neglect))')}</g>);
    case 'controlling': {
      const sq = 6;
      return (<g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--link-controlling))" strokeWidth={2} />
        <rect x={midX - sq} y={midY - sq} width={sq * 2} height={sq * 2} fill="hsl(var(--background))" stroke="hsl(var(--link-controlling))" strokeWidth={2} />
        <line x1={midX - sq * 0.6} y1={midY - sq * 0.6} x2={midX + sq * 0.6} y2={midY + sq * 0.6} stroke="hsl(var(--link-controlling))" strokeWidth={2} />
        <line x1={midX + sq * 0.6} y1={midY - sq * 0.6} x2={midX - sq * 0.6} y2={midY + sq * 0.6} stroke="hsl(var(--link-controlling))" strokeWidth={2} />
        {staticArrowHead(x2, y2, x1, y1, 7, 'hsl(var(--link-controlling))')}
      </g>);
    }
    default:
      return null;
  }
};
