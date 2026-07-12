import { act, renderHook } from "@testing-library/react";
import type { ChangeEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import { getTranslations } from "@/lib/i18n";
import { useCsvImport } from "./useCsvImport";

const t = getTranslations("ja");

function changeEventFor(file: File | null): ChangeEvent<HTMLInputElement> {
  const target = { files: file ? [file] : [], value: "" };
  return { target } as unknown as ChangeEvent<HTMLInputElement>;
}

describe("useCsvImport", () => {
  it("parses the selected file and calls onImportRecords with the records", async () => {
    const onImportRecords = vi.fn();
    const { result } = renderHook(() => useCsvImport(onImportRecords, t));

    const csv = "日付,開始,終了,調整(分),稼働時間(分),備考\r\n2026-07-05,10:00,11:00,0,60,客先訪問";
    const file = new File([csv], "records.csv", { type: "text/csv" });

    await act(async () => {
      await result.current.handleFileChange(changeEventFor(file));
    });

    expect(onImportRecords).toHaveBeenCalledWith([
      {
        date: "2026-07-05",
        startedAt: new Date(2026, 6, 5, 10, 0, 0).toISOString(),
        endedAt: new Date(2026, 6, 5, 11, 0, 0).toISOString(),
        adjustmentMinutes: 0,
        memo: "客先訪問",
      },
    ]);
  });

  it("shows a success alert with the imported record count", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const { result } = renderHook(() => useCsvImport(() => {}, t));

    const csv = "日付,開始,終了,調整(分),稼働時間(分),備考\r\n2026-07-05,10:00,11:00,0,60,";
    const file = new File([csv], "records.csv", { type: "text/csv" });

    await act(async () => {
      await result.current.handleFileChange(changeEventFor(file));
    });

    expect(alertSpy).toHaveBeenCalledWith(t.csvImportSuccess.replace("{value}", "1"));
    alertSpy.mockRestore();
  });

  it("shows an error alert when the file cannot be parsed", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const { result } = renderHook(() => useCsvImport(() => {}, t));

    const file = {
      text: () => Promise.reject(new Error("read failed")),
    } as unknown as File;

    await act(async () => {
      await result.current.handleFileChange(changeEventFor(file));
    });

    expect(alertSpy).toHaveBeenCalledWith(t.csvImportError);
    alertSpy.mockRestore();
  });

  it("does nothing when no file is selected", async () => {
    const onImportRecords = vi.fn();
    const { result } = renderHook(() => useCsvImport(onImportRecords, t));

    await act(async () => {
      await result.current.handleFileChange(changeEventFor(null));
    });

    expect(onImportRecords).not.toHaveBeenCalled();
  });
});
