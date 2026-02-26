import React from 'react';

export interface MemberIconProps {
  gender: 'male' | 'female';
  isGay?: boolean;
  isBisexual?: boolean;
  isTransgender?: boolean;
  isDead?: boolean;
  size?: number;
  className?: string;
}

/**
 * Dynamic genogram member icon — pixel-perfect per reference grid.
 * 
 * Male = square base. Female = circle base (handled externally or here).
 * Transgender = large inner opposite shape (circle in square, square in circle), drawn in lighter gray.
 * Gay = solid inverted triangle (pointe vers le bas).
 * Bisexual = dashed inverted triangle.
 * Dead = X cross corner-to-corner.
 * All flags stack/combine.
 */
const MemberIcon: React.FC<MemberIconProps> = ({
  gender,
  isGay = false,
  isBisexual = false,
  isTransgender = false,
  isDead = false,
  size = 48,
  className,
}) => {
  const s = size;
  const sw = s * 0.04; // stroke width scales with size
  const half = sw / 2;

  // Square bounds (inset by half stroke so it doesn't clip)
  const sqX = half;
  const sqY = half;
  const sqW = s - sw;
  const sqH = s - sw;

  const cx = s / 2;
  const cy = s / 2;

  // Circle for female outer or male transgender inner
  const circleR = sqW / 2; // touches square edges

  // Triangle sizing — centered, ~60% of the square width
  const triW = sqW * 0.55;
  const triH = sqH * 0.45;
  const triTopY = cy - triH * 0.35;
  const triBottomY = cy + triH * 0.65;
  const triLeft = cx - triW / 2;
  const triRight = cx + triW / 2;
  const triPoints = `${triLeft},${triTopY} ${triRight},${triTopY} ${cx},${triBottomY}`;

  // Colors
  const mainStroke = 'currentColor';
  const transStroke = 'hsl(var(--muted-foreground) / 0.5)'; // lighter gray for transgender shape

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      className={className}
      style={{ display: 'block' }}
    >
      {/* Layer 1: Outer shape */}
      {gender === 'female' ? (
        <circle cx={cx} cy={cy} r={circleR} stroke={mainStroke} strokeWidth={sw} />
      ) : (
        <rect x={sqX} y={sqY} width={sqW} height={sqH} stroke={mainStroke} strokeWidth={sw} />
      )}

      {/* Layer 2: Transgender — large inner opposite shape in lighter gray */}
      {isTransgender && (
        gender === 'male' ? (
          <circle cx={cx} cy={cy} r={circleR * 0.82} stroke={transStroke} strokeWidth={sw} />
        ) : (
          <rect
            x={cx - sqW * 0.38}
            y={cy - sqH * 0.38}
            width={sqW * 0.76}
            height={sqH * 0.76}
            stroke={transStroke}
            strokeWidth={sw}
          />
        )
      )}

      {/* Layer 3: Gay — solid inverted triangle */}
      {isGay && !isBisexual && (
        <polygon
          points={triPoints}
          stroke={isDead ? transStroke : mainStroke}
          strokeWidth={sw}
          strokeLinejoin="miter"
          fill="none"
        />
      )}

      {/* Layer 3: Bisexual — dashed inverted triangle */}
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

      {/* Layer 4 (top): Dead — X cross corner to corner */}
      {isDead && (
        <>
          <line x1={sqX} y1={sqY} x2={sqX + sqW} y2={sqY + sqH} stroke={mainStroke} strokeWidth={sw} />
          <line x1={sqX + sqW} y1={sqY} x2={sqX} y2={sqY + sqH} stroke={mainStroke} strokeWidth={sw} />
        </>
      )}
    </svg>
  );
};

export default MemberIcon;
