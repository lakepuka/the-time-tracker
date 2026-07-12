import { formatYearMonthLabel } from "./calendarMonth";
import { computeNetDurationMinutes } from "./duration";
import type { Language } from "./i18n";
import type { WorkRecord } from "./records";

export type MonthlyTotal = {
  month: string;
  totalMinutes: number;
};

export function computeMonthlyTotals(records: WorkRecord[]): MonthlyTotal[] {
  const totals = new Map<string, number>();

  for (const record of records) {
    if (!record.endedAt) continue;

    const month = record.date.slice(0, 7);
    const minutes = computeNetDurationMinutes(
      record.startedAt,
      record.endedAt,
      record.adjustmentMinutes ?? 0,
    );
    totals.set(month, (totals.get(month) ?? 0) + minutes);
  }

  return [...totals.entries()]
    .map(([month, totalMinutes]) => ({ month, totalMinutes }))
    .sort((a, b) => b.month.localeCompare(a.month));
}

export function formatMonthLabel(month: string, language: Language = "ja"): string {
  const [year, monthNumber] = month.split("-").map(Number);
  return formatYearMonthLabel({ year, month: monthNumber - 1 }, language);
}
