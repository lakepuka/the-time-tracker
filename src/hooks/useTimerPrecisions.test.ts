import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import type { Tab } from "@/lib/tabs";
import { saveTimerPrecision } from "@/lib/timerPrecision";
import { useTimerPrecisions } from "./useTimerPrecisions";

const tabs: Tab[] = [
  { id: "a", name: "A" },
  { id: "b", name: "B" },
];

describe("useTimerPrecisions", () => {
  beforeEach(() => localStorage.clear());

  it("defaults every tab to minute precision", () => {
    const { result } = renderHook(() => useTimerPrecisions(tabs));
    expect(result.current.getPrecision("a")).toBe("minute");
    expect(result.current.getPrecision("b")).toBe("minute");
  });

  it("hydrates a previously saved per-tab precision", () => {
    saveTimerPrecision("b", "second");
    const { result } = renderHook(() => useTimerPrecisions(tabs));
    expect(result.current.getPrecision("a")).toBe("minute");
    expect(result.current.getPrecision("b")).toBe("second");
  });

  it("updates and persists a tab's precision", () => {
    const { result } = renderHook(() => useTimerPrecisions(tabs));

    act(() => result.current.setPrecision("a", "second"));

    expect(result.current.getPrecision("a")).toBe("second");
    expect(localStorage.getItem("work-timer-precision:a")).toBe("second");
    // The other tab is untouched.
    expect(result.current.getPrecision("b")).toBe("minute");
  });
});
