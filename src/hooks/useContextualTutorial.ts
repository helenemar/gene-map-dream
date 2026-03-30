import { useState, useEffect, useCallback, useRef } from 'react';

const CONTEXTUAL_TUTO_DONE_KEY = 'genogy-contextual-tuto-done';

export type ContextualTutoStep =
  | 'card-intro' | 'card-selected' | 'edit-hint'
  | 'parent-intro' | 'parent-selected'
  | 'link-click-dot' | 'link-drag-release'
  | 'create-select-pi' | 'create-click-button' | 'create-pick-sibling'
  | 'drag-card' | 'multi-select'
  | 'union-select-both' | 'union-click-button'
  | null;

/**
 * Event-driven contextual tutorial.
 * Steps 1-7: existing flow (card select → edit → parent → link creation)
 * Step 8 (create-select-pi): Re-select the base member (PI) card.
 * Step 9 (create-click-button): Click "Créer un membre" button.
 * Step 10 (create-pick-sibling): Click "Frère/Sœur" in the dropdown.
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
        setCurrentStep('link-click-dot');
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

  const finish = useCallback(() => {
    setCurrentStep(null);
    setDone(true);
    parentEditFlowRef.current = false;
    localStorage.setItem(doneStorageKey, '1');
  }, [doneStorageKey]);

  // Called when user starts a link drag (clicked on a dot)
  const onLinkDragStarted = useCallback(() => {
    if (currentStep === 'link-click-dot') {
      setCurrentStep('link-drag-release');
    }
  }, [currentStep]);

  // Called when user creates their first emotional link (released on target)
  const onLinkCreated = useCallback(() => {
    if (currentStep === 'link-drag-release' || currentStep === 'link-click-dot') {
      // Move to sibling creation flow: select the PI card
      setCurrentStep('create-select-pi');
    }
  }, [currentStep]);

  // Called when PI card is selected during sibling creation flow
  const onPiSelectedForCreation = useCallback(() => {
    if (currentStep === 'create-select-pi') {
      setCurrentStep('create-click-button');
    }
  }, [currentStep]);

  // Called when user clicks the "Créer un membre" button (step 9)
  const onCreateMemberClicked = useCallback(() => {
    if (currentStep === 'create-click-button') {
      setCurrentStep('create-pick-sibling');
    }
  }, [currentStep]);

  // Called when user picks "Frère/Sœur" in the dropdown → move to drag step
  const onCreateSiblingPicked = useCallback(() => {
    if (currentStep === 'create-pick-sibling') {
      setCurrentStep('drag-card');
    }
  }, [currentStep]);

  // Called when user drags a card → move to union flow
  const onCardDragged = useCallback(() => {
    if (currentStep === 'drag-card') {
      setCurrentStep('union-select-both');
    }
  }, [currentStep]);

  // Called when 2 members are selected (step 11)
  const onTwoMembersSelected = useCallback(() => {
    if (currentStep === 'union-select-both') {
      setCurrentStep('union-click-button');
    }
  }, [currentStep]);

  // Called when user clicks "Créer une union" (step 12)
  const onUnionCreated = useCallback(() => {
    if (currentStep === 'union-click-button') {
      finish();
    }
  }, [currentStep, finish]);

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
    onLinkDragStarted, onLinkCreated,
    onPiSelectedForCreation, onCreateMemberClicked, onCreateSiblingPicked,
    onCardDragged,
    onTwoMembersSelected, onUnionCreated,
    finish, restart,
  };
}
