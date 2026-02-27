/**
 * Emotional Link Router — Smart obstacle-avoiding path computation
 * 
 * Algorithm:
 * 1. Smart anchor selection: tries all 16 corner pairs, picks the one minimising card crossings + distance
 * 2. Adaptive Bézier: when straight path crosses a card, tries increasing curvature in both directions
 * 3. Parallel bundling: offsets co-located anchors by 5px for cable-bundle effect
 * 4. Link-to-link crossing resolution: flips curvature of crossing links
 */

import { FamilyMember, EmotionalLink } from '@/types/genogram';

const CARD_W = 220;
const CARD_H = 64;
const ANCHOR_MARGIN = 5;

interface CardRect {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LinkRoute {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Quadratic Bézier control point. Undefined = straight line. */
  mx?: number;
  my?: number;
}

// ─── Geometry Helpers ───────────────────────────────────────────────

function corners(m: FamilyMember): { x: number; y: number }[] {
  return [
    { x: m.x, y: m.y },                       // top-left
    { x: m.x + CARD_W, y: m.y },              // top-right
    { x: m.x, y: m.y + CARD_H },              // bottom-left
    { x: m.x + CARD_W, y: m.y + CARD_H },     // bottom-right
  ];
}

/** Liang–Barsky segment-vs-rect intersection test */
function segmentIntersectsRect(
  ax: number, ay: number, bx: number, by: number,
  rx: number, ry: number, rw: number, rh: number
): boolean {
  const dx = bx - ax, dy = by - ay;
  const p = [-dx, dx, -dy, dy];
  const q = [ax - rx, rx + rw - ax, ay - ry, ry + rh - ay];
  let u0 = 0, u1 = 1;
  for (let i = 0; i < 4; i++) {
    if (Math.abs(p[i]) < 1e-9) {
      if (q[i] < 0) return false;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) { if (t > u0) u0 = t; }
      else { if (t < u1) u1 = t; }
    }
  }
  return u0 <= u1;
}

function countCardCrossings(
  x1: number, y1: number, x2: number, y2: number,
  cards: CardRect[], excludeIds: string[]
): number {
  let count = 0;
  for (const c of cards) {
    if (excludeIds.includes(c.id)) continue;
    if (segmentIntersectsRect(x1, y1, x2, y2, c.x, c.y, c.w, c.h)) count++;
  }
  return count;
}

/** Sample a quadratic Bézier as N straight segments and count card crossings */
function countBezierCardCrossings(
  x1: number, y1: number, mx: number, my: number, x2: number, y2: number,
  cards: CardRect[], excludeIds: string[], samples = 10
): number {
  let count = 0;
  for (const c of cards) {
    if (excludeIds.includes(c.id)) continue;
    let prevX = x1, prevY = y1;
    for (let i = 1; i <= samples; i++) {
      const t = i / samples;
      const bx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2;
      const by = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * y2;
      if (segmentIntersectsRect(prevX, prevY, bx, by, c.x, c.y, c.w, c.h)) {
        count++;
        break;
      }
      prevX = bx;
      prevY = by;
    }
  }
  return count;
}

/** Check if two straight segments intersect (excluding endpoints) */
function segmentsIntersect(
  x1: number, y1: number, x2: number, y2: number,
  x3: number, y3: number, x4: number, y4: number
): boolean {
  const d1x = x2 - x1, d1y = y2 - y1;
  const d2x = x4 - x3, d2y = y4 - y3;
  const cross = d1x * d2y - d1y * d2x;
  if (Math.abs(cross) < 1e-9) return false;
  const t = ((x3 - x1) * d2y - (y3 - y1) * d2x) / cross;
  const u = ((x3 - x1) * d1y - (y3 - y1) * d1x) / cross;
  return t > 0.05 && t < 0.95 && u > 0.05 && u < 0.95;
}

// ─── Main Router ────────────────────────────────────────────────────

export function computeEmotionalRoutes(
  members: FamilyMember[],
  emotionalLinks: EmotionalLink[]
): Map<string, LinkRoute> {
  const routes = new Map<string, LinkRoute>();
  if (emotionalLinks.length === 0) return routes;

  const cards: CardRect[] = members.map(m => ({
    id: m.id, x: m.x, y: m.y, w: CARD_W, h: CARD_H,
  }));

  // Track corner usage for parallel offset (cable bundle)
  const cornerUsage = new Map<string, number>();

  for (const link of emotionalLinks) {
    const from = members.find(m => m.id === link.from);
    const to = members.find(m => m.id === link.to);
    if (!from || !to) continue;

    const fc = corners(from);
    const tc = corners(to);
    const excludeIds = [from.id, to.id];

    // ── Step 1: Smart anchor selection ──
    // Evaluate all 16 corner pairs, pick the one with fewest card crossings
    // then shortest distance as tiebreaker
    let bestScore = Infinity;
    let bestPair = { x1: fc[0].x, y1: fc[0].y, x2: tc[0].x, y2: tc[0].y, fi: 0, ti: 0 };

    for (let fi = 0; fi < 4; fi++) {
      for (let ti = 0; ti < 4; ti++) {
        const ax = fc[fi].x, ay = fc[fi].y;
        const bx = tc[ti].x, by = tc[ti].y;
        const crossings = countCardCrossings(ax, ay, bx, by, cards, excludeIds);
        const dist = Math.hypot(bx - ax, by - ay);
        const score = crossings * 10000 + dist;
        if (score < bestScore) {
          bestScore = score;
          bestPair = { x1: ax, y1: ay, x2: bx, y2: by, fi, ti };
        }
      }
    }

    let { x1, y1, x2, y2 } = bestPair;

    // ── Step 2: Parallel offset for cable bundle ──
    const fromKey = `${from.id}:${bestPair.fi}`;
    const toKey = `${to.id}:${bestPair.ti}`;
    const fromCount = cornerUsage.get(fromKey) || 0;
    const toCount = cornerUsage.get(toKey) || 0;
    cornerUsage.set(fromKey, fromCount + 1);
    cornerUsage.set(toKey, toCount + 1);

    const maxUsage = Math.max(fromCount, toCount);
    if (maxUsage > 0) {
      const ldx = x2 - x1, ldy = y2 - y1;
      const len = Math.hypot(ldx, ldy);
      if (len > 0) {
        const perpX = -ldy / len * ANCHOR_MARGIN;
        const perpY = ldx / len * ANCHOR_MARGIN;
        x1 += perpX * maxUsage;
        y1 += perpY * maxUsage;
        x2 += perpX * maxUsage;
        y2 += perpY * maxUsage;
      }
    }

    // ── Step 3: Adaptive Bézier for obstacle avoidance ──
    const straightCrossings = countCardCrossings(x1, y1, x2, y2, cards, excludeIds);

    if (straightCrossings === 0) {
      routes.set(link.id, { x1, y1, x2, y2 });
    } else {
      const ldx = x2 - x1, ldy = y2 - y1;
      const px = (x1 + x2) / 2, py = (y1 + y2) / 2;

      let bestMx = px, bestMy = py;
      let bestCross = straightCrossings;

      for (const sign of [1, -1]) {
        for (let curvature = 0.25; curvature <= 1.5; curvature += 0.15) {
          const mx = px - ldy * curvature * sign;
          const my = py + ldx * curvature * sign;
          const crosses = countBezierCardCrossings(x1, y1, mx, my, x2, y2, cards, excludeIds);
          if (crosses < bestCross) {
            bestCross = crosses;
            bestMx = mx;
            bestMy = my;
            if (crosses === 0) break;
          }
        }
        if (bestCross === 0) break;
      }

      routes.set(link.id, { x1, y1, x2, y2, mx: bestMx, my: bestMy });
    }
  }

  // ── Step 4: Link-to-link crossing resolution ──
  const linkIds = Array.from(routes.keys());
  for (let i = 0; i < linkIds.length; i++) {
    for (let j = i + 1; j < linkIds.length; j++) {
      const rA = routes.get(linkIds[i])!;
      const rB = routes.get(linkIds[j])!;

      // Check straight-line approximations for crossing
      const aMidX = rA.mx ?? (rA.x1 + rA.x2) / 2;
      const aMidY = rA.my ?? (rA.y1 + rA.y2) / 2;
      const bMidX = rB.mx ?? (rB.x1 + rB.x2) / 2;
      const bMidY = rB.my ?? (rB.y1 + rB.y2) / 2;

      // Check if the chords cross
      if (segmentsIntersect(rA.x1, rA.y1, rA.x2, rA.y2, rB.x1, rB.y1, rB.x2, rB.y2)) {
        // Curve one or both to resolve
        if (!rB.mx) {
          // Make B curved in opposite direction
          const dx = rB.x2 - rB.x1, dy = rB.y2 - rB.y1;
          const px = (rB.x1 + rB.x2) / 2, py = (rB.y1 + rB.y2) / 2;
          rB.mx = px - dy * 0.35;
          rB.my = py + dx * 0.35;
        } else {
          // Flip B's curvature
          const px = (rB.x1 + rB.x2) / 2, py = (rB.y1 + rB.y2) / 2;
          rB.mx = 2 * px - rB.mx;
          rB.my = 2 * py - rB.my;
        }
      }
    }
  }

  return routes;
}
