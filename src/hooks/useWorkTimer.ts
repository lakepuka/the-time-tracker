"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toDateKeyFromDate } from "@/lib/dateTimeInput";
import { loadRecords, saveRecords, type WorkRecord } from "@/lib/records";
import { splitRecordAcrossDays } from "@/lib/splitRecordAcrossDays";

type UseWorkTimerDeps = {
  now?: () => Date;
  createId?: () => string;
};

const defaultNow = () => new Date();
const defaultCreateId = () => crypto.randomUUID();

export function useWorkTimer(tabId: string, deps: UseWorkTimerDeps = {}) {
  const now = deps.now ?? defaultNow;
  const createId = deps.createId ?? defaultCreateId;

  const [records, setRecords] = useState<WorkRecord[]>([]);

  useEffect(() => {
    // localStorage doesn't exist during SSR; load after mount to avoid a hydration mismatch.
    setRecords(loadRecords(tabId));
  }, [tabId]);

  const activeRecord = useMemo(
    () => records.find((record) => record.endedAt === null) ?? null,
    [records],
  );

  const commitRecords = useCallback(
    (next: WorkRecord[]) => {
      setRecords(next);
      saveRecords(tabId, next);
    },
    [tabId],
  );

  const toggle = useCallback(() => {
    const current = now();

    if (activeRecord) {
      const segments = splitRecordAcrossDays(activeRecord, current, createId);
      commitRecords([...records.filter((record) => record.id !== activeRecord.id), ...segments]);
      return;
    }

    const newRecord: WorkRecord = {
      id: createId(),
      date: toDateKeyFromDate(current),
      startedAt: current.toISOString(),
      endedAt: null,
      memo: "",
      adjustmentMinutes: 0,
    };
    commitRecords([...records, newRecord]);
  }, [activeRecord, createId, now, commitRecords, records]);

  const updateRecord = useCallback(
    (id: string, patch: Partial<Omit<WorkRecord, "id">>) => {
      commitRecords(records.map((record) => (record.id === id ? { ...record, ...patch } : record)));
    },
    [commitRecords, records],
  );

  const deleteRecord = useCallback(
    (id: string) => {
      commitRecords(records.filter((record) => record.id !== id));
    },
    [commitRecords, records],
  );

  const importRecords = useCallback(
    (newRecords: Omit<WorkRecord, "id">[]) => {
      const withIds = newRecords.map((record) => ({ ...record, id: createId() }));
      commitRecords([...records, ...withIds]);
    },
    [createId, commitRecords, records],
  );

  return { records, activeRecord, toggle, updateRecord, deleteRecord, importRecords };
}
