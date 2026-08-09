import { pad2 } from "./dateTimeInput";

/** Whole seconds between a start instant and now, clamped at zero. */
export function elapsedSeconds(startedAt: string, nowMs: number): number {
  const start = new Date(startedAt).getTime();
  if (Number.isNaN(start)) return 0;
  return Math.max(0, Math.floor((nowMs - start) / 1000));
}

/**
 * A running clock as `H:MM:SS` — hours unpadded, minutes and seconds padded.
 * The hour place grows without a cap so a long-forgotten timer still reads.
 */
export function formatElapsed(totalSeconds: number): string {
  const safe = Number.isFinite(totalSeconds) && totalSeconds > 0 ? Math.floor(totalSeconds) : 0;
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return `${hours}:${pad2(minutes)}:${pad2(seconds)}`;
}
