import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TraumaCatalogEntry {
  label: string;
  category?: string | null;
  source: 'global' | 'user';
}

/**
 * Loads the global trauma catalog (shared, read-only) and the current user's
 * personal trauma catalog (private). Returns a merged, deduplicated list for
 * autocomplete and a function to add a new personal entry.
 */
export function useTraumaCatalog() {
  const [globalEntries, setGlobalEntries] = useState<TraumaCatalogEntry[]>([]);
  const [userEntries, setUserEntries] = useState<TraumaCatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: globals }, { data: { user } }] = await Promise.all([
      supabase.from('trauma_catalog').select('label, category').order('label'),
      supabase.auth.getUser(),
    ]);
    setGlobalEntries((globals || []).map(g => ({ label: g.label, category: g.category, source: 'global' as const })));

    if (user) {
      const { data: personals } = await supabase
        .from('user_trauma_catalog')
        .select('label')
        .order('label');
      setUserEntries((personals || []).map(p => ({ label: p.label, source: 'user' as const })));
    } else {
      setUserEntries([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const allEntries = useMemo(() => {
    const seen = new Set<string>();
    const merged: TraumaCatalogEntry[] = [];
    for (const e of [...userEntries, ...globalEntries]) {
      const key = e.label.toLowerCase().trim();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(e);
    }
    return merged;
  }, [globalEntries, userEntries]);

  /**
   * Adds a label to the user's personal catalog if it doesn't already exist
   * in either catalog. Silently ignores duplicates.
   */
  const addPersonalEntry = useCallback(async (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const exists = allEntries.some(e => e.label.toLowerCase() === trimmed.toLowerCase());
    if (exists) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from('user_trauma_catalog')
      .insert({ user_id: user.id, label: trimmed });
    if (!error) {
      setUserEntries(prev => [...prev, { label: trimmed, source: 'user' }]);
    }
  }, [allEntries]);

  return { entries: allEntries, addPersonalEntry, loading, reload: load };
}
