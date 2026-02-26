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
 * Dynamic genogram member icon.
 * - Male = square, Female = circle
 * - Gay = solid inverted triangle inside
 * - Bisexual = dashed inverted triangle inside
 * - Transgender = smaller opposite shape inside (circle in square, square in circle)
 * - Dead = X cross over everything
 * All flags combine.
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
  const cx = s / 2;
  const cy = s / 2;
  const pad = 2; // padding from edge
  const strokeColor = 'currentColor';
  const sw = 1.5; // stroke width

  // Outer shape dimensions
  const outerR = s / 2 - pad; // circle radius
  const sqInset = pad + 1; // square inset

  // Inner transgender shape
  const innerScale = 0.45;
  const innerR = outerR * innerScale;
  const innerSqHalf = (s - sqInset * 2) * innerScale / 2;

  // Triangle (inverted) for gay/bisexual
  const triPad = s * 0.22;
  const triTop = cy + outerR * 0.05;
  const triBottom = cy + outerR * 0.65;
  const triLeft = cx - outerR * 0.45;
  const triRight = cx + outerR * 0.45;

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      className={className}
      style={{ display: 'block' }}
    >
      {/* Outer shape */}
      {gender === 'female' ? (
        <circle cx={cx} cy={cy} r={outerR} stroke={strokeColor} strokeWidth={sw} />
      ) : (
        <rect
          x={sqInset}
          y={sqInset}
          width={s - sqInset * 2}
          height={s - sqInset * 2}
          stroke={strokeColor}
          strokeWidth={sw}
        />
      )}

      {/* Transgender: inner opposite shape */}
      {isTransgender && (
        gender === 'male' ? (
          // Small circle inside square
          <circle cx={cx} cy={cy} r={innerR} stroke={strokeColor} strokeWidth={sw} />
        ) : (
          // Small square inside circle
          <rect
            x={cx - innerSqHalf}
            y={cy - innerSqHalf}
            width={innerSqHalf * 2}
            height={innerSqHalf * 2}
            stroke={strokeColor}
            strokeWidth={sw}
          />
        )
      )}

      {/* Gay: solid inverted triangle */}
      {isGay && !isBisexual && (
        <polygon
          points={`${cx},${triBottom} ${triLeft},${triTop} ${triRight},${triTop}`}
          stroke={strokeColor}
          strokeWidth={sw}
          fill="none"
        />
      )}

      {/* Bisexual: dashed inverted triangle */}
      {isBisexual && (
        <polygon
          points={`${cx},${triBottom} ${triLeft},${triTop} ${triRight},${triTop}`}
          stroke={strokeColor}
          strokeWidth={sw}
          strokeDasharray="3 2"
          fill="none"
        />
      )}

      {/* Dead: X cross */}
      {isDead && (
        <>
          <line
            x1={pad + 1}
            y1={pad + 1}
            x2={s - pad - 1}
            y2={s - pad - 1}
            stroke={strokeColor}
            strokeWidth={sw}
          />
          <line
            x1={s - pad - 1}
            y1={pad + 1}
            x2={pad + 1}
            y2={s - pad - 1}
            stroke={strokeColor}
            strokeWidth={sw}
          />
        </>
      )}
    </svg>
  );
};

export default MemberIcon;
