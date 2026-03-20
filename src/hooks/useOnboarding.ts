import { useState, useEffect, useCallback } from 'react';

const ONBOARDING_KEY = 'genogy-onboarding-done';

export function useOnboarding() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);

  // Auto-show on first visit
  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) {
      // Small delay so the editor renders first
      const t = setTimeout(() => setActive(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const next = useCallback(() => setStep(s => s + 1), []);
  const prev = useCallback(() => setStep(s => Math.max(0, s - 1)), []);

  const finish = useCallback(() => {
    setActive(false);
    setStep(0);
    localStorage.setItem(ONBOARDING_KEY, '1');
  }, []);

  const restart = useCallback(() => {
    setStep(0);
    setActive(true);
  }, []);

  return { active, step, next, prev, finish, restart };
}
