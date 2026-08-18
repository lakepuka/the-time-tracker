"use client";

import { type ChangeEvent, type ReactNode, useState } from "react";
import { usePopover } from "@/hooks/usePopover";
import { pad2, weekdayLabel } from "@/lib/dateTimeInput";
import type { Language, Translations } from "@/lib/i18n";

type DateEditPopoverProps = {
  value: string;
  onChange: (newDate: string) => void;
  label: ReactNode;
  /** Accessible name for the trigger when `label` renders no visible text. */
  triggerAriaLabel?: string;
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
  triggerAriaLabel,
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
      <button
        type="button"
        aria-label={triggerAriaLabel}
        onClick={handleOpen}
        className={triggerClassName}
      >
        {label}
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full z-10 mt-1 flex flex-col gap-2 border border-[color:var(--edge-strong)] bg-paper p-2">
          <div className="flex items-center gap-1 text-xs">
            <input
              type="number"
              aria-label={t.yearInputLabel}
              value={draft.year}
              onChange={(event) => handleFieldChange("year", event)}
              className="field field--boxed mono w-16"
            />
            <span className="text-muted">{t.yearInputLabel}</span>
            <input
              type="number"
              aria-label={t.monthInputLabel}
              min={1}
              max={12}
              value={draft.month}
              onChange={(event) => handleFieldChange("month", event)}
              className="field field--boxed mono w-12"
            />
            <span className="text-muted">{t.monthInputLabel}</span>
            <input
              type="number"
              aria-label={t.dayInputLabel}
              min={1}
              max={31}
              value={draft.day}
              onChange={(event) => handleFieldChange("day", event)}
              className="field field--boxed mono w-12"
            />
            <span className="text-muted">{t.dayInputLabel}</span>
            <span className="mono text-muted">
              ({weekdayLabel(draft.year, draft.month, draft.day, language)})
            </span>
          </div>
          <button type="button" onClick={handleOk} className="chip w-full">
            {t.ok}
          </button>
        </div>
      )}
    </div>
  );
}
