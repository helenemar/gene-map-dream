import { useCallback, useRef, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FamilyMember, EmotionalLink, Union } from '@/types/genogram';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface GenogramData {
  members: FamilyMember[];
  unions: Union[];
  emotionalLinks: EmotionalLink[];
}

export function useSharedAutoSave(shareToken: string | null, debounceMs = 2000) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(async (data: GenogramData, _name?: string) => {
    if (!shareToken) return;

    setSaveStatus('saving');
    try {
      const { data: success, error } = await supabase.rpc('update_shared_genogram', {
        p_token: shareToken,
        p_data: {
          members: data.members,
          unions: data.unions,
          emotionalLinks: data.emotionalLinks,
        } as any,
      });

      if (error || !success) throw error || new Error('Update failed');
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  }, [shareToken]);

  const debouncedSave = useCallback((data: GenogramData, name?: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      save(data, name);
    }, debounceMs);
  }, [save, debounceMs]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { saveStatus, debouncedSave, saveNow: save };
}
