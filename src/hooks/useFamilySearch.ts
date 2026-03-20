import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { FamilyMember, Union, EmotionalLink, EMOTIONAL_LINK_TYPES } from '@/types/genogram';
import { DynamicPathology } from '@/hooks/usePathologies';

export interface SearchSuggestion {
  category: 'name' | 'profession' | 'pathology' | 'relation';
  label: string;
  value: string;
  count: number;
  /** CSS color for relation category dot */
  color?: string;
}

export interface FamilySearchResult {
  query: string;
  setQuery: (q: string) => void;
  debouncedQuery: string;
  matchedMemberIds: Set<string>;
  /** Union IDs where both partners match */
  matchedUnionIds: Set<string>;
  /** Emotional link IDs that match the search */
  matchedEmotionalLinkIds: Set<string>;
  suggestions: SearchSuggestion[];
  isActive: boolean;
  clear: () => void;
}

const DEBOUNCE_MS = 200;

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Map emotional link type IDs to their CSS variable name */
const LINK_TYPE_CSS_VAR: Record<string, string> = {
  fusional: '--link-fusional',
  distant: '--link-distant',
  conflictual: '--link-conflictual',
  ambivalent: '--link-ambivalent',
  cutoff: '--link-cutoff',
  violence: '--link-violence',
  emotional_abuse: '--link-emotional-abuse',
  physical_violence: '--link-physical-violence',
  sexual_abuse: '--link-sexual-abuse',
  neglect: '--link-neglect',
  controlling: '--link-controlling',
};

export function useFamilySearch(
  members: FamilyMember[],
  unions: Union[],
  emotionalLinks: EmotionalLink[] = [],
  dynamicPathologies: DynamicPathology[] = []
): FamilySearchResult {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Debounce
  useEffect(() => {
    timerRef.current = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  const clear = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  const isActive = debouncedQuery.trim().length > 0;
  const needle = normalize(debouncedQuery.trim());

  // Matched emotional link IDs
  const matchedEmotionalLinkIds = useMemo(() => {
    if (!isActive) return new Set<string>();
    const set = new Set<string>();
    // Find which link type IDs match the needle
    const matchingTypes = EMOTIONAL_LINK_TYPES.filter(t =>
      normalize(t.label).includes(needle) || normalize(t.id).includes(needle)
    );
    if (matchingTypes.length === 0) return set;
    const matchingTypeIds = new Set(matchingTypes.map(t => t.id));
    for (const link of emotionalLinks) {
      if (matchingTypeIds.has(link.type)) {
        set.add(link.id);
      }
    }
    return set;
  }, [emotionalLinks, needle, isActive]);

  // Member IDs connected by matched emotional links
  const memberIdsFromLinks = useMemo(() => {
    if (matchedEmotionalLinkIds.size === 0) return new Set<string>();
    const set = new Set<string>();
    for (const link of emotionalLinks) {
      if (matchedEmotionalLinkIds.has(link.id)) {
        set.add(link.from);
        set.add(link.to);
      }
    }
    return set;
  }, [emotionalLinks, matchedEmotionalLinkIds]);

  // Matched member IDs (from name/profession/pathology search)
  const matchedMemberIdsBase = useMemo(() => {
    if (!isActive) return new Set<string>();
    const set = new Set<string>();
    for (const m of members) {
      if (m.isPlaceholder) continue;
      // Resolve pathology names from dynamic DB pathologies
      const pathologyNames = m.pathologies.map(pid => {
        const found = dynamicPathologies.find(dp => dp.id === pid);
        return found ? found.name : pid;
      });
      const haystack = normalize(
        [m.firstName, m.lastName, m.birthName || '', m.profession, ...pathologyNames].join(' ')
      );
      if (haystack.includes(needle)) {
        set.add(m.id);
      }
    }
    return set;
  }, [members, dynamicPathologies, needle, isActive]);

  // Combined: members matched by text OR by emotional link connection
  const matchedMemberIds = useMemo(() => {
    const combined = new Set(matchedMemberIdsBase);
    for (const id of memberIdsFromLinks) combined.add(id);
    return combined;
  }, [matchedMemberIdsBase, memberIdsFromLinks]);

  // Matched union IDs (both partners match)
  const matchedUnionIds = useMemo(() => {
    if (!isActive) return new Set<string>();
    const set = new Set<string>();
    for (const u of unions) {
      if (matchedMemberIds.has(u.partner1) && matchedMemberIds.has(u.partner2)) {
        set.add(u.id);
      }
      const partnerMatch = matchedMemberIds.has(u.partner1) || matchedMemberIds.has(u.partner2);
      const childMatch = u.children.some(c => matchedMemberIds.has(c));
      if (partnerMatch && childMatch) {
        set.add(u.id);
      }
    }
    return set;
  }, [unions, matchedMemberIds, isActive]);

  // Suggestions
  const suggestions = useMemo((): SearchSuggestion[] => {
    if (!isActive) return [];
    const results: SearchSuggestion[] = [];

    // Name matches
    const nameMatches = members.filter(m =>
      !m.isPlaceholder && (normalize(`${m.firstName} ${m.lastName}`).includes(needle) || (m.birthName && normalize(m.birthName).includes(needle)))
    );
    if (nameMatches.length > 0) {
      const names = new Map<string, number>();
      nameMatches.forEach(m => {
        const key = `${m.firstName} ${m.lastName}`;
        names.set(key, (names.get(key) || 0) + 1);
      });
      names.forEach((count, name) => {
        results.push({ category: 'name', label: name, value: name, count });
      });
    }

    // Profession matches
    const profMatches = members.filter(m =>
      !m.isPlaceholder && m.profession && normalize(m.profession).includes(needle)
    );
    if (profMatches.length > 0) {
      const profs = new Map<string, number>();
      profMatches.forEach(m => {
        profs.set(m.profession, (profs.get(m.profession) || 0) + 1);
      });
      profs.forEach((count, prof) => {
        results.push({ category: 'profession', label: prof, value: prof, count });
      });
    }

    // Pathology matches (from dynamic DB pathologies)
    const matchingDynPathologies = dynamicPathologies.filter(p => normalize(p.name).includes(needle));
    for (const p of matchingDynPathologies) {
      const count = members.filter(m => m.pathologies.includes(p.id)).length;
      if (count > 0) {
        results.push({ category: 'pathology', label: p.name, value: p.name, count, color: p.color_hex });
      }
    }

    // Emotional link type matches
    const matchingLinkTypes = EMOTIONAL_LINK_TYPES.filter(t =>
      normalize(t.label).includes(needle) || normalize(t.id).includes(needle)
    );
    for (const lt of matchingLinkTypes) {
      const count = emotionalLinks.filter(l => l.type === lt.id).length;
      if (count > 0) {
        const cssVar = LINK_TYPE_CSS_VAR[lt.id] || '--foreground';
        results.push({
          category: 'relation',
          label: lt.label,
          value: lt.label,
          count,
          color: `hsl(var(${cssVar}))`,
        });
      }
    }

    return results;
  }, [members, emotionalLinks, needle, isActive]);

  return {
    query,
    setQuery,
    debouncedQuery,
    matchedMemberIds,
    matchedUnionIds,
    matchedEmotionalLinkIds,
    suggestions,
    isActive,
    clear,
  };
}
