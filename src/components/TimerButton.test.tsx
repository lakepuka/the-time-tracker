import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { getTranslations } from "@/lib/i18n";
import { TimerButton } from "./TimerButton";

const ja = getTranslations("ja");
const en = getTranslations("en");

describe("TimerButton", () => {
  it("shows a start label when not active", () => {
    render(<TimerButton t={ja} isActive={false} onToggle={() => {}} />);
    expect(screen.getByRole("button", { name: "開始" })).toBeInTheDocument();
  });

  it("shows a stop label when active", () => {
    render(<TimerButton t={ja} isActive onToggle={() => {}} />);
    expect(screen.getByRole("button", { name: "終了" })).toBeInTheDocument();
  });

  it("calls onToggle when clicked", async () => {
    const onToggle = vi.fn();
    render(<TimerButton t={ja} isActive={false} onToggle={onToggle} />);

    await userEvent.click(screen.getByRole("button"));

    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("shows the start time when active and a startedAt is given", () => {
    const startedAt = new Date(2026, 6, 5, 10, 30, 0).toISOString();
    render(<TimerButton t={ja} isActive onToggle={() => {}} startedAt={startedAt} />);

    expect(screen.getByText("10:30から計測中")).toBeInTheDocument();
  });

  it("does not show a start time when not active", () => {
    const startedAt = new Date(2026, 6, 5, 10, 30, 0).toISOString();
    render(<TimerButton t={ja} isActive={false} onToggle={() => {}} startedAt={startedAt} />);

    expect(screen.queryByText(/から計測中/)).not.toBeInTheDocument();
  });

  it("does not show a start time when active but no startedAt is given", () => {
    render(<TimerButton t={ja} isActive onToggle={() => {}} />);

    expect(screen.queryByText(/から計測中/)).not.toBeInTheDocument();
  });

  it("shows English labels when given English translations", () => {
    const startedAt = new Date(2026, 6, 5, 10, 30, 0).toISOString();
    render(<TimerButton t={en} isActive onToggle={() => {}} startedAt={startedAt} />);

    expect(screen.getByRole("button", { name: "Stop" })).toBeInTheDocument();
    expect(screen.getByText("Tracking since 10:30")).toBeInTheDocument();
  });
});
