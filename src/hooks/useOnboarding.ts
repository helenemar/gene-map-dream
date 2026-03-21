import { useState, useEffect, useCallback } from 'react';

const ONBOARDING_DISMISSED_KEY = 'genogy-onboarding-dismissed';
const ONBOARDING_SEEN_PREFIX = 'genogy-onboarding-seen-';

export function useOnboarding(genogramId?: string) {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(ONBOARDING_DISMISSED_KEY) === '1');

  // Auto-show only on first visit to a specific genogram (unless permanently dismissed)
  useEffect(() => {
    if (dismissed) return;
    if (!genogramId) return;

    const seenKey = ONBOARDING_SEEN_PREFIX + genogramId;
    const alreadySeen = localStorage.getItem(seenKey) === '1';
    if (alreadySeen) return;

    // Mark as seen for this genogram
    localStorage.setItem(seenKey, '1');
    const t = setTimeout(() => setActive(true), 800);
    return () => clearTimeout(t);
  }, [dismissed, genogramId]);

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
