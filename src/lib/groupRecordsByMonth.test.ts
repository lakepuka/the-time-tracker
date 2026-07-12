import { describe, expect, it } from "vitest";
import { groupRecordsByYearAndMonth } from "./groupRecordsByMonth";
import type { WorkRecord } from "./records";

function makeRecord(overrides: Partial<WorkRecord>): WorkRecord {
  return {
    id: "id",
    date: "2026-07-01",
    startedAt: new Date(2026, 6, 1, 10, 0, 0).toISOString(),
    endedAt: new Date(2026, 6, 1, 11, 0, 0).toISOString(),
    ...overrides,
  };
}

describe("groupRecordsByYearAndMonth", () => {
  it("groups records into years and months, most recent first", () => {
    const records: WorkRecord[] = [
      makeRecord({
        id: "1",
        date: "2026-06-10",
        startedAt: new Date(2026, 5, 10, 9, 0, 0).toISOString(),
        endedAt: new Date(2026, 5, 10, 10, 0, 0).toISOString(),
      }),
      makeRecord({
        id: "2",
        date: "2026-07-01",
        startedAt: new Date(2026, 6, 1, 9, 0, 0).toISOString(),
        endedAt: new Date(2026, 6, 1, 10, 0, 0).toISOString(),
      }),
      makeRecord({
        id: "3",
        date: "2025-12-25",
        startedAt: new Date(2025, 11, 25, 9, 0, 0).toISOString(),
        endedAt: new Date(2025, 11, 25, 10, 0, 0).toISOString(),
      }),
      makeRecord({
        id: "4",
        date: "2026-07-15",
        startedAt: new Date(2026, 6, 15, 9, 0, 0).toISOString(),
        endedAt: new Date(2026, 6, 15, 10, 0, 0).toISOString(),
      }),
    ];

    const groups = groupRecordsByYearAndMonth(records);

    expect(groups.map((g) => g.yearKey)).toEqual(["2026", "2025"]);
    expect(groups[0].months.map((m) => m.monthKey)).toEqual(["2026-07", "2026-06"]);
    expect(groups[0].months[0].records.map((r) => r.id)).toEqual(["4", "2"]);
    expect(groups[0].months[0].month).toBe(6);
    expect(groups[1].months.map((m) => m.monthKey)).toEqual(["2025-12"]);
  });

  it("returns an empty array for no records", () => {
    expect(groupRecordsByYearAndMonth([])).toEqual([]);
  });
});
