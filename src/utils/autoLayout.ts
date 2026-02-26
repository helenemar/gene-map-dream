/**
 * Hierarchical Genealogy Layout Engine — Orthogonal Tree
 *
 * Golden Rules:
 *   1. Y = generationLevel × LEVEL_SPACING (strict horizontal alignment)
 *   2. Union Point at center between partners → vertical stem → comb
 *   3. Orthogonal comb: horizontal rail + vertical drops (zero crossings)
 *
 * Gap hierarchy:
 *   COUPLE_GAP  = 40   (between partners)
 *   SIBLING_GAP = 50   (between siblings of same union)
 *   BLOCK_GAP   = 100  (between unrelated members at same generation)
 */

import dagre from '@dagrejs/dagre';
import { FamilyMember, Union, EmotionalLink } from '@/types/genogram';

const CARD_W = 186;
const CARD_H = 64;
const LEVEL_SPACING = 350;
const COUPLE_GAP = 40;
const SIBLING_GAP = 50;
const BLOCK_GAP = 100;

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

  // ═══ INDEX ═══
  const allChildIds = new Set<string>();
  const partnerUnions = new Map<string, string[]>();
  for (const u of unions) {
    for (const cid of u.children) allChildIds.add(cid);
    for (const pid of [u.partner1, u.partner2]) {
      if (!partnerUnions.has(pid)) partnerUnions.set(pid, []);
      partnerUnions.get(pid)!.push(u.id);
    }
  }

  // Partner-pair & sibling-pair lookups
  const partnerPairs = new Set<string>();
  const siblingPairs = new Set<string>();
  for (const u of unions) {
    partnerPairs.add(`${u.partner1}|${u.partner2}`);
    partnerPairs.add(`${u.partner2}|${u.partner1}`);
    for (let i = 0; i < u.children.length; i++) {
      for (let j = i + 1; j < u.children.length; j++) {
        siblingPairs.add(`${u.children[i]}|${u.children[j]}`);
        siblingPairs.add(`${u.children[j]}|${u.children[i]}`);
      }
    }
  }
  const arePartners = (a: string, b: string) => partnerPairs.has(`${a}|${b}`);
  const areSiblings = (a: string, b: string) => siblingPairs.has(`${a}|${b}`);

  function getGap(a: string, b: string): number {
    if (arePartners(a, b)) return COUPLE_GAP;
    if (areSiblings(a, b)) return SIBLING_GAP;
    return BLOCK_GAP;
  }

  // ═══ PHASE 1: Generation Assignment ═══
  const generation = new Map<string, number>();
  const bfsQ: { id: string; gen: number }[] = [];

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

  // Partner alignment: spouses share highest generation
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

  // ═══ PHASE 2: Dagre Initial X ═══
  const dg = new dagre.graphlib.Graph();
  dg.setGraph({
    rankdir: 'TB',
    nodesep: SIBLING_GAP,
    ranksep: LEVEL_SPACING,
    edgesep: 10,
  });
  dg.setDefaultEdgeLabel(() => ({}));

  for (const m of members) {
    dg.setNode(m.id, { width: CARD_W, height: CARD_H });
  }
  for (const u of unions) {
    const vid = `union_${u.id}`;
    dg.setNode(vid, { width: 1, height: 1 });
    dg.setEdge(u.partner1, vid, { weight: 2 });
    dg.setEdge(u.partner2, vid, { weight: 2 });
    for (const cid of u.children) {
      if (memberMap.has(cid)) dg.setEdge(vid, cid, { weight: 1 });
    }
  }

  dagre.layout(dg);

  for (const m of members) {
    const node = dg.node(m.id);
    if (node) positions.set(m.id, { x: node.x - CARD_W / 2, y: 0 });
  }

  // ═══ PHASE 3: Snap Y ═══
  for (const [id, gen] of generation) {
    const pos = positions.get(id);
    if (pos) pos.y = gen * LEVEL_SPACING;
  }

  // ═══ PHASE 4: Male-Left, Female-Right ═══
  for (const u of unions) {
    const m1 = memberMap.get(u.partner1);
    const m2 = memberMap.get(u.partner2);
    const p1 = positions.get(u.partner1);
    const p2 = positions.get(u.partner2);
    if (!m1 || !m2 || !p1 || !p2) continue;
    if ((m1.gender === 'female' && m2.gender === 'male' && p1.x < p2.x) ||
        (m1.gender === 'male' && m2.gender === 'female' && p1.x > p2.x)) {
      const t = p1.x; p1.x = p2.x; p2.x = t;
    }
  }

  // ═══ PHASE 5: Iterative Refinement ═══
  const maxGen = Math.max(0, ...Array.from(generation.values()));

  const unionsByGenDesc = [...unions].sort((a, b) => {
    const gA = Math.max(generation.get(a.partner1) ?? 0, generation.get(a.partner2) ?? 0);
    const gB = Math.max(generation.get(b.partner1) ?? 0, generation.get(b.partner2) ?? 0);
    return gB - gA;
  });

  for (let pass = 0; pass < 10; pass++) {
    // 5a. Center couples above children
    const memberShifts = new Map<string, number[]>();

    for (const u of unionsByGenDesc) {
      const cp = u.children
        .map(cid => positions.get(cid))
        .filter((p): p is { x: number; y: number } => !!p);
      if (cp.length === 0) continue;

      const childCenter = (Math.min(...cp.map(c => c.x)) + Math.max(...cp.map(c => c.x + CARD_W))) / 2;

      const p1 = positions.get(u.partner1);
      const p2 = positions.get(u.partner2);
      if (!p1 || !p2) continue;

      const coupleCenter = (Math.min(p1.x, p2.x) + Math.max(p1.x, p2.x) + CARD_W) / 2;
      const shift = childCenter - coupleCenter;

      if (Math.abs(shift) > 1) {
        for (const pid of [u.partner1, u.partner2]) {
          if (!memberShifts.has(pid)) memberShifts.set(pid, []);
          memberShifts.get(pid)!.push(shift);
        }
      }
    }

    for (const [id, shifts] of memberShifts) {
      const isMultiUnion = (partnerUnions.get(id)?.length ?? 0) > 1;
      const damping = isMultiUnion ? 0.5 : 1.0;
      const avg = shifts.reduce((a, b) => a + b, 0) / shifts.length;
      const pos = positions.get(id);
      if (pos) pos.x += avg * damping;
    }

    // 5b. Enforce couple gap
    for (const u of unions) {
      const p1 = positions.get(u.partner1);
      const p2 = positions.get(u.partner2);
      if (!p1 || !p2) continue;
      const leftPos = p1.x < p2.x ? p1 : p2;
      const rightPos = p1.x < p2.x ? p2 : p1;
      const mid = (leftPos.x + rightPos.x + CARD_W) / 2;
      leftPos.x = mid - CARD_W - COUPLE_GAP / 2;
      rightPos.x = mid + COUPLE_GAP / 2;
    }

    // 5c. Resolve overlaps per generation (bottom-up)
    for (let gen = maxGen; gen >= 0; gen--) {
      const ids: string[] = [];
      for (const [id, g] of generation) {
        if (g === gen && positions.has(id)) ids.push(id);
      }
      if (ids.length < 2) continue;

      const row = ids
        .map(id => ({ id, x: positions.get(id)!.x }))
        .sort((a, b) => a.x - b.x);

      for (let i = 1; i < row.length; i++) {
        const gap = getGap(row[i - 1].id, row[i].id);
        const minX = row[i - 1].x + CARD_W + gap;
        if (row[i].x < minX) {
          row[i].x = minX;
          positions.get(row[i].id)!.x = minX;
        }
      }
    }
  }

  // ═══ PHASE 6: Center Around Origin ═══
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
