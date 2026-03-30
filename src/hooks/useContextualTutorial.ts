import { useState, useEffect, useCallback, useRef } from 'react';

const CONTEXTUAL_TUTO_DONE_KEY = 'genogy-contextual-tuto-done';

/**
 * Contextual mini-tutorial that triggers once after the user creates their
 * very first member (members goes from 0 to ≥1).  It never shows again once
 * completed or dismissed.
 */
export function useContextualTutorial(memberCount: number, drawerOpen: boolean) {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(() => localStorage.getItem(CONTEXTUAL_TUTO_DONE_KEY) === '1');
  const prevCount = useRef(memberCount);
  const waitingForDrawerClose = useRef(false);

  // Detect first member creation: memberCount goes from 0 to ≥1
  useEffect(() => {
    if (done) return;
    if (prevCount.current === 0 && memberCount >= 1) {
      // Wait for the drawer to close before starting
      waitingForDrawerClose.current = true;
    }
    prevCount.current = memberCount;
  }, [memberCount, done]);

  // Start the tutorial once the drawer closes after first member creation
  useEffect(() => {
    if (!waitingForDrawerClose.current) return;
    if (!drawerOpen) {
      waitingForDrawerClose.current = false;
      setActive(true);
      setStep(0);
    }
  }, [drawerOpen]);

  const next = useCallback(() => setStep(s => s + 1), []);
  const prev = useCallback(() => setStep(s => Math.max(0, s - 1)), []);

  const finish = useCallback(() => {
    setActive(false);
    setStep(0);
    setDone(true);
    localStorage.setItem(CONTEXTUAL_TUTO_DONE_KEY, '1');
  }, []);

  const totalSteps = 4;

  return { active, step, totalSteps, next, prev, finish };
}
