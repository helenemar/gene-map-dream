import { useState, useEffect, useCallback } from 'react';

export function useOnboarding() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);

  // Auto-show every time the editor mounts (small delay so UI renders first)
  useEffect(() => {
    const t = setTimeout(() => setActive(true), 800);
    return () => clearTimeout(t);
  }, []);

  const next = useCallback(() => setStep(s => s + 1), []);
  const prev = useCallback(() => setStep(s => Math.max(0, s - 1)), []);

  const finish = useCallback(() => {
    setActive(false);
    setStep(0);
  }, []);

  const restart = useCallback(() => {
    setStep(0);
    setActive(true);
  }, []);

  return { active, step, next, prev, finish, restart };
}
