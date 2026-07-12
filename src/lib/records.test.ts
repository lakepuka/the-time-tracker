import { beforeEach, describe, expect, it } from "vitest";
import { loadRecords, saveRecords, type WorkRecord } from "./records";
import { DEFAULT_TAB_ID } from "./tabs";

const LEGACY_KEY = "work-timer-records";

describe("records repository", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns an empty array when nothing is stored", () => {
    expect(loadRecords("tab-1")).toEqual([]);
  });

  it("returns an empty array when the stored value is invalid JSON", () => {
    localStorage.setItem("work-timer-records:tab-1", "not-json");
    expect(loadRecords("tab-1")).toEqual([]);
  });

  it("returns an empty array when the stored value is not an array", () => {
    localStorage.setItem("work-timer-records:tab-1", JSON.stringify({ foo: "bar" }));
    expect(loadRecords("tab-1")).toEqual([]);
  });

  it("saves records under a tab-scoped key and loads them back", () => {
    const records: WorkRecord[] = [
      {
        id: "1",
        date: "2026-07-05",
        startedAt: "2026-07-05T10:00:00.000Z",
        endedAt: "2026-07-05T11:00:00.000Z",
      },
    ];

    saveRecords("tab-1", records);

    expect(loadRecords("tab-1")).toEqual(records);
  });

  it("keeps records for different tabs separate", () => {
    const tab1Records: WorkRecord[] = [
      { id: "1", date: "2026-07-05", startedAt: "2026-07-05T10:00:00.000Z", endedAt: null },
    ];
    const tab2Records: WorkRecord[] = [
      { id: "2", date: "2026-07-06", startedAt: "2026-07-06T10:00:00.000Z", endedAt: null },
    ];

    saveRecords("tab-1", tab1Records);
    saveRecords("tab-2", tab2Records);

    expect(loadRecords("tab-1")).toEqual(tab1Records);
    expect(loadRecords("tab-2")).toEqual(tab2Records);
  });

  it("migrates pre-tabs data stored under the legacy key into the default tab", () => {
    const legacyRecords: WorkRecord[] = [
      { id: "legacy", date: "2026-07-01", startedAt: "2026-07-01T09:00:00.000Z", endedAt: null },
    ];
    localStorage.setItem(LEGACY_KEY, JSON.stringify(legacyRecords));

    expect(loadRecords(DEFAULT_TAB_ID)).toEqual(legacyRecords);
  });

  it("does not use legacy data for a non-default tab", () => {
    const legacyRecords: WorkRecord[] = [
      { id: "legacy", date: "2026-07-01", startedAt: "2026-07-01T09:00:00.000Z", endedAt: null },
    ];
    localStorage.setItem(LEGACY_KEY, JSON.stringify(legacyRecords));

    expect(loadRecords("tab-2")).toEqual([]);
  });
});
