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

const CARD_W = 220;       // Must match MEMBER_CARD_W (min-width of actual cards)
const CARD_H = 64;
const LEVEL_SPACING = 220;
const BASE_COUPLE_GAP = 60;
const MIN_BADGE_GAP = 120;
const BADGE_SAFETY = 36;
const SIBLING_GAP = 36;
const BLOCK_GAP = 44;
const VERTICAL_STAGGER = 20;
const MAX_STAGGER = 150; // Cap to avoid colliding with next generation

interface LayoutResult {
  positions: Map<string, { x: number; y: number }>;
}

/** Compute dynamic gap between couple cards based on badge width.
 *  Gap = badgeWidth + 60px (30px each side). Badge never overlaps a card. */
function coupleGap(union: Union): number {
  let labelLen = 0;
  if (union.marriageYear) labelLen += `R: ${union.marriageYear}`.length;
  if (union.divorceYear) labelLen += `   D: ${union.divorceYear}`.length;
  if (labelLen > 0) {
    // Match UnionBadge: charWidth × count + padding × 2
    const badgeW = Math.max(labelLen * 7.2 + 24, 56);
    // Gap = badge + 30px breathing on each side
    return Math.max(badgeW + BADGE_SAFETY, MIN_BADGE_GAP);
  }
  // Has status icon but no dates — icon circle is ~28px
  const hasIcon = ['divorced', 'separated', 'widowed', 'love_affair', 'common_law'].includes(union.status);
  return hasIcon ? Math.max(BASE_COUPLE_GAP, 160) : BASE_COUPLE_GAP;
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

  // Align partners AND propagate children generations
  for (let iter = 0; iter < 20; iter++) {
    let changed = false;
    // Align partners to same generation
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
    // Ensure children are at parent_gen + 1
    for (const u of unions) {
      const parentGen = Math.max(generation.get(u.partner1) ?? 0, generation.get(u.partner2) ?? 0);
      for (const cid of u.children) {
        const childGen = generation.get(cid) ?? 0;
        if (childGen <= parentGen) {
          generation.set(cid, parentGen + 1);
          changed = true;
        }
      }
    }
    if (!changed) break;
  }

  // ═══ PILLAR 2: Recursive Block Placement ═══
  
  // Track rightmost X used globally at each generation
  const genRightEdge = new Map<number, number>();
  function getRightEdge(gen: number): number {
    return genRightEdge.get(gen) ?? -Infinity;
  }
  function updateRightEdge(gen: number, x: number) {
    const cur = genRightEdge.get(gen);
    genRightEdge.set(gen, cur === undefined ? x : Math.max(cur, x));
  }
  function hasPlacedAt(gen: number): boolean {
    return genRightEdge.has(gen);
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
      // The couple itself needs at minimum CARD_W * 2 + gap
      const coupleW = CARD_W * 2 + coupleGap(u);
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
      const x = hasPlacedAt(gen) ? getRightEdge(gen) + BLOCK_GAP : startX;
      placeCouple(union, x, gen);
      const rightX = x + CARD_W * 2 + coupleGap(union);
      updateRightEdge(gen, rightX);
      return rightX;
    }

    // ─── Place children first (left to right) with twin detection ───
    let childCursor = hasPlacedAt(childGen) ? getRightEdge(childGen) + BLOCK_GAP : startX;
    const childXPositions: { id: string; left: number; right: number }[] = [];

    // Compute stagger rank: twins share the same rank
    const staggerRanks: number[] = [];
    let currentRank = 0;
    for (let i = 0; i < children.length; i++) {
      const child = memberMap.get(children[i])!;
      if (i > 0) {
        const prev = memberMap.get(children[i - 1])!;
        const sameTwin = child.twinGroup && prev.twinGroup && child.twinGroup === prev.twinGroup;
        if (!sameTwin) currentRank++;
      }
      staggerRanks.push(currentRank);
    }

    for (let childIdx = 0; childIdx < children.length; childIdx++) {
      const cid = children[childIdx];

      // Ensure no overlap at child gen
      if (hasPlacedAt(childGen)) {
        childCursor = Math.max(childCursor, getRightEdge(childGen) + SIBLING_GAP);
      }
      
      // Vertical stagger: twins share rank → same Y
      const yStagger = Math.min(staggerRanks[childIdx] * VERTICAL_STAGGER, MAX_STAGGER);
      const childY = childGen * LEVEL_SPACING + yStagger;

      // Check if this child has their own sub-family
      const childSubUnions = getParentingUnions(cid).filter(u => !processedUnions.has(u.id));

      if (childSubUnions.length > 0) {
        let subRight = childCursor;
        for (const cu of childSubUnions) {
          subRight = placeUnion(cu, subRight);
        }
        const childPos = positions.get(cid);
        // Don't override Y when child has sub-family (couple Y was set by placeCouple)
        // But DO apply stagger to the child AND their partner
        if (childPos) {
          const dy = childY - childGen * LEVEL_SPACING;
          childPos.y = childY;
          // Also shift partner to maintain same Y
          for (const cu of childSubUnions) {
            const u = unionMap.get(cu.id)!;
            const partnerId = u.partner1 === cid ? u.partner2 : u.partner1;
            const partnerPos = positions.get(partnerId);
            if (partnerPos) partnerPos.y = childY;
            // Shift children of this sub-union down too
            for (const gcid of u.children) {
              const gcPos = positions.get(gcid);
              if (gcPos) gcPos.y += dy;
            }
          }
        }
        const left = childPos ? childPos.x : childCursor;
        const right = Math.max(subRight, (childPos ? childPos.x + CARD_W : subRight));
        childXPositions.push({ id: cid, left, right });
        childCursor = right + SIBLING_GAP;
      } else {
        if (!placed.has(cid)) {
          positions.set(cid, { x: childCursor, y: childY });
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

    const gap = coupleGap(union);
    const coupleWidth = CARD_W * 2 + gap;
    let coupleLeft = blockCenter - coupleWidth / 2;

    // Don't overlap previously placed members at this gen
    const minCoupleLeft = hasPlacedAt(gen) ? getRightEdge(gen) + BLOCK_GAP : startX;
    if (coupleLeft < minCoupleLeft) {
      const shift = minCoupleLeft - coupleLeft;
      coupleLeft = minCoupleLeft;
      // Cascade: shift all children right
      shiftDescendants(children, shift);
    }

    placeCouple(union, coupleLeft, gen);

    // ─── Re-center ALL children block under couple midpoint ───
    const coupleMidX = coupleLeft + coupleWidth / 2;
    // Recompute current block center after potential shifts
    const currentBlockLeft = Math.min(...children.map(cid => positions.get(cid)?.x ?? 0));
    const currentBlockRight = Math.max(...children.map(cid => (positions.get(cid)?.x ?? 0) + CARD_W));
    const currentBlockCenter = (currentBlockLeft + currentBlockRight) / 2;
    const centerShift = coupleMidX - currentBlockCenter;
    if (Math.abs(centerShift) > 1) {
      // Only shift children that don't have their own sub-families to avoid cascading issues
      for (const cid of children) {
        const childPos = positions.get(cid);
        if (childPos) {
          childPos.x += centerShift;
          updateRightEdge(childGen, childPos.x + CARD_W);
        }
      }
    }
    
    // Recompute block right after potential shifts
    const finalBlockRight = Math.max(...childXPositions.map(c => {
      const pos = positions.get(c.id);
      return pos ? pos.x + CARD_W : c.right;
    }));
    const totalRight = Math.max(coupleLeft + coupleWidth, finalBlockRight);
    updateRightEdge(gen, totalRight);

    return totalRight;
  }

  function placeCouple(u: Union, leftX: number, gen: number) {
    const m1 = memberMap.get(u.partner1)!;
    const gap = coupleGap(u);
    
    // Male left, female right
    const [maleId, femaleId] = m1.gender === 'male'
      ? [u.partner1, u.partner2]
      : [u.partner2, u.partner1];

    if (!placed.has(maleId)) {
      positions.set(maleId, { x: leftX, y: gen * LEVEL_SPACING });
      placed.add(maleId);
    }
    if (!placed.has(femaleId)) {
      positions.set(femaleId, { x: leftX + CARD_W + gap, y: gen * LEVEL_SPACING });
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
      const x = hasPlacedAt(gen) ? getRightEdge(gen) + BLOCK_GAP : 0;
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

  // ═══ OVERLAP RESOLUTION — push overlapping cards apart ═══
  const OVERLAP_MARGIN = 40; // min gap between cards
  for (let pass = 0; pass < 10; pass++) {
    let anyOverlap = false;
    // Group members by generation for efficient overlap checks
    const genGroups = new Map<number, string[]>();
    for (const m of members) {
      const g = generation.get(m.id) ?? 0;
      if (!genGroups.has(g)) genGroups.set(g, []);
      genGroups.get(g)!.push(m.id);
    }

    for (const [, ids] of genGroups) {
      // Sort by X position
      const sorted = ids
        .filter(id => positions.has(id))
        .sort((a, b) => (positions.get(a)!.x) - (positions.get(b)!.x));

      for (let i = 0; i < sorted.length - 1; i++) {
        const posA = positions.get(sorted[i])!;
        const posB = positions.get(sorted[i + 1])!;
        const rightA = posA.x + CARD_W + OVERLAP_MARGIN;
        if (posB.x < rightA) {
          // Overlap detected — push B (and its descendants) right
          const shift = rightA - posB.x;
          // Collect all members that should shift (B + partner + descendants)
          const toShift = [sorted[i + 1]];
          // Also shift partner if in a union
          for (const u of unions) {
            if (u.partner1 === sorted[i + 1] || u.partner2 === sorted[i + 1]) {
              const partnerId = u.partner1 === sorted[i + 1] ? u.partner2 : u.partner1;
              const partnerPos = positions.get(partnerId);
              // Only shift partner if it's to the right (avoid pulling left partner)
              if (partnerPos && partnerPos.x >= posB.x) {
                toShift.push(partnerId);
              }
            }
          }
          for (const id of toShift) {
            const p = positions.get(id);
            if (p) p.x += shift;
          }
          anyOverlap = true;
        }
      }
    }
    if (!anyOverlap) break;
  }

  // ═══ POST-FIX: Re-center single children under their parent union ═══
  for (const u of unions) {
    if (u.children.length !== 1) continue;
    const childId = u.children[0];
    const childPos = positions.get(childId);
    const p1Pos = positions.get(u.partner1);
    const p2Pos = positions.get(u.partner2);
    if (!childPos || !p1Pos || !p2Pos) continue;
    
    // Skip if child has their own sub-family
    const childHasUnions = (partnerUnions.get(childId) || []).length > 0;
    if (childHasUnions) continue;
    
    // Compute union midpoint and center child under it
    const unionMidX = (p1Pos.x + CARD_W + p2Pos.x) / 2;
    childPos.x = unionMidX - CARD_W / 2;
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
