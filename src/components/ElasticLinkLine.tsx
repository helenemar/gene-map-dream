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
  const curvature = Math.min(dist * 0.3, 80);

  const cx1 = x1 + dx * 0.25;
  const cy1 = y1 + dy * 0.25 - curvature * 0.3;
  const cx2 = x1 + dx * 0.75;
  const cy2 = y1 + dy * 0.75 + curvature * 0.3;

  return (
    <svg
      className="absolute pointer-events-none"
      style={{ zIndex: 50, overflow: 'visible', top: 0, left: 0, width: 1, height: 1 }}
    >
      <path
        d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${endX} ${endY}`}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={isSnapped ? 2.5 : 2}
        strokeDasharray={isSnapped ? undefined : '6 4'}
        opacity={isSnapped ? 0.9 : 0.7}
        className="transition-all duration-100"
      />
      {/* Origin dot */}
      <circle cx={x1} cy={y1} r={4} fill="hsl(var(--primary))" opacity={0.8} />
      {/* Cursor/snap dot with haptic vibration */}
      <circle
        key={`snap-${hapticKey}`}
        cx={endX} cy={endY}
        r={isSnapped ? 7 : 5}
        fill="hsl(var(--primary))"
        opacity={isSnapped ? 0.9 : 0.5}
        className={`transition-all duration-100 ${isSnapped ? 'animate-snap-haptic' : ''}`}
      />
      {/* Snap glow ring */}
      {isSnapped && (
        <circle
          cx={endX} cy={endY} r={14}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          opacity={0.3}
          className="animate-pulse"
        />
      )}
    </svg>
  );
};

export default ElasticLinkLine;
