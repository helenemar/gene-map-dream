import { useState, useEffect, useCallback, useRef } from 'react';

const CONTEXTUAL_TUTO_DONE_KEY = 'genogy-contextual-tuto-done';

export type ContextualTutoStep =
  | 'card-intro' | 'card-selected' | 'edit-hint'
  | 'parent-intro' | 'parent-selected'
  | 'link-demo'
  | null;

/**
 * Event-driven contextual tutorial.
 * Step 1 (card-intro): Highlight PI card → user clicks to select.
 * Step 2 (card-selected): Card selected → user clicks edit button.
 * Step 3 (edit-hint): Edit drawer open → user fills info & closes drawer.
 * Step 4 (parent-intro): Highlight father card → user clicks to select.
 * Step 5 (parent-selected): Father selected → user double-clicks or clicks edit.
 * Step 6 (link-demo): Show how to drag from anchor point to create an emotional link.
 */
export function useContextualTutorial(
  memberCount: number,
  drawerOpen: boolean,
  userEmail?: string | null,
  genogramId?: string,
) {
  const isAllowedUser = ['contact.genogy@gmail.com', 'contact@genogy.fr'].includes((userEmail ?? '').toLowerCase());
  const doneStorageKey = `${CONTEXTUAL_TUTO_DONE_KEY}-${genogramId ?? 'global'}`;

  const [currentStep, setCurrentStep] = useState<ContextualTutoStep>(null);
  const [done, setDone] = useState(() => !isAllowedUser || localStorage.getItem(doneStorageKey) === '1');
  const startedRef = useRef(false);
  const parentEditFlowRef = useRef(false);

  // Reset tutorial state when changing genogram/account scope
  useEffect(() => {
    const alreadyDone = !isAllowedUser || localStorage.getItem(doneStorageKey) === '1';
    setDone(alreadyDone);
    setCurrentStep(null);
    startedRef.current = false;
    parentEditFlowRef.current = false;
  }, [doneStorageKey, isAllowedUser]);

  // Start tutorial as soon as first member exists and no drawer is open
  useEffect(() => {
    if (done || startedRef.current || currentStep !== null) return;
    if (memberCount < 1) return;
    if (drawerOpen) return;

    startedRef.current = true;
    setCurrentStep('card-intro');
  }, [done, currentStep, memberCount, drawerOpen]);

  // Called when user selects the PI card (step 1)
  const onCardSelected = useCallback(() => {
    if (currentStep === 'card-intro') {
      setCurrentStep('card-selected');
    }
  }, [currentStep]);

  // Called when user clicks the edit button on the PI card (step 2)
  const onEditClicked = useCallback(() => {
    if (currentStep === 'card-selected') {
      parentEditFlowRef.current = false;
      setCurrentStep('edit-hint');
    }
  }, [currentStep]);

  // Called when the edit drawer is closed
  const onDrawerClosed = useCallback(() => {
    if (currentStep === 'edit-hint') {
      if (parentEditFlowRef.current) {
        parentEditFlowRef.current = false;
        setCurrentStep('link-demo');
      } else {
        setCurrentStep('parent-intro');
      }
    }
  }, [currentStep]);

  // Called when user selects the father card (step 4)
  const onParentSelected = useCallback(() => {
    if (currentStep === 'parent-intro') {
      setCurrentStep('parent-selected');
    }
  }, [currentStep]);

  // Called when user opens edit on the father (step 5)
  const onParentEditClicked = useCallback(() => {
    if (currentStep === 'parent-selected') {
      parentEditFlowRef.current = true;
      setCurrentStep('edit-hint');
    }
  }, [currentStep]);

  // Called when user creates their first emotional link
  const onLinkCreated = useCallback(() => {
    if (currentStep === 'link-demo') {
      finish();
    }
  }, [currentStep]);

  const finish = useCallback(() => {
    setCurrentStep(null);
    setDone(true);
    parentEditFlowRef.current = false;
    localStorage.setItem(doneStorageKey, '1');
  }, [doneStorageKey]);

  const restart = useCallback(() => {
    localStorage.removeItem(doneStorageKey);
    setDone(false);
    setCurrentStep(null);
    startedRef.current = false;
    parentEditFlowRef.current = false;
  }, [doneStorageKey]);

  const active = currentStep !== null;

  return {
    active, currentStep,
    onCardSelected, onEditClicked, onDrawerClosed,
    onParentSelected, onParentEditClicked,
    onLinkCreated,
    finish, restart,
  };
}
