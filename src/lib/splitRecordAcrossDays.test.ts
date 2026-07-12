import { describe, expect, it } from "vitest";
import type { WorkRecord } from "./records";
import { splitRecordAcrossDays } from "./splitRecordAcrossDays";

function makeActiveRecord(overrides: Partial<WorkRecord>): WorkRecord {
  return {
    id: "original",
    date: "2026-07-05",
    startedAt: new Date(2026, 6, 5, 10, 0, 0).toISOString(),
    endedAt: null,
    memo: "客先訪問",
    adjustmentMinutes: 10,
    ...overrides,
  };
}

describe("splitRecordAcrossDays", () => {
  it("returns a single closed record when start and end are on the same day", () => {
    const record = makeActiveRecord({});
    const endedAt = new Date(2026, 6, 5, 11, 30, 0);

    const segments = splitRecordAcrossDays(record, endedAt, () => "new-id");

    expect(segments).toEqual([
      {
        id: "original",
        date: "2026-07-05",
        startedAt: new Date(2026, 6, 5, 10, 0, 0).toISOString(),
        endedAt: new Date(2026, 6, 5, 11, 30, 0).toISOString(),
        memo: "客先訪問",
        adjustmentMinutes: 10,
      },
    ]);
  });

  it("splits into two records at exact midnight when ending after midnight", () => {
    const record = makeActiveRecord({
      startedAt: new Date(2026, 6, 5, 23, 30, 0).toISOString(),
    });
    const endedAt = new Date(2026, 6, 6, 1, 0, 0);

    const segments = splitRecordAcrossDays(record, endedAt, () => "new-id");

    const midnight = new Date(2026, 6, 6, 0, 0, 0).toISOString();
    expect(segments).toEqual([
      {
        id: "original",
        date: "2026-07-05",
        startedAt: new Date(2026, 6, 5, 23, 30, 0).toISOString(),
        endedAt: midnight,
        memo: "客先訪問",
        adjustmentMinutes: 10,
      },
      {
        id: "new-id",
        date: "2026-07-06",
        startedAt: midnight,
        endedAt: new Date(2026, 6, 6, 1, 0, 0).toISOString(),
        memo: "",
        adjustmentMinutes: 0,
      },
    ]);
  });

  it("has no gap or overlap between the two segments' boundary instants", () => {
    const record = makeActiveRecord({
      startedAt: new Date(2026, 6, 5, 23, 30, 0).toISOString(),
    });
    const endedAt = new Date(2026, 6, 6, 1, 0, 0);

    const [first, second] = splitRecordAcrossDays(record, endedAt, () => "new-id");

    expect(first.endedAt).toBe(second.startedAt);
  });

  it("splits into three records when spanning two midnights", () => {
    const record = makeActiveRecord({
      startedAt: new Date(2026, 6, 5, 23, 0, 0).toISOString(),
    });
    const endedAt = new Date(2026, 6, 7, 1, 0, 0);
    let nextId = 0;
    const createId = () => `generated-${++nextId}`;

    const segments = splitRecordAcrossDays(record, endedAt, createId);

    expect(segments.map((s) => s.date)).toEqual(["2026-07-05", "2026-07-06", "2026-07-07"]);
    expect(segments.map((s) => s.id)).toEqual(["original", "generated-1", "generated-2"]);
    expect(segments[1].startedAt).toBe(new Date(2026, 6, 6, 0, 0, 0).toISOString());
    expect(segments[1].endedAt).toBe(new Date(2026, 6, 7, 0, 0, 0).toISOString());
  });
});
