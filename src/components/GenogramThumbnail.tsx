import React, { useMemo } from 'react';

interface GenogramThumbnailProps {
  data: {
    members?: { id: string; gender: string; x: number; y: number; deathYear?: number; pathologies?: string[] }[];
    unions?: { partner1: string; partner2: string }[];
  };
  width?: number;
  height?: number;
}

/**
 * Renders a tiny schematic preview of a genogram:
 * squares for males, circles for females, lines for unions.
 */
const GenogramThumbnail: React.FC<GenogramThumbnailProps> = ({ data, width = 56, height = 40 }) => {
  const { members = [], unions = [] } = data;

  const { nodes, lines, viewBox } = useMemo(() => {
    if (!members.length) return { nodes: [], lines: [], viewBox: '0 0 100 100' };

    const xs = members.map(m => m.x);
    const ys = members.map(m => m.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const pad = 8;
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const vw = rangeX + pad * 2;
    const vh = rangeY + pad * 2;

    const nodeSize = Math.max(Math.min(rangeX, rangeY) * 0.04, 3);

    const posMap = new Map<string, { x: number; y: number }>();
    const nodes = members.map(m => {
      const nx = m.x - minX + pad;
      const ny = m.y - minY + pad;
      posMap.set(m.id, { x: nx, y: ny });
      return {
        id: m.id,
        x: nx,
        y: ny,
        gender: m.gender,
        size: nodeSize,
        hasPathology: (m.pathologies?.length ?? 0) > 0,
        isDead: !!m.deathYear,
      };
    });

    const lines = unions
      .map(u => {
        const a = posMap.get(u.partner1);
        const b = posMap.get(u.partner2);
        if (!a || !b) return null;
        return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
      })
      .filter(Boolean) as { x1: number; y1: number; x2: number; y2: number }[];

    return { nodes, lines, viewBox: `0 0 ${vw} ${vh}` };
  }, [members, unions]);

  if (!members.length) {
    return (
      <div
        className="rounded-lg border border-border bg-muted/30 flex items-center justify-center"
        style={{ width, height }}
      >
        <div className="w-6 h-5 border border-dashed border-muted-foreground/30 rounded-sm" />
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border border-border bg-muted/20 overflow-hidden"
      style={{ width, height }}
    >
      <svg viewBox={viewBox} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        {/* Union lines */}
        {lines.map((l, i) => (
          <line
            key={i}
            x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1}
            strokeOpacity={0.3}
          />
        ))}
        {/* Member nodes */}
        {nodes.map(n => (
          n.gender === 'female' ? (
            <circle
              key={n.id}
              cx={n.x} cy={n.y} r={n.size}
              fill={n.hasPathology ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
              fillOpacity={n.isDead ? 0.35 : 0.7}
            />
          ) : (
            <rect
              key={n.id}
              x={n.x - n.size} y={n.y - n.size}
              width={n.size * 2} height={n.size * 2}
              fill={n.hasPathology ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
              fillOpacity={n.isDead ? 0.35 : 0.7}
            />
          )
        ))}
      </svg>
    </div>
  );
};

export default GenogramThumbnail;
