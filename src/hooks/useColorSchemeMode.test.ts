import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadColorSchemeMode } from "@/lib/colorScheme";
import { useColorSchemeMode } from "./useColorSchemeMode";

function mockMatchMedia(initialMatches: boolean) {
  const listeners: Array<(event: { matches: boolean }) => void> = [];
  const mql = {
    matches: initialMatches,
    media: "(prefers-color-scheme: dark)",
    addEventListener: (_event: string, callback: (event: { matches: boolean }) => void) => {
      listeners.push(callback);
    },
    removeEventListener: (_event: string, callback: (event: { matches: boolean }) => void) => {
      const index = listeners.indexOf(callback);
      if (index >= 0) listeners.splice(index, 1);
    },
    dispatch(matches: boolean) {
      mql.matches = matches;
      for (const callback of listeners.slice()) {
        callback({ matches });
      }
    },
  };
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => mql),
  );
  return mql;
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useColorSchemeMode", () => {
  it("defaults to system", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useColorSchemeMode());
    expect(result.current.mode).toBe("system");
  });

  it("loads a previously saved mode on mount", () => {
    mockMatchMedia(false);
    localStorage.setItem("work-timer-color-scheme", "dark");
    const { result } = renderHook(() => useColorSchemeMode());
    expect(result.current.mode).toBe("dark");
  });

  it("does not apply the dark class in light mode even if the system prefers dark", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useColorSchemeMode());

    act(() => {
      result.current.setMode("light");
    });

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("applies the dark class in dark mode even if the system prefers light", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useColorSchemeMode());

    act(() => {
      result.current.setMode("dark");
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("follows the system preference in system mode", () => {
    mockMatchMedia(true);
    renderHook(() => useColorSchemeMode());
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("updates the dark class live when the system preference changes while in system mode", () => {
    const mql = mockMatchMedia(false);
    renderHook(() => useColorSchemeMode());
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    act(() => {
      mql.dispatch(true);
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("persists the selected mode", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useColorSchemeMode());

    act(() => {
      result.current.setMode("dark");
    });

    expect(loadColorSchemeMode()).toBe("dark");
  });
});
