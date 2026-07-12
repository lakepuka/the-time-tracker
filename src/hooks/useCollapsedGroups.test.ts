import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { loadCollapsedGroups, saveCollapsedGroups } from "@/lib/collapsedGroups";
import { useCollapsedGroups } from "./useCollapsedGroups";

const TAB_ID = "tab-1";

describe("useCollapsedGroups", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("treats every group as expanded by default", () => {
    const { result } = renderHook(() => useCollapsedGroups(TAB_ID));
    expect(result.current.isCollapsed("2026")).toBe(false);
  });

  it("loads previously collapsed groups from storage on mount", () => {
    saveCollapsedGroups(TAB_ID, ["2026-06"]);

    const { result } = renderHook(() => useCollapsedGroups(TAB_ID));

    expect(result.current.isCollapsed("2026-06")).toBe(true);
    expect(result.current.isCollapsed("2026-07")).toBe(false);
  });

  it("keeps collapsed groups separate per tab", () => {
    saveCollapsedGroups("tab-a", ["2026-06"]);

    const { result } = renderHook(() => useCollapsedGroups("tab-b"));

    expect(result.current.isCollapsed("2026-06")).toBe(false);
  });

  it("collapses a group when toggled and persists the change", () => {
    const { result } = renderHook(() => useCollapsedGroups(TAB_ID));

    act(() => {
      result.current.toggle("2026-07");
    });

    expect(result.current.isCollapsed("2026-07")).toBe(true);
    expect(loadCollapsedGroups(TAB_ID)).toEqual(["2026-07"]);
  });

  it("expands a collapsed group when toggled again", () => {
    saveCollapsedGroups(TAB_ID, ["2026-07"]);
    const { result } = renderHook(() => useCollapsedGroups(TAB_ID));

    act(() => {
      result.current.toggle("2026-07");
    });

    expect(result.current.isCollapsed("2026-07")).toBe(false);
    expect(loadCollapsedGroups(TAB_ID)).toEqual([]);
  });

  it("expand() removes a group from the collapsed set without toggling it back on", () => {
    saveCollapsedGroups(TAB_ID, ["2026-07"]);
    const { result } = renderHook(() => useCollapsedGroups(TAB_ID));

    act(() => {
      result.current.expand("2026-07");
    });

    expect(result.current.isCollapsed("2026-07")).toBe(false);
    expect(loadCollapsedGroups(TAB_ID)).toEqual([]);
  });

  it("expand() is a no-op when the group is already expanded", () => {
    const { result } = renderHook(() => useCollapsedGroups(TAB_ID));

    act(() => {
      result.current.expand("2026-07");
    });

    expect(result.current.isCollapsed("2026-07")).toBe(false);
    expect(loadCollapsedGroups(TAB_ID)).toEqual([]);
  });
});
