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

  it("shows the running status with the start time when active", () => {
    const startedAt = new Date(2026, 6, 5, 10, 30, 0).toISOString();
    render(<TimerButton t={ja} isActive onToggle={() => {}} startedAt={startedAt} />);

    expect(screen.getByText("計測中 開始 10:30")).toBeInTheDocument();
  });

  it("shows the most recent duration in the idle status", () => {
    render(<TimerButton t={ja} isActive={false} onToggle={() => {}} lastDurationMinutes={144} />);

    expect(screen.getByText("停止中 直近 2時間24分")).toBeInTheDocument();
  });

  it("shows a plain stopped status when there is no recent record", () => {
    render(<TimerButton t={ja} isActive={false} onToggle={() => {}} />);

    expect(screen.getByText("停止中")).toBeInTheDocument();
  });

  it("does not show the running status when not active", () => {
    const startedAt = new Date(2026, 6, 5, 10, 30, 0).toISOString();
    render(<TimerButton t={ja} isActive={false} onToggle={() => {}} startedAt={startedAt} />);

    expect(screen.queryByText(/計測中/)).not.toBeInTheDocument();
  });

  it("shows English labels when given English translations", () => {
    const startedAt = new Date(2026, 6, 5, 10, 30, 0).toISOString();
    render(<TimerButton t={en} language="en" isActive onToggle={() => {}} startedAt={startedAt} />);

    expect(screen.getByRole("button", { name: "Stop" })).toBeInTheDocument();
    expect(screen.getByText("Tracking · since 10:30")).toBeInTheDocument();
  });
});
