/**
 * Sugiyama-based auto-layout for genograms.
 *
 * Phases:
 *   1. Build directed graph from unions (parent → child edges)
 *   2. Layer assignment (topological / longest-path)
 *   3. Crossing minimization (barycenter heuristic, iterated)
 *   4. Coordinate assignment with genogram constraints:
 *      - Couples side-by-side (male left, female right)
 *      - Children centered under parent couple midpoint
 *      - Rail-safe spacing (nodeSpacing ≥ 100px)
 */

import { FamilyMember, Union, EmotionalLink } from '@/types/genogram';

// ── Layout constants ──
const CARD_W = 186;
const CARD_H = 64;
const NODE_SPACING = 100;   // horizontal gap between sibling cards
const LEVEL_SPACING = 300;  // vertical gap between generations
const COUPLE_GAP = 80;      // gap between couple partners (inside pair)

interface LayoutResult {
  positions: Map<string, { x: number; y: number }>;
}

// ── Phase 0: Build graph structures ──

interface GraphNode {
  id: string;
  layer: number;
  order: number;   // position within layer (for crossing minimization)
  x: number;
  y: number;
  unionIds: string[];  // unions this member participates in
}

interface CoupleConstraint {
  unionId: string;
  leftId: string;   // male or partner1
  rightId: string;   // female or partner2
}

/**
 * Identify generation layers using BFS from root nodes.
 * Root = any member who is NOT a child in any union.
 */
function assignLayers(
  members: FamilyMember[],
  unions: Union[],
): Map<string, number> {
  const layers = new Map<string, number>();
  const allChildren = new Set<string>();
  const parentToChildren = new Map<string, string[]>();  // parentId → childIds
  const childToParents = new Map<string, string[]>();

  for (const u of unions) {
    for (const cid of u.children) {
      allChildren.add(cid);
      // Both partners are parents of these children
      for (const pid of [u.partner1, u.partner2]) {
        if (!parentToChildren.has(pid)) parentToChildren.set(pid, []);
        parentToChildren.get(pid)!.push(cid);
        if (!childToParents.has(cid)) childToParents.set(cid, []);
        childToParents.get(cid)!.push(pid);
      }
    }
  }

  // Roots: members who are never children
  const roots = members.filter(m => !allChildren.has(m.id));
  // If no roots found (cyclic?), pick all members
  const effectiveRoots = roots.length > 0 ? roots : members;

  // BFS layer assignment (longest path from any root)
  const queue: { id: string; layer: number }[] = [];
  for (const r of effectiveRoots) {
    queue.push({ id: r.id, layer: 0 });
  }

  while (queue.length > 0) {
    const { id, layer } = queue.shift()!;
    // Keep the deepest layer assignment (longest path)
    if (layers.has(id) && layers.get(id)! >= layer) continue;
    layers.set(id, layer);

    const children = parentToChildren.get(id) ?? [];
    for (const cid of children) {
      queue.push({ id: cid, layer: layer + 1 });
    }
  }

  // Assign layer 0 to any unplaced member
  for (const m of members) {
    if (!layers.has(m.id)) layers.set(m.id, 0);
  }

  // Enforce couple constraint: partners in a union must be on the same layer
  for (const u of unions) {
    const l1 = layers.get(u.partner1) ?? 0;
    const l2 = layers.get(u.partner2) ?? 0;
    const maxLayer = Math.min(l1, l2); // Use the higher (earlier) generation
    layers.set(u.partner1, maxLayer);
    layers.set(u.partner2, maxLayer);
  }

  return layers;
}

/**
 * Phase 2: Crossing minimization using barycenter heuristic.
 * Returns ordered member IDs per layer.
 */
function minimizeCrossings(
  layerMap: Map<string, number>,
  unions: Union[],
  members: FamilyMember[],
  coupleConstraints: CoupleConstraint[],
): Map<number, string[]> {
  // Build layer → members
  const layers = new Map<number, string[]>();
  for (const [id, layer] of layerMap) {
    if (!layers.has(layer)) layers.set(layer, []);
    layers.get(layer)!.push(id);
  }

  // Build parent→child adjacency for barycenter
  const parentOf = new Map<string, string[]>();  // child → parent IDs
  for (const u of unions) {
    for (const cid of u.children) {
      if (!parentOf.has(cid)) parentOf.set(cid, []);
      parentOf.get(cid)!.push(u.partner1, u.partner2);
    }
  }

  // Couple lookup: which IDs must be adjacent
  const coupleMap = new Map<string, CoupleConstraint>();
  for (const cc of coupleConstraints) {
    coupleMap.set(cc.leftId, cc);
    coupleMap.set(cc.rightId, cc);
  }

  // Sort layers by key
  const sortedLayerKeys = [...layers.keys()].sort((a, b) => a - b);

  // Initial order: sort by birth year within each layer
  const memberMap = new Map(members.map(m => [m.id, m]));
  for (const key of sortedLayerKeys) {
    const row = layers.get(key)!;
    row.sort((a, b) => (memberMap.get(a)?.birthYear ?? 0) - (memberMap.get(b)?.birthYear ?? 0));
  }

  // Barycenter iterations (top-down then bottom-up)
  const ITERATIONS = 4;
  for (let iter = 0; iter < ITERATIONS; iter++) {
    // Top-down sweep
    for (let li = 1; li < sortedLayerKeys.length; li++) {
      const layerKey = sortedLayerKeys[li];
      const row = layers.get(layerKey)!;
      const prevRow = layers.get(sortedLayerKeys[li - 1])!;
      const prevIndex = new Map(prevRow.map((id, i) => [id, i]));

      // Compute barycenter for each node
      const barycenters = new Map<string, number>();
      for (const id of row) {
        const parents = parentOf.get(id) ?? [];
        if (parents.length === 0) {
          barycenters.set(id, Infinity); // no constraint, put at end
          continue;
        }
        const positions = parents
          .map(pid => prevIndex.get(pid))
          .filter((p): p is number => p !== undefined);
        if (positions.length === 0) {
          barycenters.set(id, Infinity);
          continue;
        }
        barycenters.set(id, positions.reduce((s, v) => s + v, 0) / positions.length);
      }

      // Sort by barycenter
      row.sort((a, b) => (barycenters.get(a) ?? 0) - (barycenters.get(b) ?? 0));

      // Enforce couple adjacency: insert partner next to their pair
      enforceCoupleOrder(row, coupleConstraints, memberMap);
    }

    // Bottom-up sweep
    const childOf = new Map<string, string[]>(); // parent → children
    for (const u of unions) {
      for (const pid of [u.partner1, u.partner2]) {
        if (!childOf.has(pid)) childOf.set(pid, []);
        childOf.get(pid)!.push(...u.children);
      }
    }

    for (let li = sortedLayerKeys.length - 2; li >= 0; li--) {
      const layerKey = sortedLayerKeys[li];
      const row = layers.get(layerKey)!;
      const nextRow = layers.get(sortedLayerKeys[li + 1])!;
      const nextIndex = new Map(nextRow.map((id, i) => [id, i]));

      const barycenters = new Map<string, number>();
      for (const id of row) {
        const children = childOf.get(id) ?? [];
        if (children.length === 0) {
          barycenters.set(id, Infinity);
          continue;
        }
        const positions = children
          .map(cid => nextIndex.get(cid))
          .filter((p): p is number => p !== undefined);
        if (positions.length === 0) {
          barycenters.set(id, Infinity);
          continue;
        }
        barycenters.set(id, positions.reduce((s, v) => s + v, 0) / positions.length);
      }

      row.sort((a, b) => (barycenters.get(a) ?? 0) - (barycenters.get(b) ?? 0));
      enforceCoupleOrder(row, coupleConstraints, memberMap);
    }
  }

  return layers;
}

/**
 * Enforce couple constraints in a layer ordering:
 * Male on left, female on right, always adjacent.
 */
function enforceCoupleOrder(
  row: string[],
  constraints: CoupleConstraint[],
  memberMap: Map<string, FamilyMember>,
) {
  for (const cc of constraints) {
    const li = row.indexOf(cc.leftId);
    const ri = row.indexOf(cc.rightId);
    if (li === -1 || ri === -1) continue; // not in this layer

    // Remove both, insert left then right at the earlier position
    const minPos = Math.min(li, ri);
    const filtered = row.filter(id => id !== cc.leftId && id !== cc.rightId);
    filtered.splice(minPos, 0, cc.leftId, cc.rightId);

    // Copy back
    row.length = 0;
    row.push(...filtered);
  }
}

/**
 * Phase 3: Coordinate assignment.
 * - Couples: side by side with COUPLE_GAP
 * - Children: centered under parent couple midpoint
 * - Minimum NODE_SPACING between non-coupled nodes
 */
function assignCoordinates(
  orderedLayers: Map<number, string[]>,
  unions: Union[],
  memberMap: Map<string, FamilyMember>,
  coupleConstraints: CoupleConstraint[],
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const sortedLayerKeys = [...orderedLayers.keys()].sort((a, b) => a - b);

  // Build couple lookup
  const coupleOf = new Map<string, CoupleConstraint>();
  for (const cc of coupleConstraints) {
    coupleOf.set(cc.leftId, cc);
    coupleOf.set(cc.rightId, cc);
  }

  // Build union lookup: union → children
  const unionChildren = new Map<string, string[]>();
  const unionPartners = new Map<string, [string, string]>();
  for (const u of unions) {
    unionChildren.set(u.id, u.children);
    unionPartners.set(u.id, [u.partner1, u.partner2]);
  }

  // Child → union ID
  const childToUnion = new Map<string, string>();
  for (const u of unions) {
    for (const cid of u.children) {
      childToUnion.set(cid, u.id);
    }
  }

  // First pass: assign X coordinates layer by layer (simple left-to-right)
  for (const layerKey of sortedLayerKeys) {
    const row = orderedLayers.get(layerKey)!;
    const y = layerKey * LEVEL_SPACING;
    let x = 0;
    const placed = new Set<string>();

    for (let i = 0; i < row.length; i++) {
      const id = row[i];
      if (placed.has(id)) continue;

      const cc = coupleOf.get(id);
      if (cc && row.includes(cc.leftId) && row.includes(cc.rightId) && !placed.has(cc.leftId) && !placed.has(cc.rightId)) {
        // Place couple together
        positions.set(cc.leftId, { x, y });
        positions.set(cc.rightId, { x: x + CARD_W + COUPLE_GAP, y });
        placed.add(cc.leftId);
        placed.add(cc.rightId);
        x += CARD_W + COUPLE_GAP + CARD_W + NODE_SPACING;
      } else {
        positions.set(id, { x, y });
        placed.add(id);
        x += CARD_W + NODE_SPACING;
      }
    }
  }

  // Second pass: center children under their parent couple midpoint
  // Process layers top-down
  for (const layerKey of sortedLayerKeys) {
    const row = orderedLayers.get(layerKey)!;

    // Group children by their parent union
    const unionGroups = new Map<string, string[]>();
    for (const id of row) {
      const uid = childToUnion.get(id);
      if (!uid) continue;
      if (!unionGroups.has(uid)) unionGroups.set(uid, []);
      unionGroups.get(uid)!.push(id);
    }

    for (const [uid, children] of unionGroups) {
      const partners = unionPartners.get(uid);
      if (!partners) continue;

      const p1Pos = positions.get(partners[0]);
      const p2Pos = positions.get(partners[1]);
      if (!p1Pos || !p2Pos) continue;

      // Parent couple midpoint
      const parentMidX = (p1Pos.x + p2Pos.x + CARD_W) / 2;

      // Current children span
      const childPositions = children.map(cid => positions.get(cid)!);
      if (childPositions.some(p => !p)) continue;

      const childMinX = Math.min(...childPositions.map(p => p.x));
      const childMaxX = Math.max(...childPositions.map(p => p.x + CARD_W));
      const childMidX = (childMinX + childMaxX) / 2;

      // Shift all children to center under parent midpoint
      const shift = parentMidX - childMidX;
      for (const cid of children) {
        const pos = positions.get(cid)!;
        pos.x += shift;
      }
    }
  }

  // Third pass: resolve overlaps within each layer
  for (const layerKey of sortedLayerKeys) {
    const row = orderedLayers.get(layerKey)!;
    const rowPositions = row
      .map(id => ({ id, pos: positions.get(id)! }))
      .filter(r => r.pos)
      .sort((a, b) => a.pos.x - b.pos.x);

    for (let i = 1; i < rowPositions.length; i++) {
      const prev = rowPositions[i - 1];
      const curr = rowPositions[i];

      // Check if they're a couple (closer spacing allowed)
      const cc = coupleOf.get(prev.id);
      const isCouple = cc && ((cc.leftId === prev.id && cc.rightId === curr.id) ||
                               (cc.rightId === prev.id && cc.leftId === curr.id));
      const minGap = isCouple ? COUPLE_GAP : NODE_SPACING;
      const minX = prev.pos.x + CARD_W + minGap;

      if (curr.pos.x < minX) {
        const shift = minX - curr.pos.x;
        // Shift this and all subsequent nodes
        for (let j = i; j < rowPositions.length; j++) {
          rowPositions[j].pos.x += shift;
        }
      }
    }
  }

  // Final: re-center children after overlap resolution (second centering pass)
  for (const layerKey of sortedLayerKeys) {
    const row = orderedLayers.get(layerKey)!;
    const unionGroups = new Map<string, string[]>();
    for (const id of row) {
      const uid = childToUnion.get(id);
      if (!uid) continue;
      if (!unionGroups.has(uid)) unionGroups.set(uid, []);
      unionGroups.get(uid)!.push(id);
    }

    for (const [uid, children] of unionGroups) {
      const partners = unionPartners.get(uid);
      if (!partners) continue;
      const p1Pos = positions.get(partners[0]);
      const p2Pos = positions.get(partners[1]);
      if (!p1Pos || !p2Pos) continue;

      const parentMidX = (p1Pos.x + p2Pos.x + CARD_W) / 2;
      const childPositions = children.map(cid => positions.get(cid)!).filter(Boolean);
      if (childPositions.length === 0) continue;

      const childMinX = Math.min(...childPositions.map(p => p.x));
      const childMaxX = Math.max(...childPositions.map(p => p.x + CARD_W));
      const childMidX = (childMinX + childMaxX) / 2;
      const shift = parentMidX - childMidX;

      for (const cid of children) {
        const pos = positions.get(cid);
        if (pos) pos.x += shift;
      }
    }
  }

  return positions;
}

/**
 * Center the entire layout around (0, 0).
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

// ── Main entry point ──

export function computeAutoLayout(
  members: FamilyMember[],
  unions: Union[],
  _emotionalLinks: EmotionalLink[],
): LayoutResult {
  if (members.length === 0) return { positions: new Map() };

  const memberMap = new Map(members.map(m => [m.id, m]));

  // Phase 1: Layer assignment
  const layerMap = assignLayers(members, unions);

  // Build couple constraints (male left, female right)
  const coupleConstraints: CoupleConstraint[] = unions.map(u => {
    const m1 = memberMap.get(u.partner1);
    const m2 = memberMap.get(u.partner2);
    // Male on left, female on right; if same gender, use partner order
    let leftId = u.partner1;
    let rightId = u.partner2;
    if (m1 && m2) {
      if (m1.gender === 'female' && m2.gender === 'male') {
        leftId = u.partner2;
        rightId = u.partner1;
      }
    }
    return { unionId: u.id, leftId, rightId };
  });

  // Phase 2: Crossing minimization
  const orderedLayers = minimizeCrossings(layerMap, unions, members, coupleConstraints);

  // Phase 3: Coordinate assignment
  const positions = assignCoordinates(orderedLayers, unions, memberMap, coupleConstraints);

  // Place any missing members
  let maxX = 0;
  for (const pos of positions.values()) {
    maxX = Math.max(maxX, pos.x + CARD_W);
  }
  for (const m of members) {
    if (!positions.has(m.id)) {
      positions.set(m.id, { x: maxX + NODE_SPACING, y: 0 });
      maxX += CARD_W + NODE_SPACING;
    }
  }

  // Center
  centerLayout(positions);

  return { positions };
}
