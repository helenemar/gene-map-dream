import { FamilyMember, Union, EmotionalLink } from '@/types/genogram';

const CARD_W = 186;
const CARD_H = 64;
const GENERATION_GAP = 300;
const SIBLING_GAP = 60;
const COUPLE_GAP = 120;
const BRANCH_GAP = 140; // gap between separate sub-tree blocks
const MIN_OVERLAP_PAD = 30;

interface LayoutResult {
  positions: Map<string, { x: number; y: number }>;
}

/**
 * Sub-tree bounding box returned by recursive layout.
 */
interface SubTreeBox {
  width: number;
  positions: Map<string, { x: number; y: number }>; // local positions (x relative to block left)
}

/**
 * Build adjacency: for each member, which unions they participate in.
 */
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
 * Layout a nuclear family sub-tree (a union + its descendants) recursively.
 * Returns local positions relative to x=0.
 */
function layoutSubTree(
  union: Union,
  generation: number,
  allUnions: Union[],
  parentToUnions: Map<string, Union[]>,
  visited: Set<string>, // visited union IDs to avoid cycles
  memberMap: Map<string, FamilyMember>,
): SubTreeBox {
  visited.add(union.id);

  const positions = new Map<string, { x: number; y: number }>();
  const y = generation * GENERATION_GAP;

  // Sort children by birth year
  const children = union.children
    .filter(cid => memberMap.has(cid))
    .sort((a, b) => (memberMap.get(a)!.birthYear ?? 0) - (memberMap.get(b)!.birthYear ?? 0));

  // Recursively layout each child's own sub-trees (if they have unions)
  const childBlocks: { childId: string; width: number; subPositions: Map<string, { x: number; y: number }> }[] = [];

  for (const childId of children) {
    const childUnions = (parentToUnions.get(childId) ?? []).filter(u => !visited.has(u.id));

    if (childUnions.length === 0) {
      // Leaf child — just a single card
      childBlocks.push({
        childId,
        width: CARD_W,
        subPositions: new Map(),
      });
    } else {
      // Child has their own union(s) — layout each as sub-tree
      let totalWidth = 0;
      const mergedSub = new Map<string, { x: number; y: number }>();

      for (let ui = 0; ui < childUnions.length; ui++) {
        const cu = childUnions[ui];
        const sub = layoutSubTree(cu, generation + 1, allUnions, parentToUnions, visited, memberMap);

        // Offset sub positions by totalWidth
        for (const [id, pos] of sub.positions) {
          mergedSub.set(id, { x: pos.x + totalWidth, y: pos.y });
        }
        totalWidth += sub.width;
        if (ui < childUnions.length - 1) totalWidth += BRANCH_GAP;
      }

      // The child card itself is centered over its sub-tree block
      // but we include it in the parent's child row, not here
      childBlocks.push({
        childId,
        width: Math.max(CARD_W, totalWidth),
        subPositions: mergedSub,
      });
    }
  }

  // Compute total children row width
  let childrenTotalWidth = 0;
  for (let i = 0; i < childBlocks.length; i++) {
    childrenTotalWidth += childBlocks[i].width;
    if (i < childBlocks.length - 1) childrenTotalWidth += SIBLING_GAP;
  }

  // Couple width (two cards side by side)
  const coupleWidth = CARD_W + COUPLE_GAP + CARD_W;
  const totalWidth = Math.max(coupleWidth, childrenTotalWidth);

  // Center couple above children
  const coupleStartX = (totalWidth - coupleWidth) / 2;
  positions.set(union.partner1, { x: coupleStartX, y });
  positions.set(union.partner2, { x: coupleStartX + CARD_W + COUPLE_GAP, y });

  // Place children centered under the couple
  const childRowStartX = (totalWidth - childrenTotalWidth) / 2;
  let cx = childRowStartX;
  const childY = y + GENERATION_GAP;

  for (const block of childBlocks) {
    const childCenterX = cx + block.width / 2 - CARD_W / 2;
    positions.set(block.childId, { x: childCenterX, y: childY });

    // Merge descendant sub-positions
    for (const [id, pos] of block.subPositions) {
      positions.set(id, { x: cx + pos.x, y: pos.y });
    }

    cx += block.width + SIBLING_GAP;
  }

  return { width: totalWidth, positions };
}

/**
 * Optimized auto-layout with sub-tree packing.
 *
 * 1. Identify root unions (unions whose partners are not children of any other union).
 * 2. Recursively layout each root union as a sub-tree.
 * 3. Place disconnected members at the end.
 * 4. Center everything around (0,0).
 */
export function computeAutoLayout(
  members: FamilyMember[],
  unions: Union[],
  _emotionalLinks: EmotionalLink[],
): LayoutResult {
  if (members.length === 0) return { positions: new Map() };

  const memberMap = new Map(members.map(m => [m.id, m]));
  const parentToUnions = buildUnionIndex(unions);
  const allChildren = new Set(unions.flatMap(u => u.children));

  // Find root unions: unions where at least one partner is NOT a child in any union
  const rootUnions = unions.filter(u =>
    !allChildren.has(u.partner1) || !allChildren.has(u.partner2)
  );

  // If no root unions found, treat all unions as roots
  const effectiveRoots = rootUnions.length > 0 ? rootUnions : unions;

  const visited = new Set<string>();
  const globalPositions = new Map<string, { x: number; y: number }>();
  let globalX = 0;

  // Layout each root sub-tree
  for (let i = 0; i < effectiveRoots.length; i++) {
    const rootUnion = effectiveRoots[i];
    if (visited.has(rootUnion.id)) continue;

    const subTree = layoutSubTree(rootUnion, 0, unions, parentToUnions, visited, memberMap);

    for (const [id, pos] of subTree.positions) {
      globalPositions.set(id, { x: pos.x + globalX, y: pos.y });
    }

    globalX += subTree.width + BRANCH_GAP;
  }

  // Place any disconnected members (not in any union at all)
  const placed = new Set(globalPositions.keys());
  const disconnected = members.filter(m => !placed.has(m.id));
  for (const m of disconnected) {
    globalPositions.set(m.id, { x: globalX, y: 0 });
    globalX += CARD_W + SIBLING_GAP;
  }

  // Resolve overlaps within same generation
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

/**
 * Post-process: resolve any remaining horizontal overlaps within the same Y level.
 */
function resolveOverlaps(
  positions: Map<string, { x: number; y: number }>,
  _memberMap: Map<string, FamilyMember>,
) {
  // Group by Y
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
        // Push this and all subsequent members
        positions.get(curr.id)!.x = curr.x;
        // Also shift all following in this row
        for (let j = i + 1; j < row.length; j++) {
          row[j].x += shift;
          positions.get(row[j].id)!.x = row[j].x;
        }
      }
    }
  }
}
