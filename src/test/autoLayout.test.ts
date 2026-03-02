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

    // Elisabeth's X center should be between Henri and Genevieve (within their branch)
    const hgLeft = Math.min(henriPos.x, genevievePos.x);
    const hgRight = Math.max(henriPos.x, genevievePos.x) + CARD_W;
    const elisabethCenter = elisabethPos.x + CARD_W / 2;
    expect(elisabethCenter).toBeGreaterThanOrEqual(hgLeft);
    expect(elisabethCenter).toBeLessThanOrEqual(hgRight);

    // Philippe should be under Claude & Jeannine's branch, NOT near Henri & Genevieve
    const cjLeft = Math.min(claudePos.x, philippePos.x);
    expect(philippePos.x).toBeLessThan(henriPos.x);

    // Children of the cross-family union should be between both parents
    const helenePos = result.positions.get('helene')!;
    expect(helenePos).toBeDefined();
    expect(helenePos.y).toBeGreaterThan(elisabethPos.y);
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
