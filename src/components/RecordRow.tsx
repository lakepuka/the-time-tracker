"use client";

import { type ChangeEvent, useState } from "react";
import { DateEditPopover } from "@/components/DateEditPopover";
import { CloseIcon } from "@/components/icons";
import { combineDateAndTime, toDisplayDate, toTimeInputValue } from "@/lib/dateTimeInput";
import {
  computeNetDurationMinutes,
  computeNetDurationSeconds,
  formatDurationMinutes,
  formatDurationSeconds,
} from "@/lib/duration";
import type { Language, Translations } from "@/lib/i18n";
import { buildDatePatch } from "@/lib/recordEdits";
import type { WorkRecord } from "@/lib/records";
import type { TimerPrecision } from "@/lib/timerPrecision";

type RecordRowProps = {
  record: WorkRecord;
  isSameDateAsPrevious: boolean;
  onUpdate: (id: string, patch: Partial<Omit<WorkRecord, "id">>) => void;
  onDelete: (id: string) => void;
  language: Language;
  precision: TimerPrecision;
  t: Translations;
};

export function RecordRow({
  record,
  isSameDateAsPrevious,
  onUpdate,
  onDelete,
  language,
  precision,
  t,
}: RecordRowProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const withSeconds = precision === "second";
  const timeFieldClass = `field mono text-[12.5px] text-[color:var(--body-strong)] ${
    withSeconds ? "w-[5.25rem]" : "w-14"
  }`;

  function handleDateChange(newDate: string) {
    onUpdate(record.id, buildDatePatch(record, newDate));
  }

  function handleTimeChange(field: "startedAt" | "endedAt", event: ChangeEvent<HTMLInputElement>) {
    const newTime = event.target.value;
    if (!newTime) return;

    onUpdate(record.id, { [field]: combineDateAndTime(record.date, newTime) });
  }

  function handleAdjustmentChange(event: ChangeEvent<HTMLInputElement>) {
    const value = Number(event.target.value);
    onUpdate(record.id, { adjustmentMinutes: Number.isNaN(value) ? 0 : value });
  }

  function handleMemoChange(event: ChangeEvent<HTMLInputElement>) {
    onUpdate(record.id, { memo: event.target.value });
  }

  function handleConfirmDelete() {
    onDelete(record.id);
    setIsConfirmingDelete(false);
  }

  const durationLabel = record.endedAt
    ? withSeconds
      ? formatDurationSeconds(
          computeNetDurationSeconds(
            record.startedAt,
            record.endedAt,
            record.adjustmentMinutes ?? 0,
          ),
          language,
        )
      : formatDurationMinutes(
          computeNetDurationMinutes(
            record.startedAt,
            record.endedAt,
            record.adjustmentMinutes ?? 0,
          ),
          language,
        )
    : "—";

  return (
    <div className="rec" data-sec={withSeconds}>
      <div className="rec__head">
        <DateEditPopover
          value={record.date}
          onChange={handleDateChange}
          label={isSameDateAsPrevious ? "〃" : toDisplayDate(record.date)}
          triggerClassName={
            isSameDateAsPrevious
              ? "mono block w-full text-left text-xs text-muted hover:text-brand"
              : "field mono block w-full text-left text-[color:var(--body-strong)]"
          }
          language={language}
          t={t}
        />

        <div className="flex items-center gap-1.5">
          <input
            type="time"
            step={withSeconds ? 1 : undefined}
            aria-label={t.columnTime}
            value={toTimeInputValue(record.startedAt, withSeconds)}
            onChange={(event) => handleTimeChange("startedAt", event)}
            className={timeFieldClass}
          />
          <span className="text-muted" aria-hidden>
            –
          </span>
          {record.endedAt ? (
            <input
              type="time"
              step={withSeconds ? 1 : undefined}
              aria-label={t.columnTime}
              value={toTimeInputValue(record.endedAt, withSeconds)}
              onChange={(event) => handleTimeChange("endedAt", event)}
              className={timeFieldClass}
            />
          ) : (
            <span
              className={`mono text-[12.5px] text-live ${withSeconds ? "w-[5.25rem]" : "w-14"}`}
            >
              {t.inProgress}
            </span>
          )}
        </div>

        <input
          type="number"
          aria-label={t.columnAdjustment}
          value={record.adjustmentMinutes ?? 0}
          onChange={handleAdjustmentChange}
          className="field mono w-12 text-right"
        />

        <span className="mono text-[13px] font-semibold text-ink">{durationLabel}</span>
      </div>

      <div className="rec__note min-w-0">
        <input
          type="text"
          aria-label={t.columnMemo}
          value={record.memo ?? ""}
          onChange={handleMemoChange}
          placeholder={t.columnMemo}
          className="field w-full text-[color:var(--body)]"
        />
      </div>

      <div className="rec__del">
        {isConfirmingDelete ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="chip !min-h-0 border-[color:var(--stop)] px-2 py-0.5 text-[color:var(--stop)] hover:!border-[color:var(--stop-hover)] hover:!text-[color:var(--stop-hover)]"
            >
              {t.deleteLabel}
            </button>
            <button
              type="button"
              aria-label={t.cancel}
              onClick={() => setIsConfirmingDelete(false)}
              className="chip chip--ghost !min-h-0 px-1 py-0.5"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            aria-label={t.deleteLabel}
            onClick={() => setIsConfirmingDelete(true)}
            className="text-[color:var(--del)] hover:text-[color:var(--stop)]"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
