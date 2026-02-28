import React from 'react';

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
}) => {
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

  // Unique ID for clipPath (needed when multiple icons on same page)
  const clipId = React.useId();

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
      {isDead && (
        <>
          <line x1={sqX} y1={sqY} x2={sqX + sqW} y2={sqY + sqH} stroke={mainStroke} strokeWidth={sw} />
          <line x1={sqX + sqW} y1={sqY} x2={sqX} y2={sqY + sqH} stroke={mainStroke} strokeWidth={sw} />
        </>
      )}
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

export default MemberIcon;
