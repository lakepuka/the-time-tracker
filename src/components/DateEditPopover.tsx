"use client";

import { type ChangeEvent, type ReactNode, useState } from "react";
import { usePopover } from "@/hooks/usePopover";
import { pad2, weekdayLabel } from "@/lib/dateTimeInput";
import type { Language, Translations } from "@/lib/i18n";

type DateEditPopoverProps = {
  value: string;
  onChange: (newDate: string) => void;
  label: ReactNode;
  triggerClassName?: string;
  language: Language;
  t: Translations;
};

type DraftDate = {
  year: number;
  month: number;
  day: number;
};

function parseDate(value: string): DraftDate {
  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day };
}

function formatDate({ year, month, day }: DraftDate): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function DateEditPopover({
  value,
  onChange,
  label,
  triggerClassName,
  language,
  t,
}: DateEditPopoverProps) {
  const { isOpen, setIsOpen, close, containerRef } = usePopover<HTMLDivElement>();
  const [draft, setDraft] = useState<DraftDate>(() => parseDate(value));

  function handleOpen() {
    setDraft(parseDate(value));
    setIsOpen(true);
  }

  function handleFieldChange(field: keyof DraftDate, event: ChangeEvent<HTMLInputElement>) {
    const numericValue = Number(event.target.value);
    setDraft((prev) => ({
      ...prev,
      [field]: Number.isNaN(numericValue) ? prev[field] : numericValue,
    }));
  }

  function handleOk() {
    onChange(formatDate(draft));
    close();
  }

  return (
    <div ref={containerRef} className="relative block w-full">
      <button type="button" onClick={handleOpen} className={triggerClassName}>
        {label}
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full z-10 mt-1 flex flex-col gap-2 rounded border border-zinc-300 bg-white p-2 shadow-md dark:border-zinc-600 dark:bg-zinc-800">
          <div className="flex items-center gap-1 text-xs">
            <input
              type="number"
              aria-label={t.yearInputLabel}
              value={draft.year}
              onChange={(event) => handleFieldChange("year", event)}
              className="w-14 rounded border border-zinc-300 px-1 py-0.5 dark:border-zinc-600 dark:bg-zinc-900"
            />
            <span>{t.yearInputLabel}</span>
            <input
              type="number"
              aria-label={t.monthInputLabel}
              min={1}
              max={12}
              value={draft.month}
              onChange={(event) => handleFieldChange("month", event)}
              className="w-11 rounded border border-zinc-300 px-1 py-0.5 dark:border-zinc-600 dark:bg-zinc-900"
            />
            <span>{t.monthInputLabel}</span>
            <input
              type="number"
              aria-label={t.dayInputLabel}
              min={1}
              max={31}
              value={draft.day}
              onChange={(event) => handleFieldChange("day", event)}
              className="w-11 rounded border border-zinc-300 px-1 py-0.5 dark:border-zinc-600 dark:bg-zinc-900"
            />
            <span>{t.dayInputLabel}</span>
            <span className="text-zinc-500 dark:text-zinc-400">
              ({weekdayLabel(draft.year, draft.month, draft.day, language)})
            </span>
          </div>
          <button
            type="button"
            onClick={handleOk}
            className="rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-700"
          >
            {t.ok}
          </button>
        </div>
      )}
    </div>
  );
}
