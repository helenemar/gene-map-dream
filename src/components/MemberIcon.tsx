import React from 'react';
import type { PerinatalType } from '@/types/genogram';

export interface MemberIconProps {
  gender: 'male' | 'female' | 'non-binary';
  isGay?: boolean;
  isBisexual?: boolean;
  isTransgender?: boolean;
  isDead?: boolean;
  /** Array of CSS color strings (hex, hsl, etc.) for pathology fills. Max 4. */
  pathologyColors?: string[];
  size?: number;
  className?: string;
  /** If set, renders a perinatal triangle symbol instead of the normal shape */
  perinatalType?: PerinatalType;
  /** Index patient — renders double border */
  isIndexPatient?: boolean;
}

/**
 * Dynamic genogram member icon with pathology quadrant fills.
 *
 * Fill algorithm based on pathologyColors.length:
 *   0 → no fill (white/transparent)
 *   1 → bottom half = [0]
 *   2 → bottom-left quadrant = [0], bottom-right = [1]
 *   3 → bottom-left[0], bottom-right[1], top-left[2]
 *   4 → bottom-left[0], bottom-right[1], top-left[2], top-right[3]
 */
const MemberIcon: React.FC<MemberIconProps> = ({
  gender,
  isGay = false,
  isBisexual = false,
  isTransgender = false,
  isDead = false,
  pathologyColors = [],
  size = 48,
  className,
  perinatalType,
  isIndexPatient = false,
}) => {
  // Unique ID for clipPath (needed when multiple icons on same page)
  const clipId = React.useId();

  // ── Perinatal triangle-based symbols ──
  if (perinatalType) {
    return (
      <PerinatalIcon type={perinatalType} gender={gender} size={size} className={className} />
    );
  }

  const s = size;
  const sw = s * 0.04;
  const half = sw / 2;

  const sqX = half;
  const sqY = half;
  const sqW = s - sw;
  const sqH = s - sw;

  const cx = s / 2;
  const cy = s / 2;
  const circleR = sqW / 2;

  // Triangle for orientation
  const triW = sqW * 0.55;
  const triH = sqH * 0.45;
  const triTopY = cy - triH * 0.35;
  const triBottomY = cy + triH * 0.65;
  const triLeft = cx - triW / 2;
  const triRight = cx + triW / 2;
  const triPoints = `${triLeft},${triTopY} ${triRight},${triTopY} ${cx},${triBottomY}`;

  const mainStroke = 'currentColor';
  const transStroke = 'hsl(var(--muted-foreground) / 0.85)';

  // Pathology fill rects — positioned in quadrants within the shape bounds
  const colors = pathologyColors.slice(0, 4);
  const fillRects = buildFillRects(colors, sqX, sqY, sqW, sqH);

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      className={className}
      style={{ display: 'block' }}
    >
      <defs>
        {/* Clip to the outer shape so fills don't bleed */}
        <clipPath id={`clip-${clipId}`}>
          {gender === 'female' ? (
            <circle cx={cx} cy={cy} r={circleR} />
          ) : gender === 'non-binary' ? (
            <polygon points={`${cx},${half} ${s - half},${cy} ${cx},${s - half} ${half},${cy}`} />
          ) : (
            <rect x={sqX} y={sqY} width={sqW} height={sqH} />
          )}
        </clipPath>
      </defs>

      {/* Layer 0: White background fill inside shape */}
      {gender === 'female' ? (
        <circle cx={cx} cy={cy} r={circleR} fill="white" />
      ) : gender === 'non-binary' ? (
        <polygon points={`${cx},${half} ${s - half},${cy} ${cx},${s - half} ${half},${cy}`} fill="white" />
      ) : (
        <rect x={sqX} y={sqY} width={sqW} height={sqH} fill="white" />
      )}

      {/* Layer 1: Pathology color fills (clipped to shape) */}
      {fillRects.length > 0 && (
        <g clipPath={`url(#clip-${clipId})`}>
          {fillRects.map((rect, i) => (
            <rect
              key={i}
              x={rect.x}
              y={rect.y}
              width={rect.w}
              height={rect.h}
              fill={rect.color}
            />
          ))}
        </g>
      )}

      {/* Layer 2: Outer shape stroke */}
      {gender === 'female' ? (
        <circle cx={cx} cy={cy} r={circleR} stroke={mainStroke} strokeWidth={sw} />
      ) : gender === 'non-binary' ? (
        <polygon points={`${cx},${half} ${s - half},${cy} ${cx},${s - half} ${half},${cy}`} stroke={mainStroke} strokeWidth={sw} fill="none" />
      ) : (
        <rect x={sqX} y={sqY} width={sqW} height={sqH} stroke={mainStroke} strokeWidth={sw} />
      )}

      {/* Layer 2b: Index patient double border */}
      {isIndexPatient && (
        gender === 'female' ? (
          <circle cx={cx} cy={cy} r={circleR + sw * 2} stroke={mainStroke} strokeWidth={sw} fill="none" />
        ) : gender === 'non-binary' ? null : (
          <rect
            x={sqX - sw * 2}
            y={sqY - sw * 2}
            width={sqW + sw * 4}
            height={sqH + sw * 4}
            stroke={mainStroke}
            strokeWidth={sw}
            fill="none"
          />
        )
      )}

      {/* Layer 3: Transgender inner shape */}
      {isTransgender && (
        gender === 'male' ? (
          <circle cx={cx} cy={cy} r={circleR * 0.82} stroke={transStroke} strokeWidth={sw} fill="none" />
        ) : (
          <rect
            x={cx - sqW * 0.38}
            y={cy - sqH * 0.38}
            width={sqW * 0.76}
            height={sqH * 0.76}
            stroke={transStroke}
            strokeWidth={sw}
            fill="none"
          />
        )
      )}

      {/* Layer 4: Gay triangle */}
      {isGay && !isBisexual && (
        <polygon
          points={triPoints}
          stroke={isDead ? transStroke : mainStroke}
          strokeWidth={sw}
          strokeLinejoin="miter"
          fill="none"
        />
      )}

      {/* Layer 4: Bisexual dashed triangle */}
      {isBisexual && (
        <polygon
          points={triPoints}
          stroke={isDead ? transStroke : mainStroke}
          strokeWidth={sw}
          strokeDasharray={`${s * 0.07} ${s * 0.05}`}
          strokeLinejoin="miter"
          fill="none"
        />
      )}

      {/* Layer 5: Dead X cross */}
      {isDead && (() => {
        // For circles, clip cross to circle boundary (45° intersection)
        const offset = gender === 'female' ? circleR * 0.707 : sqW / 2;
        const x1 = cx - offset;
        const y1 = cy - offset;
        const x2 = cx + offset;
        const y2 = cy + offset;
        return (
          <>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={mainStroke} strokeWidth={sw} />
            <line x1={x2} y1={y1} x2={x1} y2={y2} stroke={mainStroke} strokeWidth={sw} />
          </>
        );
      })()}
    </svg>
  );
};

/** Build fill rectangles based on pathology count (0-4) */
function buildFillRects(
  colors: string[],
  x: number,
  y: number,
  w: number,
  h: number,
): { x: number; y: number; w: number; h: number; color: string }[] {
  const midX = x + w / 2;
  const midY = y + h / 2;
  const halfW = w / 2;
  const halfH = h / 2;

  switch (colors.length) {
    case 0:
      return [];
    case 1:
      // Bottom-right quadrant only
      return [{ x: midX, y: midY, w: halfW, h: halfH, color: colors[0] }];
    case 2:
      // Bottom-left [0], bottom-right [1]
      return [
        { x, y: midY, w: halfW, h: halfH, color: colors[0] },
        { x: midX, y: midY, w: halfW, h: halfH, color: colors[1] },
      ];
    case 3:
      // Bottom-left[0], bottom-right[1], top-left[2]
      return [
        { x, y: midY, w: halfW, h: halfH, color: colors[0] },
        { x: midX, y: midY, w: halfW, h: halfH, color: colors[1] },
        { x, y, w: halfW, h: halfH, color: colors[2] },
      ];
    case 4:
    default:
      // All 4 quadrants: BL[0], BR[1], TL[2], TR[3]
      return [
        { x, y: midY, w: halfW, h: halfH, color: colors[0] },
        { x: midX, y: midY, w: halfW, h: halfH, color: colors[1] },
        { x, y, w: halfW, h: halfH, color: colors[2] },
        { x: midX, y, w: halfW, h: halfH, color: colors[3] },
      ];
  }
}

/** Perinatal triangle-based SVG icons */
const PerinatalIcon: React.FC<{
  type: PerinatalType;
  gender: 'male' | 'female' | 'non-binary';
  size: number;
  className?: string;
}> = ({ type, gender, size, className }) => {
  // Normalized viewBox: triangle from (20,0) to (0,40)/(40,40)
  // Extra space for cross overflow: viewBox -4 -4 48 48
  const sw = 2;

  if (type === 'pregnancy') {
    // Simple triangle
    return (
      <svg width={size} height={size} viewBox="-4 -4 48 48" fill="none" className={className}>
        <polygon points="20,0 40,40 0,40" stroke="currentColor" strokeWidth={sw} fill="white" strokeLinejoin="miter" />
      </svg>
    );
  }

  if (type === 'miscarriage') {
    // Triangle + X crossing through
    return (
      <svg width={size} height={size} viewBox="-4 -4 48 48" fill="none" className={className}>
        <polygon points="20,0 40,40 0,40" stroke="currentColor" strokeWidth={sw} fill="white" strokeLinejoin="miter" />
        <line x1={-2} y1={42} x2={42} y2={-2} stroke="currentColor" strokeWidth={sw} />
        <line x1={42} y1={42} x2={-2} y2={-2} stroke="currentColor" strokeWidth={sw} />
      </svg>
    );
  }

  if (type === 'abortion') {
    // Triangle + X crossing through + horizontal line
    return (
      <svg width={size} height={size} viewBox="-4 -4 48 48" fill="none" className={className}>
        <polygon points="20,0 40,40 0,40" stroke="currentColor" strokeWidth={sw} fill="white" strokeLinejoin="miter" />
        <line x1={-2} y1={42} x2={42} y2={-2} stroke="currentColor" strokeWidth={sw} />
        <line x1={42} y1={42} x2={-2} y2={-2} stroke="currentColor" strokeWidth={sw} />
        <line x1={-2} y1={20} x2={42} y2={20} stroke="currentColor" strokeWidth={sw} />
      </svg>
    );
  }

  // stillborn — square (male) or circle (female) with X crossing through
  if (type === 'stillborn') {
    const s = 40;
    const shapeSize = 28;
    const offset = (s - shapeSize) / 2;
    return (
      <svg width={size} height={size} viewBox="-4 -4 48 48" fill="none" className={className}>
        {gender === 'female' ? (
          <circle cx={s / 2} cy={s / 2} r={shapeSize / 2} stroke="currentColor" strokeWidth={sw} fill="white" />
        ) : (
          <rect x={offset} y={offset} width={shapeSize} height={shapeSize} stroke="currentColor" strokeWidth={sw} fill="white" />
        )}
        <line x1={-2} y1={-2} x2={42} y2={42} stroke="currentColor" strokeWidth={sw} />
        <line x1={42} y1={-2} x2={-2} y2={42} stroke="currentColor" strokeWidth={sw} />
      </svg>
    );
  }

  return null;
};

export default MemberIcon;
