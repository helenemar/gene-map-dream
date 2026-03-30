import { useState, useEffect, useCallback, useRef } from 'react';

const CONTEXTUAL_TUTO_DONE_KEY = 'genogy-contextual-tuto-done';

export type ContextualTutoStep = 'card-intro' | 'card-selected' | 'edit-hint' | null;

/**
 * Event-driven contextual tutorial.
 * Step 1 (card-intro): Highlight card, cursor points at it → user clicks to select.
 * Step 2 (card-selected): Card selected, cursor points at edit button → user clicks edit.
 * Step 3 (edit-hint): Edit drawer open, hint about editing in the sidesheet.
 */
export function useContextualTutorial(
  memberCount: number,
  drawerOpen: boolean,
  userEmail?: string | null,
  genogramId?: string,
) {
  const isAllowedUser = userEmail === 'contact@genogy.fr';
  const doneStorageKey = `${CONTEXTUAL_TUTO_DONE_KEY}-${genogramId ?? 'global'}`;

  const [currentStep, setCurrentStep] = useState<ContextualTutoStep>(null);
  const [done, setDone] = useState(() => !isAllowedUser || localStorage.getItem(doneStorageKey) === '1');
  const startedRef = useRef(false);

  // Reset tutorial state when changing genogram/account scope
  useEffect(() => {
    const alreadyDone = !isAllowedUser || localStorage.getItem(doneStorageKey) === '1';
    setDone(alreadyDone);
    setCurrentStep(null);
    startedRef.current = false;
  }, [doneStorageKey, isAllowedUser]);

  // Start tutorial as soon as first member exists and no drawer is open
  // (works both after creation and when opening a freshly created genogram)
  useEffect(() => {
    if (done || startedRef.current || currentStep !== null) return;
    if (memberCount < 1) return;
    if (drawerOpen) return;

    startedRef.current = true;
    setCurrentStep('card-intro');
  }, [done, currentStep, memberCount, drawerOpen]);

  // Called when user selects the card
  const onCardSelected = useCallback(() => {
    if (currentStep === 'card-intro') {
      setCurrentStep('card-selected');
    }
  }, [currentStep]);

  // Called when user clicks the edit button on the card
  const onEditClicked = useCallback(() => {
    if (currentStep === 'card-selected') {
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
    localStorage.setItem(doneStorageKey, '1');
  }, [doneStorageKey]);

  const active = currentStep !== null;

  return { active, currentStep, onCardSelected, onEditClicked, onDrawerClosed, finish };
}
