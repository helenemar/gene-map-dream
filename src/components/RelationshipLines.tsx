import React from 'react';
import { FamilyMember, Relationship } from '@/types/genogram';

interface RelationshipLinesProps {
  members: FamilyMember[];
  relationships: Relationship[];
}

const RelationshipLines: React.FC<RelationshipLinesProps> = ({ members, relationships }) => {
  const getMember = (id: string) => members.find(m => m.id === id);

  const CARD_W = 160;
  const CARD_H = 56;

  const getAnchor = (m: FamilyMember, side: 'top' | 'bottom' | 'left' | 'right') => {
    switch (side) {
      case 'top': return { x: m.x + CARD_W / 2, y: m.y };
      case 'bottom': return { x: m.x + CARD_W / 2, y: m.y + CARD_H };
      case 'left': return { x: m.x, y: m.y + CARD_H / 2 };
      case 'right': return { x: m.x + CARD_W, y: m.y + CARD_H / 2 };
    }
  };

  const getCenterX = (m: FamilyMember) => m.x + CARD_W / 2;
  const getCenterY = (m: FamilyMember) => m.y + CARD_H / 2;

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

        // For couple lines, use left/right anchors
        const coupleFrom = from.x < to.x
          ? getAnchor(from, 'right')
          : getAnchor(from, 'left');
        const coupleTo = from.x < to.x
          ? getAnchor(to, 'left')
          : getAnchor(to, 'right');

        if (rel.type === 'couple') {
          return (
            <g key={rel.id}>
              <line
                x1={coupleFrom.x} y1={coupleFrom.y}
                x2={coupleTo.x} y2={coupleTo.y}
                stroke="hsl(var(--foreground))"
                strokeWidth={2}
                strokeOpacity={0.3}
              />
              {(rel.marriageYear || rel.divorceYear) && (
                <text
                  x={(coupleFrom.x + coupleTo.x) / 2}
                  y={(coupleFrom.y + coupleTo.y) / 2 + 20}
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

        // Parent-child: from bottom of parent to top of child
        const parentAnchor = getAnchor(from, 'bottom');
        const childAnchor = getAnchor(to, 'top');
        const midY = parentAnchor.y + (childAnchor.y - parentAnchor.y) * 0.5;
        return (
          <g key={rel.id}>
            <path
              d={`M ${parentAnchor.x} ${parentAnchor.y} V ${midY} H ${childAnchor.x} V ${childAnchor.y}`}
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
