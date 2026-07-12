import { toDateKeyFromDate } from "./dateTimeInput";
import type { WorkRecord } from "./records";

export function splitRecordAcrossDays(
  record: WorkRecord,
  endedAt: Date,
  createId: () => string,
): WorkRecord[] {
  const segments: WorkRecord[] = [];

  let segmentStart = new Date(record.startedAt);
  let isFirst = true;

  while (toDateKeyFromDate(segmentStart) !== toDateKeyFromDate(endedAt)) {
    const nextMidnight = new Date(
      segmentStart.getFullYear(),
      segmentStart.getMonth(),
      segmentStart.getDate() + 1,
      0,
      0,
      0,
      0,
    );

    segments.push({
      id: isFirst ? record.id : createId(),
      date: toDateKeyFromDate(segmentStart),
      startedAt: segmentStart.toISOString(),
      endedAt: nextMidnight.toISOString(),
      memo: isFirst ? record.memo : "",
      adjustmentMinutes: isFirst ? record.adjustmentMinutes : 0,
    });

    segmentStart = nextMidnight;
    isFirst = false;
  }

  segments.push({
    id: isFirst ? record.id : createId(),
    date: toDateKeyFromDate(segmentStart),
    startedAt: segmentStart.toISOString(),
    endedAt: endedAt.toISOString(),
    memo: isFirst ? record.memo : "",
    adjustmentMinutes: isFirst ? record.adjustmentMinutes : 0,
  });

  return segments;
}
