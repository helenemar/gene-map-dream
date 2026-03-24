import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_PATHOLOGIES } from '@/constants/defaultPathologies';

export interface DynamicPathology {
  id: string;
  name: string;
  color_hex: string;
  genogram_id: string;
}

export function usePathologies(genogramId: string | undefined, initialPathologies?: DynamicPathology[]) {
  const [pathologies, setPathologies] = useState<DynamicPathology[]>(initialPathologies || []);
  const [loading, setLoading] = useState(false);

  const fetchPathologies = useCallback(async () => {
    if (!genogramId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('pathologies')
      .select('*')
      .eq('genogram_id', genogramId)
      .order('created_at', { ascending: true });
    if (!error && data) {
      // Backfill: seed defaults if genogram has zero pathologies
      if (data.length === 0) {
        const rows = DEFAULT_PATHOLOGIES.map(p => ({
          genogram_id: genogramId,
          name: p.name,
          color_hex: p.color_hex,
        }));
        const { data: seeded } = await supabase
          .from('pathologies')
          .insert(rows)
          .select();
        if (seeded) {
          setPathologies(seeded as DynamicPathology[]);
        }
      } else {
        setPathologies(data as DynamicPathology[]);
      }
    }
    setLoading(false);
  }, [genogramId]);

  useEffect(() => {
    fetchPathologies();
  }, [fetchPathologies]);

  const addPathology = useCallback(async (name: string, colorHex: string) => {
    if (!genogramId) return;
    const { data, error } = await supabase
      .from('pathologies')
      .insert({ name, color_hex: colorHex, genogram_id: genogramId })
      .select()
      .single();
    if (!error && data) {
      setPathologies(prev => [...prev, data as DynamicPathology]);
    }
    return { data, error };
  }, [genogramId]);

  const deletePathology = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('pathologies')
      .delete()
      .eq('id', id);
    if (!error) {
      setPathologies(prev => prev.filter(p => p.id !== id));
    }
  }, []);

  return { pathologies, loading, addPathology, deletePathology, refetch: fetchPathologies };
}
