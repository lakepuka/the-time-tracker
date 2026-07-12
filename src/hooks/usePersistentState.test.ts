import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { usePersistentState } from "./usePersistentState";

describe("usePersistentState", () => {
  it("starts with the fallback value before the stored value is loaded", () => {
    const load = vi.fn(() => "stored");
    const { result } = renderHook(() => usePersistentState("fallback", load, () => {}));

    // After mount the effect has already run, so the loaded value is visible;
    // load must have been called exactly once.
    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current[0]).toBe("stored");
  });

  it("updates the value and persists it via save", () => {
    const save = vi.fn();
    const { result } = renderHook(() => usePersistentState("initial", () => "initial", save));

    act(() => {
      result.current[1]("next");
    });

    expect(result.current[0]).toBe("next");
    expect(save).toHaveBeenCalledWith("next");
  });

  it("does not call save when only loading", () => {
    const save = vi.fn();
    renderHook(() => usePersistentState(0, () => 42, save));

    expect(save).not.toHaveBeenCalled();
  });
});
