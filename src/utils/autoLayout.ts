import { FamilyMember, Union, EmotionalLink } from '@/types/genogram';

const CARD_W = 186;
const CARD_H = 64;
const GENERATION_GAP = 300;
const BASE_SIBLING_GAP = 80; // Increased from 60 to accommodate rail corridors
const COUPLE_GAP = 120;
const BRANCH_GAP = 160; // Increased from 140 for more breathing room
const MIN_OVERLAP_PAD = 40; // Increased from 30 for rail safety
const UNION_CORRIDOR = 50; // Extra corridor when child has own union
const RAIL_GAP = 20; // Minimum gap between parallel descent rails

interface LayoutResult {
  positions: Map<string, { x: number; y: number }>;
}

interface SubTreeBox {
  width: number;
  positions: Map<string, { x: number; y: number }>;
}

function buildUnionIndex(unions: Union[]) {
  const parentToUnions = new Map<string, Union[]>();
  for (const u of unions) {
    for (const pid of [u.partner1, u.partner2]) {
      if (!parentToUnions.has(pid)) parentToUnions.set(pid, []);
      parentToUnions.get(pid)!.push(u);
    }
  }
  return parentToUnions;
}

/**
 * Compute dynamic sibling gap based on rail requirements.
 * More children = wider gap to prevent descent line overlap.
 */
function computeSiblingGap(
  childId: string,
  nextChildId: string | null,
  parentToUnions: Map<string, Union[]>,
  visited: Set<string>,
  totalSiblings: number,
): number {
  let gap = BASE_SIBLING_GAP;

  // Add corridor for children with unions
  const childUnions = (parentToUnions.get(childId) ?? []).filter(u => !visited.has(u.id));
  const nextUnions = nextChildId ? (parentToUnions.get(nextChildId) ?? []).filter(u => !visited.has(u.id)) : [];
  if (childUnions.length > 0 || nextUnions.length > 0) {
    gap += UNION_CORRIDOR;
  }

  // For large families (>5 children), increase gap proportionally to ensure rail spacing
  if (totalSiblings > 5) {
    gap += (totalSiblings - 5) * RAIL_GAP;
  }

  return gap;
}

/**
 * Order children to minimize edge crossings.
 * Children with subtrees go to edges; leaf children fill center.
 */
function orderChildrenToMinimizeCrossings(
  children: string[],
  parentToUnions: Map<string, Union[]>,
  visited: Set<string>,
): string[] {
  if (children.length <= 2) return children;

  // Separate children with unions (heavy) from leaf children
  const heavy: string[] = [];
  const light: string[] = [];

  for (const cid of children) {
    const unions = (parentToUnions.get(cid) ?? []).filter(u => !visited.has(u.id));
    if (unions.length > 0) {
      heavy.push(cid);
    } else {
      light.push(cid);
    }
  }

  // Place heavy subtrees at edges, light children in center
  // This minimizes crossings since subtree descent lines stay on the outside
  const result: string[] = [];
  let hi = 0, li = 0;
  let leftSide = true;

  // Alternate placing heavy children on left and right edges
  const leftHeavy: string[] = [];
  const rightHeavy: string[] = [];
  for (let i = 0; i < heavy.length; i++) {
    if (i % 2 === 0) leftHeavy.push(heavy[i]);
    else rightHeavy.push(heavy[i]);
  }

  return [...leftHeavy, ...light, ...rightHeavy.reverse()];
}

function layoutSubTree(
  union: Union,
  generation: number,
  allUnions: Union[],
  parentToUnions: Map<string, Union[]>,
  visited: Set<string>,
  memberMap: Map<string, FamilyMember>,
): SubTreeBox {
  visited.add(union.id);

  const positions = new Map<string, { x: number; y: number }>();
  const y = generation * GENERATION_GAP;

  // Sort children by birth year first
  const childrenByBirth = union.children
    .filter(cid => memberMap.has(cid))
    .sort((a, b) => (memberMap.get(a)!.birthYear ?? 0) - (memberMap.get(b)!.birthYear ?? 0));

  // Optimize order to minimize crossings
  const children = orderChildrenToMinimizeCrossings(childrenByBirth, parentToUnions, visited);

  const childBlocks: { childId: string; width: number; subPositions: Map<string, { x: number; y: number }> }[] = [];

  for (const childId of children) {
    const childUnions = (parentToUnions.get(childId) ?? []).filter(u => !visited.has(u.id));

    if (childUnions.length === 0) {
      childBlocks.push({
        childId,
        width: CARD_W,
        subPositions: new Map(),
      });
    } else {
      let totalWidth = 0;
      const mergedSub = new Map<string, { x: number; y: number }>();

      for (let ui = 0; ui < childUnions.length; ui++) {
        const cu = childUnions[ui];
        const sub = layoutSubTree(cu, generation + 1, allUnions, parentToUnions, visited, memberMap);

        for (const [id, pos] of sub.positions) {
          mergedSub.set(id, { x: pos.x + totalWidth, y: pos.y });
        }
        totalWidth += sub.width;
        if (ui < childUnions.length - 1) totalWidth += BRANCH_GAP;
      }

      childBlocks.push({
        childId,
        width: Math.max(CARD_W, totalWidth),
        subPositions: mergedSub,
      });
    }
  }

  // Compute total children row width with dynamic gaps
  let childrenTotalWidth = 0;
  for (let i = 0; i < childBlocks.length; i++) {
    childrenTotalWidth += childBlocks[i].width;
    if (i < childBlocks.length - 1) {
      const gap = computeSiblingGap(
        childBlocks[i].childId,
        childBlocks[i + 1]?.childId ?? null,
        parentToUnions,
        visited,
        children.length,
      );
      childrenTotalWidth += gap;
    }
  }

  const coupleWidth = CARD_W + COUPLE_GAP + CARD_W;
  const totalWidth = Math.max(coupleWidth, childrenTotalWidth);

  // Center couple above children
  const coupleStartX = (totalWidth - coupleWidth) / 2;
  positions.set(union.partner1, { x: coupleStartX, y });
  positions.set(union.partner2, { x: coupleStartX + CARD_W + COUPLE_GAP, y });

  // Place children centered under the couple with dynamic gaps
  const childRowStartX = (totalWidth - childrenTotalWidth) / 2;
  let cx = childRowStartX;
  const childY = y + GENERATION_GAP;

  for (let i = 0; i < childBlocks.length; i++) {
    const block = childBlocks[i];
    const childCenterX = cx + block.width / 2 - CARD_W / 2;
    positions.set(block.childId, { x: childCenterX, y: childY });

    for (const [id, pos] of block.subPositions) {
      positions.set(id, { x: cx + pos.x, y: pos.y });
    }

    cx += block.width;
    if (i < childBlocks.length - 1) {
      cx += computeSiblingGap(
        block.childId,
        childBlocks[i + 1]?.childId ?? null,
        parentToUnions,
        visited,
        children.length,
      );
    }
  }

  return { width: totalWidth, positions };
}

export function computeAutoLayout(
  members: FamilyMember[],
  unions: Union[],
  _emotionalLinks: EmotionalLink[],
): LayoutResult {
  if (members.length === 0) return { positions: new Map() };

  const memberMap = new Map(members.map(m => [m.id, m]));
  const parentToUnions = buildUnionIndex(unions);
  const allChildren = new Set(unions.flatMap(u => u.children));

  const rootUnions = unions.filter(u =>
    !allChildren.has(u.partner1) || !allChildren.has(u.partner2)
  );

  const effectiveRoots = rootUnions.length > 0 ? rootUnions : unions;
  const visited = new Set<string>();
  const globalPositions = new Map<string, { x: number; y: number }>();
  let globalX = 0;

  for (let i = 0; i < effectiveRoots.length; i++) {
    const rootUnion = effectiveRoots[i];
    if (visited.has(rootUnion.id)) continue;

    const subTree = layoutSubTree(rootUnion, 0, unions, parentToUnions, visited, memberMap);

    for (const [id, pos] of subTree.positions) {
      globalPositions.set(id, { x: pos.x + globalX, y: pos.y });
    }

    globalX += subTree.width + BRANCH_GAP;
  }

  // Place disconnected members
  const placed = new Set(globalPositions.keys());
  const disconnected = members.filter(m => !placed.has(m.id));
  for (const m of disconnected) {
    globalPositions.set(m.id, { x: globalX, y: 0 });
    globalX += CARD_W + BASE_SIBLING_GAP;
  }

  // Resolve overlaps with increased padding
  resolveOverlaps(globalPositions, memberMap);

  // Center around (0,0)
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const pos of globalPositions.values()) {
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    maxX = Math.max(maxX, pos.x + CARD_W);
    maxY = Math.max(maxY, pos.y + CARD_H);
  }
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  for (const pos of globalPositions.values()) {
    pos.x -= centerX;
    pos.y -= centerY;
  }

  return { positions: globalPositions };
}

function resolveOverlaps(
  positions: Map<string, { x: number; y: number }>,
  _memberMap: Map<string, FamilyMember>,
) {
  const byY = new Map<number, { id: string; x: number }[]>();
  for (const [id, pos] of positions) {
    const key = Math.round(pos.y);
    if (!byY.has(key)) byY.set(key, []);
    byY.get(key)!.push({ id, x: pos.x });
  }

  for (const [, row] of byY) {
    if (row.length < 2) continue;
    row.sort((a, b) => a.x - b.x);

    for (let i = 1; i < row.length; i++) {
      const prev = row[i - 1];
      const curr = row[i];
      const minX = prev.x + CARD_W + MIN_OVERLAP_PAD;
      if (curr.x < minX) {
        const shift = minX - curr.x;
        curr.x = minX;
        positions.get(curr.id)!.x = curr.x;
        for (let j = i + 1; j < row.length; j++) {
          row[j].x += shift;
          positions.get(row[j].id)!.x = row[j].x;
        }
      }
    }
  }
}
