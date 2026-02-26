import React from 'react';
import { FamilyMember, Union, UnionStatus } from '@/types/genogram';
import RelationshipBadge from './RelationshipBadge';

const CARD_W = 186;
const CARD_H = 64;
const MARGIN = 5;
const RAIL_GAP = 20; // Minimum gap between parallel descent rails

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
 * UnionLine: ALWAYS horizontal.
 * Even if partners are at different Y, we force horizontal at the average Y.
 */
const UnionLine: React.FC<{
  x1: number; y1: number; x2: number; y2: number;
  status: UnionStatus;
}> = ({ x1, y1, x2, y2, status }) => {
  // Force horizontal: use average Y
  const lineY = (y1 + y2) / 2;
  const midX = (x1 + x2) / 2;
  const stroke = 'hsl(var(--foreground))';
  const opacity = 0.5;

  // If partners are NOT at the same Y, draw orthogonal connectors
  const needsConnectors = Math.abs(y1 - y2) > 1;

  const renderStatusMark = () => {
    const markSize = 6;
    switch (status) {
      case 'separated':
        return (
          <line
            x1={midX - markSize} y1={lineY + markSize}
            x2={midX + markSize} y2={lineY - markSize}
            stroke={stroke} strokeWidth={2} strokeOpacity={opacity}
          />
        );
      case 'divorced':
        return (
          <>
            <line
              x1={midX - markSize - 3} y1={lineY + markSize}
              x2={midX + markSize - 3} y2={lineY - markSize}
              stroke={stroke} strokeWidth={2} strokeOpacity={opacity}
            />
            <line
              x1={midX - markSize + 3} y1={lineY + markSize}
              x2={midX + markSize + 3} y2={lineY - markSize}
              stroke={stroke} strokeWidth={2} strokeOpacity={opacity}
            />
          </>
        );
      case 'widowed':
        return (
          <>
            <line x1={midX - 5} y1={lineY - 5} x2={midX + 5} y2={lineY + 5}
              stroke={stroke} strokeWidth={2} strokeOpacity={opacity} />
            <line x1={midX + 5} y1={lineY - 5} x2={midX - 5} y2={lineY + 5}
              stroke={stroke} strokeWidth={2} strokeOpacity={opacity} />
          </>
        );
      default:
        return null;
    }
  };

  const dashArray = status === 'common_law' ? '8 4' : undefined;

  return (
    <g>
      {/* Horizontal union line */}
      <line x1={x1} y1={lineY} x2={x2} y2={lineY}
        stroke={stroke} strokeWidth={2} strokeOpacity={opacity}
        strokeDasharray={dashArray} />
      {/* Vertical connectors if partners are misaligned */}
      {needsConnectors && (
        <>
          <line x1={x1} y1={y1} x2={x1} y2={lineY}
            stroke={stroke} strokeWidth={1.5} strokeOpacity={opacity * 0.6} />
          <line x1={x2} y1={y2} x2={x2} y2={lineY}
            stroke={stroke} strokeWidth={1.5} strokeOpacity={opacity * 0.6} />
        </>
      )}
      {renderStatusMark()}
    </g>
  );
};

/**
 * FamilyLinkLines — Strictly orthogonal (90° only) family links.
 *
 * Structure for each union with children:
 *   1. Horizontal union line between partners (forced horizontal)
 *   2. Vertical stem from union midpoint down to comb Y
 *   3. Horizontal comb bar spanning all children
 *   4. Vertical drops from comb straight down to each child's top
 *
 * Rules:
 *   - ZERO diagonal lines. Every segment is H or V.
 *   - Drops go straight down from the child's center X on the comb to the child.
 *   - No rail offset needed when drops align with children — just straight vertical.
 */
const FamilyLinkLines: React.FC<FamilyLinkLinesProps> = ({ members, unions }) => {
  const getMember = (id: string) => members.find(m => m.id === id);

  const stroke = 'hsl(var(--foreground))';
  const opacity = 0.3;
  const sw = 1.5;

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

        // Union line Y: forced horizontal at average Y
        const unionLineY = (leftAnchor.y + rightAnchor.y) / 2;
        const unionMidX = (leftAnchor.x + rightAnchor.x) / 2;

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
              />
              <RelationshipBadge
                union={union}
                x={unionMidX}
                y={unionLineY}
                offsetForMark={union.status === 'divorced' || union.status === 'separated'}
                onClick={() => console.log('Edit union', union.id)}
              />
            </g>
          );
        }

        // Child top anchors
        const childAnchors = childMembers.map(c => getAnchor(c, 'top'));

        // Comb Y: exactly halfway between union line and children top
        const topChildY = Math.min(...childAnchors.map(a => a.y));
        const combY = unionLineY + (topChildY - unionLineY) * 0.5;

        // Each child's drop X = child's own center X (straight vertical, no offset)
        const childDropXs = childAnchors.map(a => a.x);

        const combLeftX = Math.min(unionMidX, ...childDropXs);
        const combRightX = Math.max(unionMidX, ...childDropXs);

        return (
          <g key={union.id}>
            {/* 1. Union line (horizontal) */}
            <UnionLine
              x1={leftAnchor.x} y1={leftAnchor.y}
              x2={rightAnchor.x} y2={rightAnchor.y}
              status={union.status}
            />
            <RelationshipBadge
              union={union}
              x={unionMidX}
              y={unionLineY}
              offsetForMark={union.status === 'divorced' || union.status === 'separated'}
              onClick={() => console.log('Edit union', union.id)}
            />

            {/* 2. Vertical stem: union midpoint straight down to comb Y */}
            <line
              x1={unionMidX} y1={unionLineY}
              x2={unionMidX} y2={combY}
              stroke={stroke} strokeWidth={sw} strokeOpacity={opacity}
            />

            {/* 3. Horizontal comb bar */}
            {childMembers.length > 1 && (
              <line
                x1={combLeftX} y1={combY}
                x2={combRightX} y2={combY}
                stroke={stroke} strokeWidth={sw} strokeOpacity={opacity}
              />
            )}

            {/* 4. Vertical drops: straight down from comb to each child */}
            {childAnchors.map((anchor, i) => (
              <line
                key={i}
                x1={anchor.x} y1={combY}
                x2={anchor.x} y2={anchor.y}
                stroke={stroke} strokeWidth={sw} strokeOpacity={opacity}
              />
            ))}

            {/* Single child: horizontal connector from stem to child if needed */}
            {childMembers.length === 1 && Math.abs(unionMidX - childDropXs[0]) > 1 && (
              <line
                x1={unionMidX} y1={combY}
                x2={childDropXs[0]} y2={combY}
                stroke={stroke} strokeWidth={sw} strokeOpacity={opacity}
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
