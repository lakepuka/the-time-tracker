import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getTranslations } from "@/lib/i18n";
import type { WorkRecord } from "@/lib/records";
import { CalendarHeatmap } from "./CalendarHeatmap";

const ja = getTranslations("ja");

const fixedNow = () => new Date(2026, 6, 15);

function makeRecord(overrides: Partial<WorkRecord>): WorkRecord {
  return {
    id: "id",
    date: "2026-07-05",
    startedAt: new Date(2026, 6, 5, 9, 0, 0).toISOString(),
    endedAt: new Date(2026, 6, 5, 10, 30, 0).toISOString(),
    ...overrides,
  };
}

describe("CalendarHeatmap", () => {
  it("shows the current month and weekday headers on mount", () => {
    render(
      <CalendarHeatmap
        records={[]}
        selectedDate={null}
        onSelectDate={() => {}}
        now={fixedNow}
        language="ja"
        t={ja}
      />,
    );

    expect(screen.getByText("2026年07月")).toBeInTheDocument();
    expect(screen.getByText("日")).toBeInTheDocument();
    expect(screen.getByText("土")).toBeInTheDocument();
  });

  it("shows an abbreviated hour label on a day with worked time", () => {
    render(
      <CalendarHeatmap
        records={[makeRecord({})]}
        selectedDate={null}
        onSelectDate={() => {}}
        now={fixedNow}
        language="ja"
        t={ja}
      />,
    );

    expect(screen.getByText("1.5h")).toBeInTheDocument();
  });

  it("shows no hour label on a day with no records", () => {
    render(
      <CalendarHeatmap
        records={[]}
        selectedDate={null}
        onSelectDate={() => {}}
        now={fixedNow}
        language="ja"
        t={ja}
      />,
    );

    expect(screen.queryByText(/h$/)).not.toBeInTheDocument();
  });

  it("navigates to the previous and next month", () => {
    render(
      <CalendarHeatmap
        records={[]}
        selectedDate={null}
        onSelectDate={() => {}}
        now={fixedNow}
        language="ja"
        t={ja}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "前の月" }));
    expect(screen.getByText("2026年06月")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "次の月" }));
    fireEvent.click(screen.getByRole("button", { name: "次の月" }));
    expect(screen.getByText("2026年08月")).toBeInTheDocument();
  });

  it("calls onSelectDate with the date when a day is clicked", () => {
    const onSelectDate = vi.fn();
    render(
      <CalendarHeatmap
        records={[makeRecord({})]}
        selectedDate={null}
        onSelectDate={onSelectDate}
        now={fixedNow}
        language="ja"
        t={ja}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /^5日/ }));

    expect(onSelectDate).toHaveBeenCalledWith("2026-07-05");
  });

  it("calls onSelectDate with null when the selected day is clicked again", () => {
    const onSelectDate = vi.fn();
    render(
      <CalendarHeatmap
        records={[makeRecord({})]}
        selectedDate="2026-07-05"
        onSelectDate={onSelectDate}
        now={fixedNow}
        language="ja"
        t={ja}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /^5日/ }));

    expect(onSelectDate).toHaveBeenCalledWith(null);
  });
});
