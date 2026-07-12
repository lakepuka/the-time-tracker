import { beforeEach, describe, expect, it } from "vitest";
import { loadCollapsedGroups, saveCollapsedGroups } from "./collapsedGroups";

describe("collapsedGroups repository", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns an empty array when nothing is stored", () => {
    expect(loadCollapsedGroups("tab-1")).toEqual([]);
  });

  it("returns an empty array when the stored value is invalid JSON", () => {
    localStorage.setItem("work-timer-collapsed-groups:tab-1", "not-json");
    expect(loadCollapsedGroups("tab-1")).toEqual([]);
  });

  it("returns an empty array when the stored value is not an array of strings", () => {
    localStorage.setItem("work-timer-collapsed-groups:tab-1", JSON.stringify({ foo: "bar" }));
    expect(loadCollapsedGroups("tab-1")).toEqual([]);
  });

  it("saves and loads group ids under a tab-scoped key", () => {
    saveCollapsedGroups("tab-1", ["2026", "2026-07"]);
    expect(loadCollapsedGroups("tab-1")).toEqual(["2026", "2026-07"]);
  });

  it("keeps collapsed groups for different tabs separate", () => {
    saveCollapsedGroups("tab-1", ["2026-07"]);
    saveCollapsedGroups("tab-2", ["2025-01"]);

    expect(loadCollapsedGroups("tab-1")).toEqual(["2026-07"]);
    expect(loadCollapsedGroups("tab-2")).toEqual(["2025-01"]);
  });
});
