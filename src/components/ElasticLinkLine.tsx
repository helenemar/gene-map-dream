import React from 'react';

interface ElasticLinkLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** Temporary elastic line shown while dragging to create a link */
const ElasticLinkLine: React.FC<ElasticLinkLineProps> = ({ x1, y1, x2, y2 }) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
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
        d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={2}
        strokeDasharray="6 4"
        opacity={0.7}
      />
      {/* Origin dot */}
      <circle cx={x1} cy={y1} r={4} fill="hsl(var(--primary))" opacity={0.8} />
      {/* Cursor dot */}
      <circle cx={x2} cy={y2} r={5} fill="hsl(var(--primary))" opacity={0.5} />
    </svg>
  );
};

export default ElasticLinkLine;
