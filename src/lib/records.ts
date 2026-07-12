import { DEFAULT_TAB_ID } from "./tabs";

export type WorkRecord = {
  id: string;
  date: string;
  startedAt: string;
  endedAt: string | null;
  memo?: string;
  adjustmentMinutes?: number;
};

const LEGACY_STORAGE_KEY = "work-timer-records";

function recordsStorageKey(tabId: string): string {
  return `${LEGACY_STORAGE_KEY}:${tabId}`;
}

function parseRecords(raw: string | null): WorkRecord[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function loadRecords(tabId: string): WorkRecord[] {
  const key = recordsStorageKey(tabId);
  const raw = localStorage.getItem(key);

  if (!raw && tabId === DEFAULT_TAB_ID) {
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) return parseRecords(legacy);
  }

  return parseRecords(raw);
}

export function saveRecords(tabId: string, records: WorkRecord[]): void {
  localStorage.setItem(recordsStorageKey(tabId), JSON.stringify(records));
}

export function deleteRecordsForTab(tabId: string): void {
  localStorage.removeItem(recordsStorageKey(tabId));
}
