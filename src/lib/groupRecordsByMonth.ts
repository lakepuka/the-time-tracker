import type { WorkRecord } from "./records";

export type MonthGroup = {
  year: number;
  month: number;
  yearKey: string;
  monthKey: string;
  records: WorkRecord[];
};

export type YearGroup = {
  year: number;
  yearKey: string;
  months: MonthGroup[];
};

export function groupRecordsByYearAndMonth(records: WorkRecord[]): YearGroup[] {
  const sorted = [...records].sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  const yearMap = new Map<string, Map<string, WorkRecord[]>>();

  for (const record of sorted) {
    const yearKey = record.date.slice(0, 4);
    const monthKey = record.date.slice(0, 7);

    let monthMap = yearMap.get(yearKey);
    if (!monthMap) {
      monthMap = new Map();
      yearMap.set(yearKey, monthMap);
    }

    let monthRecords = monthMap.get(monthKey);
    if (!monthRecords) {
      monthRecords = [];
      monthMap.set(monthKey, monthRecords);
    }
    monthRecords.push(record);
  }

  return [...yearMap.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([yearKey, monthMap]) => ({
      year: Number(yearKey),
      yearKey,
      months: [...monthMap.entries()]
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([monthKey, monthRecords]) => ({
          year: Number(yearKey),
          month: Number(monthKey.slice(5, 7)) - 1,
          yearKey,
          monthKey,
          records: monthRecords,
        })),
    }));
}
