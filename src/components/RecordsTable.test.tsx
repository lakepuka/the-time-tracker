import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getTranslations } from "@/lib/i18n";
import type { WorkRecord } from "@/lib/records";
import { RecordsTable } from "./RecordsTable";

const ja = getTranslations("ja");

const finishedRecord: WorkRecord = {
  id: "1",
  date: "2026-07-05",
  startedAt: new Date(2026, 6, 5, 10, 0, 0).toISOString(),
  endedAt: new Date(2026, 6, 5, 11, 30, 0).toISOString(),
  adjustmentMinutes: 15,
  memo: "出張先での作業",
};

const activeRecord: WorkRecord = {
  id: "2",
  date: "2026-07-06",
  startedAt: new Date(2026, 6, 6, 9, 0, 0).toISOString(),
  endedAt: null,
};

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("RecordsTable", () => {
  it("shows an empty state when there are no records", () => {
    render(
      <RecordsTable
        tabId="test-tab"
        language="ja"
        t={ja}
        records={[]}
        onUpdate={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(screen.getByText("記録がありません")).toBeInTheDocument();
  });

  it("renders date, start/end time, adjustment, net duration and memo", () => {
    render(
      <RecordsTable
        tabId="test-tab"
        language="ja"
        t={ja}
        records={[finishedRecord]}
        onUpdate={() => {}}
        onDelete={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "2026/07/05" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("10:00")).toBeInTheDocument();
    expect(screen.getByDisplayValue("11:30")).toBeInTheDocument();
    expect(screen.getByDisplayValue("15")).toBeInTheDocument();
    expect(screen.getAllByText("1時間15分").length).toBeGreaterThan(0);
    expect(screen.getByDisplayValue("出張先での作業")).toBeInTheDocument();
  });

  it("shows an in-progress indicator for a record with no end time", () => {
    render(
      <RecordsTable
        tabId="test-tab"
        language="ja"
        t={ja}
        records={[activeRecord]}
        onUpdate={() => {}}
        onDelete={() => {}}
      />,
    );

    expect(screen.getByText("稼働中")).toBeInTheDocument();
  });

  it("calls onUpdate with a combined ISO string when the start time is edited", () => {
    const onUpdate = vi.fn();
    render(
      <RecordsTable
        tabId="test-tab"
        language="ja"
        t={ja}
        records={[finishedRecord]}
        onUpdate={onUpdate}
        onDelete={() => {}}
      />,
    );

    fireEvent.change(screen.getByDisplayValue("10:00"), { target: { value: "09:15" } });

    expect(onUpdate).toHaveBeenCalledWith("1", {
      startedAt: new Date(2026, 6, 5, 9, 15, 0).toISOString(),
    });
  });

  it("calls onUpdate for both start and end when the date is edited", () => {
    const onUpdate = vi.fn();
    render(
      <RecordsTable
        tabId="test-tab"
        language="ja"
        t={ja}
        records={[finishedRecord]}
        onUpdate={onUpdate}
        onDelete={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "2026/07/05" }));
    fireEvent.change(screen.getByLabelText("日"), { target: { value: "8" } });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));

    expect(onUpdate).toHaveBeenCalledWith("1", {
      date: "2026-07-08",
      startedAt: new Date(2026, 6, 8, 10, 0, 0).toISOString(),
      endedAt: new Date(2026, 6, 8, 11, 30, 0).toISOString(),
    });
  });

  it("shows the date only on the first row of a run of same-dated records, leaving the rest blank", () => {
    const sameDateRecord: WorkRecord = {
      id: "3",
      date: "2026-07-05",
      startedAt: new Date(2026, 6, 5, 13, 0, 0).toISOString(),
      endedAt: new Date(2026, 6, 5, 14, 0, 0).toISOString(),
    };
    render(
      <RecordsTable
        tabId="test-tab"
        language="ja"
        t={ja}
        records={[sameDateRecord, finishedRecord]}
        onUpdate={() => {}}
        onDelete={() => {}}
      />,
    );

    // First row shows the date; the repeated row is blank (no ditto mark), but
    // still an editable control labelled for accessibility.
    expect(screen.getByRole("button", { name: "2026/07/05" })).toBeInTheDocument();
    expect(screen.queryByText("〃")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2026/07/05 の日付を編集" })).toBeInTheDocument();
  });

  it("opens the date popover for just that row when the blank date cell is clicked", () => {
    const onUpdate = vi.fn();
    const sameDateRecord: WorkRecord = {
      id: "3",
      date: "2026-07-05",
      startedAt: new Date(2026, 6, 5, 13, 0, 0).toISOString(),
      endedAt: new Date(2026, 6, 5, 14, 0, 0).toISOString(),
    };
    render(
      <RecordsTable
        tabId="test-tab"
        language="ja"
        t={ja}
        records={[sameDateRecord, finishedRecord]}
        onUpdate={onUpdate}
        onDelete={() => {}}
      />,
    );

    // Rows sort most-recent-first, so the 13:00 record (sameDateRecord) shows
    // the full date and the 10:00 record (finishedRecord) has the blank cell.
    fireEvent.click(screen.getByRole("button", { name: "2026/07/05 の日付を編集" }));
    fireEvent.change(screen.getByLabelText("日"), { target: { value: "9" } });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));

    expect(onUpdate).toHaveBeenCalledWith("1", {
      date: "2026-07-09",
      startedAt: new Date(2026, 6, 9, 10, 0, 0).toISOString(),
      endedAt: new Date(2026, 6, 9, 11, 30, 0).toISOString(),
    });
  });

  it("calls onUpdate with a number when the adjustment is edited", () => {
    const onUpdate = vi.fn();
    render(
      <RecordsTable
        tabId="test-tab"
        language="ja"
        t={ja}
        records={[finishedRecord]}
        onUpdate={onUpdate}
        onDelete={() => {}}
      />,
    );

    fireEvent.change(screen.getByDisplayValue("15"), { target: { value: "30" } });

    expect(onUpdate).toHaveBeenCalledWith("1", { adjustmentMinutes: 30 });
  });

  it("shows the memo and calls onUpdate when it is edited", () => {
    const onUpdate = vi.fn();
    render(
      <RecordsTable
        tabId="test-tab"
        language="ja"
        t={ja}
        records={[finishedRecord]}
        onUpdate={onUpdate}
        onDelete={() => {}}
      />,
    );

    fireEvent.change(screen.getByDisplayValue("出張先での作業"), {
      target: { value: "客先訪問" },
    });

    expect(onUpdate).toHaveBeenCalledWith("1", { memo: "客先訪問" });
  });

  it("keeps notes collapsed until added, then reveals an empty input", () => {
    render(
      <RecordsTable
        tabId="test-tab"
        language="ja"
        t={ja}
        records={[activeRecord]}
        onUpdate={() => {}}
        onDelete={() => {}}
      />,
    );

    // A record with no memo shows no note field, only an "add note" affordance.
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /メモを追加/ }));

    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("asks for inline confirmation instead of deleting on the first click", () => {
    const onDelete = vi.fn();
    render(
      <RecordsTable
        tabId="test-tab"
        language="ja"
        t={ja}
        records={[finishedRecord]}
        onUpdate={() => {}}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "削除" }));

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "キャンセル" })).toBeInTheDocument();
  });

  it("calls onDelete with the record id once the inline confirmation is accepted", () => {
    const onDelete = vi.fn();
    render(
      <RecordsTable
        tabId="test-tab"
        language="ja"
        t={ja}
        records={[finishedRecord]}
        onUpdate={() => {}}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "削除" }));
    fireEvent.click(screen.getByRole("button", { name: "削除" }));

    expect(onDelete).toHaveBeenCalledWith("1");
  });

  it("does not call onDelete when the inline confirmation is cancelled", () => {
    const onDelete = vi.fn();
    render(
      <RecordsTable
        tabId="test-tab"
        language="ja"
        t={ja}
        records={[finishedRecord]}
        onUpdate={() => {}}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "削除" }));
    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
  });

  it("shows year and month group headers with their totals", () => {
    render(
      <RecordsTable
        tabId="test-tab"
        language="ja"
        t={ja}
        records={[finishedRecord]}
        onUpdate={() => {}}
        onDelete={() => {}}
      />,
    );

    expect(screen.getByText("2026年")).toBeInTheDocument();
    expect(screen.getByText("07月")).toBeInTheDocument();
    expect(screen.getAllByText("1時間15分").length).toBeGreaterThan(0);
  });

  it("hides a month's rows when its header is collapsed, and shows them again when expanded", () => {
    render(
      <RecordsTable
        tabId="test-tab"
        language="ja"
        t={ja}
        records={[finishedRecord]}
        onUpdate={() => {}}
        onDelete={() => {}}
      />,
    );

    expect(screen.getByDisplayValue("10:00")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /07月/ }));
    expect(screen.queryByDisplayValue("10:00")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /07月/ }));
    expect(screen.getByDisplayValue("10:00")).toBeInTheDocument();
  });

  it("hides a year's rows (and its months) when the year header is collapsed", () => {
    render(
      <RecordsTable
        tabId="test-tab"
        language="ja"
        t={ja}
        records={[finishedRecord]}
        onUpdate={() => {}}
        onDelete={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /2026年/ }));

    expect(screen.queryByText("07月")).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue("10:00")).not.toBeInTheDocument();
  });

  it("remembers a collapsed month across remounts", () => {
    const { unmount } = render(
      <RecordsTable
        tabId="test-tab"
        language="ja"
        t={ja}
        records={[finishedRecord]}
        onUpdate={() => {}}
        onDelete={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /07月/ }));
    unmount();

    render(
      <RecordsTable
        tabId="test-tab"
        language="ja"
        t={ja}
        records={[finishedRecord]}
        onUpdate={() => {}}
        onDelete={() => {}}
      />,
    );

    expect(screen.queryByDisplayValue("10:00")).not.toBeInTheDocument();
  });

  it("expands the year and month containing expandDate even if collapsed", () => {
    const { rerender } = render(
      <RecordsTable
        tabId="test-tab"
        language="ja"
        t={ja}
        records={[finishedRecord]}
        onUpdate={() => {}}
        onDelete={() => {}}
        expandDate={null}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /2026年/ }));
    expect(screen.queryByDisplayValue("10:00")).not.toBeInTheDocument();

    rerender(
      <RecordsTable
        tabId="test-tab"
        language="ja"
        t={ja}
        records={[finishedRecord]}
        onUpdate={() => {}}
        onDelete={() => {}}
        expandDate="2026-07-05"
      />,
    );

    expect(screen.getByDisplayValue("10:00")).toBeInTheDocument();
  });
});
