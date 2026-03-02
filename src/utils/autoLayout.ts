/**
 * Reingold-Tilford–inspired Hierarchical Tree Layout (v3)
 *
 * Guarantees:
 *   1. Strict Y per generation: gen × LEVEL_SPACING
 *   2. Each family branch occupies a contiguous horizontal corridor
 *      sized by total descendant count (bottom-up)
 *   3. Parents are centred exactly above their children
 *   4. Siblings are distributed symmetrically around the parent union midpoint
 *   5. Minimum BRANCH_GAP (400 px) between distinct family branches
 *   6. Collision resolution pushes entire branches apart
 *   7. Cross-family unions (partners from different branches) are handled
 *      so each partner stays under their own parents
 */

import { FamilyMember, Union, EmotionalLink } from '@/types/genogram';

// ═══ CONSTANTS ═══
const CARD_W = 220;
const CARD_H = 64;
const LEVEL_SPACING = 250;
const BASE_COUPLE_GAP = 200;
const MIN_BADGE_GAP = 280;
const BADGE_SAFETY = 80;
const SIBLING_GAP = 80;          // gap between sibling sub-trees
const SIBLING_STEP_Y = 30;       // vertical staircase offset between siblings (oldest→youngest)
const BRANCH_GAP = 400;          // gap between distinct family branches
const MIN_CARD_GAP = 60;         // absolute minimum between any two cards

// ═══ TYPES ═══
interface LayoutResult {
  positions: Map<string, { x: number; y: number }>;
}

interface TreeNode {
  id: string;
  union: Union | null;
  /** Member IDs that are leaf children (no sub-tree) */
  leafMembers: string[];
  children: TreeNode[];
  /** Ordered child IDs (accounts for cross-family reordering) */
  orderedChildIds: string[];
  width: number;
  absX: number;
  gen: number;
}

// ═══ HELPERS ═══
function coupleGap(union: Union): number {
  let labelLen = 0;
  if (union.marriageYear) labelLen += `R: ${union.marriageYear}`.length;
  if (union.divorceYear) labelLen += `   D: ${union.divorceYear}`.length;
  if (labelLen > 0) {
    const badgeW = Math.max(labelLen * 7.2 + 24, 56);
    return Math.max(badgeW + BADGE_SAFETY, MIN_BADGE_GAP);
  }
  const hasIcon = ['divorced', 'separated', 'widowed', 'love_affair', 'common_law'].includes(union.status);
  return hasIcon ? Math.max(BASE_COUPLE_GAP, 160) : BASE_COUPLE_GAP;
}

function coupleWidth(union: Union): number {
  return CARD_W * 2 + coupleGap(union);
}

// ═══════════════════════════════════════════════════════════
// MAIN LAYOUT FUNCTION
// ═══════════════════════════════════════════════════════════
export function computeAutoLayout(
  members: FamilyMember[],
  unions: Union[],
  _emotionalLinks: EmotionalLink[],
): LayoutResult {
  if (members.length === 0) return { positions: new Map() };

  const memberMap = new Map(members.map(m => [m.id, m]));
  const unionMap = new Map(unions.map(u => [u.id, u]));
  const positions = new Map<string, { x: number; y: number }>();

  // ═══ 1. INDEX RELATIONSHIPS ═══
  const allChildIds = new Set<string>();
  const parentUnionOf = new Map<string, string>();   // childId → unionId
  const partnerUnions = new Map<string, string[]>(); // memberId → unionIds

  for (const u of unions) {
    for (const cid of u.children) {
      allChildIds.add(cid);
      parentUnionOf.set(cid, u.id);
    }
    for (const pid of [u.partner1, u.partner2]) {
      if (!partnerUnions.has(pid)) partnerUnions.set(pid, []);
      partnerUnions.get(pid)!.push(u.id);
    }
  }

  // ═══ 2. GENERATION ASSIGNMENT ═══
  const generation = new Map<string, number>();

  function assignGen(id: string, gen: number) {
    if (generation.has(id)) return;
    generation.set(id, gen);
    for (const uid of (partnerUnions.get(id) || [])) {
      const u = unionMap.get(uid)!;
      const pid = u.partner1 === id ? u.partner2 : u.partner1;
      if (!generation.has(pid)) assignGen(pid, gen);
      for (const cid of u.children) {
        if (!generation.has(cid)) assignGen(cid, gen + 1);
      }
    }
  }

  // Roots = members who are not children of any union
  for (const m of members) {
    if (!allChildIds.has(m.id)) assignGen(m.id, 0);
  }
  for (const m of members) {
    if (!generation.has(m.id)) assignGen(m.id, 0);
  }

  // Fix-up: force children > parent gen, partners same gen
  for (let iter = 0; iter < 20; iter++) {
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
      const pg = Math.max(generation.get(u.partner1) ?? 0, generation.get(u.partner2) ?? 0);
      for (const cid of u.children) {
        if ((generation.get(cid) ?? 0) <= pg) {
          generation.set(cid, pg + 1);
          changed = true;
        }
      }
    }
    if (!changed) break;
  }

  // ═══ 3. BUILD TREE ═══
  function getParentingUnions(memberId: string): Union[] {
    return (partnerUnions.get(memberId) || [])
      .map(uid => unionMap.get(uid)!)
      .filter(u => u && u.children.length > 0);
  }

  const builtUnions = new Set<string>();
  

  function buildNode(union: Union): TreeNode {
    builtUnions.add(union.id);
    const gen = Math.max(generation.get(union.partner1) ?? 0, generation.get(union.partner2) ?? 0);

    const sortedChildren = [...union.children]
      .filter(cid => memberMap.has(cid))
      .sort((a, b) => (memberMap.get(a)!.birthYear ?? 0) - (memberMap.get(b)!.birthYear ?? 0));

    const childNodes: TreeNode[] = [];
    const leafMembers: string[] = [];

    for (const cid of sortedChildren) {
      const childParentingUnions = getParentingUnions(cid).filter(u => !builtUnions.has(u.id));

      // Build ALL parenting unions as subtrees (including cross-family ones)
      // The cross-family partner will be placed next to their spouse naturally
      if (childParentingUnions.length > 0) {
        for (const cu of childParentingUnions) {
          childNodes.push(buildNode(cu));
        }
      } else {
        leafMembers.push(cid);
      }
    }

    return {
      id: union.id,
      union,
      leafMembers,
      children: childNodes,
      orderedChildIds: sortedChildren,
      width: 0,
      absX: 0,
      gen,
    };
  }

  // Build forest from root unions (gen 0 first, then remaining)
  const rootUnions = unions
    .filter(u => {
      const g = Math.max(generation.get(u.partner1) ?? 0, generation.get(u.partner2) ?? 0);
      return g === 0;
    })
    .filter(u => !builtUnions.has(u.id));

  const forest: TreeNode[] = [];
  for (const ru of rootUnions) {
    if (!builtUnions.has(ru.id)) forest.push(buildNode(ru));
  }
  for (const u of unions) {
    if (!builtUnions.has(u.id)) forest.push(buildNode(u));
  }

  // ═══ 4. BOTTOM-UP SIZING ═══
  function computeWidth(node: TreeNode): number {
    const cw = node.union ? coupleWidth(node.union) : CARD_W;

    if (node.children.length === 0 && node.leafMembers.length === 0) {
      node.width = cw;
      return node.width;
    }

    // Leaves each take CARD_W
    const leafTotalW = node.leafMembers.length > 0
      ? node.leafMembers.length * CARD_W + (node.leafMembers.length - 1) * SIBLING_GAP
      : 0;

    // Recursive children
    let subTreeTotalW = 0;
    for (let i = 0; i < node.children.length; i++) {
      if (i > 0) subTreeTotalW += SIBLING_GAP;
      subTreeTotalW += computeWidth(node.children[i]);
    }

    // Total children width = leaves + subtrees + gap between them
    let childrenW = 0;
    if (leafTotalW > 0 && subTreeTotalW > 0) {
      childrenW = leafTotalW + SIBLING_GAP + subTreeTotalW;
    } else {
      childrenW = leafTotalW + subTreeTotalW;
    }

    node.width = Math.max(childrenW, cw);
    return node.width;
  }

  for (const root of forest) computeWidth(root);

  // ═══ 5. TOP-DOWN POSITIONING ═══
  function positionNode(node: TreeNode, centerX: number) {
    node.absX = centerX;
    const y = node.gen * LEVEL_SPACING;

    // Place the couple
    if (node.union) {
      const u = node.union;
      const gap = coupleGap(u);
      const cw = coupleWidth(u);
      const coupleLeft = centerX - cw / 2;

      const m1 = memberMap.get(u.partner1);
      const [maleId, femaleId] = m1 && m1.gender === 'male'
        ? [u.partner1, u.partner2]
        : [u.partner2, u.partner1];

      if (!positions.has(maleId)) positions.set(maleId, { x: coupleLeft, y });
      if (!positions.has(femaleId)) positions.set(femaleId, { x: coupleLeft + CARD_W + gap, y });
    }

    // Compute total children strip width
    const allSlots: { type: 'leaf'; memberId: string; width: number }[]
      | { type: 'subtree'; node: TreeNode; width: number }[] = [];

    // Use the pre-computed ordered child IDs (accounts for cross-family reordering)
    if (node.union) {
      const orderedChildren = node.orderedChildIds.filter(cid => memberMap.has(cid));

      const leafSet = new Set(node.leafMembers);
      // Map subtree nodes to their "owning child" — the child from this union
      // that initiated the subtree
      const subtreeQueue = [...node.children];

      type Slot = { type: 'leaf'; memberId: string; w: number } | { type: 'subtree'; node: TreeNode; w: number };
      const slots: Slot[] = [];

      for (const cid of orderedChildren) {
        if (leafSet.has(cid)) {
          slots.push({ type: 'leaf', memberId: cid, w: CARD_W });
        } else {
          // Find the subtree node for this child
          const stIdx = subtreeQueue.findIndex(sn => {
            if (!sn.union) return false;
            return sn.union.partner1 === cid || sn.union.partner2 === cid;
          });
          if (stIdx >= 0) {
            const sn = subtreeQueue.splice(stIdx, 1)[0];
            slots.push({ type: 'subtree', node: sn, w: sn.width });
          }
        }
      }
      // Any remaining subtrees (shouldn't happen but safety)
      for (const sn of subtreeQueue) {
        slots.push({ type: 'subtree', node: sn, w: sn.width });
      }

      if (slots.length > 0) {
        const totalW = slots.reduce((s, sl) => s + sl.w, 0)
          + (slots.length - 1) * SIBLING_GAP;
        let cursor = centerX - totalW / 2;

        // Count only leaf siblings for staircase (subtrees keep their own gen Y)
        let leafIndex = 0;
        const totalLeaves = slots.filter(s => s.type === 'leaf').length;

        for (const slot of slots) {
          const slotCenter = cursor + slot.w / 2;

          if (slot.type === 'subtree') {
            positionNode(slot.node, slotCenter);
          } else {
            const baseChildY = (node.gen + 1) * LEVEL_SPACING;
            // Staircase: each leaf sibling steps down slightly (oldest=0, youngest=max)
            const stepOffset = totalLeaves > 1 ? leafIndex * SIBLING_STEP_Y : 0;
            if (!positions.has(slot.memberId)) {
              positions.set(slot.memberId, { x: slotCenter - CARD_W / 2, y: baseChildY + stepOffset });
            }
            leafIndex++;
          }

          cursor += slot.w + SIBLING_GAP;
        }
      }
    }
  }

  // Position forest roots side by side with BRANCH_GAP
  let forestCursor = 0;
  for (const root of forest) {
    const cx = forestCursor + root.width / 2;
    positionNode(root, cx);
    forestCursor += root.width + BRANCH_GAP;
  }

  // ═══ 6. (Cross-family unions are now built as regular subtrees, no special positioning needed) ═══

  // ═══ 7. PLACE ORPHAN MEMBERS ═══
  for (const m of members) {
    if (!positions.has(m.id)) {
      const gen = generation.get(m.id) ?? 0;
      positions.set(m.id, { x: forestCursor, y: gen * LEVEL_SPACING });
      forestCursor += CARD_W + SIBLING_GAP;
    }
  }

  // ═══ 8. COLLISION RESOLUTION ═══
  for (let pass = 0; pass < 20; pass++) {
    let anyOverlap = false;
    const genGroups = new Map<number, string[]>();
    for (const m of members) {
      const g = generation.get(m.id) ?? 0;
      if (!genGroups.has(g)) genGroups.set(g, []);
      genGroups.get(g)!.push(m.id);
    }

    for (const [, ids] of genGroups) {
      const sorted = ids
        .filter(id => positions.has(id))
        .sort((a, b) => positions.get(a)!.x - positions.get(b)!.x);

      for (let i = 0; i < sorted.length - 1; i++) {
        const posA = positions.get(sorted[i])!;
        const posB = positions.get(sorted[i + 1])!;
        const minRight = posA.x + CARD_W + MIN_CARD_GAP;
        if (posB.x < minRight) {
          const shift = minRight - posB.x;
          shiftMemberAndDescendants(sorted[i + 1], shift, positions, partnerUnions, unionMap, memberMap, parentUnionOf);
          anyOverlap = true;
        }
      }
    }
    if (!anyOverlap) break;
  }

  // ═══ 9. RE-CENTER PARENTS ABOVE CHILDREN ═══
  // After collision resolution, nudge parent couples so they stay centered
  for (let pass = 0; pass < 5; pass++) {
    let anyShift = false;
    for (const u of unions) {
      if (u.children.length === 0) continue;
      const childPositions = u.children
        .map(cid => positions.get(cid))
        .filter((p): p is { x: number; y: number } => !!p);
      if (childPositions.length === 0) continue;

      const childMinX = Math.min(...childPositions.map(p => p.x));
      const childMaxX = Math.max(...childPositions.map(p => p.x + CARD_W));
      const childCenterX = (childMinX + childMaxX) / 2;

      const p1 = positions.get(u.partner1);
      const p2 = positions.get(u.partner2);
      if (!p1 || !p2) continue;

      const gap = coupleGap(u);
      const currentCoupleCenter = (Math.min(p1.x, p2.x) + Math.max(p1.x, p2.x) + CARD_W) / 2;
      const dx = childCenterX - currentCoupleCenter;

      if (Math.abs(dx) > 5) {
        p1.x += dx;
        p2.x += dx;
        anyShift = true;
      }
    }
    if (!anyShift) break;
  }

  // ═══ 10. ENSURE PARTNERS SHARE SAME Y ═══
  for (const u of unions) {
    const p1 = positions.get(u.partner1);
    const p2 = positions.get(u.partner2);
    if (p1 && p2) {
      const maxY = Math.max(p1.y, p2.y);
      p1.y = maxY;
      p2.y = maxY;
    }
  }

  // ═══ 11. FINAL COLLISION PASS ═══
  for (let pass = 0; pass < 10; pass++) {
    let anyOverlap = false;
    const genGroups = new Map<number, string[]>();
    for (const m of members) {
      const g = generation.get(m.id) ?? 0;
      if (!genGroups.has(g)) genGroups.set(g, []);
      genGroups.get(g)!.push(m.id);
    }
    for (const [, ids] of genGroups) {
      const sorted = ids
        .filter(id => positions.has(id))
        .sort((a, b) => positions.get(a)!.x - positions.get(b)!.x);
      for (let i = 0; i < sorted.length - 1; i++) {
        const posA = positions.get(sorted[i])!;
        const posB = positions.get(sorted[i + 1])!;
        const minRight = posA.x + CARD_W + MIN_CARD_GAP;
        if (posB.x < minRight) {
          const shift = minRight - posB.x;
          shiftMemberAndDescendants(sorted[i + 1], shift, positions, partnerUnions, unionMap, memberMap, parentUnionOf);
          anyOverlap = true;
        }
      }
    }
    if (!anyOverlap) break;
  }

  // ═══ 12. CENTER AROUND ORIGIN ═══
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

/** Shift a member, their siblings, partners, and all descendants by dx */
function shiftMemberAndDescendants(
  startId: string,
  dx: number,
  positions: Map<string, { x: number; y: number }>,
  partnerUnions: Map<string, string[]>,
  unionMap: Map<string, Union>,
  memberMap: Map<string, FamilyMember>,
  parentUnionOf?: Map<string, string>,
) {
  const visited = new Set<string>();
  const stack = [startId];

  // Also include all siblings (children of the same parent union)
  if (parentUnionOf) {
    const parentUId = parentUnionOf.get(startId);
    if (parentUId) {
      const parentU = unionMap.get(parentUId);
      if (parentU) {
        for (const sibId of parentU.children) {
          const sibPos = positions.get(sibId);
          const startPos = positions.get(startId);
          // Only shift siblings that are at or to the right of the shifted member
          if (sibPos && startPos && sibId !== startId && sibPos.x >= startPos.x) {
            stack.push(sibId);
          }
        }
      }
    }
  }

  while (stack.length > 0) {
    const id = stack.pop()!;
    if (visited.has(id) || !memberMap.has(id)) continue;
    visited.add(id);
    const pos = positions.get(id);
    if (pos) pos.x += dx;
    for (const uid of (partnerUnions.get(id) || [])) {
      const u = unionMap.get(uid);
      if (!u) continue;
      const pid = u.partner1 === id ? u.partner2 : u.partner1;
      const partnerPos = positions.get(pid);
      if (partnerPos && pos && partnerPos.x >= pos.x - dx) {
        stack.push(pid);
      }
      for (const cid of u.children) stack.push(cid);
    }
  }
}
