import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { loadRecords, saveRecords } from "@/lib/records";
import { useWorkTimer } from "./useWorkTimer";

const TAB_ID = "tab-1";

describe("useWorkTimer", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with no active record and no records", () => {
    const { result } = renderHook(() => useWorkTimer(TAB_ID));

    expect(result.current.activeRecord).toBeNull();
    expect(result.current.records).toEqual([]);
  });

  it("loads existing records from storage on mount", () => {
    saveRecords(TAB_ID, [
      {
        id: "existing",
        date: "2026-07-01",
        startedAt: "2026-07-01T09:00:00.000Z",
        endedAt: "2026-07-01T10:00:00.000Z",
      },
    ]);

    const { result } = renderHook(() => useWorkTimer(TAB_ID));

    expect(result.current.records).toHaveLength(1);
    expect(result.current.records[0].id).toBe("existing");
  });

  it("keeps records for different tabs separate", () => {
    saveRecords("tab-a", [
      { id: "a", date: "2026-07-01", startedAt: "2026-07-01T09:00:00.000Z", endedAt: null },
    ]);
    saveRecords("tab-b", [
      { id: "b", date: "2026-07-02", startedAt: "2026-07-02T09:00:00.000Z", endedAt: null },
    ]);

    const { result } = renderHook(() => useWorkTimer("tab-a"));

    expect(result.current.records.map((record) => record.id)).toEqual(["a"]);
  });

  it("starts a new record on the first toggle", () => {
    const now = new Date("2026-07-05T10:00:00.000Z");
    const { result } = renderHook(() =>
      useWorkTimer(TAB_ID, { now: () => now, createId: () => "id-1" }),
    );

    act(() => {
      result.current.toggle();
    });

    expect(result.current.activeRecord).toEqual({
      id: "id-1",
      date: "2026-07-05",
      startedAt: "2026-07-05T10:00:00.000Z",
      endedAt: null,
      memo: "",
      adjustmentMinutes: 0,
    });
    expect(result.current.records).toHaveLength(1);
  });

  it("ends the active record on the second toggle", () => {
    let current = new Date("2026-07-05T10:00:00.000Z");
    const { result } = renderHook(() =>
      useWorkTimer(TAB_ID, { now: () => current, createId: () => "id-1" }),
    );

    act(() => {
      result.current.toggle();
    });

    current = new Date("2026-07-05T12:30:00.000Z");
    act(() => {
      result.current.toggle();
    });

    expect(result.current.activeRecord).toBeNull();
    expect(result.current.records).toEqual([
      {
        id: "id-1",
        date: "2026-07-05",
        startedAt: "2026-07-05T10:00:00.000Z",
        endedAt: "2026-07-05T12:30:00.000Z",
        memo: "",
        adjustmentMinutes: 0,
      },
    ]);
  });

  it("splits the record at midnight when the toggle ends it on the next day", () => {
    let current = new Date(2026, 6, 5, 23, 30, 0);
    let nextId = 0;
    const createId = () => `id-${++nextId}`;
    const { result } = renderHook(() => useWorkTimer(TAB_ID, { now: () => current, createId }));

    act(() => {
      result.current.toggle();
    });

    current = new Date(2026, 6, 6, 1, 0, 0);
    act(() => {
      result.current.toggle();
    });

    const midnight = new Date(2026, 6, 6, 0, 0, 0).toISOString();
    expect(result.current.activeRecord).toBeNull();
    expect(result.current.records).toEqual([
      {
        id: "id-1",
        date: "2026-07-05",
        startedAt: new Date(2026, 6, 5, 23, 30, 0).toISOString(),
        endedAt: midnight,
        memo: "",
        adjustmentMinutes: 0,
      },
      {
        id: "id-2",
        date: "2026-07-06",
        startedAt: midnight,
        endedAt: new Date(2026, 6, 6, 1, 0, 0).toISOString(),
        memo: "",
        adjustmentMinutes: 0,
      },
    ]);
  });

  it("persists records to storage after every toggle", () => {
    const now = new Date("2026-07-05T10:00:00.000Z");
    const { result } = renderHook(() =>
      useWorkTimer(TAB_ID, { now: () => now, createId: () => "id-1" }),
    );

    act(() => {
      result.current.toggle();
    });

    expect(loadRecords(TAB_ID)).toEqual(result.current.records);
  });

  it("updates a record's fields via updateRecord and persists the change", () => {
    saveRecords(TAB_ID, [
      {
        id: "existing",
        date: "2026-07-01",
        startedAt: "2026-07-01T09:00:00.000Z",
        endedAt: "2026-07-01T10:00:00.000Z",
      },
    ]);

    const { result } = renderHook(() => useWorkTimer(TAB_ID));

    act(() => {
      result.current.updateRecord("existing", {
        endedAt: "2026-07-01T11:00:00.000Z",
      });
    });

    expect(result.current.records[0].endedAt).toBe("2026-07-01T11:00:00.000Z");
    expect(loadRecords(TAB_ID)[0].endedAt).toBe("2026-07-01T11:00:00.000Z");
  });

  it("updates a record's memo via updateRecord and persists the change", () => {
    saveRecords(TAB_ID, [
      {
        id: "existing",
        date: "2026-07-01",
        startedAt: "2026-07-01T09:00:00.000Z",
        endedAt: "2026-07-01T10:00:00.000Z",
        memo: "",
      },
    ]);

    const { result } = renderHook(() => useWorkTimer(TAB_ID));

    act(() => {
      result.current.updateRecord("existing", { memo: "客先訪問" });
    });

    expect(result.current.records[0].memo).toBe("客先訪問");
    expect(loadRecords(TAB_ID)[0].memo).toBe("客先訪問");
  });

  it("appends imported records with fresh ids and persists them", () => {
    saveRecords(TAB_ID, [
      {
        id: "existing",
        date: "2026-07-01",
        startedAt: "2026-07-01T09:00:00.000Z",
        endedAt: "2026-07-01T10:00:00.000Z",
      },
    ]);

    let nextId = 0;
    const createId = () => `imported-${++nextId}`;
    const { result } = renderHook(() => useWorkTimer(TAB_ID, { createId }));

    act(() => {
      result.current.importRecords([
        {
          date: "2026-07-05",
          startedAt: "2026-07-05T09:00:00.000Z",
          endedAt: "2026-07-05T10:00:00.000Z",
          adjustmentMinutes: 10,
          memo: "客先訪問",
        },
      ]);
    });

    expect(result.current.records).toEqual([
      {
        id: "existing",
        date: "2026-07-01",
        startedAt: "2026-07-01T09:00:00.000Z",
        endedAt: "2026-07-01T10:00:00.000Z",
      },
      {
        id: "imported-1",
        date: "2026-07-05",
        startedAt: "2026-07-05T09:00:00.000Z",
        endedAt: "2026-07-05T10:00:00.000Z",
        adjustmentMinutes: 10,
        memo: "客先訪問",
      },
    ]);
    expect(loadRecords(TAB_ID)).toEqual(result.current.records);
  });

  it("deletes a record via deleteRecord and persists the change", () => {
    saveRecords(TAB_ID, [
      {
        id: "a",
        date: "2026-07-01",
        startedAt: "2026-07-01T09:00:00.000Z",
        endedAt: "2026-07-01T10:00:00.000Z",
      },
      {
        id: "b",
        date: "2026-07-02",
        startedAt: "2026-07-02T09:00:00.000Z",
        endedAt: "2026-07-02T10:00:00.000Z",
      },
    ]);

    const { result } = renderHook(() => useWorkTimer(TAB_ID));

    act(() => {
      result.current.deleteRecord("a");
    });

    expect(result.current.records.map((record) => record.id)).toEqual(["b"]);
    expect(loadRecords(TAB_ID).map((record) => record.id)).toEqual(["b"]);
  });

  it("floors the start to the minute by default (minute precision)", () => {
    const started = new Date(2026, 7, 10, 10, 40, 50);
    const { result } = renderHook(() =>
      useWorkTimer(TAB_ID, { now: () => started, createId: () => "id-1" }),
    );

    act(() => result.current.toggle());

    expect(result.current.records[0].startedAt).toBe(
      new Date(2026, 7, 10, 10, 40, 0).toISOString(),
    );
  });

  it("floors both ends so a sub-minute session reads as 0, not a spanning minute", () => {
    let current = new Date(2026, 7, 10, 10, 40, 50);
    const { result } = renderHook(() =>
      useWorkTimer(TAB_ID, { now: () => current, createId: () => "id-1" }),
    );

    act(() => result.current.toggle());
    current = new Date(2026, 7, 10, 10, 41, 5);
    act(() => result.current.toggle());

    const record = result.current.records[0];
    expect(record.startedAt).toBe(new Date(2026, 7, 10, 10, 40, 0).toISOString());
    expect(record.endedAt).toBe(new Date(2026, 7, 10, 10, 41, 0).toISOString());
  });

  it("keeps the exact seconds when the tab uses second precision", () => {
    const started = new Date(2026, 7, 10, 10, 40, 50);
    const { result } = renderHook(() =>
      useWorkTimer(TAB_ID, {
        now: () => started,
        createId: () => "id-1",
        precision: "second",
      }),
    );

    act(() => result.current.toggle());

    expect(result.current.records[0].startedAt).toBe(started.toISOString());
  });
});
