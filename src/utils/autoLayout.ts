/**
 * Dagre-based auto-layout for genograms.
 *
 * Uses @dagrejs/dagre with Virtual Union Points for couple constraints:
 * 1. Each Union creates a virtual node (1x1px) on the same rank as the couple
 * 2. Edges: partner1 → virtual, partner2 → virtual (weight: high, minlen: 0)
 * 3. Edges: virtual → each child
 * 4. Dagre computes optimal positions with crossing minimization
 * 5. Post-process: snap couples side-by-side (male left, female right)
 *    and center children under parent midpoint
 */

import dagre from '@dagrejs/dagre';
import { FamilyMember, Union, EmotionalLink } from '@/types/genogram';

// ── Layout constants ──
const CARD_W = 186;
const CARD_H = 64;
const NODE_SEP = 100;   // horizontal spacing between nodes
const RANK_SEP = 200;   // vertical spacing between generations
const COUPLE_GAP = 80;  // gap between partners in a couple
const MARGIN = 50;

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

  // ── Create Dagre graph ──
  const g = new dagre.graphlib.Graph({ compound: true });
  g.setGraph({
    rankdir: 'TB',
    nodesep: NODE_SEP,
    ranksep: RANK_SEP,
    marginx: MARGIN,
    marginy: MARGIN,
    ranker: 'network-simplex',
  });
  g.setDefaultEdgeLabel(() => ({}));

  // ── Add real member nodes with actual card dimensions ──
  for (const m of members) {
    g.setNode(m.id, {
      label: `${m.firstName} ${m.lastName}`,
      width: CARD_W,
      height: CARD_H,
    });
  }

  // ── Create Virtual Union Points and edges ──
  for (const u of unions) {
    const virtualId = `__union_${u.id}`;

    // Virtual union point: tiny invisible node
    g.setNode(virtualId, {
      label: '',
      width: 1,
      height: 1,
    });

    // Partner → Virtual edges (high weight to keep partners close, minlen 0 for same rank)
    g.setEdge(u.partner1, virtualId, {
      weight: 10,
      minlen: 0,
    });
    g.setEdge(u.partner2, virtualId, {
      weight: 10,
      minlen: 0,
    });

    // Virtual → Children edges
    for (const childId of u.children) {
      if (memberMap.has(childId)) {
        g.setEdge(virtualId, childId, {
          weight: 1,
          minlen: 1,
        });
      }
    }
  }

  // ── Run Dagre layout ──
  dagre.layout(g);

  // ── Extract positions ──
  const positions = new Map<string, { x: number; y: number }>();
  const virtualPositions = new Map<string, { x: number; y: number }>();

  for (const nodeId of g.nodes()) {
    const node = g.node(nodeId);
    if (!node) continue;

    if (nodeId.startsWith('__union_')) {
      virtualPositions.set(nodeId, {
        x: node.x - node.width / 2,
        y: node.y - node.height / 2,
      });
    } else {
      // Dagre returns center coordinates; convert to top-left
      positions.set(nodeId, {
        x: node.x - CARD_W / 2,
        y: node.y - CARD_H / 2,
      });
    }
  }

  // ── Post-process: Enforce couple constraints ──
  // Snap partners side-by-side on the same Y, male left / female right
  for (const u of unions) {
    const p1Pos = positions.get(u.partner1);
    const p2Pos = positions.get(u.partner2);
    if (!p1Pos || !p2Pos) continue;

    const m1 = memberMap.get(u.partner1);
    const m2 = memberMap.get(u.partner2);
    if (!m1 || !m2) continue;

    // Determine left (male) and right (female)
    let leftId = u.partner1;
    let rightId = u.partner2;
    if (m1.gender === 'female' && m2.gender === 'male') {
      leftId = u.partner2;
      rightId = u.partner1;
    }

    const leftPos = positions.get(leftId)!;
    const rightPos = positions.get(rightId)!;

    // Use the midpoint X of where dagre placed them
    const midX = (leftPos.x + rightPos.x + CARD_W) / 2;
    // Use the higher Y (same rank)
    const sharedY = Math.min(leftPos.y, rightPos.y);

    // Place left partner and right partner centered around midX
    const totalCoupleWidth = CARD_W + COUPLE_GAP + CARD_W;
    leftPos.x = midX - totalCoupleWidth / 2;
    leftPos.y = sharedY;
    rightPos.x = midX - totalCoupleWidth / 2 + CARD_W + COUPLE_GAP;
    rightPos.y = sharedY;
  }

  // ── Post-process: Center children under parent couple midpoint ──
  for (const u of unions) {
    const p1Pos = positions.get(u.partner1);
    const p2Pos = positions.get(u.partner2);
    if (!p1Pos || !p2Pos) continue;

    const parentMidX = (p1Pos.x + p2Pos.x + CARD_W) / 2;

    const childPositions = u.children
      .map(cid => ({ id: cid, pos: positions.get(cid) }))
      .filter((c): c is { id: string; pos: { x: number; y: number } } => !!c.pos);

    if (childPositions.length === 0) continue;

    // Current children midpoint
    const childMinX = Math.min(...childPositions.map(c => c.pos.x));
    const childMaxX = Math.max(...childPositions.map(c => c.pos.x + CARD_W));
    const childMidX = (childMinX + childMaxX) / 2;

    // Shift children to center under parent
    const shift = parentMidX - childMidX;
    for (const c of childPositions) {
      c.pos.x += shift;
    }
  }

  // ── Resolve any remaining overlaps ──
  resolveOverlaps(positions);

  // ── Center around (0, 0) ──
  centerLayout(positions);

  return { positions };
}

/**
 * Resolve horizontal overlaps within same Y level.
 */
function resolveOverlaps(positions: Map<string, { x: number; y: number }>) {
  const byY = new Map<number, { id: string; x: number }[]>();
  for (const [id, pos] of positions) {
    // Round Y to group same-rank nodes
    const key = Math.round(pos.y / 10) * 10;
    if (!byY.has(key)) byY.set(key, []);
    byY.get(key)!.push({ id, x: pos.x });
  }

  for (const [, row] of byY) {
    if (row.length < 2) continue;
    row.sort((a, b) => a.x - b.x);

    for (let i = 1; i < row.length; i++) {
      const prev = row[i - 1];
      const curr = row[i];
      const minX = prev.x + CARD_W + NODE_SEP * 0.3; // tighter than NODE_SEP since dagre already spaces
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
