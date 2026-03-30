import { useState, useEffect, useCallback, useRef } from 'react';

const CONTEXTUAL_TUTO_DONE_KEY = 'genogy-contextual-tuto-done';

export type ContextualTutoStep = 'card-intro' | 'edit-hint' | null;

/**
 * Event-driven contextual tutorial. 
 * Step 1 (card-intro): Highlights card immediately, tells user to click edit button.
 * Step 2 (edit-hint): Once edit drawer opens, shows hint about editing in the sidesheet.
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

  // Start tutorial once drawer closes after first member creation
  useEffect(() => {
    if (!waitingForDrawerClose.current) return;
    if (!drawerOpen) {
      waitingForDrawerClose.current = false;
      setCurrentStep('card-intro');
    }
  }, [drawerOpen]);

  // Called when user clicks the edit button on the card
  const onEditClicked = useCallback(() => {
    if (currentStep === 'card-intro') {
      setCurrentStep('edit-hint');
    }
  }, [currentStep]);

  // Called when the edit drawer is closed after seeing the hint
  const onDrawerClosed = useCallback(() => {
    if (currentStep === 'edit-hint') {
      finish();
    }
  }, [currentStep]);

  const finish = useCallback(() => {
    setCurrentStep(null);
    setDone(true);
    localStorage.setItem(CONTEXTUAL_TUTO_DONE_KEY, '1');
  }, []);

  const active = currentStep !== null;

  return { active, currentStep, onEditClicked, onDrawerClosed, finish };
}
