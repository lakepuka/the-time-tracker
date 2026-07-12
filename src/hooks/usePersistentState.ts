"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * State backed by a load/save pair (typically localStorage).
 * Starts with `fallback`, then loads the stored value once after mount —
 * localStorage doesn't exist during SSR, so deferring the read avoids
 * a hydration mismatch.
 */
export function usePersistentState<T>(fallback: T, load: () => T, save: (value: T) => void) {
  const [value, setValueState] = useState<T>(fallback);
  // Read via a ref so the mount-only load never re-runs (and never stomps
  // later updates) even if the caller passes a new `load` identity per render.
  const loadRef = useRef(load);

  useEffect(() => {
    setValueState(loadRef.current());
  }, []);

  const setValue = useCallback(
    (next: T) => {
      setValueState(next);
      save(next);
    },
    [save],
  );

  return [value, setValue] as const;
}
