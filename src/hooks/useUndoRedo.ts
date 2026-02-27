import { useCallback, useRef, useState } from 'react';

const MAX_HISTORY = 50;

export interface UndoRedoControls<T> {
  /** Record a snapshot before a mutation */
  record: (state: T) => void;
  /** Undo: returns previous state or null */
  undo: (current: T) => T | null;
  /** Redo: returns next state or null */
  redo: (current: T) => T | null;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
}

/**
 * Generic undo/redo hook using snapshot stacks.
 * The caller manages the "current" state — this hook only manages past/future.
 */
export function useUndoRedo<T>(): UndoRedoControls<T> {
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);
  const [, setTick] = useState(0);
  const tick = useCallback(() => setTick(c => c + 1), []);

  const record = useCallback((state: T) => {
    past.current = [...past.current.slice(-(MAX_HISTORY - 1)), state];
    future.current = [];
    tick();
  }, [tick]);

  const undo = useCallback((current: T): T | null => {
    if (past.current.length === 0) return null;
    const prev = past.current[past.current.length - 1];
    past.current = past.current.slice(0, -1);
    future.current = [...future.current, current];
    tick();
    return prev;
  }, [tick]);

  const redo = useCallback((current: T): T | null => {
    if (future.current.length === 0) return null;
    const next = future.current[future.current.length - 1];
    future.current = future.current.slice(0, -1);
    past.current = [...past.current, current];
    tick();
    return next;
  }, [tick]);

  return {
    record,
    undo,
    redo,
    get canUndo() { return past.current.length > 0; },
    get canRedo() { return future.current.length > 0; },
  };
}
