import { describe, expect, it } from "vitest";
import { buildDatePatch } from "./recordEdits";
import type { WorkRecord } from "./records";

const finishedRecord: WorkRecord = {
  id: "1",
  date: "2026-07-05",
  startedAt: new Date(2026, 6, 5, 10, 0, 0).toISOString(),
  endedAt: new Date(2026, 6, 5, 11, 30, 0).toISOString(),
};

const activeRecord: WorkRecord = {
  id: "2",
  date: "2026-07-06",
  startedAt: new Date(2026, 6, 6, 9, 0, 0).toISOString(),
  endedAt: null,
};

describe("buildDatePatch", () => {
  it("combines the new date with the existing start time", () => {
    const patch = buildDatePatch(finishedRecord, "2026-07-08");
    expect(patch.startedAt).toBe(new Date(2026, 6, 8, 10, 0, 0).toISOString());
  });

  it("also combines the new date with the existing end time when present", () => {
    const patch = buildDatePatch(finishedRecord, "2026-07-08");
    expect(patch.endedAt).toBe(new Date(2026, 6, 8, 11, 30, 0).toISOString());
  });

  it("omits endedAt from the patch when the record has no end time yet", () => {
    const patch = buildDatePatch(activeRecord, "2026-07-09");
    expect(patch).not.toHaveProperty("endedAt");
  });

  it("sets the date field to the new date", () => {
    const patch = buildDatePatch(finishedRecord, "2026-07-08");
    expect(patch.date).toBe("2026-07-08");
  });
});
