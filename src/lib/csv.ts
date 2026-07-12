import { combineDateAndTime, pad2, toTimeInputValue } from "./dateTimeInput";
import { computeNetDurationMinutes } from "./duration";
import type { Language } from "./i18n";
import type { WorkRecord } from "./records";

const HEADERS: Record<Language, string[]> = {
  ja: ["日付", "開始", "終了", "調整(分)", "稼働時間(分)", "備考"],
  en: ["Date", "Start", "End", "Adjustment (min)", "Duration (min)", "Notes"],
};

function escapeCsvField(value: string): string {
  if (/["\n,]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function recordsToCsv(records: WorkRecord[], language: Language = "ja"): string {
  const sorted = [...records].sort((a, b) => a.startedAt.localeCompare(b.startedAt));

  const rows = sorted.map((record) => {
    const adjustmentMinutes = record.adjustmentMinutes ?? 0;
    const end = record.endedAt ? toTimeInputValue(record.endedAt) : "";
    const netMinutes = record.endedAt
      ? String(computeNetDurationMinutes(record.startedAt, record.endedAt, adjustmentMinutes))
      : "";

    return [
      record.date,
      toTimeInputValue(record.startedAt),
      end,
      String(adjustmentMinutes),
      netMinutes,
      record.memo ?? "",
    ].map(escapeCsvField);
  });

  return [HEADERS[language], ...rows].map((row) => row.join(",")).join("\r\n");
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  fields.push(current);
  return fields;
}

export function parseCsv(csv: string): Omit<WorkRecord, "id">[] {
  const lines = csv.replace(/^﻿/, "").split(/\r?\n/);
  const dataLines = lines.slice(1).filter((line) => line.trim().length > 0);

  return dataLines.map((line) => {
    const [date, start, end, adjustment, , memo] = parseCsvLine(line);

    return {
      date,
      startedAt: combineDateAndTime(date, start),
      endedAt: end ? combineDateAndTime(date, end) : null,
      adjustmentMinutes: Number(adjustment) || 0,
      memo: memo ?? "",
    };
  });
}

export function buildCsvFilename(tabName: string, now: Date = new Date()): string {
  const sanitized = tabName.trim().replace(/[\\/:*?"<>|]/g, "_") || "records";

  const year = now.getFullYear();
  const month = pad2(now.getMonth() + 1);
  const day = pad2(now.getDate());
  const hours = pad2(now.getHours());
  const minutes = pad2(now.getMinutes());
  const seconds = pad2(now.getSeconds());

  return `${sanitized}_${year}${month}${day}-${hours}${minutes}${seconds}.csv`;
}
