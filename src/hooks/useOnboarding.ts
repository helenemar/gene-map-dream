import { useState, useEffect, useCallback } from 'react';

const ONBOARDING_DISMISSED_KEY = 'genogy-onboarding-dismissed';

export function useOnboarding() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(ONBOARDING_DISMISSED_KEY) === '1');

  // Auto-show on mount unless permanently dismissed
  useEffect(() => {
    if (dismissed) return;
    const t = setTimeout(() => setActive(true), 800);
    return () => clearTimeout(t);
  }, [dismissed]);

  const next = useCallback(() => setStep(s => s + 1), []);
  const prev = useCallback(() => setStep(s => Math.max(0, s - 1)), []);

  const finish = useCallback(() => {
    setActive(false);
    setStep(0);
  }, []);

  const dismiss = useCallback(() => {
    setActive(false);
    setStep(0);
    setDismissed(true);
    localStorage.setItem(ONBOARDING_DISMISSED_KEY, '1');
  }, []);

  const restart = useCallback(() => {
    setStep(0);
    setActive(true);
  }, []);

  return { active, step, next, prev, finish, dismiss, restart };
}
