import React, { useState } from 'react';
import { Pencil } from 'lucide-react';
import { EmotionalLinkType } from '@/types/genogram';

interface EmotionalLinkLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: EmotionalLinkType;
  onClick?: () => void;
}

/**
 * Compute Bézier curve control point perpendicular to the line.
 * Creates a gentle arc to visually distinguish emotional links from orthogonal family links.
 */
function computeCurve(x1: number, y1: number, x2: number, y2: number) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return { cpx: midX, cpy: midY, midX, midY };
  const perpX = -dy / len;
  const perpY = dx / len;
  const curveOffset = Math.min(len * 0.12, 35);
  return {
    cpx: midX + perpX * curveOffset,
    cpy: midY + perpY * curveOffset,
    midX,
    midY,
  };
}

/** Quadratic Bézier path string */
function bezierPath(x1: number, y1: number, x2: number, y2: number) {
  const { cpx, cpy } = computeCurve(x1, y1, x2, y2);
  return `M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2}`;
}

/** Parallel Bézier curve (offset perpendicular) */
function parallelBezier(x1: number, y1: number, x2: number, y2: number, offset: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return bezierPath(x1, y1, x2, y2);
  const px = (-dy / len) * offset;
  const py = (dx / len) * offset;
  return bezierPath(x1 + px, y1 + py, x2 + px, y2 + py);
}

/**
 * Generates a zigzag path along a Bézier curve.
 */
function zigzagBezier(
  x1: number, y1: number, x2: number, y2: number,
  amplitude: number, segments: number, lineOffset: number = 0
): string {
  const { cpx, cpy } = computeCurve(x1, y1, x2, y2);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return `M ${x1} ${y1}`;

  // Apply line offset
  let ox1 = x1, oy1 = y1, ox2 = x2, oy2 = y2, ocpx = cpx, ocpy = cpy;
  if (lineOffset !== 0) {
    const px = (-dy / len) * lineOffset;
    const py = (dx / len) * lineOffset;
    ox1 += px; oy1 += py; ox2 += px; oy2 += py; ocpx += px; ocpy += py;
  }

  const pts: string[] = [];
  for (let i = 0; i <= segments + 1; i++) {
    const t = i / (segments + 1);
    // Point on quadratic Bézier
    const bx = (1 - t) * (1 - t) * ox1 + 2 * (1 - t) * t * ocpx + t * t * ox2;
    const by = (1 - t) * (1 - t) * oy1 + 2 * (1 - t) * t * ocpy + t * t * oy2;

    if (i === 0 || i === segments + 1) {
      pts.push(`${bx},${by}`);
    } else {
      // Tangent for perpendicular
      const tx = 2 * ((1 - t) * (ocpx - ox1) + t * (ox2 - ocpx));
      const ty = 2 * ((1 - t) * (ocpy - oy1) + t * (oy2 - ocpy));
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

/**
 * Arrow marker for neglect/controlling types.
 */
function arrowHead(x2: number, y2: number, x1: number, y1: number, size: number, color: string) {
  const { cpx, cpy } = computeCurve(x1, y1, x2, y2);
  // Use tangent at t=1 for arrow direction
  const tx = 2 * (x2 - cpx);
  const ty = 2 * (y2 - cpy);
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

const EmotionalLinkLine: React.FC<EmotionalLinkLineProps> = ({
  x1, y1, x2, y2, type, onClick,
}) => {
  const [hovered, setHovered] = useState(false);
  const { cpx, cpy, midX, midY } = computeCurve(x1, y1, x2, y2);

  const segments = 16;
  const amp = 6;
  const mainPath = bezierPath(x1, y1, x2, y2);
  const hitPath = mainPath;

  const renderLine = () => {
    switch (type) {
      case 'fusional': {
        return (
          <>
            <path d={parallelBezier(x1, y1, x2, y2, 2.5)} fill="none" stroke="hsl(var(--link-fusional))" strokeWidth={2.5} />
            <path d={parallelBezier(x1, y1, x2, y2, -2.5)} fill="none" stroke="hsl(var(--link-fusional))" strokeWidth={2.5} />
          </>
        );
      }
      case 'distant':
        return (
          <path d={mainPath} fill="none"
            stroke="hsl(var(--link-distant))" strokeWidth={2}
            strokeDasharray="8 5" />
        );
      case 'conflictual': {
        return (
          <>
            <path d={parallelBezier(x1, y1, x2, y2, 3)} fill="none" stroke="hsl(var(--link-conflictual))" strokeWidth={2} strokeDasharray="8 5" />
            <path d={parallelBezier(x1, y1, x2, y2, -3)} fill="none" stroke="hsl(var(--link-conflictual))" strokeWidth={2} strokeDasharray="8 5" />
          </>
        );
      }
      case 'ambivalent': {
        const zigPts = zigzagBezier(x1, y1, x2, y2, amp, segments);
        return (
          <>
            <path d={mainPath} fill="none" stroke="hsl(var(--link-ambivalent))" strokeWidth={2} />
            <polyline points={zigPts} fill="none" stroke="hsl(var(--link-conflictual))" strokeWidth={1.5} />
          </>
        );
      }
      case 'cutoff': {
        // Compute tangent at midpoint for bar orientation
        const t = 0.5;
        const tx = 2 * ((1 - t) * (cpx - x1) + t * (x2 - cpx));
        const ty = 2 * ((1 - t) * (cpy - y1) + t * (y2 - cpy));
        const tlen = Math.sqrt(tx * tx + ty * ty);
        const ux = tlen > 0 ? tx / tlen : 1;
        const uy = tlen > 0 ? ty / tlen : 0;
        const px = -uy;
        const py = ux;
        const bMidX = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cpx + t * t * x2;
        const bMidY = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cpy + t * t * y2;
        const barGap = 4;
        const barH = 10;
        return (
          <>
            <path d={mainPath} fill="none"
              stroke="hsl(var(--link-cutoff))" strokeWidth={2} strokeDasharray="4 3" />
            <line
              x1={bMidX - ux * barGap + px * barH} y1={bMidY - uy * barGap + py * barH}
              x2={bMidX - ux * barGap - px * barH} y2={bMidY - uy * barGap - py * barH}
              stroke="hsl(var(--link-cutoff))" strokeWidth={2.5} />
            <line
              x1={bMidX + ux * barGap + px * barH} y1={bMidY + uy * barGap + py * barH}
              x2={bMidX + ux * barGap - px * barH} y2={bMidY + uy * barGap - py * barH}
              stroke="hsl(var(--link-cutoff))" strokeWidth={2.5} />
          </>
        );
      }
      case 'violence': {
        const pts = zigzagBezier(x1, y1, x2, y2, amp, segments);
        return (
          <polyline points={pts} fill="none"
            stroke="hsl(var(--link-violence))" strokeWidth={2} />
        );
      }
      case 'emotional_abuse': {
        return (
          <>
            <polyline points={zigzagBezier(x1, y1, x2, y2, amp * 0.8, segments, 0)} fill="none"
              stroke="hsl(var(--link-emotional-abuse))" strokeWidth={1.5} />
            <polyline points={zigzagBezier(x1, y1, x2, y2, amp * 0.8, segments, 5)} fill="none"
              stroke="hsl(var(--link-emotional-abuse))" strokeWidth={1.5} />
            <polyline points={zigzagBezier(x1, y1, x2, y2, amp * 0.8, segments, -5)} fill="none"
              stroke="hsl(var(--link-emotional-abuse))" strokeWidth={1.5} />
          </>
        );
      }
      case 'physical_violence': {
        const pts = zigzagBezier(x1, y1, x2, y2, amp, segments);
        return (
          <>
            <path d={mainPath} fill="none" stroke="hsl(var(--link-physical-violence))" strokeWidth={2} />
            <polyline points={pts} fill="none"
              stroke="hsl(var(--link-physical-violence))" strokeWidth={1.5} strokeOpacity={0.7} />
          </>
        );
      }
      case 'sexual_abuse': {
        return (
          <>
            {[-7, -2.5, 2.5, 7].map((off, i) => (
              <polyline key={i}
                points={zigzagBezier(x1, y1, x2, y2, amp * 0.7, segments, off)}
                fill="none" stroke="hsl(var(--link-sexual-abuse))" strokeWidth={1.5} />
            ))}
          </>
        );
      }
      case 'neglect':
        return (
          <>
            <path d={mainPath} fill="none" stroke="hsl(var(--link-neglect))" strokeWidth={2} />
            {arrowHead(x2, y2, x1, y1, 10, 'hsl(var(--link-neglect))')}
          </>
        );
      case 'controlling': {
        const t = 0.5;
        const bMidX = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cpx + t * t * x2;
        const bMidY = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cpy + t * t * y2;
        const sq = 8;
        const tx2 = 2 * ((1 - t) * (cpx - x1) + t * (x2 - cpx));
        const ty2 = 2 * ((1 - t) * (cpy - y1) + t * (y2 - cpy));
        const angle = Math.atan2(ty2, tx2) * 180 / Math.PI;
        return (
          <>
            <path d={mainPath} fill="none" stroke="hsl(var(--link-controlling))" strokeWidth={2} />
            <rect
              x={bMidX - sq} y={bMidY - sq} width={sq * 2} height={sq * 2}
              fill="hsl(var(--background))" stroke="hsl(var(--link-controlling))" strokeWidth={1.5}
              transform={`rotate(${angle}, ${bMidX}, ${bMidY})`}
            />
            <line
              x1={bMidX - sq * 0.6} y1={bMidY - sq * 0.6}
              x2={bMidX + sq * 0.6} y2={bMidY + sq * 0.6}
              stroke="hsl(var(--link-controlling))" strokeWidth={1.5}
              transform={`rotate(${angle}, ${bMidX}, ${bMidY})`}
            />
            <line
              x1={bMidX + sq * 0.6} y1={bMidY - sq * 0.6}
              x2={bMidX - sq * 0.6} y2={bMidY + sq * 0.6}
              stroke="hsl(var(--link-controlling))" strokeWidth={1.5}
              transform={`rotate(${angle}, ${bMidX}, ${bMidY})`}
            />
            {arrowHead(x2, y2, x1, y1, 10, 'hsl(var(--link-controlling))')}
          </>
        );
      }
      default:
        return null;
    }
  };

  // Compute visual midpoint on the Bézier curve at t=0.5
  const vizMidX = 0.25 * x1 + 0.5 * cpx + 0.25 * x2;
  const vizMidY = 0.25 * y1 + 0.5 * cpy + 0.25 * y2;

  return (
    <g
      className="cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Invisible fat hit area along curve */}
      <path d={hitPath} fill="none" stroke="transparent" strokeWidth={20} />
      {/* Bridge halo: thick background stroke creates visual "jump over" at crossings */}
      <path d={mainPath} fill="none" stroke="hsl(var(--canvas-bg, var(--background)))" strokeWidth={8} strokeLinecap="round" />
      {/* Actual rendered line */}
      <g style={{ opacity: hovered ? 1 : 0.85 }}>
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

/**
 * Static preview for design system — renders a horizontal curved line sample.
 */
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

/**
 * Non-interactive version for previews (no hover state).
 * Uses straight lines for compact preview rendering.
 */
const EmotionalLinkLineStatic: React.FC<{
  x1: number; y1: number; x2: number; y2: number; type: EmotionalLinkType;
}> = ({ x1, y1, x2, y2, type }) => {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const segments = 16;
  const amp = 5;

  // For previews, keep straight lines for clarity
  function parallelLine(x1: number, y1: number, x2: number, y2: number, offset: number) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return { x1, y1, x2, y2 };
    const px = (-dy / len) * offset;
    const py = (dx / len) * offset;
    return { x1: x1 + px, y1: y1 + py, x2: x2 + px, y2: y2 + py };
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
      const l1 = parallelLine(x1, y1, x2, y2, 2.5);
      const l2 = parallelLine(x1, y1, x2, y2, -2.5);
      return (
        <g>
          <line {...l1} stroke="hsl(var(--link-fusional))" strokeWidth={2.5} />
          <line {...l2} stroke="hsl(var(--link-fusional))" strokeWidth={2.5} />
        </g>
      );
    }
    case 'distant':
      return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--link-distant))" strokeWidth={2} strokeDasharray="8 5" />;
    case 'conflictual': {
      const l1 = parallelLine(x1, y1, x2, y2, 3);
      const l2 = parallelLine(x1, y1, x2, y2, -3);
      return (
        <g>
          <line {...l1} stroke="hsl(var(--link-conflictual))" strokeWidth={2} strokeDasharray="8 5" />
          <line {...l2} stroke="hsl(var(--link-conflictual))" strokeWidth={2} strokeDasharray="8 5" />
        </g>
      );
    }
    case 'ambivalent': {
      const pts = zigzagPath(x1, y1, x2, y2, amp, segments);
      return (
        <g>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--link-ambivalent))" strokeWidth={2} />
          <polyline points={pts} fill="none" stroke="hsl(var(--link-conflictual))" strokeWidth={1.5} />
        </g>
      );
    }
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
      return (
        <g>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--link-cutoff))" strokeWidth={2} strokeDasharray="4 3" />
          <line x1={midX - ux * barGap + px * barH} y1={midY - uy * barGap + py * barH}
            x2={midX - ux * barGap - px * barH} y2={midY - uy * barGap - py * barH}
            stroke="hsl(var(--link-cutoff))" strokeWidth={2.5} />
          <line x1={midX + ux * barGap + px * barH} y1={midY + uy * barGap + py * barH}
            x2={midX + ux * barGap - px * barH} y2={midY + uy * barGap - py * barH}
            stroke="hsl(var(--link-cutoff))" strokeWidth={2.5} />
        </g>
      );
    }
    case 'violence':
      return <polyline points={zigzagPath(x1, y1, x2, y2, amp, segments)} fill="none" stroke="hsl(var(--link-violence))" strokeWidth={2} />;
    case 'emotional_abuse':
      return (
        <g>
          {[-4, 0, 4].map((off, i) => (
            <polyline key={i} points={zigzagPathOffset(x1, y1, x2, y2, amp * 0.7, segments, off)}
              fill="none" stroke="hsl(var(--link-emotional-abuse))" strokeWidth={1.5} />
          ))}
        </g>
      );
    case 'physical_violence':
      return (
        <g>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--link-physical-violence))" strokeWidth={2} />
          <polyline points={zigzagPath(x1, y1, x2, y2, amp, segments)} fill="none"
            stroke="hsl(var(--link-physical-violence))" strokeWidth={1.5} strokeOpacity={0.7} />
        </g>
      );
    case 'sexual_abuse':
      return (
        <g>
          {[-6, -2, 2, 6].map((off, i) => (
            <polyline key={i} points={zigzagPathOffset(x1, y1, x2, y2, amp * 0.6, segments, off)}
              fill="none" stroke="hsl(var(--link-sexual-abuse))" strokeWidth={1.5} />
          ))}
        </g>
      );
    case 'neglect':
      return (
        <g>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--link-neglect))" strokeWidth={2} />
          {staticArrowHead(x2, y2, x1, y1, 8, 'hsl(var(--link-neglect))')}
        </g>
      );
    case 'controlling': {
      const sq = 6;
      return (
        <g>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--link-controlling))" strokeWidth={2} />
          <rect x={midX - sq} y={midY - sq} width={sq * 2} height={sq * 2}
            fill="hsl(var(--background))" stroke="hsl(var(--link-controlling))" strokeWidth={1.5} />
          <line x1={midX - sq * 0.6} y1={midY - sq * 0.6} x2={midX + sq * 0.6} y2={midY + sq * 0.6}
            stroke="hsl(var(--link-controlling))" strokeWidth={1.5} />
          <line x1={midX + sq * 0.6} y1={midY - sq * 0.6} x2={midX - sq * 0.6} y2={midY + sq * 0.6}
            stroke="hsl(var(--link-controlling))" strokeWidth={1.5} />
          {staticArrowHead(x2, y2, x1, y1, 8, 'hsl(var(--link-controlling))')}
        </g>
      );
    }
    default:
      return null;
  }
};
