import React from 'react';
import { FamilyMember, Union, UnionStatus } from '@/types/genogram';
import UnionBadge from './UnionBadge';

const CARD_W = 220;
const CARD_H = 64;
const CORRIDOR_GAP = 30; // Minimum vertical gap between comb corridors
const CARD_CLEARANCE = 20; // Horizontal clearance around cards for rerouting

interface FamilyLinkLinesProps {
  members: FamilyMember[];
  unions: Union[];
  onEditUnion?: (unionId: string) => void;
  searchMatchedUnionIds?: Set<string>;
  isSearchActive?: boolean;
}

const getAnchor = (m: FamilyMember, side: 'top' | 'bottom' | 'left' | 'right') => {
  switch (side) {
    case 'top': return { x: m.x + CARD_W / 2, y: m.y };
    case 'bottom': return { x: m.x + CARD_W / 2, y: m.y + CARD_H };
    case 'left': return { x: m.x, y: m.y + CARD_H / 2 };
    case 'right': return { x: m.x + CARD_W, y: m.y + CARD_H / 2 };
  }
};

// ─── Union Line (horizontal couple connector) ────────────────────────

const UnionLine: React.FC<{
  x1: number; y1: number; x2: number; y2: number;
  status: UnionStatus;
}> = ({ x1, y1, x2, y2, status }) => {
  const lineY = (y1 + y2) / 2;
  const stroke = 'hsl(var(--foreground))';
  const opacity = 0.5;
  const needsConnectors = Math.abs(y1 - y2) > 1;
  const dashArray = (status === 'common_law' || status === 'love_affair') ? '8 4' : undefined;

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
    </g>
  );
};

// ─── Segment types for global collision tracking ─────────────────────

interface HSegment {
  unionId: string;
  y: number;
  xMin: number;
  xMax: number;
}

interface VSegment {
  unionId: string;
  x: number;
  yMin: number;
  yMax: number;
}

// ─── Collision queries ───────────────────────────────────────────────

/** Find horizontal segments that a vertical line at X would cross */
function findHCrossings(
  x: number, yTop: number, yBottom: number,
  hSegs: HSegment[], excludeId: string
): number[] {
  const crossings: number[] = [];
  for (const seg of hSegs) {
    if (seg.unionId === excludeId) continue;
    if (x >= seg.xMin - 2 && x <= seg.xMax + 2 && seg.y > yTop + 2 && seg.y < yBottom - 2) {
      crossings.push(seg.y);
    }
  }
  return crossings.sort((a, b) => a - b);
}

/** Check if a vertical line at X from yTop→yBottom would overlap an existing vertical segment */
function findVConflicts(
  x: number, yTop: number, yBottom: number,
  vSegs: VSegment[], excludeId: string, tolerance: number = 4
): VSegment[] {
  return vSegs.filter(seg => {
    if (seg.unionId === excludeId) return false;
    if (Math.abs(seg.x - x) > tolerance) return false;
    // Y ranges overlap?
    return seg.yMin < yBottom - 2 && seg.yMax > yTop + 2;
  });
}

/**
 * Build a strict Manhattan vertical path from (x, yTop) to (x, yBottom),
 * rerouting around any horizontal segments it would cross.
 * Uses a side-step approach: step left/right, go past the crossing, step back.
 */
function buildManhattanVerticalPath(
  x: number, yTop: number, yBottom: number,
  hCrossings: number[],
  vSegs: VSegment[],
  excludeId: string,
  preferredDir: number = 1 // +1 = right, -1 = left
): string {
  if (hCrossings.length === 0) {
    return `M ${x} ${yTop} L ${x} ${yBottom}`;
  }

  // Find a clear X offset to reroute through
  let offsetX = x + CARD_CLEARANCE * preferredDir;
  // Check if that X is also occupied by a vertical segment
  const vConflicts = findVConflicts(offsetX, yTop, yBottom, vSegs, excludeId, 6);
  if (vConflicts.length > 0) {
    // Try the other direction
    offsetX = x - CARD_CLEARANCE * preferredDir;
    const vConflicts2 = findVConflicts(offsetX, yTop, yBottom, vSegs, excludeId, 6);
    if (vConflicts2.length > 0) {
      // Double the offset
      offsetX = x + CARD_CLEARANCE * 2 * preferredDir;
    }
  }

  let d = `M ${x} ${yTop}`;

  for (const crossY of hCrossings) {
    const above = crossY - 8;
    const below = crossY + 8;
    // Manhattan detour: vertical → horizontal → vertical → horizontal → vertical
    d += ` L ${x} ${above}`;
    d += ` L ${offsetX} ${above}`;
    d += ` L ${offsetX} ${below}`;
    d += ` L ${x} ${below}`;
  }

  d += ` L ${x} ${yBottom}`;
  return d;
}

// ─── Main Component ─────────────────────────────────────────────────

const FamilyLinkLines: React.FC<FamilyLinkLinesProps> = ({
  members, unions, onEditUnion, searchMatchedUnionIds, isSearchActive,
}) => {
  const getMember = (id: string) => members.find(m => m.id === id);

  const stroke = 'hsl(var(--foreground))';
  const opacity = 0.3;
  const sw = 1.5;

  // ═══ PHASE 1: Compute geometry for each union ═══

  interface UnionGeometry {
    union: Union;
    leftAnchor: { x: number; y: number };
    rightAnchor: { x: number; y: number };
    unionLineY: number;
    unionMidX: number;
    childMembers: FamilyMember[];
    childAnchors: { x: number; y: number }[];
    combY: number;
    combLeftX: number;
    combRightX: number;
    effectiveDropCount: number;
    twinGroups: Set<string | undefined>;
    nonTwinCount: number;
    twinForkXs: number[];
  }

  const geometries: UnionGeometry[] = [];

  interface CombInfo {
    unionId: string;
    baseY: number;
    leftX: number;
    rightX: number;
    finalY: number;
  }

  const combInfos: CombInfo[] = [];

  for (const union of unions) {
    const p1 = getMember(union.partner1);
    const p2 = getMember(union.partner2);
    if (!p1 || !p2) continue;

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
      geometries.push({
        union, leftAnchor, rightAnchor, unionLineY, unionMidX,
        childMembers: [], childAnchors: [], combY: 0,
        combLeftX: 0, combRightX: 0, effectiveDropCount: 0,
        twinGroups: new Set(), nonTwinCount: 0, twinForkXs: [],
      });
      continue;
    }

    const childAnchors = childMembers.map(c => getAnchor(c, 'top'));
    const childDropXs = childAnchors.map(a => a.x);

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

    const twinGroups = new Set(childMembers.filter(c => c.twinGroup).map(c => c.twinGroup));
    const nonTwinCount = childMembers.filter(c => !c.twinGroup).length;
    const effectiveDropCount = nonTwinCount + twinGroups.size;

    const twinForkXs: number[] = [];
    if (twinGroups.size > 0) {
      for (const tg of twinGroups) {
        const twins = childMembers.filter(c => c.twinGroup === tg);
        const twinAnchorsForGroup = twins.map(t => getAnchor(t, 'top'));
        const forkX = twinAnchorsForGroup.reduce((sum, a) => sum + a.x, 0) / twinAnchorsForGroup.length;
        twinForkXs.push(forkX);
      }
    }

    geometries.push({
      union, leftAnchor, rightAnchor, unionLineY, unionMidX,
      childMembers, childAnchors, combY: baseY,
      combLeftX, combRightX, effectiveDropCount,
      twinGroups, nonTwinCount, twinForkXs,
    });
  }

  // ═══ PHASE 2: Corridor allocation (non-overlapping comb Y) ═══

  combInfos.sort((a, b) => a.baseY - b.baseY);
  for (let i = 0; i < combInfos.length; i++) {
    for (let j = i + 1; j < combInfos.length; j++) {
      const a = combInfos[i];
      const b = combInfos[j];
      // Check horizontal overlap between the two comb bars
      if (a.leftX < b.rightX + 40 && b.leftX < a.rightX + 40) {
        // They share horizontal space → need different Y corridors
        if (Math.abs(a.finalY - b.finalY) < CORRIDOR_GAP) {
          b.finalY = a.finalY + CORRIDOR_GAP;
        }
      }
    }
  }

  const combYMap = new Map(combInfos.map(c => [c.unionId, c.finalY]));

  for (const geo of geometries) {
    const resolved = combYMap.get(geo.union.id);
    if (resolved !== undefined) geo.combY = resolved;
  }

  // ═══ PHASE 3: Collect ALL segments for global collision detection ═══

  const allHSegs: HSegment[] = [];
  const allVSegs: VSegment[] = [];

  for (const geo of geometries) {
    // Union line (horizontal)
    allHSegs.push({
      unionId: geo.union.id,
      y: geo.unionLineY,
      xMin: Math.min(geo.leftAnchor.x, geo.rightAnchor.x),
      xMax: Math.max(geo.leftAnchor.x, geo.rightAnchor.x),
    });

    if (geo.childMembers.length === 0) continue;

    // Comb bar (horizontal)
    if (geo.effectiveDropCount > 1) {
      allHSegs.push({
        unionId: geo.union.id,
        y: geo.combY,
        xMin: geo.combLeftX,
        xMax: geo.combRightX,
      });
    }

    // Single-child horizontal connector
    if (geo.effectiveDropCount === 1) {
      const dropX = geo.nonTwinCount === 1
        ? geo.childAnchors[geo.childMembers.findIndex(c => !c.twinGroup)]?.x ?? geo.unionMidX
        : geo.twinForkXs[0] ?? geo.unionMidX;
      if (Math.abs(geo.unionMidX - dropX) > 1) {
        allHSegs.push({
          unionId: geo.union.id,
          y: geo.combY,
          xMin: Math.min(geo.unionMidX, dropX),
          xMax: Math.max(geo.unionMidX, dropX),
        });
      }
    }

    // Vertical stem (union mid → comb)
    allVSegs.push({
      unionId: geo.union.id,
      x: geo.unionMidX,
      yMin: geo.unionLineY,
      yMax: geo.combY,
    });

    // Vertical drops (comb → each child)
    for (const anchor of geo.childAnchors) {
      allVSegs.push({
        unionId: geo.union.id,
        x: anchor.x,
        yMin: geo.combY,
        yMax: anchor.y,
      });
    }
  }

  // ═══ PHASE 4: Render with Manhattan routing ═══

  const badgeData: { unionObj: Union; midX: number; midY: number }[] = [];

  const linesContent = geometries.map((geo) => {
    const { union, leftAnchor, rightAnchor, unionLineY, unionMidX,
            childMembers, childAnchors, combY, combLeftX, combRightX,
            effectiveDropCount, nonTwinCount, twinForkXs } = geo;

    badgeData.push({ unionObj: union, midX: unionMidX, midY: unionLineY });

    if (childMembers.length === 0) {
      return (
        <g key={union.id}>
          <UnionLine
            x1={leftAnchor.x} y1={leftAnchor.y}
            x2={rightAnchor.x} y2={rightAnchor.y}
            status={union.status}
          />
        </g>
      );
    }

    // Stem: union midpoint → combY
    const stemCrossings = findHCrossings(unionMidX, unionLineY, combY, allHSegs, union.id);
    const stemPath = buildManhattanVerticalPath(
      unionMidX, unionLineY, combY, stemCrossings, allVSegs, union.id, 1
    );

    return (
      <g key={union.id}>
        {/* 1. Union line (horizontal couple connector) */}
        <UnionLine
          x1={leftAnchor.x} y1={leftAnchor.y}
          x2={rightAnchor.x} y2={rightAnchor.y}
          status={union.status}
        />

        {/* 2. Vertical stem (Manhattan routed) */}
        <path d={stemPath} fill="none"
          stroke={stroke} strokeWidth={sw} strokeOpacity={opacity} />

        {/* 3. Horizontal comb bar */}
        {effectiveDropCount > 1 && (
          <line
            x1={combLeftX} y1={combY}
            x2={combRightX} y2={combY}
            stroke={stroke} strokeWidth={sw} strokeOpacity={opacity}
          />
        )}

        {/* 4. Vertical drops (Manhattan routed, chronological L→R) */}
        {(() => {
          const elements: React.ReactNode[] = [];
          const processed = new Set<number>();

          for (let i = 0; i < childMembers.length; i++) {
            if (processed.has(i)) continue;

            const child = childMembers[i];
            if (child.twinGroup) {
              // Twin group: shared fork point
              const twinIndices = childMembers
                .map((c, idx) => ({ c, idx }))
                .filter(({ c }) => c.twinGroup === child.twinGroup)
                .map(({ idx }) => idx);

              twinIndices.forEach(idx => processed.add(idx));

              const twinAnchorsLocal = twinIndices.map(idx => childAnchors[idx]);
              const forkX = twinAnchorsLocal.reduce((sum, a) => sum + a.x, 0) / twinAnchorsLocal.length;
              const forkY = combY + 20;

              // Stem from comb to fork
              const forkCrossings = findHCrossings(forkX, combY, forkY, allHSegs, union.id);
              const forkStemPath = buildManhattanVerticalPath(
                forkX, combY, forkY, forkCrossings, allVSegs, union.id
              );
              elements.push(
                <path key={`twin-stem-${child.twinGroup}`} d={forkStemPath} fill="none"
                  stroke={stroke} strokeWidth={sw} strokeOpacity={opacity} />
              );

              // Twin branches (diagonal lines are acceptable for twin notation)
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
              processed.add(i);
              const dropX = childAnchors[i].x;
              const dropYTop = combY;
              const dropYBottom = childAnchors[i].y;

              // Find crossings for this drop
              const dropCrossings = findHCrossings(dropX, dropYTop, dropYBottom, allHSegs, union.id);

              // Direction preference: oldest children (left) jog left, youngest (right) jog right
              const jogDir = dropX >= unionMidX ? 1 : -1;

              const dropPath = buildManhattanVerticalPath(
                dropX, dropYTop, dropYBottom, dropCrossings, allVSegs, union.id, jogDir
              );
              elements.push(
                <path key={`drop-${i}`} d={dropPath} fill="none"
                  stroke={stroke} strokeWidth={sw} strokeOpacity={opacity} />
              );
            }
          }
          return elements;
        })()}

        {/* Single drop horizontal connector */}
        {effectiveDropCount === 1 && (() => {
          const dropX = nonTwinCount === 1
            ? childAnchors[childMembers.findIndex(c => !c.twinGroup)]?.x
            : twinForkXs[0];
          if (dropX === undefined) return null;
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
  });

  return (
    <>
      {/* Structural lines layer */}
      <svg className="absolute pointer-events-none" style={{ zIndex: 0, overflow: 'visible', top: 0, left: 0, width: 1, height: 1, opacity: 0.9, transition: 'opacity 0.3s' }}>
        {geometries.map((geo, idx) => {
          const dimmed = isSearchActive && searchMatchedUnionIds && !searchMatchedUnionIds.has(geo.union.id);
          return (
            <g key={geo.union.id} style={{ opacity: dimmed ? 0.08 : 1, transition: 'opacity 0.3s' }}>
              {linesContent[idx]}
            </g>
          );
        })}
      </svg>

      {/* Union badges layer */}
      <svg className="absolute pointer-events-none" style={{ zIndex: 100, overflow: 'visible', top: 0, left: 0, width: 1, height: 1 }}>
        {badgeData.map(({ unionObj, midX, midY }) => (
          <UnionBadge
            key={`badge-${unionObj.id}`}
            union={unionObj}
            x={midX}
            y={midY}
            onClick={() => onEditUnion?.(unionObj.id)}
          />
        ))}
      </svg>
    </>
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
