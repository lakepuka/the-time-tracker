"use client";

import { useEffect, useState } from "react";
import {
  daysInMonth,
  firstWeekdayOfMonth,
  formatYearMonthLabel,
  shiftMonth,
  toDateKey,
  type YearMonth,
} from "@/lib/calendarMonth";
import { computeDailyTotals, formatHoursShort, heatLevel } from "@/lib/dailyTotals";
import { weekdayLabels } from "@/lib/dateTimeInput";
import type { Language, Translations } from "@/lib/i18n";
import type { WorkRecord } from "@/lib/records";

type CalendarHeatmapProps = {
  records: WorkRecord[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  now?: () => Date;
  language: Language;
  t: Translations;
};

const heatLevelClass: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500",
  1: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  2: "bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
  3: "bg-blue-400 text-white dark:bg-blue-700 dark:text-white",
  4: "bg-blue-600 text-white dark:bg-blue-500 dark:text-white",
};

export function CalendarHeatmap({
  records,
  selectedDate,
  onSelectDate,
  now = () => new Date(),
  language,
  t,
}: CalendarHeatmapProps) {
  const [viewedMonth, setViewedMonth] = useState<YearMonth | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount; deferring to the client avoids an SSR hydration mismatch
  useEffect(() => {
    const current = now();
    setViewedMonth({ year: current.getFullYear(), month: current.getMonth() });
  }, []);

  if (!viewedMonth) {
    return null;
  }

  const dailyTotals = computeDailyTotals(records);
  const totalDays = daysInMonth(viewedMonth.year, viewedMonth.month);
  const leadingBlanks = firstWeekdayOfMonth(viewedMonth.year, viewedMonth.month);

  const cells: Array<{ day: number; dateKey: string } | null> = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: totalDays }, (_, index) => {
      const day = index + 1;
      return { day, dateKey: toDateKey(viewedMonth.year, viewedMonth.month, day) };
    }),
  ];

  function handleDayClick(dateKey: string) {
    onSelectDate(selectedDate === dateKey ? null : dateKey);
  }

  return (
    <div className="w-full shrink-0 sm:w-[240px] lg:w-full">
      <div className="mb-1.5 flex items-center justify-between">
        <button
          type="button"
          aria-label={t.prevMonth}
          onClick={() => setViewedMonth((prev) => prev && shiftMonth(prev, -1))}
          className="rounded px-1.5 py-0.5 text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700"
        >
          ◀
        </button>
        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          {formatYearMonthLabel(viewedMonth, language)}
        </span>
        <button
          type="button"
          aria-label={t.nextMonth}
          onClick={() => setViewedMonth((prev) => prev && shiftMonth(prev, 1))}
          className="rounded px-1.5 py-0.5 text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700"
        >
          ▶
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {weekdayLabels(language).map((label) => (
          <div key={label} className="text-[0.6rem] font-medium text-zinc-400 dark:text-zinc-500">
            {label}
          </div>
        ))}
        {cells.map((cell, index) => {
          if (!cell) {
            // biome-ignore lint/suspicious/noArrayIndexKey: leading blanks are static positional placeholders with no stable id
            return <div key={`blank-${index}`} />;
          }

          const minutes = dailyTotals[cell.dateKey] ?? 0;
          const level = heatLevel(minutes);
          const isSelected = selectedDate === cell.dateKey;

          return (
            <button
              key={cell.dateKey}
              type="button"
              onClick={() => handleDayClick(cell.dateKey)}
              aria-label={`${cell.day}${language === "en" ? "" : "日"}${minutes > 0 ? ` ${formatHoursShort(minutes)}` : ""}`}
              className={`flex aspect-square flex-col items-center justify-center rounded text-[0.65rem] leading-none ${heatLevelClass[level]} ${
                isSelected ? "ring-2 ring-offset-1 ring-blue-600 dark:ring-blue-400" : ""
              }`}
            >
              <span>{cell.day}</span>
              {minutes > 0 && <span className="text-[0.55rem]">{formatHoursShort(minutes)}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
