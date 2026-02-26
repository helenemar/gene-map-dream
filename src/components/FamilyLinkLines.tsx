import React from 'react';
import { FamilyMember, Union, UnionStatus } from '@/types/genogram';

const CARD_W = 186;
const CARD_H = 64;
const MARGIN = 5;

interface FamilyLinkLinesProps {
  members: FamilyMember[];
  unions: Union[];
}

const getAnchor = (m: FamilyMember, side: 'top' | 'bottom' | 'left' | 'right') => {
  switch (side) {
    case 'top': return { x: m.x + CARD_W / 2, y: m.y - MARGIN };
    case 'bottom': return { x: m.x + CARD_W / 2, y: m.y + CARD_H + MARGIN };
    case 'left': return { x: m.x - MARGIN, y: m.y + CARD_H / 2 };
    case 'right': return { x: m.x + CARD_W + MARGIN, y: m.y + CARD_H / 2 };
  }
};

/**
 * Render the union line between two partners based on status.
 */
const UnionLine: React.FC<{
  x1: number; y1: number; x2: number; y2: number;
  status: UnionStatus;
  marriageYear?: number;
  divorceYear?: number;
}> = ({ x1, y1, x2, y2, status, marriageYear, divorceYear }) => {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const stroke = 'hsl(var(--foreground))';
  const opacity = 0.5;

  const renderStatusMark = () => {
    const markSize = 6;
    switch (status) {
      case 'separated':
        return (
          <line
            x1={midX - markSize} y1={midY + markSize}
            x2={midX + markSize} y2={midY - markSize}
            stroke={stroke} strokeWidth={2} strokeOpacity={opacity}
          />
        );
      case 'divorced':
        return (
          <>
            <line
              x1={midX - markSize - 3} y1={midY + markSize}
              x2={midX + markSize - 3} y2={midY - markSize}
              stroke={stroke} strokeWidth={2} strokeOpacity={opacity}
            />
            <line
              x1={midX - markSize + 3} y1={midY + markSize}
              x2={midX + markSize + 3} y2={midY - markSize}
              stroke={stroke} strokeWidth={2} strokeOpacity={opacity}
            />
          </>
        );
      case 'widowed':
        return (
          <>
            <line x1={midX - 5} y1={midY - 5} x2={midX + 5} y2={midY + 5}
              stroke={stroke} strokeWidth={2} strokeOpacity={opacity} />
            <line x1={midX + 5} y1={midY - 5} x2={midX - 5} y2={midY + 5}
              stroke={stroke} strokeWidth={2} strokeOpacity={opacity} />
          </>
        );
      default:
        return null;
    }
  };

  const renderLine = () => {
    switch (status) {
      case 'common_law':
        return (
          <line x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={stroke} strokeWidth={2} strokeOpacity={opacity}
            strokeDasharray="8 4" />
        );
      default:
        return (
          <line x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={stroke} strokeWidth={2} strokeOpacity={opacity} />
        );
    }
  };

  return (
    <g>
      {renderLine()}
      {renderStatusMark()}
      {(marriageYear || divorceYear) && (
        <text
          x={midX} y={midY + 18}
          textAnchor="middle"
          className="fill-muted-foreground text-[10px]"
        >
          {marriageYear && `m. ${marriageYear}`}
          {divorceYear && ` · div. ${divorceYear}`}
        </text>
      )}
    </g>
  );
};

/**
 * FamilyLinkLines renders orthogonal (right-angle) family links:
 * 1. Union lines (horizontal) between partners
 * 2. Descent stem (vertical) from union midpoint
 * 3. Sibling comb (horizontal bar) connecting children
 * 4. Individual drops from comb to each child's top anchor
 *
 * All paths use strict orthogonal routing (no diagonals).
 */
const FamilyLinkLines: React.FC<FamilyLinkLinesProps> = ({ members, unions }) => {
  const getMember = (id: string) => members.find(m => m.id === id);

  return (
    <svg className="absolute pointer-events-none" style={{ zIndex: 0, overflow: 'visible', top: 0, left: 0, width: 1, height: 1 }}>
      {unions.map(union => {
        const p1 = getMember(union.partner1);
        const p2 = getMember(union.partner2);
        if (!p1 || !p2) return null;

        // Determine left/right partners
        const [left, right] = p1.x < p2.x ? [p1, p2] : [p2, p1];
        const leftAnchor = getAnchor(left, 'right');
        const rightAnchor = getAnchor(right, 'left');

        // Union midpoint
        const unionMidX = (leftAnchor.x + rightAnchor.x) / 2;
        const unionMidY = (leftAnchor.y + rightAnchor.y) / 2;

        // Get children sorted left to right
        const childMembers = union.children
          .map(getMember)
          .filter((m): m is FamilyMember => !!m)
          .sort((a, b) => a.x - b.x);

        if (childMembers.length === 0) {
          return (
            <g key={union.id}>
              <UnionLine
                x1={leftAnchor.x} y1={leftAnchor.y}
                x2={rightAnchor.x} y2={rightAnchor.y}
                status={union.status}
                marriageYear={union.marriageYear}
                divorceYear={union.divorceYear}
              />
            </g>
          );
        }

        const childAnchors = childMembers.map(c => getAnchor(c, 'top'));

        // Orthogonal comb Y: fixed midpoint between union and top of children
        const topChildY = Math.min(...childAnchors.map(a => a.y));
        const combY = unionMidY + (topChildY - unionMidY) * 0.5;

        const combLeftX = childAnchors[0].x;
        const combRightX = childAnchors[childAnchors.length - 1].x;

        const stroke = 'hsl(var(--foreground))';
        const opacity = 0.3;
        const sw = 1.5;

        // Build orthogonal path segments
        return (
          <g key={union.id}>
            {/* Union line */}
            <UnionLine
              x1={leftAnchor.x} y1={leftAnchor.y}
              x2={rightAnchor.x} y2={rightAnchor.y}
              status={union.status}
              marriageYear={union.marriageYear}
              divorceYear={union.divorceYear}
            />

            {/* Descent stem: vertical from union midpoint down to comb Y */}
            <path
              d={`M ${unionMidX} ${unionMidY} L ${unionMidX} ${combY}`}
              stroke={stroke} strokeWidth={sw} strokeOpacity={opacity} fill="none"
            />

            {/* Sibling comb: horizontal bar at combY */}
            {childAnchors.length > 1 && (
              <path
                d={`M ${combLeftX} ${combY} L ${combRightX} ${combY}`}
                stroke={stroke} strokeWidth={sw} strokeOpacity={opacity} fill="none"
              />
            )}

            {/* Orthogonal drops: vertical from combY to each child top anchor */}
            {childAnchors.map((anchor, i) => (
              <path
                key={i}
                d={`M ${anchor.x} ${combY} L ${anchor.x} ${anchor.y}`}
                stroke={stroke} strokeWidth={sw} strokeOpacity={opacity} fill="none"
              />
            ))}

            {/* Single child: connect stem directly */}
            {childAnchors.length === 1 && (
              <path
                d={`M ${unionMidX} ${combY} L ${childAnchors[0].x} ${combY}`}
                stroke={stroke} strokeWidth={sw} strokeOpacity={opacity} fill="none"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
};

export default FamilyLinkLines;

/**
 * Static preview for design system
 */
export const FamilyLinkPreview: React.FC<{ status: UnionStatus; width?: number; height?: number }> = ({
  status, width = 200, height = 32,
}) => {
  const pad = 10;
  return (
    <svg width={width} height={height} className="shrink-0">
      <UnionLine
        x1={pad} y1={height / 2}
        x2={width - pad} y2={height / 2}
        status={status}
      />
    </svg>
  );
};
