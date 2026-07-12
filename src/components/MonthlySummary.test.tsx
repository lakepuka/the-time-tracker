import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getTranslations } from "@/lib/i18n";
import type { WorkRecord } from "@/lib/records";
import { MonthlySummary } from "./MonthlySummary";

const ja = getTranslations("ja");

function makeRecord(overrides: Partial<WorkRecord>): WorkRecord {
  return {
    id: "id",
    date: "2026-07-01",
    startedAt: new Date(2026, 6, 1, 10, 0, 0).toISOString(),
    endedAt: new Date(2026, 6, 1, 11, 30, 0).toISOString(),
    ...overrides,
  };
}

describe("MonthlySummary", () => {
  it("renders nothing when there are no finished records", () => {
    const { container } = render(<MonthlySummary language="ja" t={ja} records={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows a total duration per month", () => {
    render(<MonthlySummary language="ja" t={ja} records={[makeRecord({})]} />);

    expect(screen.getByText("2026年07月")).toBeInTheDocument();
    expect(screen.getByText("1時間30分")).toBeInTheDocument();
  });

  it("highlights the current month's row", () => {
    const records = [
      makeRecord({
        id: "current",
        date: "2026-07-01",
        startedAt: new Date(2026, 6, 1, 10, 0, 0).toISOString(),
        endedAt: new Date(2026, 6, 1, 11, 30, 0).toISOString(),
      }),
      makeRecord({
        id: "past",
        date: "2026-06-01",
        startedAt: new Date(2026, 5, 1, 10, 0, 0).toISOString(),
        endedAt: new Date(2026, 5, 1, 11, 30, 0).toISOString(),
      }),
    ];
    render(
      <MonthlySummary language="ja" t={ja} records={records} now={() => new Date(2026, 6, 15)} />,
    );

    const currentItem = screen.getByText("2026年07月").closest("li");
    const pastItem = screen.getByText("2026年06月").closest("li");

    expect(currentItem).toHaveAttribute("data-current", "true");
    expect(pastItem).toHaveAttribute("data-current", "false");
  });

  it("does not highlight any row when no month matches the current month", () => {
    render(
      <MonthlySummary
        language="ja"
        t={ja}
        records={[makeRecord({})]}
        now={() => new Date(2026, 8, 1)}
      />,
    );

    expect(screen.getByText("2026年07月").closest("li")).toHaveAttribute("data-current", "false");
  });
});
