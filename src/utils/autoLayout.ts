/**
 * Hierarchical Grid Layout for Genograms
 *
 * Enforces strict clinical genogram rules:
 * 1. All members of the same generation share the EXACT same Y coordinate
 * 2. Siblings are spaced with a fixed minimum gap (150px between card edges)
 * 3. Couples are side-by-side (male left, female right), centered above children
 * 4. 100px exclusion zone around each card (no overlaps)
 * 5. Multiple unions per member → separate "beds" (peignes) per union
 *
 * Algorithm:
 *   Phase 1 — Generation assignment via BFS from roots
 *   Phase 2 — Bottom-up subtree width computation
 *   Phase 3 — Top-down X placement with couple centering
 *   Phase 4 — Overlap resolution within each generation row
 */

import { FamilyMember, Union, EmotionalLink } from '@/types/genogram';

// ── Layout constants ──
const CARD_W = 186;
const CARD_H = 64;
const SIBLING_GAP = 150;     // min px between card edges within a sibship
const COUPLE_GAP = 80;       // gap between partners
const GENERATION_HEIGHT = 300; // Y spacing between generations
const EXCLUSION_ZONE = 100;  // minimum gap between any two cards
const MARGIN = 50;

interface LayoutResult {
  positions: Map<string, { x: number; y: number }>;
}

// ── Helper types ──
interface FamilyUnit {
  unionId: string;
  partner1: string;
  partner2: string;
  children: string[];
}

export function computeAutoLayout(
  members: FamilyMember[],
  unions: Union[],
  _emotionalLinks: EmotionalLink[],
): LayoutResult {
  if (members.length === 0) return { positions: new Map() };

  const memberMap = new Map(members.map(m => [m.id, m]));
  const positions = new Map<string, { x: number; y: number }>();

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 1: Assign generations via BFS
  // ═══════════════════════════════════════════════════════════════════

  // Build parent-child relationship maps
  const childToUnion = new Map<string, Union>();      // child → union they belong to
  const memberToUnions = new Map<string, Union[]>();   // member → unions as partner

  for (const u of unions) {
    for (const cid of u.children) {
      childToUnion.set(cid, u);
    }
    for (const pid of [u.partner1, u.partner2]) {
      if (!memberToUnions.has(pid)) memberToUnions.set(pid, []);
      memberToUnions.get(pid)!.push(u);
    }
  }

  // Find roots: members who are not children in any union
  const allChildIds = new Set<string>();
  for (const u of unions) {
    for (const cid of u.children) allChildIds.add(cid);
  }
  const roots = members.filter(m => !allChildIds.has(m.id));

  // BFS to assign generation levels
  const generation = new Map<string, number>();
  const queue: { id: string; gen: number }[] = [];

  // Start with roots at generation 0
  for (const r of roots) {
    if (!generation.has(r.id)) {
      generation.set(r.id, 0);
      queue.push({ id: r.id, gen: 0 });
    }
  }

  let qi = 0;
  while (qi < queue.length) {
    const { id, gen } = queue[qi++];

    // Ensure partner is on same generation
    const myUnions = memberToUnions.get(id) || [];
    for (const u of myUnions) {
      const partnerId = u.partner1 === id ? u.partner2 : u.partner1;
      if (!generation.has(partnerId)) {
        generation.set(partnerId, gen);
        queue.push({ id: partnerId, gen });
      }
      // Children go one generation below
      for (const cid of u.children) {
        if (!generation.has(cid) && memberMap.has(cid)) {
          generation.set(cid, gen + 1);
          queue.push({ id: cid, gen: gen + 1 });
        }
      }
    }
  }

  // Assign any orphan members (not connected to any union)
  for (const m of members) {
    if (!generation.has(m.id)) {
      generation.set(m.id, 0);
    }
  }

  // Group members by generation
  const genRows = new Map<number, string[]>();
  for (const [id, gen] of generation) {
    if (!genRows.has(gen)) genRows.set(gen, []);
    genRows.get(gen)!.push(id);
  }

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 2: Build family tree structure for placement
  // ═══════════════════════════════════════════════════════════════════

  // For each union, compute the subtree width (bottom-up)
  // Subtree of a union = couple width + max of children subtrees spread

  // First, determine which unions are "root families"
  // (unions where neither partner is a child in another union, or they are top-level)

  // Build ordered family units per generation
  // We process from the bottom generation upward to compute widths

  const maxGen = Math.max(...Array.from(generation.values()), 0);

  // Width cache: how much horizontal space does a member's descendant tree need?
  const subtreeWidth = new Map<string, number>();

  // Compute subtree width bottom-up
  function getSubtreeWidth(memberId: string): number {
    if (subtreeWidth.has(memberId)) return subtreeWidth.get(memberId)!;

    const myUnions = memberToUnions.get(memberId) || [];
    if (myUnions.length === 0) {
      subtreeWidth.set(memberId, CARD_W);
      return CARD_W;
    }

    // For each union this member is part of, compute children spread
    let totalWidth = 0;
    const processedUnions = new Set<string>();

    for (const u of myUnions) {
      if (processedUnions.has(u.id)) continue;
      processedUnions.add(u.id);

      // Couple width
      const coupleW = CARD_W + COUPLE_GAP + CARD_W;

      // Children subtree widths
      const childWidths: number[] = [];
      for (const cid of u.children) {
        if (!memberMap.has(cid)) continue;
        childWidths.push(getSubtreeWidth(cid));
      }

      let childrenSpread = 0;
      if (childWidths.length > 0) {
        childrenSpread = childWidths.reduce((sum, w) => sum + w, 0)
          + (childWidths.length - 1) * SIBLING_GAP;
      }

      const unionWidth = Math.max(coupleW, childrenSpread);
      totalWidth = Math.max(totalWidth, unionWidth);
    }

    subtreeWidth.set(memberId, totalWidth);
    return totalWidth;
  }

  // Compute widths for all members
  for (const m of members) {
    getSubtreeWidth(m.id);
  }

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 3: Place nodes top-down
  // ═══════════════════════════════════════════════════════════════════

  const placed = new Set<string>();

  // Identify root unions (unions at generation 0)
  const rootUnions: Union[] = [];
  const processedPartners = new Set<string>();

  // Sort roots by their original X to maintain left-to-right order
  const gen0 = (genRows.get(0) || []).sort((a, b) => {
    const ma = memberMap.get(a);
    const mb = memberMap.get(b);
    return (ma?.x || 0) - (mb?.x || 0);
  });

  for (const rid of gen0) {
    if (processedPartners.has(rid)) continue;
    const myUnions = memberToUnions.get(rid) || [];
    for (const u of myUnions) {
      if (!rootUnions.find(ru => ru.id === u.id)) {
        rootUnions.push(u);
        processedPartners.add(u.partner1);
        processedPartners.add(u.partner2);
      }
    }
    // Orphan roots (no union)
    if (myUnions.length === 0 && !placed.has(rid)) {
      // Will be placed later
    }
  }

  /**
   * Place a couple and their descendants recursively.
   * centerX = the X center where this family unit should be placed.
   */
  function placeUnion(union: Union, centerX: number, genLevel: number) {
    const m1 = memberMap.get(union.partner1);
    const m2 = memberMap.get(union.partner2);
    if (!m1 || !m2) return;

    const y = genLevel * GENERATION_HEIGHT;

    // Determine left (male) / right (female)
    let leftId = union.partner1;
    let rightId = union.partner2;
    if (m1.gender === 'female' && m2.gender === 'male') {
      leftId = union.partner2;
      rightId = union.partner1;
    }

    // Place couple centered at centerX
    const coupleW = CARD_W + COUPLE_GAP + CARD_W;
    const leftX = centerX - coupleW / 2;
    const rightX = leftX + CARD_W + COUPLE_GAP;

    if (!placed.has(leftId)) {
      positions.set(leftId, { x: leftX, y });
      placed.add(leftId);
    }
    if (!placed.has(rightId)) {
      positions.set(rightId, { x: rightX, y });
      placed.add(rightId);
    }

    // Place children
    const validChildren = union.children.filter(cid => memberMap.has(cid) && !placed.has(cid));
    if (validChildren.length === 0) return;

    // Compute each child's subtree width for proportional spacing
    const childSubtrees = validChildren.map(cid => ({
      id: cid,
      width: getSubtreeWidth(cid),
    }));

    const totalChildrenWidth = childSubtrees.reduce((s, c) => s + c.width, 0)
      + (childSubtrees.length - 1) * SIBLING_GAP;

    // Center children under the couple
    let childX = centerX - totalChildrenWidth / 2;
    const childGen = genLevel + 1;

    for (const child of childSubtrees) {
      const childCenterX = childX + child.width / 2;

      // Check if this child has their own union(s)
      const childUnions = (memberToUnions.get(child.id) || [])
        .filter(u => !placed.has(u.partner1 === child.id ? u.partner2 : u.partner1));

      if (childUnions.length > 0) {
        // Place child as part of their own couple
        for (const cu of childUnions) {
          placeUnion(cu, childCenterX, childGen);
        }
      }

      // Place the child itself if not yet placed (single, or partner already placed)
      if (!placed.has(child.id)) {
        positions.set(child.id, {
          x: childCenterX - CARD_W / 2,
          y: childGen * GENERATION_HEIGHT,
        });
        placed.add(child.id);
      }

      childX += child.width + SIBLING_GAP;
    }
  }

  // Place root unions left to right
  let currentX = 0;
  for (const ru of rootUnions) {
    // Compute total width of this root family
    const p1w = getSubtreeWidth(ru.partner1);
    const p2w = getSubtreeWidth(ru.partner2);
    const familyWidth = Math.max(p1w, p2w, CARD_W + COUPLE_GAP + CARD_W);

    const centerX = currentX + familyWidth / 2;
    placeUnion(ru, centerX, 0);

    currentX += familyWidth + EXCLUSION_ZONE;
  }

  // Place any remaining unplaced members (orphans without unions)
  for (const m of members) {
    if (!placed.has(m.id)) {
      const gen = generation.get(m.id) || 0;
      positions.set(m.id, {
        x: currentX,
        y: gen * GENERATION_HEIGHT,
      });
      placed.add(m.id);
      currentX += CARD_W + EXCLUSION_ZONE;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 4: Enforce strict Y alignment & resolve overlaps
  // ═══════════════════════════════════════════════════════════════════

  // Force all members of the same generation to exactly the same Y
  for (const [gen, memberIds] of genRows) {
    const y = gen * GENERATION_HEIGHT;
    for (const id of memberIds) {
      const pos = positions.get(id);
      if (pos) pos.y = y;
    }
  }

  // Resolve horizontal overlaps within each generation row
  resolveOverlaps(positions, generation);

  // Re-center children under parents after overlap resolution
  for (let pass = 0; pass < 3; pass++) {
    for (const u of unions) {
      const p1Pos = positions.get(u.partner1);
      const p2Pos = positions.get(u.partner2);
      if (!p1Pos || !p2Pos) continue;

      const parentMidX = (p1Pos.x + p2Pos.x + CARD_W) / 2;

      const childPositions = u.children
        .map(cid => ({ id: cid, pos: positions.get(cid) }))
        .filter((c): c is { id: string; pos: { x: number; y: number } } => !!c.pos);

      if (childPositions.length === 0) continue;

      const childMinX = Math.min(...childPositions.map(c => c.pos.x));
      const childMaxX = Math.max(...childPositions.map(c => c.pos.x + CARD_W));
      const childMidX = (childMinX + childMaxX) / 2;
      const shift = parentMidX - childMidX;

      for (const c of childPositions) {
        c.pos.x += shift;
      }
    }

    // Re-resolve overlaps after centering
    resolveOverlaps(positions, generation);
  }

  // ── Center entire layout around (0, 0) ──
  centerLayout(positions);

  return { positions };
}

/**
 * Resolve horizontal overlaps within each generation row.
 * Maintains EXCLUSION_ZONE minimum gap between cards.
 */
function resolveOverlaps(
  positions: Map<string, { x: number; y: number }>,
  generation: Map<string, number>,
) {
  const byGen = new Map<number, { id: string; x: number }[]>();
  for (const [id, pos] of positions) {
    const gen = generation.get(id) ?? 0;
    if (!byGen.has(gen)) byGen.set(gen, []);
    byGen.get(gen)!.push({ id, x: pos.x });
  }

  for (const [, row] of byGen) {
    if (row.length < 2) continue;
    row.sort((a, b) => a.x - b.x);

    for (let i = 1; i < row.length; i++) {
      const prev = row[i - 1];
      const curr = row[i];
      const minX = prev.x + CARD_W + EXCLUSION_ZONE;
      if (curr.x < minX) {
        const shift = minX - curr.x;
        curr.x = minX;
        positions.get(curr.id)!.x = curr.x;
        // Push all subsequent nodes right
        for (let j = i + 1; j < row.length; j++) {
          row[j].x += shift;
          positions.get(row[j].id)!.x = row[j].x;
        }
      }
    }
  }
}

/**
 * Center entire layout around (0, 0).
 */
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
