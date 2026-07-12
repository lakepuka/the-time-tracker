import { describe, expect, it } from "vitest";
import { computeMonthlyTotals, formatMonthLabel } from "./monthlySummary";
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

describe("computeMonthlyTotals", () => {
  it("sums finished durations per month, most recent month first", () => {
    const records: WorkRecord[] = [
      makeRecord({
        id: "1",
        date: "2026-07-01",
        startedAt: new Date(2026, 6, 1, 10, 0, 0).toISOString(),
        endedAt: new Date(2026, 6, 1, 11, 0, 0).toISOString(),
      }),
      makeRecord({
        id: "2",
        date: "2026-07-15",
        startedAt: new Date(2026, 6, 15, 9, 0, 0).toISOString(),
        endedAt: new Date(2026, 6, 15, 9, 30, 0).toISOString(),
      }),
      makeRecord({
        id: "3",
        date: "2026-06-20",
        startedAt: new Date(2026, 5, 20, 10, 0, 0).toISOString(),
        endedAt: new Date(2026, 5, 20, 12, 0, 0).toISOString(),
      }),
    ];

    expect(computeMonthlyTotals(records)).toEqual([
      { month: "2026-07", totalMinutes: 90 },
      { month: "2026-06", totalMinutes: 120 },
    ]);
  });

  it("excludes in-progress records", () => {
    const records: WorkRecord[] = [makeRecord({ endedAt: null })];
    expect(computeMonthlyTotals(records)).toEqual([]);
  });

  it("returns an empty array for no records", () => {
    expect(computeMonthlyTotals([])).toEqual([]);
  });

  it("subtracts each record's adjustment from its month's total", () => {
    const records: WorkRecord[] = [
      makeRecord({
        startedAt: new Date(2026, 6, 1, 10, 0, 0).toISOString(),
        endedAt: new Date(2026, 6, 1, 11, 0, 0).toISOString(),
        adjustmentMinutes: 15,
      }),
    ];

    expect(computeMonthlyTotals(records)).toEqual([{ month: "2026-07", totalMinutes: 45 }]);
  });
});

describe("formatMonthLabel", () => {
  it("formats a YYYY-MM key as a Japanese month label by default", () => {
    expect(formatMonthLabel("2026-07")).toBe("2026年07月");
  });

  it("formats a YYYY-MM key as an English month label when requested", () => {
    expect(formatMonthLabel("2026-07", "en")).toBe("Jul 2026");
  });
});
