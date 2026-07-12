import { describe, expect, it } from "vitest";
import { computeDailyTotals, formatHoursShort, heatLevel } from "./dailyTotals";
import type { WorkRecord } from "./records";

describe("computeDailyTotals", () => {
  it("sums the net duration of finished records per day", () => {
    const records: WorkRecord[] = [
      {
        id: "1",
        date: "2026-07-05",
        startedAt: new Date(2026, 6, 5, 9, 0, 0).toISOString(),
        endedAt: new Date(2026, 6, 5, 10, 0, 0).toISOString(),
      },
      {
        id: "2",
        date: "2026-07-05",
        startedAt: new Date(2026, 6, 5, 13, 0, 0).toISOString(),
        endedAt: new Date(2026, 6, 5, 13, 30, 0).toISOString(),
      },
      {
        id: "3",
        date: "2026-07-06",
        startedAt: new Date(2026, 6, 6, 9, 0, 0).toISOString(),
        endedAt: new Date(2026, 6, 6, 9, 15, 0).toISOString(),
        adjustmentMinutes: 5,
      },
    ];

    expect(computeDailyTotals(records)).toEqual({
      "2026-07-05": 90,
      "2026-07-06": 10,
    });
  });

  it("excludes in-progress records", () => {
    const records: WorkRecord[] = [
      {
        id: "1",
        date: "2026-07-05",
        startedAt: new Date(2026, 6, 5, 9, 0, 0).toISOString(),
        endedAt: null,
      },
    ];

    expect(computeDailyTotals(records)).toEqual({});
  });
});

describe("formatHoursShort", () => {
  it("formats whole hours without a decimal", () => {
    expect(formatHoursShort(60)).toBe("1h");
  });

  it("formats fractional hours with one decimal", () => {
    expect(formatHoursShort(90)).toBe("1.5h");
  });

  it("rounds to the nearest tenth of an hour", () => {
    expect(formatHoursShort(45)).toBe("0.8h");
  });
});

describe("heatLevel", () => {
  it("returns 0 for no worked time", () => {
    expect(heatLevel(0)).toBe(0);
  });

  it("returns 1 for under an hour", () => {
    expect(heatLevel(30)).toBe(1);
  });

  it("returns 2 for one to three hours", () => {
    expect(heatLevel(120)).toBe(2);
  });

  it("returns 3 for three to six hours", () => {
    expect(heatLevel(240)).toBe(3);
  });

  it("returns 4 for six hours or more", () => {
    expect(heatLevel(400)).toBe(4);
  });
});
