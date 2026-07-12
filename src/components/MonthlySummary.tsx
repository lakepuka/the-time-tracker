"use client";

import { useEffect, useState } from "react";
import { toDateKeyFromDate } from "@/lib/dateTimeInput";
import { formatDurationMinutes } from "@/lib/duration";
import type { Language, Translations } from "@/lib/i18n";
import { computeMonthlyTotals, formatMonthLabel } from "@/lib/monthlySummary";
import type { WorkRecord } from "@/lib/records";

type MonthlySummaryProps = {
  records: WorkRecord[];
  now?: () => Date;
  language: Language;
  t: Translations;
};

export function MonthlySummary({
  records,
  now = () => new Date(),
  language,
  t,
}: MonthlySummaryProps) {
  const totals = computeMonthlyTotals(records);
  const [currentMonthKey, setCurrentMonthKey] = useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount; deferring to the client avoids an SSR hydration mismatch
  useEffect(() => {
    setCurrentMonthKey(toDateKeyFromDate(now()).slice(0, 7));
  }, []);

  if (totals.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
        {t.monthlyTotal}
      </h2>
      <ul className="scrollbar-thin flex max-h-56 flex-col divide-y divide-zinc-100 overflow-y-auto pr-1 text-sm dark:divide-zinc-700">
        {totals.map((total) => {
          const isCurrent = total.month === currentMonthKey;
          return (
            <li
              key={total.month}
              data-current={isCurrent}
              className={`flex items-center justify-between gap-4 rounded px-1.5 py-1.5 ${
                isCurrent ? "bg-indigo-50 dark:bg-indigo-950/40" : ""
              }`}
            >
              <span
                className={
                  isCurrent
                    ? "flex items-center gap-1.5 font-semibold text-indigo-700 dark:text-indigo-300"
                    : "text-zinc-600 dark:text-zinc-300"
                }
              >
                {formatMonthLabel(total.month, language)}
                {isCurrent && (
                  <span className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-1.5 py-0.5 text-[0.65rem] font-semibold leading-none text-white">
                    {t.thisMonth}
                  </span>
                )}
              </span>
              <span
                className={
                  isCurrent ? "font-semibold text-indigo-700 dark:text-indigo-300" : "font-medium"
                }
              >
                {formatDurationMinutes(total.totalMinutes, language)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
