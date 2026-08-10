import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { saveRecords } from "@/lib/records";
import { DEFAULT_TAB_ID, loadActiveTabId, loadTabs, saveTabs } from "@/lib/tabs";
import { useTabs } from "./useTabs";

describe("useTabs", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with a single default tab active", () => {
    const { result } = renderHook(() => useTabs());

    expect(result.current.tabs).toEqual([{ id: DEFAULT_TAB_ID, name: "Timer1" }]);
    expect(result.current.activeTabId).toBe(DEFAULT_TAB_ID);
  });

  it("loads previously saved tabs and active tab on mount", () => {
    saveTabs([
      { id: DEFAULT_TAB_ID, name: "Timer" },
      { id: "tab-2", name: "副業B" },
    ]);
    localStorage.setItem("work-timer-active-tab", "tab-2");

    const { result } = renderHook(() => useTabs());

    expect(result.current.tabs.map((t) => t.id)).toEqual([DEFAULT_TAB_ID, "tab-2"]);
    expect(result.current.activeTabId).toBe("tab-2");
  });

  it("adds a new tab and makes it active, persisting both", () => {
    const { result } = renderHook(() => useTabs({ createId: () => "new-tab" }));

    act(() => {
      result.current.addTab("副業B");
    });

    expect(result.current.tabs).toEqual([
      { id: DEFAULT_TAB_ID, name: "Timer1" },
      { id: "new-tab", name: "副業B" },
    ]);
    expect(result.current.activeTabId).toBe("new-tab");
    expect(loadTabs()).toEqual(result.current.tabs);
    expect(loadActiveTabId()).toBe("new-tab");
  });

  it("switches the active tab and persists the change", () => {
    saveTabs([
      { id: DEFAULT_TAB_ID, name: "Timer" },
      { id: "tab-2", name: "副業B" },
    ]);
    const { result } = renderHook(() => useTabs());

    act(() => {
      result.current.setActiveTabId("tab-2");
    });

    expect(result.current.activeTabId).toBe("tab-2");
    expect(loadActiveTabId()).toBe("tab-2");
  });

  it("removes a tab, its records, and falls back to the first remaining tab if it was active", () => {
    saveTabs([
      { id: DEFAULT_TAB_ID, name: "Timer" },
      { id: "tab-2", name: "副業B" },
    ]);
    saveRecords("tab-2", [
      { id: "r1", date: "2026-07-01", startedAt: "2026-07-01T09:00:00.000Z", endedAt: null },
    ]);
    const { result } = renderHook(() => useTabs());

    act(() => {
      result.current.setActiveTabId("tab-2");
    });
    act(() => {
      result.current.removeTab("tab-2");
    });

    expect(result.current.tabs).toEqual([{ id: DEFAULT_TAB_ID, name: "Timer" }]);
    expect(result.current.activeTabId).toBe(DEFAULT_TAB_ID);
    expect(localStorage.getItem("work-timer-records:tab-2")).toBeNull();
  });

  it("does not remove the last remaining tab", () => {
    const { result } = renderHook(() => useTabs());

    act(() => {
      result.current.removeTab(DEFAULT_TAB_ID);
    });

    expect(result.current.tabs).toEqual([{ id: DEFAULT_TAB_ID, name: "Timer1" }]);
  });

  it("renames a tab and persists the change", () => {
    saveTabs([
      { id: DEFAULT_TAB_ID, name: "Timer" },
      { id: "tab-2", name: "副業B" },
    ]);
    const { result } = renderHook(() => useTabs());

    act(() => {
      result.current.renameTab("tab-2", "副業C");
    });

    expect(result.current.tabs).toEqual([
      { id: DEFAULT_TAB_ID, name: "Timer" },
      { id: "tab-2", name: "副業C" },
    ]);
    expect(loadTabs()).toEqual(result.current.tabs);
  });

  it("leaves other tabs unaffected when renaming one", () => {
    saveTabs([
      { id: DEFAULT_TAB_ID, name: "Timer" },
      { id: "tab-2", name: "副業B" },
    ]);
    const { result } = renderHook(() => useTabs());

    act(() => {
      result.current.renameTab(DEFAULT_TAB_ID, "メインの仕事");
    });

    expect(result.current.tabs).toEqual([
      { id: DEFAULT_TAB_ID, name: "メインの仕事" },
      { id: "tab-2", name: "副業B" },
    ]);
  });
});
