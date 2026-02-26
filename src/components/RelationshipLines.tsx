import React from 'react';
import { FamilyMember, Relationship } from '@/types/genogram';

interface RelationshipLinesProps {
  members: FamilyMember[];
  relationships: Relationship[];
}

const RelationshipLines: React.FC<RelationshipLinesProps> = ({ members, relationships }) => {
  const getMember = (id: string) => members.find(m => m.id === id);

  const getCenterX = (m: FamilyMember) => m.x + 80;
  const getCenterY = (m: FamilyMember) => m.y + 25;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      {relationships.map(rel => {
        const from = getMember(rel.from);
        const to = getMember(rel.to);
        if (!from || !to) return null;

        const x1 = getCenterX(from);
        const y1 = getCenterY(from);
        const x2 = getCenterX(to);
        const y2 = getCenterY(to);

        if (rel.type === 'couple') {
          return (
            <g key={rel.id}>
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="hsl(var(--foreground))"
                strokeWidth={2}
                strokeOpacity={0.3}
              />
              {/* Marriage/divorce annotation */}
              {(rel.marriageYear || rel.divorceYear) && (
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 + 20}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px]"
                >
                  {rel.marriageYear && `R: ${rel.marriageYear}`}
                  {rel.divorceYear && ` V: ${rel.divorceYear}`}
                </text>
              )}
            </g>
          );
        }

        // Parent-child: vertical then horizontal
        const midY = y1 + (y2 - y1) * 0.6;
        return (
          <g key={rel.id}>
            <path
              d={`M ${x1} ${y1 + 25} V ${midY} H ${x2} V ${y2 - 5}`}
              fill="none"
              stroke="hsl(var(--foreground))"
              strokeWidth={1.5}
              strokeOpacity={0.2}
            />
          </g>
        );
      })}
    </svg>
  );
};

export default RelationshipLines;
