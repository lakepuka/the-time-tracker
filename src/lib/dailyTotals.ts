import { computeNetDurationMinutes } from "./duration";
import type { WorkRecord } from "./records";

export function computeDailyTotals(records: WorkRecord[]): Record<string, number> {
  const totals: Record<string, number> = {};

  for (const record of records) {
    if (!record.endedAt) continue;

    const minutes = computeNetDurationMinutes(
      record.startedAt,
      record.endedAt,
      record.adjustmentMinutes ?? 0,
    );
    totals[record.date] = (totals[record.date] ?? 0) + minutes;
  }

  return totals;
}

export function formatHoursShort(totalMinutes: number): string {
  const hours = totalMinutes / 60;
  const rounded = Math.round(hours * 10) / 10;
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}h`;
}

export function heatLevel(totalMinutes: number): 0 | 1 | 2 | 3 | 4 {
  if (totalMinutes <= 0) return 0;
  const hours = totalMinutes / 60;
  if (hours < 1) return 1;
  if (hours < 3) return 2;
  if (hours < 6) return 3;
  return 4;
}
