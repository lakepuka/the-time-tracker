import { beforeEach, describe, expect, it } from "vitest";
import { loadColorSchemeMode, saveColorSchemeMode } from "./colorScheme";

describe("colorScheme mode", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to system when nothing is stored", () => {
    expect(loadColorSchemeMode()).toBe("system");
  });

  it("falls back to system for an invalid stored value", () => {
    localStorage.setItem("work-timer-color-scheme", "not-a-real-mode");
    expect(loadColorSchemeMode()).toBe("system");
  });

  it("saves and loads a chosen mode", () => {
    saveColorSchemeMode("dark");
    expect(loadColorSchemeMode()).toBe("dark");
  });
});
