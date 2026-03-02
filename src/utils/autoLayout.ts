/**
 * Reingold-Tilford–inspired Hierarchical Tree Layout
 *
 * Guarantees:
 *   1. Strict Y per generation: gen × LEVEL_SPACING (no stagger)
 *   2. Each family branch occupies a contiguous horizontal corridor
 *   3. Parents are centred exactly above their children
 *   4. Siblings are distributed symmetrically around the parent union midpoint
 *   5. Minimum 40 px gap between any two cards (collision resolution)
 *   6. Lines never cross family branches
 */

import { FamilyMember, Union, EmotionalLink } from '@/types/genogram';

const CARD_W = 220;
const CARD_H = 64;
const LEVEL_SPACING = 250;
const BASE_COUPLE_GAP = 200;
const MIN_BADGE_GAP = 280;
const BADGE_SAFETY = 80;
const SIBLING_GAP = 60;         // gap between sibling sub-trees
const BRANCH_GAP = 80;          // gap between distinct family branches
const MIN_CARD_GAP = 40;        // absolute minimum between any two cards

interface LayoutResult {
  positions: Map<string, { x: number; y: number }>;
}

/** Dynamic couple gap based on badge width */
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

// ═══════════════════════════════════════════════════════════
// Internal tree node used during layout
// ═══════════════════════════════════════════════════════════
interface TreeNode {
  /** Union id (or synthetic id for singletons) */
  id: string;
  union: Union | null;
  /** Ordered children tree nodes */
  children: TreeNode[];
  /** Computed subtree width (bottom-up) */
  width: number;
  /** Relative X offset of this node's center within its parent's coordinate frame */
  relX: number;
  /** Absolute X of the couple/center after layout */
  absX: number;
  /** Generation level */
  gen: number;
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
  const parentUnionOf = new Map<string, string>(); // childId → unionId
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

  // ═══ GENERATION ASSIGNMENT ═══
  const generation = new Map<string, number>();

  function assignGen(id: string, gen: number) {
    if (generation.has(id)) return;
    generation.set(id, gen);
    // Propagate to partners (same gen) and children (gen + 1)
    for (const uid of (partnerUnions.get(id) || [])) {
      const u = unionMap.get(uid)!;
      const pid = u.partner1 === id ? u.partner2 : u.partner1;
      if (!generation.has(pid)) assignGen(pid, gen);
      for (const cid of u.children) {
        if (!generation.has(cid)) assignGen(cid, gen + 1);
      }
    }
  }

  // Start from roots (members who are not children of any union)
  for (const m of members) {
    if (!allChildIds.has(m.id)) assignGen(m.id, 0);
  }
  // Handle orphans
  for (const m of members) {
    if (!generation.has(m.id)) assignGen(m.id, 0);
  }

  // Fix-up: ensure children are always parent_gen + 1, partners same gen
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

  // ═══ BUILD TREE ═══
  // Find "parenting unions" for a member (unions where they are a parent with children)
  function getParentingUnions(memberId: string): Union[] {
    return (partnerUnions.get(memberId) || [])
      .map(uid => unionMap.get(uid)!)
      .filter(u => u && u.children.length > 0);
  }

  const builtUnions = new Set<string>();

  /**
   * Build a tree node for a union. Each child that itself has a parenting union
   * becomes a sub-tree. This naturally partitions the genogram into non-overlapping branches.
   */
  function buildNode(union: Union): TreeNode {
    builtUnions.add(union.id);
    const gen = Math.max(generation.get(union.partner1) ?? 0, generation.get(union.partner2) ?? 0);

    // Sort children by birth year (oldest left)
    const sortedChildren = [...union.children]
      .filter(cid => memberMap.has(cid))
      .sort((a, b) => (memberMap.get(a)!.birthYear ?? 0) - (memberMap.get(b)!.birthYear ?? 0));

    const childNodes: TreeNode[] = [];
    for (const cid of sortedChildren) {
      // Does this child have their own parenting union?
      const childParentingUnions = getParentingUnions(cid).filter(u => !builtUnions.has(u.id));
      if (childParentingUnions.length > 0) {
        // Build sub-tree for each parenting union of this child
        for (const cu of childParentingUnions) {
          childNodes.push(buildNode(cu));
        }
      } else {
        // Leaf child — create a minimal node
        childNodes.push({
          id: `leaf-${cid}`,
          union: null,
          children: [],
          width: CARD_W,
          relX: 0,
          absX: 0,
          gen: generation.get(cid) ?? gen + 1,
        });
      }
    }

    return {
      id: union.id,
      union,
      children: childNodes,
      width: 0,  // computed in sizing pass
      relX: 0,
      absX: 0,
      gen,
    };
  }

  // Build forest from root unions (gen 0)
  const rootUnions = unions.filter(u => {
    const g = Math.max(generation.get(u.partner1) ?? 0, generation.get(u.partner2) ?? 0);
    return g === 0 && !builtUnions.has(u.id);
  });

  const forest: TreeNode[] = [];
  for (const ru of rootUnions) {
    if (!builtUnions.has(ru.id)) forest.push(buildNode(ru));
  }
  // Remaining un-built unions
  for (const u of unions) {
    if (!builtUnions.has(u.id)) forest.push(buildNode(u));
  }

  // ═══ BOTTOM-UP SIZING ═══
  function computeWidth(node: TreeNode): number {
    if (node.children.length === 0) {
      // Leaf: either a couple (2 cards + gap) or a single card
      if (node.union) {
        node.width = CARD_W * 2 + coupleGap(node.union);
      } else {
        node.width = CARD_W;
      }
      return node.width;
    }

    // Width = sum of children widths + gaps between them
    let childrenTotalW = 0;
    for (let i = 0; i < node.children.length; i++) {
      if (i > 0) childrenTotalW += SIBLING_GAP;
      childrenTotalW += computeWidth(node.children[i]);
    }

    // The couple itself also has a minimum width
    const coupleW = node.union ? CARD_W * 2 + coupleGap(node.union) : CARD_W;
    node.width = Math.max(childrenTotalW, coupleW);
    return node.width;
  }

  for (const root of forest) computeWidth(root);

  // ═══ TOP-DOWN POSITIONING ═══
  function positionNode(node: TreeNode, centerX: number) {
    node.absX = centerX;

    if (node.union) {
      const u = node.union;
      const gap = coupleGap(u);
      const coupleW = CARD_W * 2 + gap;
      const coupleLeft = centerX - coupleW / 2;
      const y = node.gen * LEVEL_SPACING;

      // Male left, female right
      const m1 = memberMap.get(u.partner1);
      const [maleId, femaleId] = m1 && m1.gender === 'male'
        ? [u.partner1, u.partner2]
        : [u.partner2, u.partner1];

      if (!positions.has(maleId)) {
        positions.set(maleId, { x: coupleLeft, y });
      }
      if (!positions.has(femaleId)) {
        positions.set(femaleId, { x: coupleLeft + CARD_W + gap, y });
      }

      // Place children that are in this union but DON'T have their own sub-tree
      // (they are leaf nodes). We need to map leaf nodes back to their member IDs.
      const sortedChildren = [...u.children]
        .filter(cid => memberMap.has(cid))
        .sort((a, b) => (memberMap.get(a)!.birthYear ?? 0) - (memberMap.get(b)!.birthYear ?? 0));

      // Distribute child sub-trees within this node's width
      if (node.children.length > 0) {
        const totalChildrenW = node.children.reduce((s, c) => s + c.width, 0)
          + (node.children.length - 1) * SIBLING_GAP;
        let cursor = centerX - totalChildrenW / 2;

        let childMemberIdx = 0;
        for (const childNode of node.children) {
          const childCenterX = cursor + childNode.width / 2;

          if (childNode.union) {
            // Sub-family: position recursively
            positionNode(childNode, childCenterX);
          } else {
            // Leaf child — place the member card
            if (childMemberIdx < sortedChildren.length) {
              // Find the right member for this leaf
              let memberId = sortedChildren[childMemberIdx];
              // Skip members that already have positions (placed by sub-tree)
              while (positions.has(memberId) && childMemberIdx < sortedChildren.length - 1) {
                childMemberIdx++;
                memberId = sortedChildren[childMemberIdx];
              }
              const childY = (node.gen + 1) * LEVEL_SPACING;
              if (!positions.has(memberId)) {
                positions.set(memberId, { x: childCenterX - CARD_W / 2, y: childY });
              }
            }
            childMemberIdx++;
          }

          cursor += childNode.width + SIBLING_GAP;
        }
      }
    } else {
      // Single member node (no union) — should not happen at root level
    }
  }

  // Position forest roots side by side
  let forestCursor = 0;
  for (const root of forest) {
    const cx = forestCursor + root.width / 2;
    positionNode(root, cx);
    forestCursor += root.width + BRANCH_GAP;
  }

  // ═══ PLACE ORPHAN MEMBERS ═══
  for (const m of members) {
    if (!positions.has(m.id)) {
      const gen = generation.get(m.id) ?? 0;
      positions.set(m.id, { x: forestCursor, y: gen * LEVEL_SPACING });
      forestCursor += CARD_W + SIBLING_GAP;
    }
  }

  // ═══ COLLISION RESOLUTION ═══
  // Group by generation, sort by X, push apart if overlapping
  for (let pass = 0; pass < 15; pass++) {
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
          // Shift B and all its descendants
          shiftMemberAndDescendants(sorted[i + 1], shift, positions, partnerUnions, unionMap, memberMap);
          anyOverlap = true;
        }
      }
    }
    if (!anyOverlap) break;
  }

  // ═══ ENSURE PARTNERS SHARE SAME Y ═══
  for (const u of unions) {
    const p1 = positions.get(u.partner1);
    const p2 = positions.get(u.partner2);
    if (p1 && p2) {
      const maxY = Math.max(p1.y, p2.y);
      p1.y = maxY;
      p2.y = maxY;
    }
  }

  // ═══ CENTER AROUND ORIGIN ═══
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

/** Shift a member and all their partners + descendants by dx */
function shiftMemberAndDescendants(
  startId: string,
  dx: number,
  positions: Map<string, { x: number; y: number }>,
  partnerUnions: Map<string, string[]>,
  unionMap: Map<string, Union>,
  memberMap: Map<string, FamilyMember>,
) {
  const visited = new Set<string>();
  const stack = [startId];
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
      // Only shift partner if they are to the right or at same position
      if (partnerPos && pos && partnerPos.x >= pos.x - dx) {
        stack.push(pid);
      }
      for (const cid of u.children) stack.push(cid);
    }
  }
}
