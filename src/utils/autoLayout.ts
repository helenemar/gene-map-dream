import { FamilyMember, Union, EmotionalLink } from '@/types/genogram';

const CARD_W = 186;
const CARD_H = 64;
const GENERATION_GAP = 250; // vertical distance between generations
const SIBLING_GAP = 100;   // horizontal gap between siblings
const COUPLE_GAP = 150;    // horizontal gap between partners in a union

interface LayoutResult {
  positions: Map<string, { x: number; y: number }>;
}

/**
 * Hierarchical auto-layout (Sugiyama-inspired) for a genogram.
 *
 * 1. Assign generation layers (Y) based on union parent→child relationships.
 * 2. Position couples side-by-side, children centered beneath their union.
 * 3. Center everything around (0,0).
 * 4. Optionally pull emotionally-linked members closer within the same layer.
 */
export function computeAutoLayout(
  members: FamilyMember[],
  unions: Union[],
  emotionalLinks: EmotionalLink[],
): LayoutResult {
  if (members.length === 0) return { positions: new Map() };

  const memberMap = new Map(members.map(m => [m.id, m]));

  // ─── Step 1: Assign generation layers ───
  // Parents in a union → generation g, their children → g+1
  const generation = new Map<string, number>();

  // Find root members: those who are NOT children in any union
  const allChildren = new Set(unions.flatMap(u => u.children));
  const roots = members.filter(m => !allChildren.has(m.id));

  // BFS to assign generations
  const queue: string[] = [];

  // Seed roots at generation 0
  for (const r of roots) {
    generation.set(r.id, 0);
    queue.push(r.id);
  }


  // Propagate: children of a union are one generation below the parents
  let head = 0;
  while (head < queue.length) {
    const id = queue[head++];
    const gen = generation.get(id)!;

    for (const union of unions) {
      const isPartner = union.partner1 === id || union.partner2 === id;
      if (!isPartner) continue;

      // Ensure partner is at same generation
      const partnerId = union.partner1 === id ? union.partner2 : union.partner1;
      if (!generation.has(partnerId)) {
        generation.set(partnerId, gen);
        queue.push(partnerId);
      }

      // Children are one generation below
      for (const childId of union.children) {
        if (!generation.has(childId)) {
          generation.set(childId, gen + 1);
          queue.push(childId);
        }
      }
    }
  }

  // Seed any disconnected members not reached by BFS
  for (const m of members) {
    if (!generation.has(m.id)) {
      generation.set(m.id, 0);
    }
  }

  // ─── Step 2: Group by generation ───
  const layers = new Map<number, string[]>();
  for (const [id, gen] of generation) {
    if (!layers.has(gen)) layers.set(gen, []);
    layers.get(gen)!.push(id);
  }

  // ─── Step 3: Order members within each layer ───
  // For each layer, place couples together and order children by birth year.
  const positions = new Map<string, { x: number; y: number }>();
  const sortedGens = [...layers.keys()].sort((a, b) => a - b);

  // Track which unions belong to which generation (by partner gen)
  const unionsByGen = new Map<number, Union[]>();
  for (const union of unions) {
    const gen = generation.get(union.partner1) ?? 0;
    if (!unionsByGen.has(gen)) unionsByGen.set(gen, []);
    unionsByGen.get(gen)!.push(union);
  }

  for (const gen of sortedGens) {
    const layerMembers = layers.get(gen)!;
    const genUnions = unionsByGen.get(gen) ?? [];
    const placed = new Set<string>();
    const orderedIds: string[] = [];

    // Place couples first
    for (const union of genUnions) {
      if (!placed.has(union.partner1) && layerMembers.includes(union.partner1)) {
        orderedIds.push(union.partner1);
        placed.add(union.partner1);
      }
      if (!placed.has(union.partner2) && layerMembers.includes(union.partner2)) {
        orderedIds.push(union.partner2);
        placed.add(union.partner2);
      }
    }

    // Place remaining (sorted by birth year for stability)
    const remaining = layerMembers
      .filter(id => !placed.has(id))
      .sort((a, b) => (memberMap.get(a)?.birthYear ?? 0) - (memberMap.get(b)?.birthYear ?? 0));
    orderedIds.push(...remaining);

    // Assign X positions
    const y = gen * GENERATION_GAP;
    let x = 0;
    for (let i = 0; i < orderedIds.length; i++) {
      const id = orderedIds[i];
      positions.set(id, { x, y });

      // Determine gap to next member
      if (i < orderedIds.length - 1) {
        const nextId = orderedIds[i + 1];
        // Are current and next a couple?
        const isCouple = genUnions.some(
          u => (u.partner1 === id && u.partner2 === nextId) ||
               (u.partner2 === id && u.partner1 === nextId)
        );
        x += CARD_W + (isCouple ? COUPLE_GAP : SIBLING_GAP);
      }
    }
  }

  // ─── Step 4: Center children beneath their union ───
  // For each union, shift children so their center aligns with the union midpoint.
  for (const union of unions) {
    const p1Pos = positions.get(union.partner1);
    const p2Pos = positions.get(union.partner2);
    if (!p1Pos || !p2Pos) continue;

    const unionCenterX = (p1Pos.x + p2Pos.x + CARD_W) / 2;

    const childPositions = union.children
      .map(cid => ({ id: cid, pos: positions.get(cid) }))
      .filter((c): c is { id: string; pos: { x: number; y: number } } => !!c.pos);

    if (childPositions.length === 0) continue;

    const childMinX = Math.min(...childPositions.map(c => c.pos.x));
    const childMaxX = Math.max(...childPositions.map(c => c.pos.x + CARD_W));
    const childCenterX = (childMinX + childMaxX) / 2;
    const shiftX = unionCenterX - childCenterX;

    for (const c of childPositions) {
      c.pos.x += shiftX;
    }
  }

  // ─── Step 5: Emotional link proximity boost ───
  // Pull emotionally-linked members slightly closer within the same layer
  for (const link of emotionalLinks) {
    const fromPos = positions.get(link.from);
    const toPos = positions.get(link.to);
    if (!fromPos || !toPos) continue;
    if (generation.get(link.from) !== generation.get(link.to)) continue;

    const dx = toPos.x - fromPos.x;
    if (Math.abs(dx) > CARD_W + SIBLING_GAP * 2) {
      const pull = Math.sign(dx) * 15; // gentle 15px pull
      fromPos.x += pull;
      toPos.x -= pull;
    }
  }

  // ─── Step 6: Center everything around (0,0) ───
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const pos of positions.values()) {
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    maxX = Math.max(maxX, pos.x + CARD_W);
    maxY = Math.max(maxY, pos.y + CARD_H);
  }

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  for (const pos of positions.values()) {
    pos.x -= centerX;
    pos.y -= centerY;
  }

  return { positions };
}
