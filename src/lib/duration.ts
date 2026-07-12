import type { Language } from "./i18n";

export function computeDurationMinutes(
  startedAt: string,
  endedAt: string | null,
  now: () => Date = () => new Date(),
): number {
  const start = new Date(startedAt).getTime();
  const end = endedAt ? new Date(endedAt).getTime() : now().getTime();
  return Math.max(0, Math.round((end - start) / 60000));
}

export function computeNetDurationMinutes(
  startedAt: string,
  endedAt: string,
  adjustmentMinutes = 0,
): number {
  const raw = computeDurationMinutes(startedAt, endedAt);
  return Math.max(0, raw - adjustmentMinutes);
}

export function sumNetDurationMinutes(
  records: Array<{ startedAt: string; endedAt: string | null; adjustmentMinutes?: number }>,
): number {
  return records.reduce((total, record) => {
    if (!record.endedAt) return total;
    return (
      total +
      computeNetDurationMinutes(record.startedAt, record.endedAt, record.adjustmentMinutes ?? 0)
    );
  }, 0);
}

export function formatDurationMinutes(totalMinutes: number, language: Language = "ja"): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return language === "en" ? `${hours}h ${minutes}m` : `${hours}時間${minutes}分`;
}
