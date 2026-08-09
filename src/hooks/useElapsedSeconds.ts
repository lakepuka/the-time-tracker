"use client";

import { useEffect, useRef, useState } from "react";
import { elapsedSeconds } from "@/lib/elapsed";

type UseElapsedSecondsDeps = {
  now?: () => number;
};

/**
 * Seconds since `startedAt`, re-read once a second while a timer is running.
 *
 * Returns 0 (and schedules nothing) when `startedAt` is null, so a stopped
 * timer costs no interval. The tick recomputes from the clock rather than
 * incrementing a counter, so it stays correct across a backgrounded tab.
 */
export function useElapsedSeconds(
  startedAt: string | null,
  deps: UseElapsedSecondsDeps = {},
): number {
  const [seconds, setSeconds] = useState(0);

  // Read the clock through a ref so a new `now` function each render doesn't
  // tear down and rebuild the interval; only `startedAt` should do that.
  const nowRef = useRef(deps.now);
  nowRef.current = deps.now;

  useEffect(() => {
    if (!startedAt) {
      setSeconds(0);
      return;
    }

    const read = () => setSeconds(elapsedSeconds(startedAt, (nowRef.current ?? Date.now)()));
    read();
    const id = setInterval(read, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  return seconds;
}
