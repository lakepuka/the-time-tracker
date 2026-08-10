"use client";

import { useCallback, useEffect, useState } from "react";
import type { Tab } from "@/lib/tabs";
import {
  DEFAULT_TIMER_PRECISION,
  loadTimerPrecision,
  saveTimerPrecision,
  type TimerPrecision,
} from "@/lib/timerPrecision";

/**
 * Per-tab measurement precision, hydrated from localStorage on the client.
 *
 * Lifted above both the timer (which needs the active tab's value at start/stop)
 * and the settings panel (which edits every tab's value), so a change in one is
 * seen by the other without a remount.
 */
export function useTimerPrecisions(tabs: Tab[]) {
  const [precisions, setPrecisions] = useState<Record<string, TimerPrecision>>({});

  // localStorage is unavailable during SSR; hydrate after mount and as tabs appear.
  useEffect(() => {
    setPrecisions((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const tab of tabs) {
        if (!(tab.id in next)) {
          next[tab.id] = loadTimerPrecision(tab.id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [tabs]);

  const setPrecision = useCallback((tabId: string, precision: TimerPrecision) => {
    saveTimerPrecision(tabId, precision);
    setPrecisions((prev) => ({ ...prev, [tabId]: precision }));
  }, []);

  const getPrecision = useCallback(
    (tabId: string): TimerPrecision => precisions[tabId] ?? DEFAULT_TIMER_PRECISION,
    [precisions],
  );

  return { getPrecision, setPrecision };
}
