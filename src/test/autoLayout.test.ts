import { describe, it, expect } from 'vitest';
import { computeAutoLayout } from '@/utils/autoLayout';
import type { FamilyMember, Union } from '@/types/genogram';

const CARD_W = 220;

function makeMember(id: string, firstName: string, gender: 'male' | 'female', birthYear: number): FamilyMember {
  return {
    id, firstName, lastName: '', birthYear, age: 0, profession: '',
    gender, x: 0, y: 0, pathologies: [],
  };
}

describe('autoLayout cross-family unions', () => {
  it('places Elisabeth under Henri & Genevieve, not under Claude & Jeannine', () => {
    const members: FamilyMember[] = [
      makeMember('philippe', 'Philippe', 'male', 1963),
      makeMember('elisabeth', 'Elisabeth', 'female', 1962),
      makeMember('claude', 'Claude', 'male', 1941),
      makeMember('jeannine', 'Jeannine', 'female', 1941),
      makeMember('christine', 'Christine', 'female', 1966),
      makeMember('pascal', 'Pascal', 'male', 1967),
      makeMember('henri', 'Henri', 'male', 1927),
      makeMember('genevieve', 'Genevieve', 'female', 1928),
      makeMember('helene', 'Hélène', 'female', 1992),
      makeMember('francois', 'François', 'male', 1989),
      makeMember('thomas', 'Thomas', 'male', 1991),
    ];

    const unions: Union[] = [
      // Philippe & Elisabeth → Hélène, François (cross-family!)
      { id: 'u-pe', partner1: 'philippe', partner2: 'elisabeth', status: 'separated', children: ['helene', 'francois'] },
      // Claude & Jeannine → Philippe, Christine
      { id: 'u-cj', partner1: 'claude', partner2: 'jeannine', status: 'married', children: ['philippe', 'christine'] },
      // Christine & Pascal → Thomas
      { id: 'u-cp', partner1: 'christine', partner2: 'pascal', status: 'married', children: ['thomas'] },
      // Henri & Genevieve → Elisabeth
      { id: 'u-hg', partner1: 'henri', partner2: 'genevieve', status: 'married', children: ['elisabeth'] },
    ];

    const result = computeAutoLayout(members, unions, []);

    const henriPos = result.positions.get('henri')!;
    const genevievePos = result.positions.get('genevieve')!;
    const elisabethPos = result.positions.get('elisabeth')!;
    const claudePos = result.positions.get('claude')!;
    const philippePos = result.positions.get('philippe')!;

    // Elisabeth should be below Henri & Genevieve (gen 1, Y = 250)
    expect(elisabethPos).toBeDefined();
    expect(henriPos).toBeDefined();
    expect(genevievePos).toBeDefined();

    // Elisabeth's Y should be one generation below Henri & Genevieve
    expect(elisabethPos.y).toBeGreaterThan(henriPos.y);

    // Philippe should be to the RIGHT of Christine (reordered for cross-family adjacency)
    const christinePos = result.positions.get('christine')!;
    expect(christinePos).toBeDefined();
    expect(philippePos.x).toBeGreaterThan(christinePos.x);

    // Philippe and Elisabeth should be adjacent (cross-family couple compacted)
    const coupleDistance = Math.abs(philippePos.x - elisabethPos.x);
    expect(coupleDistance).toBeLessThan(600); // Should be within couple gap range

    // Children of Philippe & Elisabeth should be grouped together
    const helenePos = result.positions.get('helene')!;
    const francoisPos = result.positions.get('francois')!;
    expect(helenePos).toBeDefined();
    expect(francoisPos).toBeDefined();
    expect(helenePos.y).toBeGreaterThan(elisabethPos.y);

    // Thomas (Christine & Pascal's child) should exist
    const thomasPos = result.positions.get('thomas')!;
    expect(thomasPos).toBeDefined();
  });

  it('aligns all members of the same generation on the same Y', () => {
    const members: FamilyMember[] = [
      makeMember('claude', 'Claude', 'male', 1941),
      makeMember('jeannine', 'Jeannine', 'female', 1941),
      makeMember('henri', 'Henri', 'male', 1927),
      makeMember('genevieve', 'Genevieve', 'female', 1928),
    ];
    const unions: Union[] = [
      { id: 'u-cj', partner1: 'claude', partner2: 'jeannine', status: 'married', children: [] },
      { id: 'u-hg', partner1: 'henri', partner2: 'genevieve', status: 'married', children: [] },
    ];

    const result = computeAutoLayout(members, unions, []);
    const claudeY = result.positions.get('claude')!.y;
    const jeanninY = result.positions.get('jeannine')!.y;
    const henriY = result.positions.get('henri')!.y;
    const genevieveY = result.positions.get('genevieve')!.y;

    expect(claudeY).toBe(jeanninY);
    expect(henriY).toBe(genevieveY);
    expect(claudeY).toBe(henriY); // Same generation
  });
});

describe('autoLayout parent centering above direct children only', () => {
  it('centers parents over direct children, excluding in-laws', () => {
    const members: FamilyMember[] = [
      makeMember('dad', 'Dad', 'male', 1950),
      makeMember('mom', 'Mom', 'female', 1952),
      makeMember('child1', 'Child1', 'male', 1975),
      makeMember('child2', 'Child2', 'female', 1978),
      makeMember('spouse1', 'Spouse1', 'female', 1976), // in-law
    ];
    const unions: Union[] = [
      { id: 'u-parents', partner1: 'dad', partner2: 'mom', status: 'married', children: ['child1', 'child2'] },
      { id: 'u-child1', partner1: 'child1', partner2: 'spouse1', status: 'married', children: [] },
    ];

    const result = computeAutoLayout(members, unions, []);
    const dadX = result.positions.get('dad')!.x;
    const momX = result.positions.get('mom')!.x;
    const child1X = result.positions.get('child1')!.x;
    const child2X = result.positions.get('child2')!.x;
    const spouse1X = result.positions.get('spouse1')!.x;

    // Midpoint of parent couple
    const parentMid = (dadX + momX + CARD_W) / 2;
    // Midpoint of direct children only (excluding spouse1)
    const childrenMid = (Math.min(child1X, child2X) + Math.max(child1X, child2X) + CARD_W) / 2;

    // Parent midpoint should be close to children midpoint (within 50px tolerance)
    expect(Math.abs(parentMid - childrenMid)).toBeLessThan(50);

    // Spouse1 should NOT be between the two children (it's outside the sibling block)
    const childMinX = Math.min(child1X, child2X);
    const childMaxX = Math.max(child1X, child2X);
    expect(spouse1X < childMinX || spouse1X > childMaxX).toBe(true);
  });

  it('centers single-child parents exactly over the child', () => {
    const members: FamilyMember[] = [
      makeMember('dad', 'Dad', 'male', 1950),
      makeMember('mom', 'Mom', 'female', 1952),
      makeMember('only', 'Only', 'male', 1980),
    ];
    const unions: Union[] = [
      { id: 'u-parents', partner1: 'dad', partner2: 'mom', status: 'married', children: ['only'] },
    ];

    const result = computeAutoLayout(members, unions, []);
    const dadX = result.positions.get('dad')!.x;
    const momX = result.positions.get('mom')!.x;
    const onlyX = result.positions.get('only')!.x;

    const parentMid = (dadX + momX + CARD_W) / 2;
    const childMid = onlyX + CARD_W / 2;

    expect(Math.abs(parentMid - childMid)).toBeLessThan(50);
  });
});

describe('autoLayout spouse placement (left/right rule)', () => {
  // 3 siblings: Alice (eldest), Bob (middle), Charlie (youngest)
  // Each has a spouse. Rule: spouse on OUTER side of sibling line.
  // Eldest & middle → spouse LEFT, lineage RIGHT
  // Youngest (last) → lineage LEFT, spouse RIGHT

  function buildThreeSiblingFamily() {
    const members: FamilyMember[] = [
      makeMember('dad', 'Dad', 'male', 1950),
      makeMember('mom', 'Mom', 'female', 1952),
      // Siblings sorted by birth year
      makeMember('alice', 'Alice', 'female', 1975),   // eldest
      makeMember('alice-h', 'AliceH', 'male', 1974),  // Alice's spouse
      makeMember('bob', 'Bob', 'male', 1978),          // middle
      makeMember('bob-w', 'BobW', 'female', 1979),    // Bob's spouse
      makeMember('charlie', 'Charlie', 'male', 1982),  // youngest (last)
      makeMember('charlie-w', 'CharlieW', 'female', 1983), // Charlie's spouse
    ];

    const unions: Union[] = [
      { id: 'u-parents', partner1: 'dad', partner2: 'mom', status: 'married', children: ['alice', 'bob', 'charlie'] },
      { id: 'u-alice', partner1: 'alice', partner2: 'alice-h', status: 'married', children: [] },
      { id: 'u-bob', partner1: 'bob', partner2: 'bob-w', status: 'married', children: [] },
      { id: 'u-charlie', partner1: 'charlie', partner2: 'charlie-w', status: 'married', children: [] },
    ];

    return computeAutoLayout(members, unions, []);
  }

  it('places eldest spouse to the LEFT of the lineage member', () => {
    const result = buildThreeSiblingFamily();
    const aliceX = result.positions.get('alice')!.x;
    const aliceHX = result.positions.get('alice-h')!.x;
    // Spouse LEFT, lineage RIGHT
    expect(aliceHX).toBeLessThan(aliceX);
  });

  it('places middle child spouse to the LEFT of the lineage member', () => {
    const result = buildThreeSiblingFamily();
    const bobX = result.positions.get('bob')!.x;
    const bobWX = result.positions.get('bob-w')!.x;
    // Spouse LEFT, lineage RIGHT
    expect(bobWX).toBeLessThan(bobX);
  });

  it('places youngest (last) spouse to the RIGHT of the lineage member', () => {
    const result = buildThreeSiblingFamily();
    const charlieX = result.positions.get('charlie')!.x;
    const charlieWX = result.positions.get('charlie-w')!.x;
    // Lineage LEFT, spouse RIGHT
    expect(charlieWX).toBeGreaterThan(charlieX);
  });

  it('maintains sibling order left-to-right by birth year', () => {
    const result = buildThreeSiblingFamily();
    const aliceX = result.positions.get('alice')!.x;
    const bobX = result.positions.get('bob')!.x;
    const charlieX = result.positions.get('charlie')!.x;
    expect(aliceX).toBeLessThan(bobX);
    expect(bobX).toBeLessThan(charlieX);
  });
});
