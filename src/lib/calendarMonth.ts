import { pad2 } from "./dateTimeInput";
import type { Language } from "./i18n";

export type YearMonth = {
  year: number;
  month: number;
};

const MONTH_NAMES_EN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function firstWeekdayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

export function shiftMonth(yearMonth: YearMonth, delta: number): YearMonth {
  const total = yearMonth.year * 12 + yearMonth.month + delta;
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
}

export function formatYearMonthLabel(yearMonth: YearMonth, language: Language = "ja"): string {
  if (language === "en") {
    return `${MONTH_NAMES_EN[yearMonth.month]} ${yearMonth.year}`;
  }
  return `${yearMonth.year}年${pad2(yearMonth.month + 1)}月`;
}

export function formatYearOnlyLabel(year: number, language: Language = "ja"): string {
  return language === "en" ? String(year) : `${year}年`;
}

export function formatMonthOnlyLabel(month: number, language: Language = "ja"): string {
  return language === "en" ? MONTH_NAMES_EN[month] : `${pad2(month + 1)}月`;
}
