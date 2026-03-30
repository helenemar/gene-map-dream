import { useState, useEffect, useCallback, useRef } from 'react';

const CONTEXTUAL_TUTO_DONE_KEY = 'genogy-contextual-tuto-done';

export type ContextualTutoStep =
  | 'card-intro' | 'card-selected' | 'edit-hint'
  | 'parent-intro' | 'parent-selected'
  | 'link-click-dot' | 'link-drag-release'
  | 'create-select-pi' | 'create-click-button' | 'create-pick-sibling'
  | 'drag-card' | 'multi-select' | 'multi-drag' | 'search-bar'
  | null;

/**
 * Event-driven contextual tutorial.
 * Flow: card select → edit → parent → link creation → sibling creation →
 *       drag card → multi-select → multi-drag → search bar
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
  const siblingEditFlowRef = useRef(false);

  // Reset tutorial state when changing genogram/account scope
  useEffect(() => {
    const alreadyDone = !isAllowedUser || localStorage.getItem(doneStorageKey) === '1';
    setDone(alreadyDone);
    setCurrentStep(null);
    startedRef.current = false;
    parentEditFlowRef.current = false;
    siblingEditFlowRef.current = false;
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
      siblingEditFlowRef.current = false;
      setCurrentStep('edit-hint');
    }
  }, [currentStep]);

  const openPrimaryEditHint = useCallback(() => {
    setCurrentStep(prev => {
      if (prev !== 'card-selected') return prev;
      parentEditFlowRef.current = false;
      siblingEditFlowRef.current = false;
      return 'edit-hint';
    });
  }, []);

  const onDrawerClosed = useCallback(() => {
    if (currentStep === 'edit-hint') {
      if (siblingEditFlowRef.current) {
        siblingEditFlowRef.current = false;
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
      siblingEditFlowRef.current = false;
      setCurrentStep('edit-hint');
    }
  }, [currentStep]);

  const openParentEditHint = useCallback(() => {
    setCurrentStep(prev => {
      if (prev !== 'parent-selected') return prev;
      parentEditFlowRef.current = true;
      siblingEditFlowRef.current = false;
      return 'edit-hint';
    });
  }, []);

  const finish = useCallback(() => {
    setCurrentStep(null);
    setDone(true);
    parentEditFlowRef.current = false;
    siblingEditFlowRef.current = false;
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
    if (currentStep === 'create-click-button') setCurrentStep('create-pick-sibling');
  }, [currentStep]);

  const onCreateSiblingPicked = useCallback(() => {
    if (currentStep === 'create-pick-sibling') {
      siblingEditFlowRef.current = true;
      setCurrentStep('edit-hint');
    }
  }, [currentStep]);

  // drag-card → multi-select
  const onCardDragged = useCallback(() => {
    if (currentStep === 'drag-card') setCurrentStep('multi-select');
  }, [currentStep]);

  // multi-select → multi-drag (user did a marquee or shift-click selection)
  const onMultiSelected = useCallback(() => {
    if (currentStep === 'multi-select') setCurrentStep('multi-drag');
  }, [currentStep]);

  // multi-drag → search-bar (user dragged the group)
  const onMultiDragged = useCallback(() => {
    if (currentStep === 'multi-drag') setCurrentStep('search-bar');
  }, [currentStep]);

  // search-bar → finish (user typed something in search)
  const onSearchUsed = useCallback(() => {
    if (currentStep === 'search-bar') finish();
  }, [currentStep, finish]);

  const restart = useCallback(() => {
    localStorage.removeItem(doneStorageKey);
    setDone(false);
    setCurrentStep(null);
    startedRef.current = false;
    parentEditFlowRef.current = false;
    siblingEditFlowRef.current = false;
  }, [doneStorageKey]);

  const active = currentStep !== null;

  return {
    active, currentStep,
    onCardSelected, onEditClicked, onDrawerClosed,
    onParentSelected, onParentEditClicked,
    onLinkDragStarted, onLinkCreated,
    onPiSelectedForCreation, onCreateMemberClicked, onCreateSiblingPicked,
    onCardDragged, onMultiSelected, onMultiDragged, onSearchUsed,
    openPrimaryEditHint, openParentEditHint,
    finish, restart,
  };
}
