import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { FamilyMember, Union, PATHOLOGIES } from '@/types/genogram';

export interface SearchSuggestion {
  category: 'name' | 'profession' | 'pathology';
  label: string;
  value: string;
  count: number;
}

export interface FamilySearchResult {
  query: string;
  setQuery: (q: string) => void;
  debouncedQuery: string;
  matchedMemberIds: Set<string>;
  /** Union IDs where both partners match */
  matchedUnionIds: Set<string>;
  suggestions: SearchSuggestion[];
  isActive: boolean;
  clear: () => void;
}

const DEBOUNCE_MS = 200;

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function useFamilySearch(members: FamilyMember[], unions: Union[]): FamilySearchResult {
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

  // Matched member IDs
  const matchedMemberIds = useMemo(() => {
    if (!isActive) return new Set<string>();
    const set = new Set<string>();
    for (const m of members) {
      if (m.isPlaceholder) continue;
      const haystack = normalize(
        [m.firstName, m.lastName, m.profession, ...m.pathologies.map(p => {
          const found = PATHOLOGIES.find(pp => pp.id === p);
          return found ? found.name : p;
        })].join(' ')
      );
      if (haystack.includes(needle)) {
        set.add(m.id);
      }
    }
    return set;
  }, [members, needle, isActive]);

  // Matched union IDs (both partners match)
  const matchedUnionIds = useMemo(() => {
    if (!isActive) return new Set<string>();
    const set = new Set<string>();
    for (const u of unions) {
      if (matchedMemberIds.has(u.partner1) && matchedMemberIds.has(u.partner2)) {
        set.add(u.id);
      }
      // Also match if at least one partner + a child matches
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
      !m.isPlaceholder && normalize(`${m.firstName} ${m.lastName}`).includes(needle)
    );
    if (nameMatches.length > 0) {
      // Group by unique names
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

    // Pathology matches
    const matchingPathologies = PATHOLOGIES.filter(p => normalize(p.name).includes(needle));
    for (const p of matchingPathologies) {
      const count = members.filter(m => m.pathologies.includes(p.id)).length;
      if (count > 0) {
        results.push({ category: 'pathology', label: p.name, value: p.name, count });
      }
    }

    return results;
  }, [members, needle, isActive]);

  return {
    query,
    setQuery,
    debouncedQuery,
    matchedMemberIds,
    matchedUnionIds,
    suggestions,
    isActive,
    clear,
  };
}
