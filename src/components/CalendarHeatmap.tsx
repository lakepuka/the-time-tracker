"use client";

import { useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import {
  daysInMonth,
  firstWeekdayOfMonth,
  shiftMonth,
  toDateKey,
  type YearMonth,
} from "@/lib/calendarMonth";
import { computeDailyTotals, formatHoursShort, heatLevel } from "@/lib/dailyTotals";
import { toDateKeyFromDate, weekdayLabels } from "@/lib/dateTimeInput";
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

/*
 * Navy fill whose weight tracks the day's total. Filled cells stay legible with
 * white numerals; the two lightest levels keep ink text on a tinted ground.
 */
const levelStyle: Record<0 | 1 | 2 | 3 | 4, { background: string; color: string }> = {
  0: { background: "transparent", color: "var(--muted)" },
  1: { background: "rgba(28,63,110,0.10)", color: "var(--brand)" },
  2: { background: "rgba(28,63,110,0.22)", color: "#152f52" },
  3: { background: "rgba(28,63,110,0.55)", color: "#fff" },
  4: { background: "rgba(28,63,110,0.88)", color: "#fff" },
};

const darkLevelStyle: Record<0 | 1 | 2 | 3 | 4, { background: string; color: string }> = {
  0: { background: "transparent", color: "var(--muted)" },
  1: { background: "rgba(143,179,224,0.14)", color: "var(--brand)" },
  2: { background: "rgba(143,179,224,0.28)", color: "#cfe0f5" },
  3: { background: "rgba(143,179,224,0.55)", color: "#0f151c" },
  4: { background: "rgba(143,179,224,0.85)", color: "#0f151c" },
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
  const [todayKey, setTodayKey] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount; deferring to the client avoids an SSR hydration mismatch
  useEffect(() => {
    const current = now();
    setViewedMonth({ year: current.getFullYear(), month: current.getMonth() });
    setTodayKey(toDateKeyFromDate(current));
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  if (!viewedMonth) {
    return null;
  }

  const palette = isDark ? darkLevelStyle : levelStyle;
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

  const monthLabel = `${viewedMonth.year} / ${String(viewedMonth.month + 1).padStart(2, "0")}`;

  return (
    <div className="w-full shrink-0 sm:w-[248px] lg:w-full">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          aria-label={t.prevMonth}
          onClick={() => setViewedMonth((prev) => prev && shiftMonth(prev, -1))}
          className="chip chip--ghost !min-h-0 px-1 py-0.5 text-muted hover:text-brand"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <span className="mono text-xs font-bold tracking-[0.1em] text-[color:var(--ink-logo)]">
          {monthLabel}
        </span>
        <button
          type="button"
          aria-label={t.nextMonth}
          onClick={() => setViewedMonth((prev) => prev && shiftMonth(prev, 1))}
          className="chip chip--ghost !min-h-0 px-1 py-0.5 text-muted hover:text-brand"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="cal-grid">
        {weekdayLabels(language).map((weekdayName) => (
          <div
            key={weekdayName}
            className="mono pb-0.5 text-center text-[0.5625rem] font-semibold text-muted"
          >
            {weekdayName}
          </div>
        ))}
        {cells.map((cell, index) => {
          if (!cell) {
            // biome-ignore lint/suspicious/noArrayIndexKey: blanks are static positional placeholders with no stable id
            return <div key={`blank-${index}`} />;
          }

          const minutes = dailyTotals[cell.dateKey] ?? 0;
          const level = heatLevel(minutes);
          const isSelected = selectedDate === cell.dateKey;
          const { background, color } = palette[level];

          return (
            <button
              key={cell.dateKey}
              type="button"
              onClick={() => handleDayClick(cell.dateKey)}
              data-today={cell.dateKey === todayKey}
              aria-label={`${cell.day}${language === "en" ? "" : "日"}${minutes > 0 ? ` ${formatHoursShort(minutes)}` : ""}`}
              aria-pressed={isSelected}
              className="cal-cell"
              style={{
                background,
                color,
                boxShadow: isSelected ? "inset 0 0 0 1px var(--brand)" : undefined,
              }}
            >
              <span>{cell.day}</span>
              {minutes > 0 && <span className="cal-cell__h">{formatHoursShort(minutes)}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
