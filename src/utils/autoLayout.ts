/**
 * Hierarchical Grid Layout — Strict Clinical Genogram Rules
 *
 * LEVEL_HEIGHT  = 350px  (Y gap between generations)
 * SIBLING_MARGIN = 120px (min gap between sibling card edges)
 * BLOCK_GAP      = 150px (min gap between two family blocks)
 * COUPLE_GAP     = 80px  (gap between partners)
 *
 * Algorithm:
 *   Phase 1 — BFS generation assignment from roots
 *   Phase 2 — Bottom-up subtree width computation
 *   Phase 3 — Top-down recursive placement (couple centered above children)
 *   Phase 4 — Row-level overlap resolution + re-centering passes
 */

import { FamilyMember, Union, EmotionalLink } from '@/types/genogram';

// ── Layout constants ──
const CARD_W = 186;
const CARD_H = 64;
const LEVEL_HEIGHT = 350;
const SIBLING_MARGIN = 120;
const COUPLE_GAP = 80;
const BLOCK_GAP = 150;

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
  // PHASE 1: Generation assignment (BFS)
  // ═══════════════════════════════════════════════════════════════

  const childToUnion = new Map<string, Union>();
  const memberToUnions = new Map<string, Union[]>();

  for (const u of unions) {
    for (const cid of u.children) childToUnion.set(cid, u);
    for (const pid of [u.partner1, u.partner2]) {
      if (!memberToUnions.has(pid)) memberToUnions.set(pid, []);
      memberToUnions.get(pid)!.push(u);
    }
  }

  const allChildIds = new Set<string>();
  for (const u of unions) for (const cid of u.children) allChildIds.add(cid);
  const roots = members.filter(m => !allChildIds.has(m.id));

  const generation = new Map<string, number>();
  const queue: { id: string; gen: number }[] = [];

  for (const r of roots) {
    if (!generation.has(r.id)) {
      generation.set(r.id, 0);
      queue.push({ id: r.id, gen: 0 });
    }
  }

  let qi = 0;
  while (qi < queue.length) {
    const { id, gen } = queue[qi++];
    const myUnions = memberToUnions.get(id) || [];
    for (const u of myUnions) {
      const partnerId = u.partner1 === id ? u.partner2 : u.partner1;
      if (!generation.has(partnerId)) {
        generation.set(partnerId, gen);
        queue.push({ id: partnerId, gen });
      }
      for (const cid of u.children) {
        if (!generation.has(cid) && memberMap.has(cid)) {
          generation.set(cid, gen + 1);
          queue.push({ id: cid, gen: gen + 1 });
        }
      }
    }
  }

  for (const m of members) {
    if (!generation.has(m.id)) generation.set(m.id, 0);
  }

  // ═══════════════════════════════════════════════════════════════
  // PHASE 2: Bottom-up subtree width
  // ═══════════════════════════════════════════════════════════════

  const subtreeWidth = new Map<string, number>();
  const computedUnionWidth = new Map<string, number>();

  function getUnionChildrenWidth(u: Union): number {
    if (computedUnionWidth.has(u.id)) return computedUnionWidth.get(u.id)!;
    const validChildren = u.children.filter(cid => memberMap.has(cid));
    if (validChildren.length === 0) {
      computedUnionWidth.set(u.id, 0);
      return 0;
    }
    const childWidths = validChildren.map(cid => getMemberTreeWidth(cid));
    const total = childWidths.reduce((s, w) => s + w, 0) + (childWidths.length - 1) * SIBLING_MARGIN;
    computedUnionWidth.set(u.id, total);
    return total;
  }

  function getMemberTreeWidth(memberId: string): number {
    if (subtreeWidth.has(memberId)) return subtreeWidth.get(memberId)!;

    const myUnions = memberToUnions.get(memberId) || [];
    if (myUnions.length === 0) {
      subtreeWidth.set(memberId, CARD_W);
      return CARD_W;
    }

    let maxWidth = CARD_W;
    for (const u of myUnions) {
      const coupleW = CARD_W + COUPLE_GAP + CARD_W;
      const childrenW = getUnionChildrenWidth(u);
      const unionW = Math.max(coupleW, childrenW);
      maxWidth = Math.max(maxWidth, unionW);
    }

    subtreeWidth.set(memberId, maxWidth);
    return maxWidth;
  }

  for (const m of members) getMemberTreeWidth(m.id);

  // ═══════════════════════════════════════════════════════════════
  // PHASE 3: Top-down placement
  // ═══════════════════════════════════════════════════════════════

  const placed = new Set<string>();
  const placedUnions = new Set<string>();

  function placeAt(id: string, x: number, gen: number) {
    if (placed.has(id)) return;
    positions.set(id, { x, y: gen * LEVEL_HEIGHT });
    placed.add(id);
  }

  function placeUnion(union: Union, centerX: number, genLevel: number) {
    if (placedUnions.has(union.id)) return;
    placedUnions.add(union.id);

    const m1 = memberMap.get(union.partner1);
    const m2 = memberMap.get(union.partner2);
    if (!m1 || !m2) return;

    // Left = male, right = female (default)
    let leftId = union.partner1, rightId = union.partner2;
    if (m1.gender === 'female' && m2.gender === 'male') {
      leftId = union.partner2;
      rightId = union.partner1;
    }

    const coupleW = CARD_W + COUPLE_GAP + CARD_W;
    const leftX = centerX - coupleW / 2;
    const rightX = leftX + CARD_W + COUPLE_GAP;

    placeAt(leftId, leftX, genLevel);
    placeAt(rightId, rightX, genLevel);

    // Place children
    const validChildren = union.children.filter(cid => memberMap.has(cid) && !placed.has(cid));
    if (validChildren.length === 0) return;

    const childSubtrees = validChildren.map(cid => ({
      id: cid,
      width: getMemberTreeWidth(cid),
    }));

    const totalChildrenWidth = childSubtrees.reduce((s, c) => s + c.width, 0)
      + (childSubtrees.length - 1) * SIBLING_MARGIN;

    let childX = centerX - totalChildrenWidth / 2;
    const childGen = genLevel + 1;

    for (const child of childSubtrees) {
      const childCenterX = childX + child.width / 2;

      // If this child has their own union(s), place as couple
      const childUnions = (memberToUnions.get(child.id) || [])
        .filter(u => !placedUnions.has(u.id));

      if (childUnions.length > 0) {
        for (const cu of childUnions) {
          placeUnion(cu, childCenterX, childGen);
        }
      }

      // Place single child if not yet placed
      if (!placed.has(child.id)) {
        placeAt(child.id, childCenterX - CARD_W / 2, childGen);
      }

      childX += child.width + SIBLING_MARGIN;
    }
  }

  // Find root unions and place them
  const rootUnions: Union[] = [];
  const processedPartners = new Set<string>();

  const gen0 = members
    .filter(m => !allChildIds.has(m.id))
    .sort((a, b) => (a.x || 0) - (b.x || 0));

  for (const root of gen0) {
    if (processedPartners.has(root.id)) continue;
    const myUnions = memberToUnions.get(root.id) || [];
    for (const u of myUnions) {
      if (!rootUnions.find(ru => ru.id === u.id)) {
        rootUnions.push(u);
        processedPartners.add(u.partner1);
        processedPartners.add(u.partner2);
      }
    }
  }

  // Place root unions left to right
  let currentX = 0;
  for (const ru of rootUnions) {
    const p1w = getMemberTreeWidth(ru.partner1);
    const p2w = getMemberTreeWidth(ru.partner2);
    const familyWidth = Math.max(p1w, p2w, CARD_W + COUPLE_GAP + CARD_W);
    const centerX = currentX + familyWidth / 2;
    placeUnion(ru, centerX, 0);
    currentX += familyWidth + BLOCK_GAP;
  }

  // Place orphans
  for (const m of members) {
    if (!placed.has(m.id)) {
      const gen = generation.get(m.id) || 0;
      placeAt(m.id, currentX, gen);
      currentX += CARD_W + BLOCK_GAP;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // PHASE 4: Enforce Y alignment + resolve overlaps + re-center
  // ═══════════════════════════════════════════════════════════════

  // Force strict Y
  const genRows = new Map<number, string[]>();
  for (const [id, gen] of generation) {
    if (!genRows.has(gen)) genRows.set(gen, []);
    genRows.get(gen)!.push(id);
  }
  for (const [gen, ids] of genRows) {
    const y = gen * LEVEL_HEIGHT;
    for (const id of ids) {
      const pos = positions.get(id);
      if (pos) pos.y = y;
    }
  }

  // Overlap resolution + parent re-centering passes
  for (let pass = 0; pass < 5; pass++) {
    resolveOverlaps(positions, generation, genRows);

    // Re-center parents above children
    for (const u of unions) {
      const childPositions = u.children
        .map(cid => positions.get(cid))
        .filter((p): p is { x: number; y: number } => !!p);
      if (childPositions.length === 0) continue;

      const childMinX = Math.min(...childPositions.map(c => c.x));
      const childMaxX = Math.max(...childPositions.map(c => c.x + CARD_W));
      const childMidX = (childMinX + childMaxX) / 2;

      const p1 = positions.get(u.partner1);
      const p2 = positions.get(u.partner2);
      if (!p1 || !p2) continue;

      const parentMidX = (p1.x + p2.x + CARD_W) / 2;
      const shift = childMidX - parentMidX;
      p1.x += shift;
      p2.x += shift;
    }
  }

  // Final overlap pass
  resolveOverlaps(positions, generation, genRows);

  // Center layout around origin
  centerLayout(positions);

  return { positions };
}

function resolveOverlaps(
  positions: Map<string, { x: number; y: number }>,
  generation: Map<string, number>,
  genRows: Map<number, string[]>,
) {
  for (const [, ids] of genRows) {
    if (ids.length < 2) continue;
    const row = ids
      .map(id => ({ id, x: positions.get(id)!.x }))
      .sort((a, b) => a.x - b.x);

    for (let i = 1; i < row.length; i++) {
      const prev = row[i - 1];
      const curr = row[i];
      const minX = prev.x + CARD_W + BLOCK_GAP;
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

function centerLayout(positions: Map<string, { x: number; y: number }>) {
  if (positions.size === 0) return;
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
