import React from 'react';
import { FamilyMember, Union, UnionStatus } from '@/types/genogram';
import RelationshipBadge from './RelationshipBadge';

const CARD_W = 186;
const CARD_H = 64;
const RAIL_OFFSET = 20; // Offset for parallel rail conflict resolution

interface FamilyLinkLinesProps {
  members: FamilyMember[];
  unions: Union[];
}

/** Snap exactly to card border — zero gap */
const getAnchor = (m: FamilyMember, side: 'top' | 'bottom' | 'left' | 'right') => {
  switch (side) {
    case 'top': return { x: m.x + CARD_W / 2, y: m.y };
    case 'bottom': return { x: m.x + CARD_W / 2, y: m.y + CARD_H };
    case 'left': return { x: m.x, y: m.y + CARD_H / 2 };
    case 'right': return { x: m.x + CARD_W, y: m.y + CARD_H / 2 };
  }
};

/**
 * UnionLine: ALWAYS horizontal.
 */
const UnionLine: React.FC<{
  x1: number; y1: number; x2: number; y2: number;
  status: UnionStatus;
}> = ({ x1, y1, x2, y2, status }) => {
  const lineY = (y1 + y2) / 2;
  const midX = (x1 + x2) / 2;
  const stroke = 'hsl(var(--foreground))';
  const opacity = 0.5;
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
      <line x1={x1} y1={lineY} x2={x2} y2={lineY}
        stroke={stroke} strokeWidth={2} strokeOpacity={opacity}
        strokeDasharray={dashArray} />
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
 * FamilyLinkLines — MyHeritage-style orthogonal comb routing.
 *
 * Structure for each union with children:
 *   1. Horizontal union line between partners (forced horizontal)
 *   2. Vertical stem from union midpoint down to comb rail Y
 *   3. Horizontal comb bar spanning all children
 *   4. Vertical drops from comb straight down to each child's top
 *
 * Rail conflict resolution:
 *   If two combs would overlap on the same Y, offset by RAIL_OFFSET (20px).
 *
 * Rules:
 *   - ZERO diagonal lines. Every segment is strictly H or V.
 *   - Drops go straight down from the child's center X.
 */
const FamilyLinkLines: React.FC<FamilyLinkLinesProps> = ({ members, unions }) => {
  const getMember = (id: string) => members.find(m => m.id === id);

  const stroke = 'hsl(var(--foreground))';
  const opacity = 0.3;
  const sw = 1.5;

  // ─── Rail conflict resolution ───
  // Compute comb Y for each union, then offset overlapping rails
  interface CombInfo {
    unionId: string;
    baseY: number; // midpoint between parent bottom and child top
    leftX: number;
    rightX: number;
    finalY: number;
  }

  const combInfos: CombInfo[] = [];

  for (const union of unions) {
    const p1 = getMember(union.partner1);
    const p2 = getMember(union.partner2);
    if (!p1 || !p2) continue;

    const childMembers = union.children
      .map(getMember)
      .filter((m): m is FamilyMember => !!m)
      .sort((a, b) => a.x - b.x);

    if (childMembers.length === 0) continue;

    const [left, right] = p1.x < p2.x ? [p1, p2] : [p2, p1];
    const leftAnchor = getAnchor(left, 'right');
    const rightAnchor = getAnchor(right, 'left');
    const unionLineY = (leftAnchor.y + rightAnchor.y) / 2;
    const unionMidX = (leftAnchor.x + rightAnchor.x) / 2;

    const childAnchors = childMembers.map(c => getAnchor(c, 'top'));
    const childDropXs = childAnchors.map(a => a.x);

    // Base comb Y: midpoint between parent bottom and first child top
    const parentBottom = unionLineY;
    const childTop = Math.min(...childAnchors.map(a => a.y));
    const baseY = parentBottom + (childTop - parentBottom) / 2;

    const combLeftX = Math.min(unionMidX, ...childDropXs);
    const combRightX = Math.max(unionMidX, ...childDropXs);

    combInfos.push({
      unionId: union.id,
      baseY,
      leftX: combLeftX,
      rightX: combRightX,
      finalY: baseY,
    });
  }

  // Detect and resolve rail overlaps: if two combs share similar Y and overlap in X, offset
  combInfos.sort((a, b) => a.baseY - b.baseY);
  for (let i = 0; i < combInfos.length; i++) {
    for (let j = i + 1; j < combInfos.length; j++) {
      const a = combInfos[i];
      const b = combInfos[j];
      // Check Y proximity and X overlap
      if (Math.abs(a.finalY - b.finalY) < RAIL_OFFSET &&
          a.leftX < b.rightX && b.leftX < a.rightX) {
        // Offset the second rail down
        b.finalY = a.finalY + RAIL_OFFSET;
      }
    }
  }

  const combYMap = new Map(combInfos.map(c => [c.unionId, c.finalY]));

  return (
    <svg className="absolute pointer-events-none" style={{ zIndex: 0, overflow: 'visible', top: 0, left: 0, width: 1, height: 1, opacity: 0.9 }}>
      {unions.map(union => {
        const p1 = getMember(union.partner1);
        const p2 = getMember(union.partner2);
        if (!p1 || !p2) return null;

        const [left, right] = p1.x < p2.x ? [p1, p2] : [p2, p1];
        const leftAnchor = getAnchor(left, 'right');
        const rightAnchor = getAnchor(right, 'left');
        const unionLineY = (leftAnchor.y + rightAnchor.y) / 2;
        const unionMidX = (leftAnchor.x + rightAnchor.x) / 2;

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

        const childAnchors = childMembers.map(c => getAnchor(c, 'top'));
        const childDropXs = childAnchors.map(a => a.x);

        // Use resolved comb Y (with rail offset if needed)
        const combY = combYMap.get(union.id) ?? unionLineY + 60;

        // Count effective drop points: each non-twin child = 1, each twin group = 1
        const twinGroups = new Set(childMembers.filter(c => c.twinGroup).map(c => c.twinGroup));
        const nonTwinCount = childMembers.filter(c => !c.twinGroup).length;
        const effectiveDropCount = nonTwinCount + twinGroups.size;

        const childLeftX = Math.min(...childDropXs);
        const childRightX = Math.max(...childDropXs);
        const combLeftX = Math.min(unionMidX, childLeftX);
        const combRightX = Math.max(unionMidX, childRightX);

        // Compute twin fork positions for single-group connector
        const twinForkXs: number[] = [];
        if (twinGroups.size > 0) {
          for (const tg of twinGroups) {
            const twins = childMembers.filter(c => c.twinGroup === tg);
            const twinAnchorsForGroup = twins.map(t => getAnchor(t, 'top'));
            const forkX = twinAnchorsForGroup.reduce((sum, a) => sum + a.x, 0) / twinAnchorsForGroup.length;
            twinForkXs.push(forkX);
          }
        }

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

            {/* 2. Vertical stem: union midpoint → comb Y */}
            <line
              x1={unionMidX} y1={unionLineY}
              x2={unionMidX} y2={combY}
              stroke={stroke} strokeWidth={sw} strokeOpacity={opacity}
            />

            {/* 3. Horizontal comb bar — only when multiple effective drop points */}
            {effectiveDropCount > 1 && (
              <line
                x1={combLeftX} y1={combY}
                x2={combRightX} y2={combY}
                stroke={stroke} strokeWidth={sw} strokeOpacity={opacity}
              />
            )}

            {/* 4. Vertical drops: comb → each child (with twin inverted-V) */}
            {(() => {
              const elements: React.ReactNode[] = [];
              const processed = new Set<number>();

              for (let i = 0; i < childMembers.length; i++) {
                if (processed.has(i)) continue;

                const child = childMembers[i];
                // Detect twin group
                if (child.twinGroup) {
                  // Find all siblings in same twin group
                  const twinIndices = childMembers
                    .map((c, idx) => ({ c, idx }))
                    .filter(({ c }) => c.twinGroup === child.twinGroup)
                    .map(({ idx }) => idx);

                  twinIndices.forEach(idx => processed.add(idx));

                  // Inverted V: single fork point on comb, branches to each twin
                  const twinAnchorsLocal = twinIndices.map(idx => childAnchors[idx]);
                  const forkX = twinAnchorsLocal.reduce((sum, a) => sum + a.x, 0) / twinAnchorsLocal.length;
                  const forkY = combY + 20; // Fork point slightly below comb

                  // Stem from comb to fork
                  elements.push(
                    <line key={`twin-stem-${child.twinGroup}`}
                      x1={forkX} y1={combY} x2={forkX} y2={forkY}
                      stroke={stroke} strokeWidth={sw} strokeOpacity={opacity}
                    />
                  );

                  // Branches from fork to each twin
                  twinAnchorsLocal.forEach((anchor, ti) => {
                    elements.push(
                      <line key={`twin-branch-${child.twinGroup}-${ti}`}
                        x1={forkX} y1={forkY}
                        x2={anchor.x} y2={anchor.y}
                        stroke={stroke} strokeWidth={sw} strokeOpacity={opacity}
                      />
                    );
                  });
                } else {
                  // Standard vertical drop
                  processed.add(i);
                  elements.push(
                    <line key={`drop-${i}`}
                      x1={childAnchors[i].x} y1={combY}
                      x2={childAnchors[i].x} y2={childAnchors[i].y}
                      stroke={stroke} strokeWidth={sw} strokeOpacity={opacity}
                    />
                  );
                }
              }
              return elements;
            })()}

            {/* Single drop point: horizontal connector from stem if offset */}
            {effectiveDropCount === 1 && (() => {
              // Find the single drop X: either a single child or a single twin fork
              const dropX = nonTwinCount === 1
                ? childAnchors[childMembers.findIndex(c => !c.twinGroup)].x
                : twinForkXs[0];
              return Math.abs(unionMidX - dropX) > 1 ? (
                <line
                  x1={unionMidX} y1={combY}
                  x2={dropX} y2={combY}
                  stroke={stroke} strokeWidth={sw} strokeOpacity={opacity}
                />
              ) : null;
            })()}
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
