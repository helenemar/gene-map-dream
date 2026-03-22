import React from 'react';
import { FamilyMember, Union, UnionStatus } from '@/types/genogram';
import UnionBadge from './UnionBadge';

const CARD_W = 220;
const CARD_H = 64;
const RAIL_OFFSET = 20;
const JOG_OFFSET = 12; // Horizontal jog to route around crossings

interface FamilyLinkLinesProps {
  members: FamilyMember[];
  unions: Union[];
  onEditUnion?: (unionId: string) => void;
  searchMatchedUnionIds?: Set<string>;
  isSearchActive?: boolean;
  highlightedUnionStatus?: UnionStatus | null;
  variant?: 'default' | 'shared';
}

const getAnchor = (m: FamilyMember, side: 'top' | 'bottom' | 'left' | 'right') => {
  switch (side) {
    case 'top': return { x: m.x + CARD_W / 2, y: m.y };
    case 'bottom': return { x: m.x + CARD_W / 2, y: m.y + CARD_H };
    case 'left': return { x: m.x, y: m.y + CARD_H / 2 };
    case 'right': return { x: m.x + CARD_W, y: m.y + CARD_H / 2 };
  }
};

const UnionLine: React.FC<{
  x1: number; y1: number; x2: number; y2: number;
  status: UnionStatus;
  variant?: 'default' | 'shared';
}> = ({ x1, y1, x2, y2, status, variant = 'default' }) => {
  const lineY = (y1 + y2) / 2;
  const isSharedVariant = variant === 'shared';
  const stroke = isSharedVariant ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))';
  const opacity = isSharedVariant ? 1 : 0.35;
  const lineWidth = isSharedVariant ? 2.5 : 2;
  const connectorWidth = isSharedVariant ? 2.25 : 1.5;
  const needsConnectors = Math.abs(y1 - y2) > 1;
  const dashArray = (status === 'common_law' || status === 'love_affair') ? '8 4' : undefined;

  return (
    <g>
      <line x1={x1} y1={lineY} x2={x2} y2={lineY}
        stroke={stroke} strokeWidth={lineWidth} strokeOpacity={opacity}
        strokeDasharray={dashArray} />
      {needsConnectors && (
        <>
          <line x1={x1} y1={y1} x2={x1} y2={lineY}
            stroke={stroke} strokeWidth={connectorWidth} strokeOpacity={opacity} />
          <line x1={x2} y1={y2} x2={x2} y2={lineY}
            stroke={stroke} strokeWidth={connectorWidth} strokeOpacity={opacity} />
        </>
      )}
    </g>
  );
};

/** A horizontal segment for crossing detection */
interface HSegment {
  unionId: string;
  y: number;
  xMin: number;
  xMax: number;
}

/**
 * Check if a vertical line at x from y1→y2 crosses a horizontal segment.
 * Returns the crossing Y values (sorted top to bottom).
 */
function findCrossings(x: number, yTop: number, yBottom: number, segments: HSegment[], excludeUnionId: string): number[] {
  const crossings: number[] = [];
  for (const seg of segments) {
    if (seg.unionId === excludeUnionId) continue;
    // Does the vertical line at x pass through this horizontal segment?
    if (x >= seg.xMin - 2 && x <= seg.xMax + 2 && seg.y > yTop + 2 && seg.y < yBottom - 2) {
      crossings.push(seg.y);
    }
  }
  return crossings.sort((a, b) => a - b);
}

/**
 * Build a path that goes from (x, yTop) to (x, yBottom) but jogs around
 * any horizontal segments it would cross.
 */
function buildAvoidingVerticalPath(
  x: number, yTop: number, yBottom: number,
  crossings: number[], jogDir: number = 1
): string {
  if (crossings.length === 0) {
    return `M ${x} ${yTop} L ${x} ${yBottom}`;
  }

  const jogX = x + JOG_OFFSET * jogDir;
  let d = `M ${x} ${yTop}`;
  
  for (const crossY of crossings) {
    // Go down to just above the crossing, jog right, go past, jog back
    const above = crossY - 6;
    const below = crossY + 6;
    d += ` L ${x} ${above}`;
    d += ` L ${jogX} ${above}`;
    d += ` L ${jogX} ${below}`;
    d += ` L ${x} ${below}`;
  }
  
  d += ` L ${x} ${yBottom}`;
  return d;
}

const FamilyLinkLines: React.FC<FamilyLinkLinesProps> = ({ members, unions, onEditUnion, searchMatchedUnionIds, isSearchActive, highlightedUnionStatus, variant = 'default' }) => {
  const getMember = (id: string) => members.find(m => m.id === id);

  const isSharedVariant = variant === 'shared';
  const stroke = isSharedVariant ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))';
  const opacity = isSharedVariant ? 1 : 0.35;
  const sw = isSharedVariant ? 2.25 : 1.5;

  // ═══ PHASE 1: Compute all union line positions & comb data ═══
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

  // First pass: compute base comb Y for each union
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

    const twinGroups = new Set(childMembers.filter(c => c.twinGroup).map(c => c.twinGroup));
    const nonTwinCount = childMembers.filter(c => !c.twinGroup).length;
    const effectiveDropCount = nonTwinCount + twinGroups.size;

    // Compute twin fork positions
    const twinForkXs: number[] = [];
    const twinForkMap = new Map<string, number>(); // twinGroup → forkX
    if (twinGroups.size > 0) {
      for (const tg of twinGroups) {
        if (!tg) continue;
        const twins = childMembers.filter(c => c.twinGroup === tg);
        const twinAnchorsForGroup = twins.map(t => getAnchor(t, 'top'));
        const forkX = twinAnchorsForGroup.reduce((sum, a) => sum + a.x, 0) / twinAnchorsForGroup.length;
        twinForkXs.push(forkX);
        twinForkMap.set(tg, forkX);
      }
    }

    // Compute effective drop X positions (fork X for twins, anchor X for non-twins)
    const effectiveDropXs: number[] = [];
    const processedTwinGroups = new Set<string>();
    for (let i = 0; i < childMembers.length; i++) {
      const child = childMembers[i];
      if (child.twinGroup) {
        if (!processedTwinGroups.has(child.twinGroup)) {
          processedTwinGroups.add(child.twinGroup);
          const forkX = twinForkMap.get(child.twinGroup);
          if (forkX !== undefined) effectiveDropXs.push(forkX);
        }
      } else {
        effectiveDropXs.push(childAnchors[i].x);
      }
    }

    const parentBottom = unionLineY;
    const childTop = Math.min(...childAnchors.map(a => a.y));
    const baseY = parentBottom + (childTop - parentBottom) / 2;

    // Comb bar bounds use effective drop points (not raw child anchors)
    const combLeftX = Math.min(unionMidX, ...effectiveDropXs);
    const combRightX = Math.max(unionMidX, ...effectiveDropXs);

    combInfos.push({
      unionId: union.id,
      baseY,
      leftX: combLeftX,
      rightX: combRightX,
      finalY: baseY,
    });

    geometries.push({
      union, leftAnchor, rightAnchor, unionLineY, unionMidX,
      childMembers, childAnchors, combY: baseY,
      combLeftX, combRightX, effectiveDropCount,
      twinGroups, nonTwinCount, twinForkXs,
    });
  }

  // Rail conflict resolution
  combInfos.sort((a, b) => a.baseY - b.baseY);
  for (let i = 0; i < combInfos.length; i++) {
    for (let j = i + 1; j < combInfos.length; j++) {
      const a = combInfos[i];
      const b = combInfos[j];
      if (Math.abs(a.finalY - b.finalY) < RAIL_OFFSET &&
          a.leftX < b.rightX && b.leftX < a.rightX) {
        b.finalY = a.finalY + RAIL_OFFSET;
      }
    }
  }

  const combYMap = new Map(combInfos.map(c => [c.unionId, c.finalY]));

  // Update geometries with resolved combY
  for (const geo of geometries) {
    const resolved = combYMap.get(geo.union.id);
    if (resolved !== undefined) geo.combY = resolved;
  }

  // ═══ PHASE 2: Collect ALL horizontal segments for crossing detection ═══
  const allHSegments: HSegment[] = [];

  for (const geo of geometries) {
    // Union line segment
    allHSegments.push({
      unionId: geo.union.id,
      y: geo.unionLineY,
      xMin: Math.min(geo.leftAnchor.x, geo.rightAnchor.x),
      xMax: Math.max(geo.leftAnchor.x, geo.rightAnchor.x),
    });

    // Comb bar segment (if has children and multiple drops)
    if (geo.childMembers.length > 0 && geo.effectiveDropCount > 1) {
      allHSegments.push({
        unionId: geo.union.id,
        y: geo.combY,
        xMin: geo.combLeftX,
        xMax: geo.combRightX,
      });
    }
  }

  // Also add comb-to-single-child horizontal connectors
  for (const geo of geometries) {
    if (geo.effectiveDropCount === 1 && geo.childMembers.length > 0) {
      const dropX = geo.nonTwinCount === 1
        ? geo.childAnchors[geo.childMembers.findIndex(c => !c.twinGroup)]?.x ?? geo.unionMidX
        : geo.twinForkXs[0] ?? geo.unionMidX;
      if (Math.abs(geo.unionMidX - dropX) > 1) {
        allHSegments.push({
          unionId: geo.union.id,
          y: geo.combY,
          xMin: Math.min(geo.unionMidX, dropX),
          xMax: Math.max(geo.unionMidX, dropX),
        });
      }
    }
  }

  // ═══ PHASE 3: Render with crossing avoidance ═══
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
            variant={variant}
          />
        </g>
      );
    }

    // For single-child unions, draw a straight vertical from union midpoint down to child
    if (effectiveDropCount === 1) {
      const singleChildAnchor = childAnchors[0];
      const directX = unionMidX;

      return (
        <g key={union.id}>
          <UnionLine
            x1={leftAnchor.x} y1={leftAnchor.y}
            x2={rightAnchor.x} y2={rightAnchor.y}
            status={union.status}
            variant={variant}
          />
          {/* Straight vertical stem */}
          <line x1={directX} y1={unionLineY} x2={directX} y2={singleChildAnchor.y}
            stroke={stroke} strokeWidth={sw} strokeOpacity={opacity}
            strokeDasharray={union.isAdoption ? '6 4' : undefined} />
          {/* Horizontal connector from stem to child if not aligned */}
          {Math.abs(unionMidX - singleChildAnchor.x) > 1 && (
            <line
              x1={unionMidX} y1={singleChildAnchor.y}
              x2={singleChildAnchor.x} y2={singleChildAnchor.y}
              stroke={stroke} strokeWidth={sw} strokeOpacity={opacity}
            />
          )}
        </g>
      );
    }

    // Stem: union midpoint → combY (always straight)
    const stemPath = `M ${unionMidX} ${unionLineY} L ${unionMidX} ${combY}`;

    return (
      <g key={union.id}>
        {/* 1. Union line (horizontal) */}
        <UnionLine
          x1={leftAnchor.x} y1={leftAnchor.y}
          x2={rightAnchor.x} y2={rightAnchor.y}
          status={union.status}
        />

        {/* 2. Vertical stem with crossing avoidance */}
        <g>
          <path d={stemPath} fill="none"
            stroke={stroke} strokeWidth={sw} strokeOpacity={opacity}
            strokeDasharray={union.isAdoption ? '6 4' : undefined} />
          {/* Adoption tick + hover badge on stem */}
          {union.isAdoption && (() => {
            const stemMidY = (unionLineY + combY) / 2;
            return (
              <>
                <line
                  x1={unionMidX - 6} y1={stemMidY}
                  x2={unionMidX + 6} y2={stemMidY}
                  stroke={stroke} strokeWidth={sw} strokeOpacity={opacity}
                />
                {/* Invisible hover area + tooltip */}
                <rect
                  x={unionMidX - 20} y={stemMidY - 12}
                  width={40} height={24}
                  fill="transparent"
                  style={{ pointerEvents: 'all', cursor: 'default' }}
                >
                  <title>Lien adoptif</title>
                </rect>
              </>
            );
          })()}
        </g>
        {effectiveDropCount > 1 && (
          <line
            x1={combLeftX} y1={combY}
            x2={combRightX} y2={combY}
            stroke={stroke} strokeWidth={sw} strokeOpacity={opacity}
          />
        )}

        {/* 4. Vertical drops with crossing avoidance + adoption style */}
        {(() => {
          const elements: React.ReactNode[] = [];
          const processed = new Set<number>();
          const isAdoption = !!union.isAdoption;
          const adoptionDash = '6 4';
          const tickLen = 6; // half-length of transversal tick

          for (let i = 0; i < childMembers.length; i++) {
            if (processed.has(i)) continue;

            const child = childMembers[i];
            if (child.twinGroup) {
              const twinIndices = childMembers
                .map((c, idx) => ({ c, idx }))
                .filter(({ c }) => c.twinGroup === child.twinGroup)
                .map(({ idx }) => idx);

              twinIndices.forEach(idx => processed.add(idx));

              const twinAnchorsLocal = twinIndices.map(idx => childAnchors[idx]);
              const forkX = twinAnchorsLocal.reduce((sum, a) => sum + a.x, 0) / twinAnchorsLocal.length;
              const forkY = combY + 20;

              const forkCrossings = findCrossings(forkX, combY, forkY, allHSegments, union.id);
              const forkStemPath = buildAvoidingVerticalPath(forkX, combY, forkY, forkCrossings);
              elements.push(
                <path key={`twin-stem-${child.twinGroup}`} d={forkStemPath} fill="none"
                  stroke={stroke} strokeWidth={sw} strokeOpacity={opacity}
                  strokeDasharray={isAdoption ? adoptionDash : undefined} />
              );

              twinAnchorsLocal.forEach((anchor, ti) => {
                elements.push(
                  <line key={`twin-branch-${child.twinGroup}-${ti}`}
                    x1={forkX} y1={forkY}
                    x2={anchor.x} y2={anchor.y}
                    stroke={stroke} strokeWidth={sw} strokeOpacity={opacity}
                    strokeDasharray={isAdoption ? adoptionDash : undefined}
                  />
                );
                // Adoption tick on twin branch
                if (isAdoption) {
                  const mx = (forkX + anchor.x) / 2;
                  const my = (forkY + anchor.y) / 2;
                  const dx = anchor.x - forkX;
                  const dy = anchor.y - forkY;
                  const len = Math.hypot(dx, dy) || 1;
                  const nx = -dy / len;
                  const ny = dx / len;
                  elements.push(
                    <line key={`twin-tick-${child.twinGroup}-${ti}`}
                      x1={mx - nx * tickLen} y1={my - ny * tickLen}
                      x2={mx + nx * tickLen} y2={my + ny * tickLen}
                      stroke={stroke} strokeWidth={sw} strokeOpacity={opacity}
                    />
                  );
                }
              });
            } else {
              processed.add(i);
              const dropX = childAnchors[i].x;
              const dropYTop = combY;
              const dropYBottom = childAnchors[i].y;
              // Always straight vertical drops
              elements.push(
                <line key={`drop-${i}`}
                  x1={dropX} y1={dropYTop}
                  x2={dropX} y2={dropYBottom}
                  stroke={stroke} strokeWidth={sw} strokeOpacity={opacity}
                  strokeDasharray={isAdoption ? adoptionDash : undefined} />
              );
              // Adoption transversal tick at midpoint of drop
              if (isAdoption) {
                const midY = (dropYTop + dropYBottom) / 2;
                elements.push(
                  <line key={`tick-${i}`}
                    x1={dropX - tickLen} y1={midY}
                    x2={dropX + tickLen} y2={midY}
                    stroke={stroke} strokeWidth={sw} strokeOpacity={opacity}
                  />
                );
              }
            }
          }
          return elements;
        })()}

        {/* Single drop connector */}
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

  // Is any union status being highlighted from sidebar?
  const isHighlightActive = highlightedUnionStatus !== null;

  return (
    <>
      {/* Structural lines layer */}
      <svg
        className="absolute pointer-events-none"
        shapeRendering={isSharedVariant ? 'geometricPrecision' : undefined}
        style={{ zIndex: 0, overflow: 'visible', top: 0, left: 0, width: 1, height: 1, transition: 'opacity 0.3s' }}
      >
        {/* Glow filter for highlighted unions */}
        <defs>
          <filter id="union-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor="hsl(var(--primary))" floodOpacity="0.6" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {geometries.map((geo, idx) => {
          const dimmed = isSearchActive && searchMatchedUnionIds && !searchMatchedUnionIds.has(geo.union.id);
          const isStatusMatch = isHighlightActive && geo.union.status === highlightedUnionStatus;
          const isStatusDimmed = isHighlightActive && !isStatusMatch;
          return (
            <g
              key={geo.union.id}
              style={{
                opacity: dimmed ? 0.08 : isStatusDimmed ? 0.12 : 1,
                filter: isStatusMatch ? 'url(#union-glow)' : 'none',
                transition: 'opacity 0.2s, filter 0.2s',
              }}
            >
              {linesContent[idx]}
            </g>
          );
        })}
      </svg>

      {/* Union badges layer */}
      <svg className="absolute pointer-events-none" style={{ zIndex: 100, overflow: 'visible', top: 0, left: 0, width: 1, height: 1 }}>
        {badgeData.map(({ unionObj, midX, midY }) => {
          const isStatusMatch = isHighlightActive && unionObj.status === highlightedUnionStatus;
          const isStatusDimmed = isHighlightActive && !isStatusMatch;
          return (
            <g
              key={`badge-${unionObj.id}`}
              style={{
                opacity: isStatusDimmed ? 0.15 : 1,
                filter: isStatusMatch ? 'url(#union-glow)' : 'none',
                transition: 'opacity 0.2s, filter 0.2s',
              }}
            >
              <UnionBadge
                union={unionObj}
                x={midX}
                y={midY}
                onClick={() => onEditUnion?.(unionObj.id)}
              />
            </g>
          );
        })}
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
