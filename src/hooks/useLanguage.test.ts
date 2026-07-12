import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { loadLanguage } from "@/lib/i18n";
import { useLanguage } from "./useLanguage";

describe("useLanguage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to English", () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current.language).toBe("en");
    expect(result.current.t.start).toBe("Start");
  });

  it("loads a previously saved language on mount", () => {
    localStorage.setItem("work-timer-language", "ja");
    const { result } = renderHook(() => useLanguage());

    expect(result.current.language).toBe("ja");
    expect(result.current.t.start).toBe("開始");
  });

  it("updates the language and translations, and persists the change", () => {
    const { result } = renderHook(() => useLanguage());

    act(() => {
      result.current.setLanguage("ja");
    });

    expect(result.current.language).toBe("ja");
    expect(result.current.t.start).toBe("開始");
    expect(loadLanguage()).toBe("ja");
  });
});
