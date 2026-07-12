import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { loadShowSummary } from "@/lib/summaryPreference";
import { useShowSummary } from "./useShowSummary";

describe("useShowSummary", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to hiding the summary", () => {
    const { result } = renderHook(() => useShowSummary());
    expect(result.current.showSummary).toBe(false);
  });

  it("loads a previously saved preference on mount", () => {
    localStorage.setItem("work-timer-show-summary", "true");
    const { result } = renderHook(() => useShowSummary());

    expect(result.current.showSummary).toBe(true);
  });

  it("updates the preference and persists the change", () => {
    const { result } = renderHook(() => useShowSummary());

    act(() => {
      result.current.setShowSummary(true);
    });

    expect(result.current.showSummary).toBe(true);
    expect(loadShowSummary()).toBe(true);
  });
});
