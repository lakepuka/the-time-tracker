import type { Language } from "./i18n";

export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function toTimeInputValue(iso: string): string {
  const d = new Date(iso);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function combineDateAndTime(dateValue: string, timeValue: string): string {
  return new Date(`${dateValue}T${timeValue}:00`).toISOString();
}

export function toDisplayDate(dateKey: string): string {
  return dateKey.replaceAll("-", "/");
}

export function toDateKeyFromDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
const WEEKDAY_LABELS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function weekdayLabels(language: Language = "ja"): string[] {
  return language === "en" ? WEEKDAY_LABELS_EN : WEEKDAY_LABELS;
}

export function weekdayLabel(
  year: number,
  month: number,
  day: number,
  language: Language = "ja",
): string {
  return weekdayLabels(language)[new Date(year, month - 1, day).getDay()];
}
