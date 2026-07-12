import { describe, expect, it } from "vitest";
import { buildCsvFilename, parseCsv, recordsToCsv } from "./csv";
import type { WorkRecord } from "./records";

describe("recordsToCsv", () => {
  it("includes a header row and one row per record, sorted by start time", () => {
    const records: WorkRecord[] = [
      {
        id: "1",
        date: "2026-07-05",
        startedAt: new Date(2026, 6, 5, 10, 0, 0).toISOString(),
        endedAt: new Date(2026, 6, 5, 11, 30, 0).toISOString(),
        adjustmentMinutes: 15,
        memo: "客先訪問",
      },
    ];

    const csv = recordsToCsv(records);
    const lines = csv.split("\r\n");

    expect(lines[0]).toBe("日付,開始,終了,調整(分),稼働時間(分),備考");
    expect(lines[1]).toBe("2026-07-05,10:00,11:30,15,75,客先訪問");
  });

  it("leaves the end time and duration blank for an in-progress record", () => {
    const records: WorkRecord[] = [
      {
        id: "1",
        date: "2026-07-05",
        startedAt: new Date(2026, 6, 5, 10, 0, 0).toISOString(),
        endedAt: null,
      },
    ];

    const csv = recordsToCsv(records);
    const lines = csv.split("\r\n");

    expect(lines[1]).toBe("2026-07-05,10:00,,0,,");
  });

  it("quotes fields that contain a comma", () => {
    const records: WorkRecord[] = [
      {
        id: "1",
        date: "2026-07-05",
        startedAt: new Date(2026, 6, 5, 10, 0, 0).toISOString(),
        endedAt: new Date(2026, 6, 5, 11, 0, 0).toISOString(),
        memo: "A社,B社",
      },
    ];

    const csv = recordsToCsv(records);
    const lines = csv.split("\r\n");

    expect(lines[1]).toBe('2026-07-05,10:00,11:00,0,60,"A社,B社"');
  });

  it("sorts rows chronologically regardless of input order", () => {
    const records: WorkRecord[] = [
      {
        id: "later",
        date: "2026-07-06",
        startedAt: new Date(2026, 6, 6, 9, 0, 0).toISOString(),
        endedAt: new Date(2026, 6, 6, 10, 0, 0).toISOString(),
      },
      {
        id: "earlier",
        date: "2026-07-05",
        startedAt: new Date(2026, 6, 5, 9, 0, 0).toISOString(),
        endedAt: new Date(2026, 6, 5, 10, 0, 0).toISOString(),
      },
    ];

    const csv = recordsToCsv(records);
    const lines = csv.split("\r\n");

    expect(lines[1]).toContain("2026-07-05");
    expect(lines[2]).toContain("2026-07-06");
  });

  it("uses English headers when requested", () => {
    const csv = recordsToCsv([], "en");
    expect(csv).toBe("Date,Start,End,Adjustment (min),Duration (min),Notes");
  });
});

describe("buildCsvFilename", () => {
  it("combines the tab name and a timestamp", () => {
    const now = new Date(2026, 6, 6, 14, 5, 9);
    expect(buildCsvFilename("タイマー", now)).toBe("タイマー_20260706-140509.csv");
  });

  it("replaces filesystem-unsafe characters in the tab name", () => {
    const now = new Date(2026, 6, 6, 14, 5, 9);
    expect(buildCsvFilename("A/B:C*D", now)).toBe("A_B_C_D_20260706-140509.csv");
  });

  it("falls back to a generic name when the tab name is blank", () => {
    const now = new Date(2026, 6, 6, 14, 5, 9);
    expect(buildCsvFilename("   ", now)).toBe("records_20260706-140509.csv");
  });
});

describe("parseCsv", () => {
  it("parses a completed record back out of an exported CSV", () => {
    const csv =
      "日付,開始,終了,調整(分),稼働時間(分),備考\r\n2026-07-05,10:00,11:30,15,75,客先訪問";

    const records = parseCsv(csv);

    expect(records).toEqual([
      {
        date: "2026-07-05",
        startedAt: new Date(2026, 6, 5, 10, 0, 0).toISOString(),
        endedAt: new Date(2026, 6, 5, 11, 30, 0).toISOString(),
        adjustmentMinutes: 15,
        memo: "客先訪問",
      },
    ]);
  });

  it("treats a blank end time as an in-progress record", () => {
    const csv = "Date,Start,End,Adjustment (min),Duration (min),Notes\r\n2026-07-05,10:00,,0,,";

    const records = parseCsv(csv);

    expect(records[0].endedAt).toBeNull();
  });

  it("unescapes quoted fields that contain a comma", () => {
    const csv =
      '日付,開始,終了,調整(分),稼働時間(分),備考\r\n2026-07-05,10:00,11:00,0,60,"A社,B社"';

    const records = parseCsv(csv);

    expect(records[0].memo).toBe("A社,B社");
  });

  it("strips a leading BOM before parsing the header", () => {
    const csv = "﻿日付,開始,終了,調整(分),稼働時間(分),備考\r\n2026-07-05,10:00,11:00,0,60,";

    const records = parseCsv(csv);

    expect(records).toHaveLength(1);
    expect(records[0].date).toBe("2026-07-05");
  });

  it("ignores blank trailing lines", () => {
    const csv = "日付,開始,終了,調整(分),稼働時間(分),備考\r\n2026-07-05,10:00,11:00,0,60,\r\n";

    const records = parseCsv(csv);

    expect(records).toHaveLength(1);
  });

  it("returns an empty array for a header-only CSV", () => {
    const csv = "日付,開始,終了,調整(分),稼働時間(分),備考";

    expect(parseCsv(csv)).toEqual([]);
  });
});
