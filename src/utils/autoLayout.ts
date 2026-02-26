/**
 * Hierarchical Grid Layout — Dagre-based with strict generation alignment
 *
 * Uses @dagrejs/dagre for the graph layout, then snaps Y to strict generation levels.
 * Rules:
 *   - LEVEL_SPACING = 350px → strict Y per generation
 *   - Male left, female right in couples
 *   - Couples centered above children
 *   - No overlaps
 */

import dagre from '@dagrejs/dagre';
import { FamilyMember, Union, EmotionalLink } from '@/types/genogram';

const CARD_W = 186;
const CARD_H = 64;
const LEVEL_SPACING = 350;

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

  // ═══ Build index ═══
  const allChildIds = new Set<string>();
  const memberToUnions = new Map<string, Union[]>();

  for (const u of unions) {
    for (const cid of u.children) allChildIds.add(cid);
    for (const pid of [u.partner1, u.partner2]) {
      if (!memberToUnions.has(pid)) memberToUnions.set(pid, []);
      memberToUnions.get(pid)!.push(u);
    }
  }

  // ═══ BFS generation assignment ═══
  const generation = new Map<string, number>();
  const q: { id: string; gen: number }[] = [];

  for (const m of members) {
    if (!allChildIds.has(m.id) && !generation.has(m.id)) {
      generation.set(m.id, 0);
      q.push({ id: m.id, gen: 0 });
    }
  }

  let qi = 0;
  while (qi < q.length) {
    const { id, gen } = q[qi++];
    for (const u of (memberToUnions.get(id) || [])) {
      const pid = u.partner1 === id ? u.partner2 : u.partner1;
      if (!generation.has(pid) && memberMap.has(pid)) {
        generation.set(pid, gen);
        q.push({ id: pid, gen });
      }
      for (const cid of u.children) {
        if (!generation.has(cid) && memberMap.has(cid)) {
          generation.set(cid, gen + 1);
          q.push({ id: cid, gen: gen + 1 });
        }
      }
    }
  }

  for (const m of members) {
    if (!generation.has(m.id)) generation.set(m.id, 0);
  }

  // ═══ Build Dagre graph ═══
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: 'TB',
    nodesep: 40,
    ranksep: LEVEL_SPACING,
    edgesep: 20,
    marginx: 0,
    marginy: 0,
  });
  g.setDefaultEdgeLabel(() => ({}));

  // Add member nodes
  for (const m of members) {
    g.setNode(m.id, { width: CARD_W, height: CARD_H, label: m.id });
  }

  // Add union "virtual" nodes (small point between partners)
  for (const u of unions) {
    const unionNodeId = `union_${u.id}`;
    g.setNode(unionNodeId, { width: 1, height: 1, label: unionNodeId });

    // Edges: partners → union node → children
    g.setEdge(u.partner1, unionNodeId, { weight: 2 });
    g.setEdge(u.partner2, unionNodeId, { weight: 2 });

    for (const cid of u.children) {
      if (memberMap.has(cid)) {
        g.setEdge(unionNodeId, cid, { weight: 1 });
      }
    }
  }

  // Layout
  dagre.layout(g);

  // Extract positions (dagre gives center coordinates, convert to top-left)
  for (const m of members) {
    const node = g.node(m.id);
    if (node) {
      positions.set(m.id, {
        x: node.x - CARD_W / 2,
        y: node.y - CARD_H / 2,
      });
    }
  }

  // ═══ Snap Y to strict generation levels ═══
  for (const [id, gen] of generation) {
    const pos = positions.get(id);
    if (pos) {
      pos.y = gen * LEVEL_SPACING;
    }
  }

  // ═══ Enforce male-left, female-right within couples ═══
  for (const u of unions) {
    const m1 = memberMap.get(u.partner1);
    const m2 = memberMap.get(u.partner2);
    const p1 = positions.get(u.partner1);
    const p2 = positions.get(u.partner2);
    if (!m1 || !m2 || !p1 || !p2) continue;

    // Determine which should be left (male) and right (female)
    const shouldSwap =
      (m1.gender === 'female' && m2.gender === 'male' && p1.x < p2.x) ||
      (m1.gender === 'male' && m2.gender === 'female' && p1.x > p2.x);

    if (shouldSwap) {
      const tmpX = p1.x;
      p1.x = p2.x;
      p2.x = tmpX;
    }
  }

  // ═══ Re-center couples above children (3 passes) ═══
  for (let pass = 0; pass < 5; pass++) {
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

      if (Math.abs(shift) > 2) {
        p1.x += shift;
        p2.x += shift;
      }
    }

    // Resolve overlaps
    const genRows = new Map<number, string[]>();
    for (const [id, gen] of generation) {
      if (!genRows.has(gen)) genRows.set(gen, []);
      genRows.get(gen)!.push(id);
    }

    for (const [, ids] of genRows) {
      if (ids.length < 2) continue;
      const row = ids
        .filter(id => positions.has(id))
        .map(id => ({ id, x: positions.get(id)!.x }))
        .sort((a, b) => a.x - b.x);

      for (let i = 1; i < row.length; i++) {
        const minX = row[i - 1].x + CARD_W + 40;
        if (row[i].x < minX) {
          const shift = minX - row[i].x;
          for (let j = i; j < row.length; j++) {
            row[j].x += shift;
            positions.get(row[j].id)!.x = row[j].x;
          }
        }
      }
    }
  }

  // ═══ Center layout around origin ═══
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
