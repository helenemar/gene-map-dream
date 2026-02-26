/**
 * MyHeritage-Style Hierarchical Layout Engine
 *
 * 3 Structural Pillars:
 *   1. Rank Assignment: Each generation = strict horizontal level at Y = gen × LEVEL_SPACING
 *   2. Family Blocks: Bottom-up block sizing. Sibling block width first, parents centered above.
 *      Growing branches cascade/push right to prevent overlap.
 *   3. Orthogonal Comb Routing: vertical stem → horizontal rail → vertical drops. Zero diagonals.
 */

import { FamilyMember, Union, EmotionalLink } from '@/types/genogram';

const CARD_W = 186;
const CARD_H = 64;
const LEVEL_SPACING = 350;
const COUPLE_GAP = 30;
const SIBLING_GAP = 40;
const BLOCK_GAP = 80;
const STAGGER_OFFSET = 40; // Progressive X-offset per sibling for "escalier" effect

interface LayoutResult {
  positions: Map<string, { x: number; y: number }>;
}

export function computeAutoLayout(
  members: FamilyMember[],
  unions: Union[],
  _emotionalLinks: EmotionalLink[],
): LayoutResult {
  if (members.length === 0) return { positions: new Map() };

  const memberMap = new Map(members.map(m => [m.id, m]));
  const positions = new Map<string, { x: number; y: number }>();

  // ═══ INDEX ═══
  const allChildIds = new Set<string>();
  const parentUnionOf = new Map<string, string>(); // childId → unionId
  const partnerUnions = new Map<string, string[]>(); // memberId → unionIds
  const unionMap = new Map(unions.map(u => [u.id, u]));

  for (const u of unions) {
    for (const cid of u.children) {
      allChildIds.add(cid);
      parentUnionOf.set(cid, u.id);
    }
    for (const pid of [u.partner1, u.partner2]) {
      if (!partnerUnions.has(pid)) partnerUnions.set(pid, []);
      partnerUnions.get(pid)!.push(u.id);
    }
  }

  // ═══ PILLAR 1: Generation Assignment ═══
  const generation = new Map<string, number>();
  const bfsQ: { id: string; gen: number }[] = [];

  // Roots = not children of any union
  for (const m of members) {
    if (!allChildIds.has(m.id)) {
      generation.set(m.id, 0);
      bfsQ.push({ id: m.id, gen: 0 });
    }
  }

  let qi = 0;
  while (qi < bfsQ.length) {
    const { id, gen } = bfsQ[qi++];
    for (const uid of (partnerUnions.get(id) || [])) {
      const u = unionMap.get(uid)!;
      const pid = u.partner1 === id ? u.partner2 : u.partner1;
      if (!generation.has(pid) && memberMap.has(pid)) {
        generation.set(pid, gen);
        bfsQ.push({ id: pid, gen });
      }
      for (const cid of u.children) {
        if (!generation.has(cid) && memberMap.has(cid)) {
          generation.set(cid, gen + 1);
          bfsQ.push({ id: cid, gen: gen + 1 });
        }
      }
    }
  }

  // Orphans
  for (const m of members) {
    if (!generation.has(m.id)) generation.set(m.id, 0);
  }

  // Align partners
  for (let iter = 0; iter < 10; iter++) {
    let changed = false;
    for (const u of unions) {
      const g1 = generation.get(u.partner1) ?? 0;
      const g2 = generation.get(u.partner2) ?? 0;
      if (g1 !== g2) {
        const t = Math.max(g1, g2);
        generation.set(u.partner1, t);
        generation.set(u.partner2, t);
        changed = true;
      }
    }
    if (!changed) break;
  }

  // ═══ PILLAR 2: Recursive Block Placement ═══
  
  // Track rightmost X used globally at each generation
  const genRightEdge = new Map<number, number>();
  function getRightEdge(gen: number): number {
    return genRightEdge.get(gen) ?? 0;
  }
  function updateRightEdge(gen: number, x: number) {
    genRightEdge.set(gen, Math.max(getRightEdge(gen), x));
  }

  const placed = new Set<string>();
  const processedUnions = new Set<string>();

  /** Find the union where this member is a parent (not the union they're a child of) */
  function getParentingUnions(memberId: string): Union[] {
    return (partnerUnions.get(memberId) || [])
      .map(uid => unionMap.get(uid)!)
      .filter(u => u.children.length > 0);
  }

  /**
   * Compute the minimum width a subtree needs (bottom-up).
   */
  function subtreeMinWidth(memberId: string, visited = new Set<string>()): number {
    if (visited.has(memberId)) return CARD_W;
    visited.add(memberId);

    const myUnions = getParentingUnions(memberId);
    if (myUnions.length === 0) return CARD_W;

    let maxW = 0;
    for (const u of myUnions) {
      let blockW = 0;
      for (let i = 0; i < u.children.length; i++) {
        if (i > 0) blockW += SIBLING_GAP;
        blockW += subtreeMinWidth(u.children[i], visited);
      }
      // The couple itself needs at minimum CARD_W * 2 + COUPLE_GAP
      const coupleW = CARD_W * 2 + COUPLE_GAP;
      maxW = Math.max(maxW, blockW, coupleW);
    }
    return maxW;
  }

  /**
   * Place a union (couple + descendants) starting at startX.
   * Returns the rightmost X used.
   */
  function placeUnion(union: Union, startX: number): number {
    if (processedUnions.has(union.id)) return startX;
    processedUnions.add(union.id);

    const m1 = memberMap.get(union.partner1);
    const m2 = memberMap.get(union.partner2);
    if (!m1 || !m2) return startX;

    const gen = generation.get(union.partner1) ?? 0;
    const childGen = gen + 1;

    // ─── Sort children chronologically (oldest → youngest = left → right) ───
    const children = union.children
      .filter(cid => memberMap.has(cid))
      .sort((a, b) => {
        const ma = memberMap.get(a)!;
        const mb = memberMap.get(b)!;
        return (ma.birthYear ?? 0) - (mb.birthYear ?? 0);
      });

    if (children.length === 0) {
      // Childless couple
      const x = Math.max(startX, getRightEdge(gen) + BLOCK_GAP);
      placeCouple(union, x, gen);
      const rightX = x + CARD_W * 2 + COUPLE_GAP;
      updateRightEdge(gen, rightX);
      return rightX;
    }

    // ─── Place children first (left to right) ───
    let childCursor = Math.max(startX, getRightEdge(childGen) + BLOCK_GAP);
    const childXPositions: { id: string; left: number; right: number }[] = [];

    for (let childIdx = 0; childIdx < children.length; childIdx++) {
      const cid = children[childIdx];
      // Staggered X-offset: each sibling after the first gets STAGGER_OFFSET extra
      const stagger = childIdx > 0 ? STAGGER_OFFSET : 0;

      // Ensure no overlap at child gen
      childCursor = Math.max(childCursor + stagger, getRightEdge(childGen) + SIBLING_GAP);
      
      // Check if this child has their own sub-family
      const childSubUnions = getParentingUnions(cid).filter(u => !processedUnions.has(u.id));

      if (childSubUnions.length > 0) {
        // Recursive: place each sub-union
        const subStart = childCursor;
        let subRight = childCursor;
        for (const cu of childSubUnions) {
          subRight = placeUnion(cu, subRight);
        }
        // The child was placed by placeUnion → get their position
        const childPos = positions.get(cid);
        const left = childPos ? childPos.x : subStart;
        childXPositions.push({ id: cid, left, right: subRight });
        childCursor = subRight + SIBLING_GAP;
      } else {
        // Leaf child
        if (!placed.has(cid)) {
          positions.set(cid, { x: childCursor, y: childGen * LEVEL_SPACING });
          placed.add(cid);
        }
        childXPositions.push({ id: cid, left: childCursor, right: childCursor + CARD_W });
        updateRightEdge(childGen, childCursor + CARD_W);
        childCursor = childCursor + CARD_W + SIBLING_GAP;
      }
    }

    // ─── Children block span ───
    const blockLeft = Math.min(...childXPositions.map(c => c.left));
    const blockRight = Math.max(...childXPositions.map(c => c.right));
    const blockCenter = (blockLeft + blockRight) / 2;

    // ─── Center couple above children ───
    const coupleWidth = CARD_W * 2 + COUPLE_GAP;
    let coupleLeft = blockCenter - coupleWidth / 2;

    // Don't overlap previously placed members at this gen
    const minCoupleLeft = placed.size > 0 ? getRightEdge(gen) + BLOCK_GAP : startX;
    if (coupleLeft < minCoupleLeft) {
      const shift = minCoupleLeft - coupleLeft;
      coupleLeft = minCoupleLeft;
      // Cascade: shift all children right
      shiftDescendants(children, shift);
    }

    placeCouple(union, coupleLeft, gen);
    const totalRight = Math.max(coupleLeft + coupleWidth, blockRight + (coupleLeft - (blockCenter - coupleWidth / 2)));
    updateRightEdge(gen, coupleLeft + coupleWidth);

    return totalRight;
  }

  function placeCouple(union: Union, leftX: number, gen: number) {
    const m1 = memberMap.get(union.partner1)!;
    const m2 = memberMap.get(union.partner2)!;
    
    // Male left, female right
    const [maleId, femaleId] = m1.gender === 'male'
      ? [union.partner1, union.partner2]
      : [union.partner2, union.partner1];

    if (!placed.has(maleId)) {
      positions.set(maleId, { x: leftX, y: gen * LEVEL_SPACING });
      placed.add(maleId);
    }
    if (!placed.has(femaleId)) {
      positions.set(femaleId, { x: leftX + CARD_W + COUPLE_GAP, y: gen * LEVEL_SPACING });
      placed.add(femaleId);
    }
  }

  /**
   * Shift all positioned members in list and their descendants by dx.
   */
  function shiftDescendants(memberIds: string[], dx: number) {
    const visited = new Set<string>();
    const stack = [...memberIds];
    while (stack.length > 0) {
      const id = stack.pop()!;
      if (visited.has(id)) continue;
      visited.add(id);
      const pos = positions.get(id);
      if (pos) {
        pos.x += dx;
        // Update right edge for this member's generation
        const gen = generation.get(id) ?? 0;
        updateRightEdge(gen, pos.x + CARD_W);
      }
      for (const uid of (partnerUnions.get(id) || [])) {
        const u = unionMap.get(uid)!;
        const pid = u.partner1 === id ? u.partner2 : u.partner1;
        stack.push(pid);
        for (const cid of u.children) stack.push(cid);
      }
    }
  }

  // ═══ Place root unions ═══
  const rootUnions = unions.filter(u => {
    const g = generation.get(u.partner1) ?? 0;
    return g === 0;
  });

  let cursor = 0;
  for (const ru of rootUnions) {
    cursor = placeUnion(ru, cursor) + BLOCK_GAP;
  }

  // Place remaining unions not yet processed (disconnected sub-graphs)
  for (const u of unions) {
    if (!processedUnions.has(u.id)) {
      cursor = placeUnion(u, cursor) + BLOCK_GAP;
    }
  }

  // Place orphan members not in any union
  for (const m of members) {
    if (!placed.has(m.id)) {
      const gen = generation.get(m.id) ?? 0;
      const x = getRightEdge(gen) + BLOCK_GAP;
      positions.set(m.id, { x, y: gen * LEVEL_SPACING });
      placed.add(m.id);
      updateRightEdge(gen, x + CARD_W);
    }
  }

  // ═══ Ensure partners share same Y ═══
  for (const u of unions) {
    const p1Pos = positions.get(u.partner1);
    const p2Pos = positions.get(u.partner2);
    if (p1Pos && p2Pos) {
      const maxY = Math.max(p1Pos.y, p2Pos.y);
      p1Pos.y = maxY;
      p2Pos.y = maxY;
    }
  }

  // ═══ Center around origin ═══
  if (positions.size > 0) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const pos of positions.values()) {
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + CARD_W);
      maxY = Math.max(maxY, pos.y + CARD_H);
    }
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    for (const pos of positions.values()) { pos.x -= cx; pos.y -= cy; }
  }

  return { positions };
}
