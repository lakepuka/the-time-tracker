import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_TAB_ID,
  generateTabName,
  loadActiveTabId,
  loadTabs,
  saveActiveTabId,
  saveTabs,
  type Tab,
} from "./tabs";

describe("tabs repository", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns a single default tab when nothing is stored", () => {
    expect(loadTabs()).toEqual([{ id: DEFAULT_TAB_ID, name: "Timer" }]);
  });

  it("returns the default tab when the stored value is invalid JSON", () => {
    localStorage.setItem("work-timer-tabs", "not-json");
    expect(loadTabs()).toEqual([{ id: DEFAULT_TAB_ID, name: "Timer" }]);
  });

  it("returns the default tab when the stored value is an empty array", () => {
    localStorage.setItem("work-timer-tabs", JSON.stringify([]));
    expect(loadTabs()).toEqual([{ id: DEFAULT_TAB_ID, name: "Timer" }]);
  });

  it("saves and loads a custom list of tabs", () => {
    const tabs: Tab[] = [
      { id: DEFAULT_TAB_ID, name: "Timer" },
      { id: "tab-2", name: "副業B" },
    ];

    saveTabs(tabs);

    expect(loadTabs()).toEqual(tabs);
  });

  it("defaults the active tab id to the default tab", () => {
    expect(loadActiveTabId()).toBe(DEFAULT_TAB_ID);
  });

  it("saves and loads the active tab id", () => {
    saveActiveTabId("tab-2");
    expect(loadActiveTabId()).toBe("tab-2");
  });
});

describe("generateTabName", () => {
  it("returns the base name with 1 when no numbered names exist", () => {
    const tabs: Tab[] = [{ id: DEFAULT_TAB_ID, name: "Timer" }];
    expect(generateTabName(tabs, "Timer")).toBe("Timer 1");
  });

  it("skips numbers already in use", () => {
    const tabs: Tab[] = [
      { id: "a", name: "Timer 1" },
      { id: "b", name: "Timer 2" },
    ];
    expect(generateTabName(tabs, "Timer")).toBe("Timer 3");
  });

  it("fills the lowest available gap", () => {
    const tabs: Tab[] = [
      { id: "a", name: "Timer 1" },
      { id: "c", name: "Timer 3" },
    ];
    expect(generateTabName(tabs, "Timer")).toBe("Timer 2");
  });

  it("ignores an empty-named tab being created", () => {
    const tabs: Tab[] = [
      { id: "a", name: "Timer 1" },
      { id: "b", name: "" },
    ];
    expect(generateTabName(tabs, "Timer")).toBe("Timer 2");
  });
});
