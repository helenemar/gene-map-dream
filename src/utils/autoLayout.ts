/**
 * Couple-First Chronology Layout Engine
 *
 * Guarantees:
 *   1. Strict Y per generation: gen × LEVEL_SPACING
 *   2. Couple = inseparable block (max coupleGap between partners)
 *   3. Spouse (in-law) placed OUTSIDE the sibling line
 *   4. Siblings ordered by birth year (eldest left, youngest right)
 *   5. Dynamic spacing: couple blocks push subsequent siblings
 *   6. Collision resolution keeps couples atomic
 *   7. Cross-family unions compact branches together
 *   8. No link may cross a member card
 */

import { FamilyMember, Union, EmotionalLink } from '@/types/genogram';

// ═══ CONSTANTS ═══
const CARD_W = 220;
const CARD_H = 64;
const LEVEL_SPACING = 250;
const BASE_COUPLE_GAP = 40;
const MIN_BADGE_GAP = 180;
const BADGE_SAFETY = 40;
const SIBLING_GAP = 60;          // compact gap between sibling cards
const SIBLING_STEP_Y = 30;       // vertical staircase offset between siblings (oldest→youngest)
const BRANCH_GAP = 160;          // gutter between distinct family branches
const MIN_CARD_GAP = 20;         // absolute minimum between any two cards

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
  /** Locked positions: members whose position must not change. The engine adapts around them. */
  lockedPositions?: Map<string, { x: number; y: number }>,
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

  // Fix-up: force children = parent + 1, partners same gen
  // Two-phase: first push children down, then pull parents up to ensure
  // cross-family grandparents align on the same generation row.
  for (let iter = 0; iter < 30; iter++) {
    let changed = false;
    for (const u of unions) {
      // Partners must share the same generation
      const g1 = generation.get(u.partner1) ?? 0;
      const g2 = generation.get(u.partner2) ?? 0;
      if (g1 !== g2) {
        const t = Math.max(g1, g2);
        generation.set(u.partner1, t);
        generation.set(u.partner2, t);
        changed = true;
      }
      // Children must be exactly parent + 1 (push DOWN if too low)
      const pg = Math.max(generation.get(u.partner1) ?? 0, generation.get(u.partner2) ?? 0);
      for (const cid of u.children) {
        if ((generation.get(cid) ?? 0) <= pg) {
          generation.set(cid, pg + 1);
          changed = true;
        }
      }
      // All children of the same union must share the same generation
      if (u.children.length > 1) {
        const maxChildGen = Math.max(...u.children.map(cid => generation.get(cid) ?? 0));
        for (const cid of u.children) {
          if ((generation.get(cid) ?? 0) < maxChildGen) {
            generation.set(cid, maxChildGen);
            changed = true;
          }
        }
      }
      // Parents must be exactly child - 1 (pull UP if too low)
      // This ensures cross-family grandparents align
      if (u.children.length > 0) {
        const minChildGen = Math.min(...u.children.map(cid => generation.get(cid) ?? 0));
        const expectedParentGen = minChildGen - 1;
        const currentParentGen = Math.max(generation.get(u.partner1) ?? 0, generation.get(u.partner2) ?? 0);
        if (currentParentGen < expectedParentGen) {
          generation.set(u.partner1, expectedParentGen);
          generation.set(u.partner2, expectedParentGen);
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

  /** Get childless unions for a member (partner positioning only) */
  function getChildlessUnions(memberId: string): Union[] {
    return (partnerUnions.get(memberId) || [])
      .map(uid => unionMap.get(uid)!)
      .filter(u => u && u.children.length === 0);
  }

  const builtUnions = new Set<string>();
  const crossFamilyUnions: Union[] = [];

  function buildNode(union: Union): TreeNode {
    builtUnions.add(union.id);
    const gen = Math.max(generation.get(union.partner1) ?? 0, generation.get(union.partner2) ?? 0);

    const sortedChildren = [...union.children]
      .filter(cid => memberMap.has(cid))
      .sort((a, b) => {
        const ma = memberMap.get(a)!;
        const mb = memberMap.get(b)!;
        const ya = ma.birthYear ?? 0;
        const yb = mb.birthYear ?? 0;
        if (!ma.birthYear) console.warn(`[AutoLayout] Date manquante pour le tri : ${ma.firstName || a}`);
        if (!mb.birthYear) console.warn(`[AutoLayout] Date manquante pour le tri : ${mb.firstName || b}`);
        if (ya !== yb) return ya - yb;
        // Fallback: ID lexicographic order
        return a.localeCompare(b);
      });

    const childNodes: TreeNode[] = [];
    const leafMembers: string[] = [];

    for (const cid of sortedChildren) {
      const childParentingUnions = getParentingUnions(cid).filter(u => !builtUnions.has(u.id));

      // Separate cross-family from same-branch
      const sameBranch: Union[] = [];
      for (const cu of childParentingUnions) {
        const otherPartner = cu.partner1 === cid ? cu.partner2 : cu.partner1;
        const otherParentUnionId = parentUnionOf.get(otherPartner);
        const isCrossFamily = otherParentUnionId && otherParentUnionId !== union.id;

        if (isCrossFamily) {
          builtUnions.add(cu.id);
          crossFamilyUnions.push(cu);
        } else {
          sameBranch.push(cu);
        }
      }

      if (sameBranch.length > 0) {
        for (const cu of sameBranch) {
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

  // NOW collect cross-family children (after root trees are built and crossFamilyUnions populated)
  const crossFamilyChildIds = new Set<string>();
  for (const cu of crossFamilyUnions) {
    for (const cid of cu.children) crossFamilyChildIds.add(cid);
  }

  for (const u of unions) {
    if (!builtUnions.has(u.id)) {
      // Skip unions where a partner is a cross-family child — they'll be placed in step 6
      const p1IsCFChild = crossFamilyChildIds.has(u.partner1);
      const p2IsCFChild = crossFamilyChildIds.has(u.partner2);
      if (p1IsCFChild || p2IsCFChild) {
        builtUnions.add(u.id); // mark as handled
        continue;
      }
      // Skip childless unions where either partner is already placed by a built tree
      // (they'll be handled inline by getChildlessUnions during positioning)
      if (u.children.length === 0) {
        const p1ParentBuilt = parentUnionOf.has(u.partner1) && builtUnions.has(parentUnionOf.get(u.partner1)!);
        const p2ParentBuilt = parentUnionOf.has(u.partner2) && builtUnions.has(parentUnionOf.get(u.partner2)!);
        if (p1ParentBuilt || p2ParentBuilt) {
          builtUnions.add(u.id);
          continue;
        }
      }
      forest.push(buildNode(u));
    }
  }

  // Track which members belong to which root tree (for branch compaction)
  const rootMembers = new Map<number, Set<string>>();
  function collectRootMembers(node: TreeNode, rootIdx: number) {
    if (!rootMembers.has(rootIdx)) rootMembers.set(rootIdx, new Set());
    const s = rootMembers.get(rootIdx)!;
    if (node.union) { s.add(node.union.partner1); s.add(node.union.partner2); }
    for (const lid of node.leafMembers) s.add(lid);
    // Also collect childless union partners
    for (const lid of node.leafMembers) {
      for (const cu of getChildlessUnions(lid)) {
        const otherId = cu.partner1 === lid ? cu.partner2 : cu.partner1;
        s.add(otherId);
      }
    }
    for (const child of node.children) collectRootMembers(child, rootIdx);
  }
  forest.forEach((root, idx) => collectRootMembers(root, idx));

  // ═══ 3b. REORDER CHILDREN FOR CROSS-FAMILY ADJACENCY ═══
  // Move cross-family partners to the edges closest to each other's branch
  function findParentNode(nodes: TreeNode[], childId: string): TreeNode | null {
    for (const node of nodes) {
      if (node.union && node.union.children.includes(childId)) return node;
      const found = findParentNode(node.children, childId);
      if (found) return found;
    }
    return null;
  }

  for (const cu of crossFamilyUnions) {
    let p1RootIdx = -1, p2RootIdx = -1;
    for (const [idx, members] of rootMembers) {
      if (members.has(cu.partner1)) p1RootIdx = idx;
      if (members.has(cu.partner2)) p2RootIdx = idx;
    }
    if (p1RootIdx < 0 || p2RootIdx < 0 || p1RootIdx === p2RootIdx) continue;

    const [leftRootIdx, rightRootIdx] = p1RootIdx < p2RootIdx ? [p1RootIdx, p2RootIdx] : [p2RootIdx, p1RootIdx];
    const leftPartner = rootMembers.get(leftRootIdx)!.has(cu.partner1) ? cu.partner1 : cu.partner2;
    const rightPartner = leftPartner === cu.partner1 ? cu.partner2 : cu.partner1;

    // Move leftPartner to RIGHT edge of their parent's orderedChildIds
    const leftParentNode = findParentNode(forest, leftPartner);
    if (leftParentNode) {
      const idx = leftParentNode.orderedChildIds.indexOf(leftPartner);
      if (idx >= 0 && idx < leftParentNode.orderedChildIds.length - 1) {
        leftParentNode.orderedChildIds.splice(idx, 1);
        leftParentNode.orderedChildIds.push(leftPartner);
      }
    }

    // Move rightPartner to LEFT edge of their parent's orderedChildIds
    const rightParentNode = findParentNode(forest, rightPartner);
    if (rightParentNode) {
      const idx = rightParentNode.orderedChildIds.indexOf(rightPartner);
      if (idx > 0) {
        rightParentNode.orderedChildIds.splice(idx, 1);
        rightParentNode.orderedChildIds.unshift(rightPartner);
      }
    }
  }

  // ═══ 4. BOTTOM-UP SIZING ═══
  function computeWidth(node: TreeNode): number {
    const cw = node.union ? coupleWidth(node.union) : CARD_W;

    if (node.children.length === 0 && node.leafMembers.length === 0) {
      node.width = cw;
      return node.width;
    }

    // Leaves: each takes CARD_W, or coupleWidth if they have a childless union
    let leafTotalW = 0;
    for (let i = 0; i < node.leafMembers.length; i++) {
      if (i > 0) leafTotalW += SIBLING_GAP;
      const lid = node.leafMembers[i];
      const childlessU = getChildlessUnions(lid);
      if (childlessU.length > 0) {
        leafTotalW += coupleWidth(childlessU[0]);
      } else {
        leafTotalW += CARD_W;
      }
    }

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

      // Determine lineage member (has a parent union) vs spouse (in-law)
      const p1IsLineage = parentUnionOf.has(u.partner1);
      const p2IsLineage = parentUnionOf.has(u.partner2);

      let leftId: string, rightId: string;
      if (p1IsLineage && !p2IsLineage) {
        // p2 is spouse → spouse LEFT, lineage RIGHT
        leftId = u.partner2;
        rightId = u.partner1;
      } else if (p2IsLineage && !p1IsLineage) {
        // p1 is spouse → spouse LEFT, lineage RIGHT
        leftId = u.partner1;
        rightId = u.partner2;
      } else {
        // Both lineage or both in-law: fallback to male left
        const m1 = memberMap.get(u.partner1);
        [leftId, rightId] = m1 && m1.gender === 'male'
          ? [u.partner1, u.partner2]
          : [u.partner2, u.partner1];
      }

      if (!positions.has(leftId)) positions.set(leftId, { x: coupleLeft, y });
      if (!positions.has(rightId)) positions.set(rightId, { x: coupleLeft + CARD_W + gap, y });
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
          // Check if this leaf has a childless union → needs couple width
          const childlessU = getChildlessUnions(cid);
          const w = childlessU.length > 0 ? coupleWidth(childlessU[0]) : CARD_W;
          slots.push({ type: 'leaf', memberId: cid, w });
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
            const childY = baseChildY + stepOffset;

            // Check if this leaf has a childless union → place as couple block
            const childlessU = getChildlessUnions(slot.memberId);
            if (childlessU.length > 0) {
              const u = childlessU[0];
              const gap = coupleGap(u);
              const cw = coupleWidth(u);
              const coupleLeft = slotCenter - cw / 2;

              // Couple-First: lineage member stays on inner side (closest to siblings),
              // spouse (in-law) goes on OUTER side (away from sibling line)
              const isLastSlot = slots.indexOf(slot) === slots.length - 1;
              const isFirstSlot = slots.indexOf(slot) === 0;

              // Determine lineage member vs spouse
              const lineageMember = slot.memberId;
              const spouseId = u.partner1 === lineageMember ? u.partner2 : u.partner1;

              // RULE: Spouse on OUTER side of sibling line
              // Last slot → spouse RIGHT (outside), First/middle → spouse LEFT (outside)
              if (isLastSlot && !isFirstSlot) {
                // Lineage LEFT, spouse RIGHT
                if (!positions.has(lineageMember)) positions.set(lineageMember, { x: coupleLeft, y: childY });
                if (!positions.has(spouseId)) positions.set(spouseId, { x: coupleLeft + CARD_W + gap, y: childY });
              } else {
                // Spouse LEFT, lineage RIGHT
                if (!positions.has(spouseId)) positions.set(spouseId, { x: coupleLeft, y: childY });
                if (!positions.has(lineageMember)) positions.set(lineageMember, { x: coupleLeft + CARD_W + gap, y: childY });
              }
            } else {
              if (!positions.has(slot.memberId)) {
                positions.set(slot.memberId, { x: slotCenter - CARD_W / 2, y: childY });
              }
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

  // ═══ 5b. COMPACT CROSS-FAMILY COUPLES ═══
  // Pull branches connected by cross-family unions together so partners are adjacent
  for (const cu of crossFamilyUnions) {
    const p1Pos = positions.get(cu.partner1);
    const p2Pos = positions.get(cu.partner2);
    if (!p1Pos || !p2Pos) continue;

    const [leftId, rightId] = p1Pos.x <= p2Pos.x
      ? [cu.partner1, cu.partner2]
      : [cu.partner2, cu.partner1];

    const leftPos = positions.get(leftId)!;
    const rightPos = positions.get(rightId)!;

    const gap = coupleGap(cu);
    const desiredRightX = leftPos.x + CARD_W + gap;
    const dx = desiredRightX - rightPos.x;
    if (dx >= -5) continue; // Already close enough

    // Find roots of each partner
    let rightRootIdx = -1, leftRootIdx = -1;
    for (const [idx, members] of rootMembers) {
      if (members.has(rightId)) rightRootIdx = idx;
      if (members.has(leftId)) leftRootIdx = idx;
    }
    if (rightRootIdx < 0 || leftRootIdx < 0 || rightRootIdx === leftRootIdx) continue;

    // Shift entire right root tree leftward
    for (const mid of rootMembers.get(rightRootIdx)!) {
      const pos = positions.get(mid);
      if (pos) pos.x += dx;
    }
  }

  // ═══ 6. POSITION CROSS-FAMILY UNION CHILDREN ═══
  for (const cu of crossFamilyUnions) {
    const p1Pos = positions.get(cu.partner1);
    const p2Pos = positions.get(cu.partner2);
    if (!p1Pos || !p2Pos) continue;

    // Use midpoint between the (now adjacent) parents
    const midX = (Math.min(p1Pos.x, p2Pos.x) + Math.max(p1Pos.x, p2Pos.x) + CARD_W) / 2;

    const parentGen = Math.max(generation.get(cu.partner1) ?? 0, generation.get(cu.partner2) ?? 0);
    const childY = (parentGen + 1) * LEVEL_SPACING;

    const children = cu.children
      .filter(cid => memberMap.has(cid) && !positions.has(cid))
      .sort((a, b) => {
        const ma = memberMap.get(a)!;
        const mb = memberMap.get(b)!;
        if (!ma.birthYear) console.warn(`[AutoLayout] Date manquante pour le tri : ${ma.firstName || a}`);
        if (!mb.birthYear) console.warn(`[AutoLayout] Date manquante pour le tri : ${mb.firstName || b}`);
        return (ma.birthYear ?? 0) - (mb.birthYear ?? 0) || a.localeCompare(b);
      });

    if (children.length === 0) continue;

    // Calculate total width accounting for couple blocks
    let totalW = 0;
    const childSlots: { id: string; w: number; hasUnion: boolean; union?: Union }[] = [];
    for (const cid of children) {
      // Check if this child has a union (childless or with children)
      const childUnions = (partnerUnions.get(cid) || [])
        .map(uid => unionMap.get(uid)!)
        .filter(u => u && !crossFamilyUnions.includes(u));
      if (childUnions.length > 0) {
        const u = childUnions[0];
        childSlots.push({ id: cid, w: coupleWidth(u), hasUnion: true, union: u });
      } else {
        childSlots.push({ id: cid, w: CARD_W, hasUnion: false });
      }
    }
    totalW = childSlots.reduce((s, sl) => s + sl.w, 0) + (childSlots.length - 1) * SIBLING_GAP;

    let cursor = midX - totalW / 2;
    for (let ci = 0; ci < childSlots.length; ci++) {
      const slot = childSlots[ci];
      const stepOffset = childSlots.length > 1 ? ci * SIBLING_STEP_Y : 0;
      const childYPos = childY + stepOffset;

      if (slot.hasUnion && slot.union) {
        const u = slot.union;
        const gap = coupleGap(u);
        const spouseId = u.partner1 === slot.id ? u.partner2 : u.partner1;
        // Spouse LEFT, lineage member RIGHT
        if (!positions.has(spouseId)) positions.set(spouseId, { x: cursor, y: childYPos });
        if (!positions.has(slot.id)) positions.set(slot.id, { x: cursor + CARD_W + gap, y: childYPos });
      } else {
        if (!positions.has(slot.id)) positions.set(slot.id, { x: cursor, y: childYPos });
      }
      cursor += slot.w + SIBLING_GAP;
    }
  }

  // ═══ 6b. PLACE UNPOSITIONED PARTNERS NEXT TO THEIR SPOUSE ═══
  // Partners who have no parent union (in-laws) would otherwise become orphans far away
  for (const u of unions) {
    const p1Pos = positions.get(u.partner1);
    const p2Pos = positions.get(u.partner2);
    if (p1Pos && !p2Pos) {
      const gap = coupleGap(u);
      // Determine who is lineage (has a parent union) vs spouse (in-law)
      const p1IsLineage = parentUnionOf.has(u.partner1);
      if (p1IsLineage) {
        // p2 is spouse → place LEFT of lineage member p1
        positions.set(u.partner2, { x: p1Pos.x - CARD_W - gap, y: p1Pos.y });
      } else {
        positions.set(u.partner2, { x: p1Pos.x + CARD_W + gap, y: p1Pos.y });
      }
    } else if (!p1Pos && p2Pos) {
      const gap = coupleGap(u);
      const p2IsLineage = parentUnionOf.has(u.partner2);
      if (p2IsLineage) {
        // p1 is spouse → place LEFT of lineage member p2
        positions.set(u.partner1, { x: p2Pos.x - CARD_W - gap, y: p2Pos.y });
      } else {
        positions.set(u.partner1, { x: p2Pos.x - CARD_W - gap, y: p2Pos.y });
      }
    }
  }

  // ═══ 7. PLACE ORPHAN MEMBERS ═══
  for (const m of members) {
    if (!positions.has(m.id)) {
      const gen = generation.get(m.id) ?? 0;
      positions.set(m.id, { x: forestCursor, y: gen * LEVEL_SPACING });
      forestCursor += CARD_W + SIBLING_GAP;
    }
  }

  // ═══ HELPER: Simple collision resolution pass ═══
  function simpleCollisionPass(): boolean {
    let anyOverlap = false;
    const genGroupsLocal = new Map<number, string[]>();
    for (const m of members) {
      const g = generation.get(m.id) ?? 0;
      if (!genGroupsLocal.has(g)) genGroupsLocal.set(g, []);
      genGroupsLocal.get(g)!.push(m.id);
    }
    for (const [, ids] of genGroupsLocal) {
      const sorted = ids
        .filter(id => positions.has(id))
        .sort((a, b) => positions.get(a)!.x - positions.get(b)!.x);
      for (let i = 0; i < sorted.length - 1; i++) {
        const posA = positions.get(sorted[i])!;
        const posB = positions.get(sorted[i + 1])!;
        const minRight = posA.x + CARD_W + MIN_CARD_GAP;
        if (posB.x < minRight) {
          posB.x = minRight;
          anyOverlap = true;
        }
      }
    }
    return anyOverlap;
  }

  // ═══ 8. COLLISION RESOLUTION ═══
  for (let pass = 0; pass < 20; pass++) {
    if (!simpleCollisionPass()) break;
  }

  // ═══ 9. RE-CENTER PARENTS ABOVE CHILDREN ═══
  const crossFamilyUnionIds = new Set(crossFamilyUnions.map(cu => cu.id));
  for (let pass = 0; pass < 5; pass++) {
    let anyShift = false;
    for (const u of unions) {
      if (u.children.length === 0) continue;
      if (crossFamilyUnionIds.has(u.id)) continue;
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

  // ═══ 11. COLLISION PASS ═══
  for (let pass = 0; pass < 10; pass++) {
    if (!simpleCollisionPass()) break;
  }

  // ═══ 11b. RE-COMPACT COUPLES ═══
  for (const u of unions) {
    const p1 = positions.get(u.partner1);
    const p2 = positions.get(u.partner2);
    if (!p1 || !p2) continue;
    const gap = coupleGap(u);
    const [leftId, rightId] = p1.x <= p2.x ? [u.partner1, u.partner2] : [u.partner2, u.partner1];
    const leftPos = positions.get(leftId)!;
    const rightPos = positions.get(rightId)!;
    const desiredX = leftPos.x + CARD_W + gap;
    if (rightPos.x > desiredX + 5) {
      rightPos.x = desiredX;
    }
  }

  // ═══ 11c. COLLISION PASS (post-compaction) ═══
  for (let pass = 0; pass < 10; pass++) {
    if (!simpleCollisionPass()) break;
  }

  // ═══ 11d. ENFORCE SIBLING ORDER + DEINTERLEAVE ═══
  // Ensure siblings are in birth-year order AND tightly packed (no interlopers).
  for (const u of unions) {
    const childIds = u.children.filter(cid => positions.has(cid));
    if (childIds.length < 2) continue;

    // Sort children by BIRTH YEAR
    childIds.sort((a, b) => {
      const ma = memberMap.get(a);
      const mb = memberMap.get(b);
      const ya = ma?.birthYear ?? 0;
      const yb = mb?.birthYear ?? 0;
      if (ya !== yb) return ya - yb;
      return a.localeCompare(b);
    });

    // Check if X order matches birth-year order
    const currentXOrder = [...childIds].sort((a, b) => positions.get(a)!.x - positions.get(b)!.x);
    const isOutOfOrder = childIds.some((cid, i) => cid !== currentXOrder[i]);

    const firstChildX = Math.min(...childIds.map(cid => positions.get(cid)!.x));
    const lastChildX = Math.max(...childIds.map(cid => positions.get(cid)!.x));
    const childGen = generation.get(childIds[0]) ?? 0;

    const allowedSet = new Set(childIds);
    for (const cid of childIds) {
      for (const uid of (partnerUnions.get(cid) || [])) {
        const pu = unionMap.get(uid);
        if (!pu) continue;
        const spouseId = pu.partner1 === cid ? pu.partner2 : pu.partner1;
        allowedSet.add(spouseId);
      }
    }

    let hasInterlopers = false;
    for (const [mid, pos] of positions) {
      if ((generation.get(mid) ?? 0) === childGen &&
          pos.x > firstChildX && pos.x < lastChildX &&
          !allowedSet.has(mid)) {
        hasInterlopers = true;
        break;
      }
    }

    if (!hasInterlopers && !isOutOfOrder) continue;

    // Re-pack children in birth-year order starting from firstChildX
    let cursor = firstChildX;
    for (let i = 0; i < childIds.length; i++) {
      const cid = childIds[i];
      const pos = positions.get(cid)!;
      const oldX = pos.x;
      const dx = cursor - oldX;

      pos.x = cursor;

      for (const uid of (partnerUnions.get(cid) || [])) {
        const pu = unionMap.get(uid);
        if (!pu) continue;
        const spouseId = pu.partner1 === cid ? pu.partner2 : pu.partner1;
        const spousePos = positions.get(spouseId);
        if (spousePos) spousePos.x += dx;
      }

      let rightEdge = pos.x + CARD_W;
      for (const uid of (partnerUnions.get(cid) || [])) {
        const pu = unionMap.get(uid);
        if (!pu) continue;
        const spouseId = pu.partner1 === cid ? pu.partner2 : pu.partner1;
        const spousePos = positions.get(spouseId);
        if (spousePos) rightEdge = Math.max(rightEdge, spousePos.x + CARD_W);
      }

      cursor = rightEdge + SIBLING_GAP;
    }
  }

  // ═══ 11d2. ENFORCE BRANCH GAP BETWEEN CHILDREN OF DIFFERENT UNIONS ═══
  // Ensure children of different parent unions at the same generation have
  // at least BRANCH_GAP separation, preventing branches from merging visually.
  {
    // Group unions by child generation
    const unionsByChildGen = new Map<number, Union[]>();
    for (const u of unions) {
      if (u.children.length === 0) continue;
      const childGen = Math.max(...u.children.map(cid => generation.get(cid) ?? 0));
      if (!unionsByChildGen.has(childGen)) unionsByChildGen.set(childGen, []);
      unionsByChildGen.get(childGen)!.push(u);
    }

    for (const [, genUnions] of unionsByChildGen) {
      if (genUnions.length < 2) continue;

      // For each union, compute the bounding box of its children + their spouses
      const blocks: { union: Union; minX: number; maxX: number }[] = [];
      for (const u of genUnions) {
        const childIds = u.children.filter(cid => positions.has(cid));
        if (childIds.length === 0) continue;
        let minX = Infinity, maxX = -Infinity;
        for (const cid of childIds) {
          const pos = positions.get(cid)!;
          minX = Math.min(minX, pos.x);
          maxX = Math.max(maxX, pos.x + CARD_W);
          // Include spouse positions
          for (const uid of (partnerUnions.get(cid) || [])) {
            const pu = unionMap.get(uid);
            if (!pu) continue;
            const spouseId = pu.partner1 === cid ? pu.partner2 : pu.partner1;
            const spousePos = positions.get(spouseId);
            if (spousePos) {
              minX = Math.min(minX, spousePos.x);
              maxX = Math.max(maxX, spousePos.x + CARD_W);
            }
          }
        }
        blocks.push({ union: u, minX, maxX });
      }

      // Sort blocks by minX
      blocks.sort((a, b) => a.minX - b.minX);

      // Enforce BRANCH_GAP between consecutive blocks
      for (let i = 0; i < blocks.length - 1; i++) {
        const leftBlock = blocks[i];
        const rightBlock = blocks[i + 1];
        const gap = rightBlock.minX - leftBlock.maxX;
        if (gap < BRANCH_GAP) {
          const shift = BRANCH_GAP - gap;
          // Shift the right block and all subsequent blocks
          for (let j = i + 1; j < blocks.length; j++) {
            const bUnion = blocks[j].union;
            for (const cid of bUnion.children) {
              const pos = positions.get(cid);
              if (pos) pos.x += shift;
              // Also shift spouses
              for (const uid of (partnerUnions.get(cid) || [])) {
                const pu = unionMap.get(uid);
                if (!pu) continue;
                const spouseId = pu.partner1 === cid ? pu.partner2 : pu.partner1;
                const spousePos = positions.get(spouseId);
                if (spousePos) spousePos.x += shift;
              }
            }
            blocks[j].minX += shift;
            blocks[j].maxX += shift;
          }
        }
      }
    }
  }

  // ═══ 11e. FINAL COLLISION PASS (post-deinterleave) ═══
  for (let pass = 0; pass < 10; pass++) {
    if (!simpleCollisionPass()) break;
  }

  // ═══ 11f. RE-CENTER PARENTS ABOVE CHILDREN (post-deinterleave) ═══
  for (let pass = 0; pass < 5; pass++) {
    let anyShift = false;
    for (const u of unions) {
      if (u.children.length === 0) continue;
      if (crossFamilyUnionIds.has(u.id)) continue;
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

  // ═══ 11g. FINAL COLLISION PASS ═══
  for (let pass = 0; pass < 10; pass++) {
    if (!simpleCollisionPass()) break;
  }

  // ═══ 11h. FINAL RE-COMPACT ALL COUPLES (especially childless) ═══
  // After all collision passes, couples may have been pushed apart.
  // Pull them back together, prioritising childless couples which have no
  // children anchor to justify separation.
  for (const u of unions) {
    const p1 = positions.get(u.partner1);
    const p2 = positions.get(u.partner2);
    if (!p1 || !p2) continue;
    const gap = coupleGap(u);
    const [leftId, rightId] = p1.x <= p2.x ? [u.partner1, u.partner2] : [u.partner2, u.partner1];
    const leftPos = positions.get(leftId)!;
    const rightPos = positions.get(rightId)!;
    const desiredX = leftPos.x + CARD_W + gap;
    if (rightPos.x > desiredX + 2) {
      rightPos.x = desiredX;
    }
  }

  // Final collision pass after re-compaction
  for (let pass = 0; pass < 10; pass++) {
    if (!simpleCollisionPass()) break;
  }

  // ═══ 11i. INJECT LOCKED POSITIONS & ADAPT PARTNERS ═══
  // Strategy: run normal centering first, then compute offset between where
  // the layout placed each locked member vs where they actually are.
  // Use the average offset to shift ALL non-locked members into the locked
  // members' coordinate space, then override locked positions exactly.
  if (lockedPositions && lockedPositions.size > 0) {
    // First, do the normal centering (same as step 12)
    {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const pos of positions.values()) {
        minX = Math.min(minX, pos.x);
        minY = Math.min(minY, pos.y);
        maxX = Math.max(maxX, pos.x + CARD_W);
        maxY = Math.max(maxY, pos.y + CARD_H);
      }
      const ccx = (minX + maxX) / 2, ccy = (minY + maxY) / 2;
      for (const pos of positions.values()) { pos.x -= ccx; pos.y -= ccy; }
    }

    // Now positions are centered (same coord space as what the user sees).
    // For each locked member, compute the delta from layout position → locked position.
    let totalDx = 0, totalDy = 0, count = 0;
    for (const [id, lockedPos] of lockedPositions) {
      const pos = positions.get(id);
      if (pos) {
        totalDx += lockedPos.x - pos.x;
        totalDy += lockedPos.y - pos.y;
        count++;
      }
    }

    // Shift ALL positions by average delta so non-locked members land
    // in the same coordinate space as locked members
    if (count > 0) {
      const avgDx = totalDx / count;
      const avgDy = totalDy / count;
      for (const pos of positions.values()) {
        pos.x += avgDx;
        pos.y += avgDy;
      }
    }

    // Override locked members with their exact positions
    const lockedIds = new Set<string>();
    for (const [id, lockedPos] of lockedPositions) {
      const pos = positions.get(id);
      if (pos) {
        pos.x = lockedPos.x;
        pos.y = lockedPos.y;
        lockedIds.add(id);
      }
    }

    // Adapt partners of locked members: pull/push them to maintain couple gap
    for (const u of unions) {
      const p1Locked = lockedIds.has(u.partner1);
      const p2Locked = lockedIds.has(u.partner2);
      if (!p1Locked && !p2Locked) continue;
      const p1 = positions.get(u.partner1);
      const p2 = positions.get(u.partner2);
      if (!p1 || !p2) continue;
      const gap = coupleGap(u);

      if (p1Locked && !p2Locked) {
        // Adapt p2 to be adjacent to p1
        // Determine which side p2 should be on (use layout's original relative position)
        const p2ShouldBeLeft = p2.x < p1.x;
        if (p2ShouldBeLeft) {
          p2.x = p1.x - CARD_W - gap;
        } else {
          p2.x = p1.x + CARD_W + gap;
        }
        p2.y = p1.y;
      } else if (p2Locked && !p1Locked) {
        const p1ShouldBeLeft = p1.x < p2.x;
        if (p1ShouldBeLeft) {
          p1.x = p2.x - CARD_W - gap;
        } else {
          p1.x = p2.x + CARD_W + gap;
        }
        p1.y = p2.y;
      }
      // If both locked, don't touch either
    }

    // Collision resolution respecting locked positions
    function lockedCollisionPass(): boolean {
      let anyOverlap = false;
      const genGroupsLocal = new Map<number, string[]>();
      for (const m of members) {
        const g = generation.get(m.id) ?? 0;
        if (!genGroupsLocal.has(g)) genGroupsLocal.set(g, []);
        genGroupsLocal.get(g)!.push(m.id);
      }
      for (const [, ids] of genGroupsLocal) {
        const sorted = ids
          .filter(id => positions.has(id))
          .sort((a, b) => positions.get(a)!.x - positions.get(b)!.x);
        for (let i = 0; i < sorted.length - 1; i++) {
          const posA = positions.get(sorted[i])!;
          const posB = positions.get(sorted[i + 1])!;
          const minRight = posA.x + CARD_W + MIN_CARD_GAP;
          if (posB.x < minRight) {
            if (lockedIds.has(sorted[i + 1])) {
              // Can't move the right one — push left one leftward
              if (!lockedIds.has(sorted[i])) {
                posA.x = posB.x - CARD_W - MIN_CARD_GAP;
                anyOverlap = true;
              }
            } else {
              posB.x = minRight;
              anyOverlap = true;
            }
          }
        }
      }
      return anyOverlap;
    }

    for (let pass = 0; pass < 20; pass++) {
      if (!lockedCollisionPass()) break;
    }

    // Re-compact couples (non-locked partners)
    for (const u of unions) {
      const p1 = positions.get(u.partner1);
      const p2 = positions.get(u.partner2);
      if (!p1 || !p2) continue;
      if (lockedIds.has(u.partner1) && lockedIds.has(u.partner2)) continue;
      const gap = coupleGap(u);
      const [leftId, rightId] = p1.x <= p2.x ? [u.partner1, u.partner2] : [u.partner2, u.partner1];
      const leftPos = positions.get(leftId)!;
      const rightPos = positions.get(rightId)!;
      const desiredX = leftPos.x + CARD_W + gap;
      if (lockedIds.has(rightId)) {
        // Right is locked — pull left closer
        if (!lockedIds.has(leftId) && leftPos.x < rightPos.x - CARD_W - gap - 2) {
          leftPos.x = rightPos.x - CARD_W - gap;
        }
      } else if (rightPos.x > desiredX + 2) {
        rightPos.x = desiredX;
      }
    }

    // Final collision pass
    for (let pass = 0; pass < 20; pass++) {
      if (!lockedCollisionPass()) break;
    }

    return { positions };
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

/**
 * Shift a member, their coupled partner(s), and all descendants by dx.
 * Partners are shifted together (couple = atomic block) but we do NOT
 * cascade through the partner's OTHER unions to avoid spreading branches.
 */
function shiftMemberAndDescendants(
  startId: string,
  dx: number,
  positions: Map<string, { x: number; y: number }>,
  partnerUnions: Map<string, string[]>,
  unionMap: Map<string, Union>,
  memberMap: Map<string, FamilyMember>,
  _parentUnionOf?: Map<string, string>,
) {
  const visited = new Set<string>();
  // cascadeUnions: true = process this member's unions; false = just shift position (partner pulled along)
  const stack: { id: string; cascadeUnions: boolean }[] = [{ id: startId, cascadeUnions: true }];

  while (stack.length > 0) {
    const { id, cascadeUnions } = stack.pop()!;
    if (visited.has(id) || !memberMap.has(id)) continue;
    visited.add(id);
    const pos = positions.get(id);
    if (pos) pos.x += dx;

    if (!cascadeUnions) continue; // Partner was pulled along — don't cascade their other unions

    for (const uid of (partnerUnions.get(id) || [])) {
      const u = unionMap.get(uid);
      if (!u) continue;
      const pid = u.partner1 === id ? u.partner2 : u.partner1;
      // Pull partner along (couple = inseparable block) but don't cascade their other unions
      if (!visited.has(pid)) {
        stack.push({ id: pid, cascadeUnions: false });
      }
      // Always cascade to children
      for (const cid of u.children) {
        stack.push({ id: cid, cascadeUnions: true });
      }
    }
  }
}
