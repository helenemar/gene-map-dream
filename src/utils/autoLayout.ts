/**
 * MyHeritage-Style Hierarchical Layout Engine
 *
 * 3 Structural Pillars:
 *   1. Rank Assignment: Each generation = strict horizontal level at Y = gen × LEVEL_SPACING
 *   2. Family Blocks: Bottom-up block sizing. Sibling block width first, parents centered above.
 *      Growing branches cascade/push right to prevent overlap.
 *   3. Orthogonal Comb Routing: vertical stem → horizontal rail → vertical drops. Zero diagonals.
 *
 * Constants:
 *   LEVEL_SPACING = 350   (vertical distance between generations)
 *   CARD_W        = 186   (card width)
 *   CARD_H        = 64    (card height)
 *   COUPLE_GAP    = 30    (horizontal gap between partners)
 *   SIBLING_GAP   = 40    (horizontal gap between siblings)
 *   BLOCK_GAP     = 80    (horizontal gap between unrelated family blocks)
 */

import { FamilyMember, Union, EmotionalLink } from '@/types/genogram';

const CARD_W = 186;
const CARD_H = 64;
const LEVEL_SPACING = 350;
const COUPLE_GAP = 30;
const SIBLING_GAP = 40;
const BLOCK_GAP = 80;

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

  // ═══════════════════════════════════════════
  // INDEX: Build lookup structures
  // ═══════════════════════════════════════════
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

  // ═══════════════════════════════════════════
  // PILLAR 1: Rank Assignment (Generation Levels)
  // ═══════════════════════════════════════════
  const generation = new Map<string, number>();
  const bfsQ: { id: string; gen: number }[] = [];

  // Roots = members who are NOT children of any union
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
      // Partner same generation
      const pid = u.partner1 === id ? u.partner2 : u.partner1;
      if (!generation.has(pid) && memberMap.has(pid)) {
        generation.set(pid, gen);
        bfsQ.push({ id: pid, gen });
      }
      // Children = next generation
      for (const cid of u.children) {
        if (!generation.has(cid) && memberMap.has(cid)) {
          generation.set(cid, gen + 1);
          bfsQ.push({ id: cid, gen: gen + 1 });
        }
      }
    }
  }

  // Orphans fallback
  for (const m of members) {
    if (!generation.has(m.id)) generation.set(m.id, 0);
  }

  // Align partners to same generation (max of both)
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

  // ═══════════════════════════════════════════
  // PILLAR 2: Family Block Calculation (Bottom-Up)
  // ═══════════════════════════════════════════
  // 
  // Strategy:
  //   1. Find all "family units" (a union + its children)
  //   2. Bottom-up: compute width of each sibling block
  //   3. Center parents above their children block
  //   4. Cascade: resolve overlaps by pushing right
  //
  // A "block" = the horizontal span a union's descendants occupy.

  // Sort unions by generation depth (deepest first = bottom-up)
  const unionsByDepth = [...unions].sort((a, b) => {
    const gA = Math.max(generation.get(a.partner1) ?? 0, generation.get(a.partner2) ?? 0);
    const gB = Math.max(generation.get(b.partner1) ?? 0, generation.get(b.partner2) ?? 0);
    return gB - gA; // deepest first
  });

  // Track the X-span each member occupies (including descendant subtree)
  const subtreeWidth = new Map<string, number>(); // memberId → total width of subtree rooted here

  // For each union, compute the width of its children block
  const unionBlockWidth = new Map<string, number>();

  // Phase A: Compute subtree widths bottom-up
  function getSubtreeWidth(memberId: string): number {
    if (subtreeWidth.has(memberId)) return subtreeWidth.get(memberId)!;

    // Find unions where this member is a partner
    const myUnions = partnerUnions.get(memberId) || [];
    
    // Base case: leaf member (no unions as parent, or unions have no children)
    let maxChildBlockWidth = 0;
    for (const uid of myUnions) {
      const u = unionMap.get(uid)!;
      if (u.children.length === 0) continue;
      
      let blockW = 0;
      for (let i = 0; i < u.children.length; i++) {
        if (i > 0) blockW += SIBLING_GAP;
        const childW = getSubtreeWidth(u.children[i]);
        blockW += Math.max(CARD_W, childW);
      }
      maxChildBlockWidth = Math.max(maxChildBlockWidth, blockW);
    }

    const w = Math.max(CARD_W, maxChildBlockWidth);
    subtreeWidth.set(memberId, w);
    return w;
  }

  // Compute subtree widths for all members
  for (const m of members) {
    getSubtreeWidth(m.id);
  }

  // Phase B: Place family blocks
  // We process top-down by generation, placing each generation's members left to right.
  // Within a union's children, they're centered under the couple.

  const maxGen = Math.max(0, ...Array.from(generation.values()));
  const placed = new Set<string>();

  // Group members by generation
  const genGroups = new Map<number, string[]>();
  for (const [id, gen] of generation) {
    if (!genGroups.has(gen)) genGroups.set(gen, []);
    genGroups.get(gen)!.push(id);
  }

  // Find root unions (unions at generation 0)
  const rootUnions = unions.filter(u => {
    const g = generation.get(u.partner1) ?? 0;
    return g === 0;
  });

  // Also find orphan members at gen 0 who aren't in any union
  const gen0InUnion = new Set<string>();
  for (const u of rootUnions) {
    gen0InUnion.add(u.partner1);
    gen0InUnion.add(u.partner2);
  }

  // Track rightmost X used at each generation for cascade
  const genRightEdge = new Map<number, number>();
  function getRightEdge(gen: number): number {
    return genRightEdge.get(gen) ?? 0;
  }
  function updateRightEdge(gen: number, x: number) {
    genRightEdge.set(gen, Math.max(getRightEdge(gen), x));
  }

  /**
   * Place a union and all its descendants recursively.
   * Returns the [leftX, rightX] span of the placed block.
   */
  function placeUnion(union: Union, startX: number): [number, number] {
    const m1 = memberMap.get(union.partner1);
    const m2 = memberMap.get(union.partner2);
    if (!m1 || !m2) return [startX, startX];

    const gen = generation.get(union.partner1) ?? 0;
    const childGen = gen + 1;

    // Get children sorted by their subtree width (for stable ordering)
    const children = union.children
      .filter(cid => memberMap.has(cid))
      // Preserve original order from data
      ;

    if (children.length === 0) {
      // No children: just place the couple
      const coupleWidth = CARD_W * 2 + COUPLE_GAP;
      const x = Math.max(startX, getRightEdge(gen) + BLOCK_GAP);

      // Male left, female right
      const [maleId, femaleId] = m1.gender === 'male' 
        ? [union.partner1, union.partner2] 
        : [union.partner2, union.partner1];

      if (!placed.has(maleId)) {
        positions.set(maleId, { x, y: gen * LEVEL_SPACING });
        placed.add(maleId);
      }
      if (!placed.has(femaleId)) {
        positions.set(femaleId, { x: x + CARD_W + COUPLE_GAP, y: gen * LEVEL_SPACING });
        placed.add(femaleId);
      }

      const rightX = x + coupleWidth;
      updateRightEdge(gen, rightX);
      return [x, rightX];
    }

    // Has children: compute children block first, then center parents above

    // Place each child (and their subtrees) left to right
    let childStartX = Math.max(startX, getRightEdge(childGen) + BLOCK_GAP);
    const childPositions: { id: string; x: number; width: number }[] = [];

    for (let i = 0; i < children.length; i++) {
      const cid = children[i];
      
      // Check if this child has their own unions with children (sub-families)
      const childUnions = (partnerUnions.get(cid) || [])
        .map(uid => unionMap.get(uid)!)
        .filter(u => u.children.length > 0);

      if (childUnions.length > 0) {
        // This child is also a parent — place their sub-family recursively
        for (const cu of childUnions) {
          const [subLeft, subRight] = placeUnion(cu, childStartX);
          // The child's position was set inside placeUnion
          childPositions.push({ id: cid, x: positions.get(cid)?.x ?? subLeft, width: subRight - subLeft });
          childStartX = subRight + SIBLING_GAP;
        }
      } else {
        // Leaf child: just place the card
        const cx = childStartX;
        if (!placed.has(cid)) {
          positions.set(cid, { x: cx, y: childGen * LEVEL_SPACING });
          placed.add(cid);
        }
        childPositions.push({ id: cid, x: cx, width: CARD_W });
        childStartX = cx + CARD_W + SIBLING_GAP;
        updateRightEdge(childGen, cx + CARD_W);
      }
    }

    // Children block span
    const blockLeft = Math.min(...childPositions.map(c => c.x));
    const blockRight = Math.max(...childPositions.map(c => c.x + c.width));
    const blockCenter = (blockLeft + blockRight) / 2;

    // Center couple above children block
    const coupleWidth = CARD_W * 2 + COUPLE_GAP;
    let coupleLeft = blockCenter - coupleWidth / 2;

    // Ensure couple doesn't overlap with previously placed members at this gen
    const minCoupleLeft = getRightEdge(gen) + BLOCK_GAP;
    if (coupleLeft < minCoupleLeft) {
      // Need to shift everything right (cascade!)
      const shift = minCoupleLeft - coupleLeft;
      coupleLeft = minCoupleLeft;
      
      // Shift all children and their descendants right
      shiftSubtree(children, shift);
    }

    // Place partners: male left, female right
    const [maleId, femaleId] = m1.gender === 'male'
      ? [union.partner1, union.partner2]
      : [union.partner2, union.partner1];

    if (!placed.has(maleId)) {
      positions.set(maleId, { x: coupleLeft, y: gen * LEVEL_SPACING });
      placed.add(maleId);
    }
    if (!placed.has(femaleId)) {
      positions.set(femaleId, { x: coupleLeft + CARD_W + COUPLE_GAP, y: gen * LEVEL_SPACING });
      placed.add(femaleId);
    }

    const totalRight = Math.max(coupleLeft + coupleWidth, blockRight);
    updateRightEdge(gen, coupleLeft + coupleWidth);

    return [Math.min(coupleLeft, blockLeft), totalRight];
  }

  /**
   * Shift all positioned members in the given list (and their descendants) by dx.
   */
  function shiftSubtree(memberIds: string[], dx: number) {
    const visited = new Set<string>();
    const stack = [...memberIds];
    while (stack.length > 0) {
      const id = stack.pop()!;
      if (visited.has(id)) continue;
      visited.add(id);
      const pos = positions.get(id);
      if (pos) pos.x += dx;
      // Also shift this member's children through unions
      for (const uid of (partnerUnions.get(id) || [])) {
        const u = unionMap.get(uid)!;
        // Shift partner too
        const pid = u.partner1 === id ? u.partner2 : u.partner1;
        stack.push(pid);
        for (const cid of u.children) {
          stack.push(cid);
        }
      }
    }
  }

  // ═══ Place all root unions ═══
  // Sort root unions left-to-right by their first appearance
  let cursor = 0;
  for (const ru of rootUnions) {
    const [, right] = placeUnion(ru, cursor);
    cursor = right + BLOCK_GAP;
  }

  // Place any orphan gen-0 members not in unions
  for (const m of members) {
    if (!placed.has(m.id) && (generation.get(m.id) ?? 0) === 0 && !gen0InUnion.has(m.id)) {
      const x = getRightEdge(0) + BLOCK_GAP;
      positions.set(m.id, { x, y: 0 });
      placed.add(m.id);
      updateRightEdge(0, x + CARD_W);
    }
  }

  // Place any remaining unplaced members
  for (const m of members) {
    if (!placed.has(m.id)) {
      const gen = generation.get(m.id) ?? 0;
      const x = getRightEdge(gen) + BLOCK_GAP;
      positions.set(m.id, { x, y: gen * LEVEL_SPACING });
      placed.add(m.id);
      updateRightEdge(gen, x + CARD_W);
    }
  }

  // ═══ PHASE: Handle multi-union members ═══
  // If a member appears in multiple unions (e.g., remarriage),
  // they may have been placed by the first union. Ensure partners align.
  for (const u of unions) {
    const p1Pos = positions.get(u.partner1);
    const p2Pos = positions.get(u.partner2);
    if (p1Pos && p2Pos) {
      // Ensure same Y
      const maxY = Math.max(p1Pos.y, p2Pos.y);
      p1Pos.y = maxY;
      p2Pos.y = maxY;
    }
  }

  // ═══ CENTER AROUND ORIGIN ═══
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
