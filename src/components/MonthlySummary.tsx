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

/** Month totals; the current month gets a highlighter pass. */
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
      <h2 className="ledger-label mb-2 !text-[0.625rem] text-muted">{t.monthlyTotal}</h2>
      <ul className="scrollbar-thin flex max-h-56 flex-col gap-0.5 overflow-y-auto pr-1">
        {totals.map((total) => {
          const isCurrent = total.month === currentMonthKey;
          return (
            <li
              key={total.month}
              data-current={isCurrent}
              className={`mono flex items-center justify-between px-1.5 text-[12.5px] leading-[1.6] ${
                isCurrent ? "hl font-semibold text-ink" : "font-medium text-[color:var(--body)]"
              }`}
            >
              <span>{formatMonthLabel(total.month, language)}</span>
              <span>{formatDurationMinutes(total.totalMinutes, language)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
