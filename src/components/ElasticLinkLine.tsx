import React, { useRef, useEffect, useState } from 'react';

interface ElasticLinkLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** When snapped, show endpoint locked to this position */
  snapX?: number;
  snapY?: number;
  isSnapped?: boolean;
}

/** Temporary elastic line shown while dragging to create a link */
const ElasticLinkLine: React.FC<ElasticLinkLineProps> = ({ x1, y1, x2, y2, snapX, snapY, isSnapped }) => {
  // Track snap transitions to retrigger haptic animation
  const [hapticKey, setHapticKey] = useState(0);
  const wasSnapped = useRef(false);

  useEffect(() => {
    if (isSnapped && !wasSnapped.current) {
      setHapticKey(k => k + 1);
    }
    wasSnapped.current = !!isSnapped;
  }, [isSnapped]);

  // Use snap position if available
  const endX = isSnapped && snapX !== undefined ? snapX : x2;
  const endY = isSnapped && snapY !== undefined ? snapY : y2;

  const dx = endX - x1;
  const dy = endY - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const curvature = Math.min(dist * 0.25, 60);

  // Smoother bezier with asymmetric control points
  const cx1 = x1 + dx * 0.3;
  const cy1 = y1 - curvature * 0.2;
  const cx2 = x1 + dx * 0.7;
  const cy2 = endY + curvature * 0.2;

  const pathD = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${endX} ${endY}`;
  const gradientId = `elastic-grad-${hapticKey}`;

  return (
    <svg
      className="absolute pointer-events-none"
      style={{ zIndex: 50, overflow: 'visible', top: 0, left: 0, width: 1, height: 1 }}
    >
      <defs>
        {/* Gradient along the line for depth */}
        <linearGradient id={gradientId} x1={x1} y1={y1} x2={endX} y2={endY} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={isSnapped ? 0.9 : 0.6} />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={isSnapped ? 1 : 0.8} />
        </linearGradient>
      </defs>

      {/* Soft glow under the line */}
      <path
        d={pathD}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={isSnapped ? 8 : 5}
        opacity={isSnapped ? 0.12 : 0.06}
        strokeLinecap="round"
      />

      {/* Main line */}
      <path
        d={pathD}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={isSnapped ? 2.5 : 2}
        strokeDasharray={isSnapped ? undefined : '6 4'}
        strokeLinecap="round"
        className="transition-all duration-75"
      >
        {/* Animated dash movement when not snapped */}
        {!isSnapped && (
          <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.6s" repeatCount="indefinite" />
        )}
      </path>

      {/* Origin dot with ring */}
      <circle cx={x1} cy={y1} r={5} fill="hsl(var(--primary))" opacity={0.9} />
      <circle cx={x1} cy={y1} r={8} fill="none" stroke="hsl(var(--primary))" strokeWidth={1.5} opacity={0.25} />

      {/* Cursor/snap dot with haptic vibration */}
      <circle
        key={`snap-${hapticKey}`}
        cx={endX} cy={endY}
        r={isSnapped ? 7 : 5}
        fill="hsl(var(--primary))"
        opacity={isSnapped ? 0.9 : 0.5}
        className={`transition-all duration-75 ${isSnapped ? 'animate-snap-haptic' : ''}`}
      />

      {/* Snap glow rings */}
      {isSnapped && (
        <>
          <circle
            cx={endX} cy={endY} r={12}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            opacity={0.35}
            className="animate-ping"
            style={{ animationDuration: '1s' }}
          />
          <circle
            cx={endX} cy={endY} r={18}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={1}
            opacity={0.15}
            className="animate-pulse"
          />
        </>
      )}
    </svg>
  );
};

export default ElasticLinkLine;
