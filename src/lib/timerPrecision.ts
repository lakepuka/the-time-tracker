export type TimerPrecision = "minute" | "second";

/** Minute is the default: it keeps stored times aligned with the HH:MM display. */
export const DEFAULT_TIMER_PRECISION: TimerPrecision = "minute";

const KEY_PREFIX = "work-timer-precision:";

function isPrecision(value: string): value is TimerPrecision {
  return value === "minute" || value === "second";
}

export function loadTimerPrecision(tabId: string): TimerPrecision {
  const raw = localStorage.getItem(KEY_PREFIX + tabId);
  return raw && isPrecision(raw) ? raw : DEFAULT_TIMER_PRECISION;
}

export function saveTimerPrecision(tabId: string, precision: TimerPrecision): void {
  localStorage.setItem(KEY_PREFIX + tabId, precision);
}

/**
 * A copy of the instant floored to the start of its minute.
 *
 * Applied to a timer's start and stop in minute mode so a sub-minute session
 * reads as the same HH:MM at both ends (duration 0) instead of spanning two
 * displayed minutes while computing to 0 — the confusing case.
 */
export function floorToMinute(date: Date): Date {
  const floored = new Date(date);
  floored.setSeconds(0, 0);
  return floored;
}
