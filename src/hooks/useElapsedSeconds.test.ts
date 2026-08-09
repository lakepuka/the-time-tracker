import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useElapsedSeconds } from "./useElapsedSeconds";

describe("useElapsedSeconds", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 3, 9, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const now = () => Date.now();

  it("returns 0 when no timer is running", () => {
    const { result } = renderHook(() => useElapsedSeconds(null, { now }));
    expect(result.current).toBe(0);
  });

  it("reports the seconds already elapsed on mount", () => {
    const startedAt = new Date(2026, 7, 3, 8, 59, 30).toISOString();
    const { result } = renderHook(() => useElapsedSeconds(startedAt, { now }));
    expect(result.current).toBe(30);
  });

  it("advances once per second while running", () => {
    const startedAt = new Date(2026, 7, 3, 9, 0, 0).toISOString();
    const { result } = renderHook(() => useElapsedSeconds(startedAt, { now }));

    expect(result.current).toBe(0);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current).toBe(3);
  });

  it("resets to 0 when the timer stops", () => {
    const startedAt = new Date(2026, 7, 3, 8, 0, 0).toISOString();
    const { result, rerender } = renderHook(({ start }) => useElapsedSeconds(start, { now }), {
      initialProps: { start: startedAt as string | null },
    });
    expect(result.current).toBe(3600);

    rerender({ start: null });
    expect(result.current).toBe(0);
  });
});
