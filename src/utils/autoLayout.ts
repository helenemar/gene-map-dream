/**
 * Hierarchical Grid Layout — Strict Clinical Genogram
 *
 * Constants:
 *   LEVEL_SPACING  = 350px   (Y distance between generations)
 *   EXCLUSION_ZONE = 120px   (min gap between any two card edges on same row)
 *   COUPLE_GAP     = 80px    (gap between partners in a couple)
 *   COMB_DROP      = 60px    (vertical stem from union midpoint to comb bar)
 *
 * Algorithm (Sugiyama-inspired):
 *   Phase 1 — BFS generation assignment
 *   Phase 2 — Build ordered forest of family units (union → children)
 *   Phase 3 — Bottom-up: compute minimum subtree width for each union
 *   Phase 4 — Top-down: place unions left-to-right, couple centered over children
 *   Phase 5 — Enforce strict Y, resolve X overlaps, re-center parents (iterate)
 */

import { FamilyMember, Union, EmotionalLink } from '@/types/genogram';

const CARD_W = 186;
const CARD_H = 64;
const LEVEL_SPACING = 350;
const EXCLUSION_ZONE = 120;   // min px gap between card edges
const COUPLE_GAP = 80;

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

  // ═══════════════════════════════════════════════════════════════
  // PHASE 1: Generation assignment via BFS
  // ═══════════════════════════════════════════════════════════════

  const childOfUnion = new Map<string, Union>();       // childId → parent union
  const memberUnions = new Map<string, Union[]>();     // memberId → unions as partner

  for (const u of unions) {
    for (const cid of u.children) childOfUnion.set(cid, u);
    for (const pid of [u.partner1, u.partner2]) {
      if (!memberUnions.has(pid)) memberUnions.set(pid, []);
      memberUnions.get(pid)!.push(u);
    }
  }

  const allChildIds = new Set<string>();
  for (const u of unions) for (const cid of u.children) allChildIds.add(cid);

  const generation = new Map<string, number>();
  const bfsQueue: { id: string; gen: number }[] = [];

  // Roots = members not a child of any union
  for (const m of members) {
    if (!allChildIds.has(m.id) && !generation.has(m.id)) {
      generation.set(m.id, 0);
      bfsQueue.push({ id: m.id, gen: 0 });
    }
  }

  let qi = 0;
  while (qi < bfsQueue.length) {
    const { id, gen } = bfsQueue[qi++];
    for (const u of (memberUnions.get(id) || [])) {
      // Partner on same generation
      const pid = u.partner1 === id ? u.partner2 : u.partner1;
      if (!generation.has(pid) && memberMap.has(pid)) {
        generation.set(pid, gen);
        bfsQueue.push({ id: pid, gen });
      }
      // Children one level down
      for (const cid of u.children) {
        if (!generation.has(cid) && memberMap.has(cid)) {
          generation.set(cid, gen + 1);
          bfsQueue.push({ id: cid, gen: gen + 1 });
        }
      }
    }
  }

  // Orphans
  for (const m of members) {
    if (!generation.has(m.id)) generation.set(m.id, 0);
  }

  // ═══════════════════════════════════════════════════════════════
  // PHASE 2 & 3: Bottom-up subtree width
  // ═══════════════════════════════════════════════════════════════

  // For each union, compute how wide its descendant tree is.
  // A union's width = max(coupleWidth, sum of children subtree widths + gaps)
  // A member's subtree width = if single: CARD_W; if has unions: sum of all their widths + gaps between them

  const unionWidthCache = new Map<string, number>();
  const memberWidthCache = new Map<string, number>();

  function unionSubtreeWidth(u: Union): number {
    if (unionWidthCache.has(u.id)) return unionWidthCache.get(u.id)!;

    const coupleW = CARD_W + COUPLE_GAP + CARD_W;
    const validChildren = u.children.filter(cid => memberMap.has(cid));

    if (validChildren.length === 0) {
      unionWidthCache.set(u.id, coupleW);
      return coupleW;
    }

    const childWidths = validChildren.map(cid => memberSubtreeWidth(cid));
    const childrenTotal = childWidths.reduce((s, w) => s + w, 0)
      + (childWidths.length - 1) * EXCLUSION_ZONE;

    const w = Math.max(coupleW, childrenTotal);
    unionWidthCache.set(u.id, w);
    return w;
  }

  function memberSubtreeWidth(memberId: string): number {
    if (memberWidthCache.has(memberId)) return memberWidthCache.get(memberId)!;

    const myUnions = memberUnions.get(memberId) || [];
    if (myUnions.length === 0) {
      memberWidthCache.set(memberId, CARD_W);
      return CARD_W;
    }

    // A member may be in multiple unions. Each union is a separate "bed".
    // The member's total width = max of all union widths (they share the same center).
    let maxW = CARD_W;
    for (const u of myUnions) {
      maxW = Math.max(maxW, unionSubtreeWidth(u));
    }

    memberWidthCache.set(memberId, maxW);
    return maxW;
  }

  for (const m of members) memberSubtreeWidth(m.id);

  // ═══════════════════════════════════════════════════════════════
  // PHASE 4: Top-down placement
  // ═══════════════════════════════════════════════════════════════

  const placed = new Set<string>();
  const placedUnions = new Set<string>();

  function placeAt(id: string, x: number, genLevel: number) {
    if (placed.has(id)) return;
    positions.set(id, { x, y: genLevel * LEVEL_SPACING });
    placed.add(id);
  }

  function placeUnionTree(union: Union, centerX: number, genLevel: number) {
    if (placedUnions.has(union.id)) return;
    placedUnions.add(union.id);

    const m1 = memberMap.get(union.partner1);
    const m2 = memberMap.get(union.partner2);
    if (!m1 || !m2) return;

    // Determine left/right (male left, female right by default)
    let leftId = union.partner1, rightId = union.partner2;
    if (m1.gender === 'female' && m2.gender === 'male') {
      leftId = union.partner2;
      rightId = union.partner1;
    }

    const coupleW = CARD_W + COUPLE_GAP + CARD_W;

    // If one partner is already placed (multi-union case), position the other relative to them
    const leftPlaced = placed.has(leftId);
    const rightPlaced = placed.has(rightId);

    if (leftPlaced && !rightPlaced) {
      // Place right partner next to existing left partner
      const leftPos = positions.get(leftId)!;
      const rightX = leftPos.x + CARD_W + COUPLE_GAP;
      placeAt(rightId, rightX, genLevel);
      // Recalculate centerX based on actual positions
      centerX = leftPos.x + coupleW / 2;
    } else if (rightPlaced && !leftPlaced) {
      const rightPos = positions.get(rightId)!;
      const leftX = rightPos.x - CARD_W - COUPLE_GAP;
      placeAt(leftId, leftX, genLevel);
      centerX = leftX + coupleW / 2;
    } else if (!leftPlaced && !rightPlaced) {
      const leftX = centerX - coupleW / 2;
      const rightX = leftX + CARD_W + COUPLE_GAP;
      placeAt(leftId, leftX, genLevel);
      placeAt(rightId, rightX, genLevel);
    } else {
      // Both already placed — just use their midpoint as center
      const lp = positions.get(leftId)!;
      const rp = positions.get(rightId)!;
      centerX = (lp.x + rp.x + CARD_W) / 2;
    }

    // Place children
    const validChildren = union.children.filter(cid => memberMap.has(cid) && !placed.has(cid));
    if (validChildren.length === 0) return;

    const childGen = genLevel + 1;
    const childSubtrees = validChildren.map(cid => ({
      id: cid,
      width: memberSubtreeWidth(cid),
    }));

    const totalWidth = childSubtrees.reduce((s, c) => s + c.width, 0)
      + (childSubtrees.length - 1) * EXCLUSION_ZONE;

    let childX = centerX - totalWidth / 2;

    for (const child of childSubtrees) {
      const childCenterX = childX + child.width / 2;

      // If child has their own unions, place them recursively
      const childUnionsList = (memberUnions.get(child.id) || [])
        .filter(u => !placedUnions.has(u.id));

      if (childUnionsList.length > 0) {
        for (const cu of childUnionsList) {
          placeUnionTree(cu, childCenterX, childGen);
        }
      }

      // Place single child
      if (!placed.has(child.id)) {
        placeAt(child.id, childCenterX - CARD_W / 2, childGen);
      }

      childX += child.width + EXCLUSION_ZONE;
    }
  }

  // Collect root unions (ordered by original X)
  const rootUnions: Union[] = [];
  const seenPartners = new Set<string>();

  const rootMembers = members
    .filter(m => !allChildIds.has(m.id))
    .sort((a, b) => (a.x || 0) - (b.x || 0));

  for (const rm of rootMembers) {
    if (seenPartners.has(rm.id)) continue;
    for (const u of (memberUnions.get(rm.id) || [])) {
      if (!rootUnions.find(ru => ru.id === u.id)) {
        rootUnions.push(u);
        seenPartners.add(u.partner1);
        seenPartners.add(u.partner2);
      }
    }
  }

  // Place root unions left to right with spacing
  let cursorX = 0;
  for (const ru of rootUnions) {
    const w = unionSubtreeWidth(ru);
    const center = cursorX + w / 2;
    placeUnionTree(ru, center, 0);
    cursorX += w + EXCLUSION_ZONE * 2; // extra gap between root families
  }

  // Place any remaining orphans
  for (const m of members) {
    if (!placed.has(m.id)) {
      const gen = generation.get(m.id) || 0;
      placeAt(m.id, cursorX, gen);
      cursorX += CARD_W + EXCLUSION_ZONE;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // PHASE 5: Enforce strict Y + resolve overlaps + re-center
  // ═══════════════════════════════════════════════════════════════

  const genRows = new Map<number, string[]>();
  for (const [id, gen] of generation) {
    if (!genRows.has(gen)) genRows.set(gen, []);
    genRows.get(gen)!.push(id);
  }

  // Force strict Y
  for (const [gen, ids] of genRows) {
    const y = gen * LEVEL_SPACING;
    for (const id of ids) {
      const pos = positions.get(id);
      if (pos) pos.y = y;
    }
  }

  // Iterative overlap resolution + parent re-centering
  for (let pass = 0; pass < 8; pass++) {
    // Resolve overlaps in each row
    for (const [, ids] of genRows) {
      if (ids.length < 2) continue;
      const row = ids
        .filter(id => positions.has(id))
        .map(id => ({ id, x: positions.get(id)!.x }))
        .sort((a, b) => a.x - b.x);

      for (let i = 1; i < row.length; i++) {
        const minX = row[i - 1].x + CARD_W + EXCLUSION_ZONE;
        if (row[i].x < minX) {
          const shift = minX - row[i].x;
          // Push this and all subsequent nodes right
          for (let j = i; j < row.length; j++) {
            row[j].x += shift;
            positions.get(row[j].id)!.x = row[j].x;
          }
        }
      }
    }

    // Re-center each couple above its children
    for (const u of unions) {
      const cp = u.children
        .map(cid => positions.get(cid))
        .filter((p): p is { x: number; y: number } => !!p);
      if (cp.length === 0) continue;

      const childMinX = Math.min(...cp.map(c => c.x));
      const childMaxX = Math.max(...cp.map(c => c.x + CARD_W));
      const childCenterX = (childMinX + childMaxX) / 2;

      const p1 = positions.get(u.partner1);
      const p2 = positions.get(u.partner2);
      if (!p1 || !p2) continue;

      const parentCenterX = (p1.x + p2.x + CARD_W) / 2;
      const shift = childCenterX - parentCenterX;

      // Only shift if meaningful
      if (Math.abs(shift) > 1) {
        p1.x += shift;
        p2.x += shift;
      }
    }
  }

  // Final overlap pass
  for (const [, ids] of genRows) {
    if (ids.length < 2) continue;
    const row = ids
      .filter(id => positions.has(id))
      .map(id => ({ id, x: positions.get(id)!.x }))
      .sort((a, b) => a.x - b.x);

    for (let i = 1; i < row.length; i++) {
      const minX = row[i - 1].x + CARD_W + EXCLUSION_ZONE;
      if (row[i].x < minX) {
        const shift = minX - row[i].x;
        for (let j = i; j < row.length; j++) {
          row[j].x += shift;
          positions.get(row[j].id)!.x = row[j].x;
        }
      }
    }
  }

  // Center entire layout around origin
  if (positions.size > 0) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const pos of positions.values()) {
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + CARD_W);
      maxY = Math.max(maxY, pos.y + CARD_H);
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    for (const pos of positions.values()) {
      pos.x -= cx;
      pos.y -= cy;
    }
  }

  return { positions };
}
