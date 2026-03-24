import { useCallback, useRef, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FamilyMember, EmotionalLink, Union } from '@/types/genogram';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface GenogramData {
  members: FamilyMember[];
  unions: Union[];
  emotionalLinks: EmotionalLink[];
}

export function useAutoSave(genogramId: string | null, debounceMs = 2000) {
  const { user } = useAuth();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestDataRef = useRef<GenogramData | null>(null);
  const latestNameRef = useRef<string | undefined>(undefined);

  const save = useCallback(async (data: GenogramData, name?: string) => {
    if (!genogramId || !user) return;

    setSaveStatus('saving');
    try {
      const payload: Record<string, any> = {
        data: {
          members: data.members,
          unions: data.unions,
          emotionalLinks: data.emotionalLinks,
        },
      };
      if (name !== undefined) payload.name = name;

      const { error } = await supabase
        .from('genograms')
        .update(payload)
        .eq('id', genogramId)
        .eq('user_id', user.id);

      if (error) throw error;
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  }, [genogramId, user]);

  const debouncedSave = useCallback((data: GenogramData, name?: string) => {
    latestDataRef.current = data;
    latestNameRef.current = name;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (latestDataRef.current) {
        save(latestDataRef.current, latestNameRef.current);
      }
    }, debounceMs);
  }, [save, debounceMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { saveStatus, debouncedSave, saveNow: save };
}
