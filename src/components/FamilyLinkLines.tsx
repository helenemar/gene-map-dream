import React from 'react';
import { FamilyMember, Union, UnionStatus } from '@/types/genogram';
import RelationshipBadge from './RelationshipBadge';

const CARD_W = 186;
const CARD_H = 64;
const MARGIN = 5;
const RAIL_MIN_GAP = 15; // Minimum 15px between parallel vertical descent lines

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
 * Check if a vertical segment from (x, y1) to (x, y2) intersects a card bounding box.
 * Returns the card if intersection found.
 */
function findCardIntersection(
  x: number, y1: number, y2: number,
  members: FamilyMember[],
  excludeIds: Set<string>,
): FamilyMember | null {
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  for (const m of members) {
    if (excludeIds.has(m.id)) continue;
    // Card bounding box with margin
    const cardLeft = m.x - MARGIN;
    const cardRight = m.x + CARD_W + MARGIN;
    const cardTop = m.y - MARGIN;
    const cardBottom = m.y + CARD_H + MARGIN;
    // Check if vertical line at x passes through card
    if (x >= cardLeft && x <= cardRight && maxY >= cardTop && minY <= cardBottom) {
      return m;
    }
  }
  return null;
}

/**
 * Generate Manhattan-routed orthogonal path from (x1,y1) to (x2,y2),
 * routing around any card obstacles.
 */
function manhattanRoute(
  x1: number, y1: number, x2: number, y2: number,
  members: FamilyMember[],
  excludeIds: Set<string>,
): string {
  // Simple case: straight vertical
  if (Math.abs(x1 - x2) < 1) {
    const obstacle = findCardIntersection(x1, y1, y2, members, excludeIds);
    if (!obstacle) {
      return `M ${x1} ${y1} L ${x1} ${y2}`;
    }
    // Route around the obstacle
    const cardLeft = obstacle.x - MARGIN * 2;
    const cardRight = obstacle.x + CARD_W + MARGIN * 2;
    const detourX = (Math.abs(x1 - cardLeft) < Math.abs(x1 - cardRight))
      ? cardLeft - RAIL_MIN_GAP
      : cardRight + RAIL_MIN_GAP;
    const cardTop = obstacle.y - MARGIN;
    const cardBottom = obstacle.y + CARD_H + MARGIN;
    return `M ${x1} ${y1} L ${x1} ${cardTop} L ${detourX} ${cardTop} L ${detourX} ${cardBottom} L ${x1} ${cardBottom} L ${x1} ${y2}`;
  }
  // Orthogonal L-route: go vertical to midpoint, then horizontal, then vertical
  const midY = (y1 + y2) / 2;
  return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
}

/**
 * Apply rail spacing: ensure parallel vertical descent lines maintain minimum gap.
 * Returns adjusted X positions for each child drop.
 */
function computeRails(childXs: number[]): number[] {
  if (childXs.length <= 1) return [...childXs];
  const rails = childXs.map((x, i) => ({ x, idx: i }));
  rails.sort((a, b) => a.x - b.x);

  // Enforce minimum gap
  for (let i = 1; i < rails.length; i++) {
    const gap = rails[i].x - rails[i - 1].x;
    if (gap < RAIL_MIN_GAP) {
      rails[i].x = rails[i - 1].x + RAIL_MIN_GAP;
    }
  }

  // Map back to original indices
  const result = new Array(childXs.length);
  for (const r of rails) {
    result[r.idx] = r.x;
  }
  return result;
}

/**
 * Render the union line between two partners based on status.
 * Strictly orthogonal (horizontal only for union lines).
 */
const UnionLine: React.FC<{
  x1: number; y1: number; x2: number; y2: number;
  status: UnionStatus;
}> = ({ x1, y1, x2, y2, status }) => {
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
    // Union lines are always horizontal (orthogonal)
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
    </g>
  );
};

/**
 * FamilyLinkLines renders strictly orthogonal (right-angle) family links:
 * 1. Union lines (horizontal) between partners
 * 2. Descent stem (vertical) from union midpoint
 * 3. Sibling comb (horizontal bar) connecting children
 * 4. Individual drops from comb to each child's top anchor
 *
 * Features:
 * - Rail system: parallel descent lines maintain ≥20px spacing
 * - Manhattan routing: stems avoid card obstacles
 * - All segments are strictly 90° (no diagonals)
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

        // Union midpoint (on horizontal line)
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
              />
              <RelationshipBadge
                union={union}
                x={unionMidX}
                y={unionMidY}
                offsetForMark={union.status === 'divorced' || union.status === 'separated'}
                onClick={() => console.log('Edit union', union.id)}
              />
            </g>
          );
        }

        const childAnchors = childMembers.map(c => getAnchor(c, 'top'));

        // Orthogonal comb Y: midpoint between union and top of children
        const topChildY = Math.min(...childAnchors.map(a => a.y));
        const combY = unionMidY + (topChildY - unionMidY) * 0.5;

        // Apply rail spacing to descent line X positions
        const rawChildXs = childAnchors.map(a => a.x);
        const railXs = computeRails(rawChildXs);

        const combLeftX = Math.min(...railXs);
        const combRightX = Math.max(...railXs);

        const stroke = 'hsl(var(--foreground))';
        const opacity = 0.3;
        const sw = 1.5;

        // Exclude union partners and their children from obstacle detection
        const excludeIds = new Set([union.partner1, union.partner2, ...union.children]);

        // Compute stem path with Manhattan routing (avoids cards)
        const stemPath = manhattanRoute(unionMidX, unionMidY, unionMidX, combY, members, excludeIds);

        // If stem doesn't land on the comb, connect with horizontal segment
        const stemNeedsCombConnect = Math.abs(unionMidX - combLeftX) > 1 || Math.abs(unionMidX - combRightX) > 1;

        return (
          <g key={union.id}>
            {/* Union line (horizontal, orthogonal) */}
            <UnionLine
              x1={leftAnchor.x} y1={leftAnchor.y}
              x2={rightAnchor.x} y2={rightAnchor.y}
              status={union.status}
            />
            <RelationshipBadge
              union={union}
              x={unionMidX}
              y={unionMidY}
              offsetForMark={union.status === 'divorced' || union.status === 'separated'}
              onClick={() => console.log('Edit union', union.id)}
            />

            {/* Descent stem: vertical from union midpoint down to comb Y (Manhattan routed) */}
            <path
              d={stemPath}
              stroke={stroke} strokeWidth={sw} strokeOpacity={opacity} fill="none"
            />

            {/* Sibling comb: horizontal bar at combY */}
            {childAnchors.length > 1 && (
              <path
                d={`M ${combLeftX} ${combY} L ${combRightX} ${combY}`}
                stroke={stroke} strokeWidth={sw} strokeOpacity={opacity} fill="none"
              />
            )}

            {/* Orthogonal drops: from comb rail position down, then horizontal to child anchor */}
            {childAnchors.map((anchor, i) => {
              const railX = railXs[i];
              const needsHorizontal = Math.abs(railX - anchor.x) > 1;

              if (needsHorizontal) {
                // Rail was offset: go vertical on rail, then horizontal to child, then vertical to child
                return (
                  <path
                    key={i}
                    d={`M ${railX} ${combY} L ${railX} ${anchor.y - RAIL_MIN_GAP} L ${anchor.x} ${anchor.y - RAIL_MIN_GAP} L ${anchor.x} ${anchor.y}`}
                    stroke={stroke} strokeWidth={sw} strokeOpacity={opacity} fill="none"
                  />
                );
              }
              // Direct vertical drop
              return (
                <path
                  key={i}
                  d={`M ${railX} ${combY} L ${railX} ${anchor.y}`}
                  stroke={stroke} strokeWidth={sw} strokeOpacity={opacity} fill="none"
                />
              );
            })}

            {/* Single child: connect stem to child via comb */}
            {childAnchors.length === 1 && (
              <path
                d={`M ${unionMidX} ${combY} L ${railXs[0]} ${combY}`}
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
