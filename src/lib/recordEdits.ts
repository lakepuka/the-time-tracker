import { combineDateAndTime, toTimeInputValue } from "./dateTimeInput";
import type { WorkRecord } from "./records";

export function buildDatePatch(
  record: WorkRecord,
  newDate: string,
): Partial<Omit<WorkRecord, "id">> {
  const patch: Partial<Omit<WorkRecord, "id">> = {
    date: newDate,
    startedAt: combineDateAndTime(newDate, toTimeInputValue(record.startedAt)),
  };

  if (record.endedAt) {
    patch.endedAt = combineDateAndTime(newDate, toTimeInputValue(record.endedAt));
  }

  return patch;
}
