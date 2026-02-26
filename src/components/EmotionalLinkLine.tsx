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
 * Generates a zigzag/wavy polyline path string between two points.
 */
function zigzagPath(
  x1: number, y1: number, x2: number, y2: number,
  amplitude: number, segments: number
): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return `M ${x1} ${y1}`;

  // Unit vector along line
  const ux = dx / len;
  const uy = dy / len;
  // Perpendicular
  const px = -uy;
  const py = ux;

  const pts: string[] = [`${x1},${y1}`];
  for (let i = 1; i <= segments; i++) {
    const t = i / (segments + 1);
    const bx = x1 + dx * t;
    const by = y1 + dy * t;
    const dir = i % 2 === 1 ? 1 : -1;
    pts.push(`${bx + px * amplitude * dir},${by + py * amplitude * dir}`);
  }
  pts.push(`${x2},${y2}`);
  return pts.join(' ');
}

/**
 * Generates parallel line offset from the main line.
 */
function parallelLine(
  x1: number, y1: number, x2: number, y2: number, offset: number
): { x1: number; y1: number; x2: number; y2: number } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return { x1, y1, x2, y2 };
  const px = (-dy / len) * offset;
  const py = (dx / len) * offset;
  return { x1: x1 + px, y1: y1 + py, x2: x2 + px, y2: y2 + py };
}

function zigzagPathOffset(
  x1: number, y1: number, x2: number, y2: number,
  amplitude: number, segments: number, offset: number
): string {
  const p = parallelLine(x1, y1, x2, y2, offset);
  return zigzagPath(p.x1, p.y1, p.x2, p.y2, amplitude, segments);
}

/**
 * Arrow marker for neglect/controlling types.
 */
function arrowHead(x2: number, y2: number, x1: number, y1: number, size: number, color: string) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return null;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const tip = { x: x2, y: y2 };
  const left = { x: x2 - ux * size + px * size * 0.5, y: y2 - uy * size + py * size * 0.5 };
  const right = { x: x2 - ux * size - px * size * 0.5, y: y2 - uy * size - py * size * 0.5 };
  return (
    <polygon
      points={`${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`}
      fill={color}
    />
  );
}

const EmotionalLinkLine: React.FC<EmotionalLinkLineProps> = ({
  x1, y1, x2, y2, type, onClick,
}) => {
  const [hovered, setHovered] = useState(false);
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  const segments = 16;
  const amp = 6;

  const renderLine = () => {
    switch (type) {
      case 'fusional': {
        // Double green parallel lines
        const l1 = parallelLine(x1, y1, x2, y2, 2.5);
        const l2 = parallelLine(x1, y1, x2, y2, -2.5);
        return (
          <>
            <line {...l1} stroke="hsl(var(--link-fusional))" strokeWidth={2.5} />
            <line {...l2} stroke="hsl(var(--link-fusional))" strokeWidth={2.5} />
          </>
        );
      }
      case 'distant':
        // Dashed red line
        return (
          <line x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="hsl(var(--link-distant))" strokeWidth={2}
            strokeDasharray="8 5" />
        );
      case 'conflictual': {
        // Double dashed red lines
        const l1 = parallelLine(x1, y1, x2, y2, 3);
        const l2 = parallelLine(x1, y1, x2, y2, -3);
        return (
          <>
            <line {...l1} stroke="hsl(var(--link-conflictual))" strokeWidth={2} strokeDasharray="8 5" />
            <line {...l2} stroke="hsl(var(--link-conflictual))" strokeWidth={2} strokeDasharray="8 5" />
          </>
        );
      }
      case 'ambivalent': {
        // Green straight line + red zigzag on top
        const zigPts = zigzagPath(x1, y1, x2, y2, amp, segments);
        return (
          <>
            <line x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="hsl(var(--link-ambivalent))" strokeWidth={2} />
            <polyline points={zigPts} fill="none"
              stroke="hsl(var(--link-conflictual))" strokeWidth={1.5} />
          </>
        );
      }
      case 'cutoff': {
        // Dotted red line with two vertical bars in center
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const ux = len > 0 ? dx / len : 1;
        const uy = len > 0 ? dy / len : 0;
        const px = -uy;
        const py = ux;
        const barGap = 4;
        const barH = 10;
        return (
          <>
            <line x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="hsl(var(--link-cutoff))" strokeWidth={2} strokeDasharray="4 3" />
            {/* Two vertical bars */}
            <line
              x1={midX - ux * barGap + px * barH} y1={midY - uy * barGap + py * barH}
              x2={midX - ux * barGap - px * barH} y2={midY - uy * barGap - py * barH}
              stroke="hsl(var(--link-cutoff))" strokeWidth={2.5} />
            <line
              x1={midX + ux * barGap + px * barH} y1={midY + uy * barGap + py * barH}
              x2={midX + ux * barGap - px * barH} y2={midY + uy * barGap - py * barH}
              stroke="hsl(var(--link-cutoff))" strokeWidth={2.5} />
          </>
        );
      }
      case 'violence': {
        // Red wavy zigzag
        const pts = zigzagPath(x1, y1, x2, y2, amp, segments);
        return (
          <polyline points={pts} fill="none"
            stroke="hsl(var(--link-violence))" strokeWidth={2} />
        );
      }
      case 'emotional_abuse': {
        // Triple blue zigzag
        return (
          <>
            <polyline points={zigzagPathOffset(x1, y1, x2, y2, amp * 0.8, segments, 0)} fill="none"
              stroke="hsl(var(--link-emotional-abuse))" strokeWidth={1.5} />
            <polyline points={zigzagPathOffset(x1, y1, x2, y2, amp * 0.8, segments, 5)} fill="none"
              stroke="hsl(var(--link-emotional-abuse))" strokeWidth={1.5} />
            <polyline points={zigzagPathOffset(x1, y1, x2, y2, amp * 0.8, segments, -5)} fill="none"
              stroke="hsl(var(--link-emotional-abuse))" strokeWidth={1.5} />
          </>
        );
      }
      case 'physical_violence': {
        // Straight blue line + dark blue zigzag on top
        const pts = zigzagPath(x1, y1, x2, y2, amp, segments);
        return (
          <>
            <line x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="hsl(var(--link-physical-violence))" strokeWidth={2} />
            <polyline points={pts} fill="none"
              stroke="hsl(var(--link-physical-violence))" strokeWidth={1.5} strokeOpacity={0.7} />
          </>
        );
      }
      case 'sexual_abuse': {
        // Quadruple purple zigzag
        return (
          <>
            {[-7, -2.5, 2.5, 7].map((off, i) => (
              <polyline key={i}
                points={zigzagPathOffset(x1, y1, x2, y2, amp * 0.7, segments, off)}
                fill="none" stroke="hsl(var(--link-sexual-abuse))" strokeWidth={1.5} />
            ))}
          </>
        );
      }
      case 'neglect':
        // Blue straight line with arrow
        return (
          <>
            <line x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="hsl(var(--link-neglect))" strokeWidth={2} />
            {arrowHead(x2, y2, x1, y1, 10, 'hsl(var(--link-neglect))')}
          </>
        );
      case 'controlling': {
        // Red line with crossed square in center + arrow
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const ux = len > 0 ? dx / len : 1;
        const uy = len > 0 ? dy / len : 0;
        const px = -uy;
        const py = ux;
        const sq = 8;
        return (
          <>
            <line x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="hsl(var(--link-controlling))" strokeWidth={2} />
            {/* Square */}
            <rect
              x={midX - sq} y={midY - sq} width={sq * 2} height={sq * 2}
              fill="hsl(var(--background))" stroke="hsl(var(--link-controlling))" strokeWidth={1.5}
              transform={`rotate(${Math.atan2(dy, dx) * 180 / Math.PI}, ${midX}, ${midY})`}
            />
            {/* X inside square */}
            <line
              x1={midX - sq * 0.6} y1={midY - sq * 0.6}
              x2={midX + sq * 0.6} y2={midY + sq * 0.6}
              stroke="hsl(var(--link-controlling))" strokeWidth={1.5}
              transform={`rotate(${Math.atan2(dy, dx) * 180 / Math.PI}, ${midX}, ${midY})`}
            />
            <line
              x1={midX + sq * 0.6} y1={midY - sq * 0.6}
              x2={midX - sq * 0.6} y2={midY + sq * 0.6}
              stroke="hsl(var(--link-controlling))" strokeWidth={1.5}
              transform={`rotate(${Math.atan2(dy, dx) * 180 / Math.PI}, ${midX}, ${midY})`}
            />
            {arrowHead(x2, y2, x1, y1, 10, 'hsl(var(--link-controlling))')}
          </>
        );
      }
      default:
        return null;
    }
  };

  return (
    <g
      className="cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Invisible fat hit area */}
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="transparent" strokeWidth={20} />
      {/* Actual rendered line */}
      <g style={{ opacity: hovered ? 1 : 0.85 }} transform={hovered ? '' : ''}>
        {renderLine()}
      </g>
      {/* Hover edit icon */}
      {hovered && (
        <foreignObject x={midX - 14} y={midY - 14} width={28} height={28}>
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
 * Static preview for design system — renders a horizontal line sample.
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
 */
const EmotionalLinkLineStatic: React.FC<{
  x1: number; y1: number; x2: number; y2: number; type: EmotionalLinkType;
}> = ({ x1, y1, x2, y2, type }) => {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const segments = 16;
  const amp = 5;

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
          {arrowHead(x2, y2, x1, y1, 8, 'hsl(var(--link-neglect))')}
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
          {arrowHead(x2, y2, x1, y1, 8, 'hsl(var(--link-controlling))')}
        </g>
      );
    }
    default:
      return null;
  }
};
