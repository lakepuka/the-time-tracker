"use client";

import { type ChangeEvent, useCallback, useRef } from "react";
import { parseCsv } from "@/lib/csv";
import { formatTemplate, type Translations } from "@/lib/i18n";
import type { WorkRecord } from "@/lib/records";

export function useCsvImport(
  onImportRecords: (records: Omit<WorkRecord, "id">[]) => void,
  t: Translations,
) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;

      try {
        const text = await file.text();
        const records = parseCsv(text);
        onImportRecords(records);
        window.alert(formatTemplate(t.csvImportSuccess, String(records.length)));
      } catch {
        window.alert(t.csvImportError);
      }
    },
    [onImportRecords, t],
  );

  return { fileInputRef, triggerImport, handleFileChange };
}
