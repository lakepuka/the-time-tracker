import { describe, expect, it } from "vitest";
import {
  computeDurationMinutes,
  computeNetDurationMinutes,
  formatDurationMinutes,
  sumNetDurationMinutes,
} from "./duration";

describe("computeDurationMinutes", () => {
  it("computes whole minutes between start and end", () => {
    const minutes = computeDurationMinutes("2026-07-05T10:00:00.000Z", "2026-07-05T11:30:00.000Z");
    expect(minutes).toBe(90);
  });

  it("uses the provided clock when the record is still in progress", () => {
    const minutes = computeDurationMinutes(
      "2026-07-05T10:00:00.000Z",
      null,
      () => new Date("2026-07-05T10:45:00.000Z"),
    );
    expect(minutes).toBe(45);
  });

  it("never returns a negative duration", () => {
    const minutes = computeDurationMinutes("2026-07-05T10:00:00.000Z", "2026-07-05T09:00:00.000Z");
    expect(minutes).toBe(0);
  });
});

describe("computeNetDurationMinutes", () => {
  it("subtracts the adjustment from the raw duration", () => {
    const minutes = computeNetDurationMinutes(
      "2026-07-05T10:00:00.000Z",
      "2026-07-05T11:30:00.000Z",
      15,
    );
    expect(minutes).toBe(75);
  });

  it("defaults the adjustment to zero", () => {
    const minutes = computeNetDurationMinutes(
      "2026-07-05T10:00:00.000Z",
      "2026-07-05T11:00:00.000Z",
    );
    expect(minutes).toBe(60);
  });

  it("never returns a negative duration even if the adjustment is larger than the raw duration", () => {
    const minutes = computeNetDurationMinutes(
      "2026-07-05T10:00:00.000Z",
      "2026-07-05T10:10:00.000Z",
      30,
    );
    expect(minutes).toBe(0);
  });
});

describe("sumNetDurationMinutes", () => {
  it("sums the net duration of finished records", () => {
    const total = sumNetDurationMinutes([
      {
        id: "1",
        date: "2026-07-05",
        startedAt: "2026-07-05T10:00:00.000Z",
        endedAt: "2026-07-05T11:30:00.000Z",
        adjustmentMinutes: 15,
      },
      {
        id: "2",
        date: "2026-07-06",
        startedAt: "2026-07-06T09:00:00.000Z",
        endedAt: "2026-07-06T09:30:00.000Z",
      },
    ]);

    expect(total).toBe(105);
  });

  it("excludes in-progress records", () => {
    const total = sumNetDurationMinutes([
      {
        id: "1",
        date: "2026-07-05",
        startedAt: "2026-07-05T10:00:00.000Z",
        endedAt: null,
      },
    ]);

    expect(total).toBe(0);
  });

  it("returns zero for an empty list", () => {
    expect(sumNetDurationMinutes([])).toBe(0);
  });
});

describe("formatDurationMinutes", () => {
  it("formats hours and minutes in Japanese by default", () => {
    expect(formatDurationMinutes(90)).toBe("1時間30分");
    expect(formatDurationMinutes(45)).toBe("0時間45分");
    expect(formatDurationMinutes(0)).toBe("0時間0分");
  });

  it("formats hours and minutes in English when requested", () => {
    expect(formatDurationMinutes(90, "en")).toBe("1h 30m");
    expect(formatDurationMinutes(45, "en")).toBe("0h 45m");
    expect(formatDurationMinutes(0, "en")).toBe("0h 0m");
  });
});
