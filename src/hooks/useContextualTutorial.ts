import { useState, useEffect, useCallback, useRef } from 'react';

const CONTEXTUAL_TUTO_DONE_KEY = 'genogy-contextual-tuto-done';

export type ContextualTutoStep = 'card-intro' | 'card-selected' | 'anchor-hint' | null;

/**
 * Event-driven contextual tutorial. Advances based on user actions,
 * not manual "next" buttons.
 */
export function useContextualTutorial(
  memberCount: number,
  drawerOpen: boolean,
  userEmail?: string | null,
) {
  const isAllowedUser = userEmail === 'contact@genogy.fr';

  const [currentStep, setCurrentStep] = useState<ContextualTutoStep>(null);
  const [done, setDone] = useState(() => !isAllowedUser || localStorage.getItem(CONTEXTUAL_TUTO_DONE_KEY) === '1');
  const prevCount = useRef(memberCount);
  const waitingForDrawerClose = useRef(false);

  // Detect first member creation
  useEffect(() => {
    if (done) return;
    if (prevCount.current === 0 && memberCount >= 1) {
      waitingForDrawerClose.current = true;
    }
    prevCount.current = memberCount;
  }, [memberCount, done]);

  // Start tutorial once drawer closes
  useEffect(() => {
    if (!waitingForDrawerClose.current) return;
    if (!drawerOpen) {
      waitingForDrawerClose.current = false;
      setCurrentStep('card-intro');
    }
  }, [drawerOpen]);

  // Called when user selects the first card
  const onCardSelected = useCallback(() => {
    if (currentStep === 'card-intro') {
      setCurrentStep('card-selected');
    }
  }, [currentStep]);

  // Called when user clicks edit, view, or create on the card
  const onCardAction = useCallback(() => {
    if (currentStep === 'card-selected') {
      setCurrentStep('anchor-hint');
    }
  }, [currentStep]);

  // Called when user starts a link drag or after anchor hint is seen
  const onLinkAction = useCallback(() => {
    if (currentStep === 'anchor-hint') {
      finish();
    }
  }, [currentStep]);

  const finish = useCallback(() => {
    setCurrentStep(null);
    setDone(true);
    localStorage.setItem(CONTEXTUAL_TUTO_DONE_KEY, '1');
  }, []);

  const active = currentStep !== null;

  return { active, currentStep, onCardSelected, onCardAction, onLinkAction, finish };
}
