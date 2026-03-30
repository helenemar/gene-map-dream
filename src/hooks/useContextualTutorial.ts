import { useState, useEffect, useCallback, useRef } from 'react';

const CONTEXTUAL_TUTO_DONE_KEY = 'genogy-contextual-tuto-done';

export type ContextualTutoStep =
  | 'card-intro' | 'card-selected' | 'edit-hint'
  | 'parent-intro' | 'parent-selected'
  | 'link-click-dot' | 'link-drag-release'
  | 'create-select-pi' | 'create-click-button'
  | 'drag-card'
  | null;

/**
 * Event-driven contextual tutorial.
 * Flow: card select → edit → parent → link creation → create member → drag card → finish
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
  const memberCreatedFlowRef = useRef(false);

  // Reset tutorial state when changing genogram/account scope
  useEffect(() => {
    const alreadyDone = !isAllowedUser || localStorage.getItem(doneStorageKey) === '1';
    setDone(alreadyDone);
    setCurrentStep(null);
    startedRef.current = false;
    parentEditFlowRef.current = false;
    memberCreatedFlowRef.current = false;
  }, [doneStorageKey, isAllowedUser]);

  // Start tutorial as soon as first member exists and no drawer is open
  useEffect(() => {
    if (done || startedRef.current || currentStep !== null) return;
    if (memberCount < 1) return;
    if (drawerOpen) return;

    startedRef.current = true;
    setCurrentStep('card-intro');
  }, [done, currentStep, memberCount, drawerOpen]);

  const onCardSelected = useCallback(() => {
    if (currentStep === 'card-intro') setCurrentStep('card-selected');
  }, [currentStep]);

  const onEditClicked = useCallback(() => {
    if (currentStep === 'card-selected') {
      parentEditFlowRef.current = false;
      memberCreatedFlowRef.current = false;
      setCurrentStep('edit-hint');
    }
  }, [currentStep]);

  const openPrimaryEditHint = useCallback(() => {
    setCurrentStep(prev => {
      if (prev !== 'card-selected') return prev;
      parentEditFlowRef.current = false;
      memberCreatedFlowRef.current = false;
      return 'edit-hint';
    });
  }, []);

  const onDrawerClosed = useCallback(() => {
    if (currentStep === 'edit-hint') {
      if (memberCreatedFlowRef.current) {
        memberCreatedFlowRef.current = false;
        setCurrentStep('drag-card');
      } else if (parentEditFlowRef.current) {
        parentEditFlowRef.current = false;
        setCurrentStep('link-click-dot');
      } else {
        setCurrentStep('parent-intro');
      }
    }
  }, [currentStep]);

  const onParentSelected = useCallback(() => {
    if (currentStep === 'parent-intro') setCurrentStep('parent-selected');
  }, [currentStep]);

  const onParentEditClicked = useCallback(() => {
    if (currentStep === 'parent-selected') {
      parentEditFlowRef.current = true;
      memberCreatedFlowRef.current = false;
      setCurrentStep('edit-hint');
    }
  }, [currentStep]);

  const openParentEditHint = useCallback(() => {
    setCurrentStep(prev => {
      if (prev !== 'parent-selected') return prev;
      parentEditFlowRef.current = true;
      memberCreatedFlowRef.current = false;
      return 'edit-hint';
    });
  }, []);

  const finish = useCallback(() => {
    setCurrentStep(null);
    setDone(true);
    parentEditFlowRef.current = false;
    memberCreatedFlowRef.current = false;
    localStorage.setItem(doneStorageKey, '1');
  }, [doneStorageKey]);

  const onLinkDragStarted = useCallback(() => {
    if (currentStep === 'link-click-dot') setCurrentStep('link-drag-release');
  }, [currentStep]);

  const onLinkCreated = useCallback(() => {
    if (currentStep === 'link-drag-release' || currentStep === 'link-click-dot') {
      setCurrentStep('create-select-pi');
    }
  }, [currentStep]);

  const onPiSelectedForCreation = useCallback(() => {
    if (currentStep === 'create-select-pi') setCurrentStep('create-click-button');
  }, [currentStep]);

  const onCreateMemberClicked = useCallback(() => {
    if (currentStep === 'create-click-button') {
      memberCreatedFlowRef.current = true;
      setCurrentStep('edit-hint');
    }
  }, [currentStep]);

  // drag-card → finish
  const onCardDragged = useCallback(() => {
    if (currentStep === 'drag-card') finish();
  }, [currentStep, finish]);

  const restart = useCallback(() => {
    localStorage.removeItem(doneStorageKey);
    setDone(false);
    setCurrentStep(null);
    startedRef.current = false;
    parentEditFlowRef.current = false;
    memberCreatedFlowRef.current = false;
  }, [doneStorageKey]);

  const active = currentStep !== null;

  return {
    active, currentStep,
    onCardSelected, onEditClicked, onDrawerClosed,
    onParentSelected, onParentEditClicked,
    onLinkDragStarted, onLinkCreated,
    onPiSelectedForCreation, onCreateMemberClicked,
    onCardDragged,
    openPrimaryEditHint, openParentEditHint,
    finish, restart,
  };
}
