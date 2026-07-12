"use client";

import { type ChangeEvent, useState } from "react";
import { DateEditPopover } from "@/components/DateEditPopover";
import { combineDateAndTime, toDisplayDate, toTimeInputValue } from "@/lib/dateTimeInput";
import { computeNetDurationMinutes, formatDurationMinutes } from "@/lib/duration";
import type { Language, Translations } from "@/lib/i18n";
import { buildDatePatch } from "@/lib/recordEdits";
import type { WorkRecord } from "@/lib/records";

type RecordRowProps = {
  record: WorkRecord;
  isSameDateAsPrevious: boolean;
  onUpdate: (id: string, patch: Partial<Omit<WorkRecord, "id">>) => void;
  onDelete: (id: string) => void;
  language: Language;
  t: Translations;
};

const editableInputClass =
  "rounded border border-zinc-300 bg-white px-1 py-0.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900";

const deleteTriggerClass =
  "rounded-lg border-2 border-zinc-300 px-2 py-0.5 font-bold text-zinc-600 hover:border-red-400 hover:text-red-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-red-500 dark:hover:text-red-400";
const deleteConfirmClass =
  "rounded-lg border-2 border-red-400 bg-red-500 px-2 py-0.5 font-bold text-white hover:bg-red-600 dark:border-red-500 dark:bg-red-600 dark:hover:bg-red-500";
const deleteCancelClass =
  "rounded-lg border-2 border-zinc-300 px-1.5 py-0.5 font-bold text-zinc-500 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-100";

export function RecordRow({
  record,
  isSameDateAsPrevious,
  onUpdate,
  onDelete,
  language,
  t,
}: RecordRowProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

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

  return (
    <tr className="border-b border-zinc-200 dark:border-zinc-800">
      <td className="py-1.5 pr-3">
        <DateEditPopover
          value={record.date}
          onChange={handleDateChange}
          label={isSameDateAsPrevious ? "〃" : toDisplayDate(record.date)}
          triggerClassName={
            isSameDateAsPrevious
              ? "w-full text-center text-zinc-400 hover:text-blue-600 dark:text-zinc-500 dark:hover:text-blue-400"
              : `${editableInputClass} block w-full text-left`
          }
          language={language}
          t={t}
        />
      </td>
      <td className="py-1.5 pr-3">
        <div className="flex items-center gap-1">
          <input
            type="time"
            value={toTimeInputValue(record.startedAt)}
            onChange={(event) => handleTimeChange("startedAt", event)}
            className={editableInputClass}
          />
          <span>〜</span>
          {record.endedAt ? (
            <input
              type="time"
              value={toTimeInputValue(record.endedAt)}
              onChange={(event) => handleTimeChange("endedAt", event)}
              className={editableInputClass}
            />
          ) : (
            <span className="text-zinc-500 dark:text-zinc-400">{t.inProgress}</span>
          )}
        </div>
      </td>
      <td className="py-1.5 pr-3">
        <input
          type="number"
          value={record.adjustmentMinutes ?? 0}
          onChange={handleAdjustmentChange}
          className={`${editableInputClass} w-16`}
        />
      </td>
      <td className="whitespace-nowrap py-1.5 pr-3">
        {record.endedAt
          ? formatDurationMinutes(
              computeNetDurationMinutes(
                record.startedAt,
                record.endedAt,
                record.adjustmentMinutes ?? 0,
              ),
              language,
            )
          : "-"}
      </td>
      <td className="min-w-[140px] py-1.5 pr-3">
        <input
          type="text"
          value={record.memo ?? ""}
          onChange={handleMemoChange}
          className={`${editableInputClass} w-full`}
        />
      </td>
      <td className="whitespace-nowrap py-1.5 pr-3">
        {isConfirmingDelete ? (
          <div className="flex items-center gap-1">
            <button type="button" onClick={handleConfirmDelete} className={deleteConfirmClass}>
              {t.deleteLabel}
            </button>
            <button
              type="button"
              aria-label={t.cancel}
              onClick={() => setIsConfirmingDelete(false)}
              className={deleteCancelClass}
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
            className={deleteTriggerClass}
          >
            {t.deleteLabel}
          </button>
        )}
      </td>
    </tr>
  );
}
