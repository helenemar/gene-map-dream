/**
 * Hierarchical Genealogy Layout Engine
 *
 * Strict clinical genogram layout (Geneanet/Heredis style):
 *   1. LEVEL_SPACING = 350 → each generation locked to gen * LEVEL_SPACING on Y
 *   2. Bottom-up: children determine parent positions (top adapts to bottom width)
 *   3. Nuclear family = inseparable block on X axis
 *   4. Male-left, female-right in couples
 *   5. COUPLE_GAP = 40 between partners, MIN_GAP = 120 between unrelated members
 *   6. Partner alignment: spouses always share the same generation level
 *
 * Algorithm phases:
 *   Phase 1 — BFS generation assignment + partner alignment
 *   Phase 2 — Dagre initial X ordering (handles cross-family marriages)
 *   Phase 3 — Y snap to strict generation levels
 *   Phase 4 — Male-left / Female-right enforcement
 *   Phase 5 — Iterative bottom-up refinement (15 passes):
 *     5a. Center couples above children (averaged shifts for multi-union members)
 *     5b. Resolve overlaps with partner-aware gaps (bottom-up per generation)
 *   Phase 6 — Center layout around origin
 */

import dagre from '@dagrejs/dagre';
import { FamilyMember, Union, EmotionalLink } from '@/types/genogram';

const CARD_W = 186;
const CARD_H = 64;
const LEVEL_SPACING = 350;
const COUPLE_GAP = 40;   // gap between partners in a couple
const MIN_GAP = 120;     // exclusion zone between unrelated cards

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
  const unionMap = new Map(unions.map(u => [u.id, u]));
  const positions = new Map<string, { x: number; y: number }>();

  // ═══════════════════════════════════════════════════
  // PHASE 1: Generation Assignment (BFS + partner align)
  // ═══════════════════════════════════════════════════
  const allChildIds = new Set<string>();
  const partnerUnions = new Map<string, string[]>();

  for (const u of unions) {
    for (const cid of u.children) allChildIds.add(cid);
    for (const pid of [u.partner1, u.partner2]) {
      if (!partnerUnions.has(pid)) partnerUnions.set(pid, []);
      partnerUnions.get(pid)!.push(u.id);
    }
  }

  const generation = new Map<string, number>();
  const bfsQ: { id: string; gen: number }[] = [];

  // Seed: non-child members start at gen 0
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

  for (const m of members) {
    if (!generation.has(m.id)) generation.set(m.id, 0);
  }

  // Partner alignment: spouses MUST share the same generation (use max)
  // This fixes cases like Marc (no parents) marrying Elisabeth (gen 1)
  for (let iter = 0; iter < 10; iter++) {
    let changed = false;
    for (const u of unions) {
      const g1 = generation.get(u.partner1) ?? 0;
      const g2 = generation.get(u.partner2) ?? 0;
      if (g1 !== g2) {
        const target = Math.max(g1, g2);
        generation.set(u.partner1, target);
        generation.set(u.partner2, target);
        changed = true;
      }
    }
    if (!changed) break;
  }

  // ═══════════════════════════════════════════════════
  // PHASE 2: Dagre Initial X Ordering
  // ═══════════════════════════════════════════════════
  const dg = new dagre.graphlib.Graph();
  dg.setGraph({
    rankdir: 'TB',
    nodesep: MIN_GAP,
    ranksep: LEVEL_SPACING,
    edgesep: 20,
    marginx: 0,
    marginy: 0,
  });
  dg.setDefaultEdgeLabel(() => ({}));

  for (const m of members) {
    dg.setNode(m.id, { width: CARD_W, height: CARD_H, label: m.id });
  }

  for (const u of unions) {
    const vid = `union_${u.id}`;
    dg.setNode(vid, { width: 1, height: 1, label: vid });
    dg.setEdge(u.partner1, vid, { weight: 2 });
    dg.setEdge(u.partner2, vid, { weight: 2 });
    for (const cid of u.children) {
      if (memberMap.has(cid)) {
        dg.setEdge(vid, cid, { weight: 1 });
      }
    }
  }

  dagre.layout(dg);

  for (const m of members) {
    const node = dg.node(m.id);
    if (node) {
      positions.set(m.id, { x: node.x - CARD_W / 2, y: 0 });
    }
  }

  // ═══════════════════════════════════════════════════
  // PHASE 3: Snap Y to Strict Generation Levels
  // ═══════════════════════════════════════════════════
  for (const [id, gen] of generation) {
    const pos = positions.get(id);
    if (pos) pos.y = gen * LEVEL_SPACING;
  }

  // ═══════════════════════════════════════════════════
  // PHASE 4: Male-Left, Female-Right
  // ═══════════════════════════════════════════════════
  for (const u of unions) {
    const m1 = memberMap.get(u.partner1);
    const m2 = memberMap.get(u.partner2);
    const p1 = positions.get(u.partner1);
    const p2 = positions.get(u.partner2);
    if (!m1 || !m2 || !p1 || !p2) continue;

    const shouldSwap =
      (m1.gender === 'female' && m2.gender === 'male' && p1.x < p2.x) ||
      (m1.gender === 'male' && m2.gender === 'female' && p1.x > p2.x);
    if (shouldSwap) {
      const t = p1.x;
      p1.x = p2.x;
      p2.x = t;
    }
  }

  // ═══════════════════════════════════════════════════
  // PHASE 5: Iterative Bottom-Up Refinement
  // ═══════════════════════════════════════════════════
  const maxGen = Math.max(0, ...Array.from(generation.values()));

  // Partner-pair lookup for gap determination
  const partnerPairs = new Set<string>();
  for (const u of unions) {
    partnerPairs.add(`${u.partner1}|${u.partner2}`);
    partnerPairs.add(`${u.partner2}|${u.partner1}`);
  }
  const arePartners = (a: string, b: string) => partnerPairs.has(`${a}|${b}`);

  // Sort unions deepest-generation-first for bottom-up centering
  const unionsByGenDesc = [...unions].sort((a, b) => {
    const gA = Math.max(generation.get(a.partner1) ?? 0, generation.get(a.partner2) ?? 0);
    const gB = Math.max(generation.get(b.partner1) ?? 0, generation.get(b.partner2) ?? 0);
    return gB - gA;
  });

  for (let pass = 0; pass < 15; pass++) {
    // ── 5a. Center couples above children ──
    // For multi-union members: average the desired shifts to find a compromise
    const memberShifts = new Map<string, number[]>();

    for (const u of unionsByGenDesc) {
      const cp = u.children
        .map(cid => positions.get(cid))
        .filter((p): p is { x: number; y: number } => !!p);
      if (cp.length === 0) continue;

      const childMinX = Math.min(...cp.map(c => c.x));
      const childMaxX = Math.max(...cp.map(c => c.x + CARD_W));
      const childCenter = (childMinX + childMaxX) / 2;

      const p1 = positions.get(u.partner1);
      const p2 = positions.get(u.partner2);
      if (!p1 || !p2) continue;

      const coupleCenter =
        (Math.min(p1.x, p2.x) + Math.max(p1.x, p2.x) + CARD_W) / 2;
      const shift = childCenter - coupleCenter;

      if (Math.abs(shift) > 1) {
        for (const pid of [u.partner1, u.partner2]) {
          if (!memberShifts.has(pid)) memberShifts.set(pid, []);
          memberShifts.get(pid)!.push(shift);
        }
      }
    }

    // Apply averaged + damped shifts
    for (const [id, shifts] of memberShifts) {
      const avg = shifts.reduce((a, b) => a + b, 0) / shifts.length;
      const pos = positions.get(id);
      if (pos) pos.x += avg * 0.7;
    }

    // ── 5b. Resolve overlaps per generation (bottom-up) ──
    for (let gen = maxGen; gen >= 0; gen--) {
      const ids: string[] = [];
      for (const [id, g] of generation) {
        if (g === gen && positions.has(id)) ids.push(id);
      }
      if (ids.length < 2) continue;

      // Sort left-to-right
      const row = ids
        .map(id => ({ id, x: positions.get(id)!.x }))
        .sort((a, b) => a.x - b.x);

      // Sweep left-to-right: enforce minimum gaps
      for (let i = 1; i < row.length; i++) {
        const gap = arePartners(row[i - 1].id, row[i].id)
          ? COUPLE_GAP
          : MIN_GAP;
        const minX = row[i - 1].x + CARD_W + gap;
        if (row[i].x < minX) {
          row[i].x = minX;
          positions.get(row[i].id)!.x = minX;
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════
  // PHASE 6: Center Around Origin
  // ═══════════════════════════════════════════════════
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
