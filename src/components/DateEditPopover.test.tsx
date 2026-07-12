import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getTranslations } from "@/lib/i18n";
import { DateEditPopover } from "./DateEditPopover";

const ja = getTranslations("ja");

describe("DateEditPopover", () => {
  it("shows the given label as the trigger and no inputs yet", () => {
    render(
      <DateEditPopover
        value="2026-07-05"
        language="ja"
        t={ja}
        onChange={() => {}}
        label="2026/07/05"
      />,
    );

    expect(screen.getByRole("button", { name: "2026/07/05" })).toBeInTheDocument();
    expect(screen.queryByLabelText("日")).not.toBeInTheDocument();
  });

  it("opens year/month/day inputs prefilled from the value when the trigger is clicked", () => {
    render(
      <DateEditPopover
        value="2026-07-05"
        language="ja"
        t={ja}
        onChange={() => {}}
        label="2026/07/05"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "2026/07/05" }));

    expect(screen.getByLabelText("年")).toHaveValue(2026);
    expect(screen.getByLabelText("月")).toHaveValue(7);
    expect(screen.getByLabelText("日")).toHaveValue(5);
  });

  it("does not call onChange while editing until OK is clicked", () => {
    const onChange = vi.fn();
    render(
      <DateEditPopover
        value="2026-07-05"
        language="ja"
        t={ja}
        onChange={onChange}
        label="2026/07/05"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "2026/07/05" }));

    fireEvent.change(screen.getByLabelText("日"), { target: { value: "8" } });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("calls onChange with the combined date and closes the popover when OK is clicked", () => {
    const onChange = vi.fn();
    render(
      <DateEditPopover
        value="2026-07-05"
        language="ja"
        t={ja}
        onChange={onChange}
        label="2026/07/05"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "2026/07/05" }));

    fireEvent.change(screen.getByLabelText("日"), { target: { value: "8" } });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));

    expect(onChange).toHaveBeenCalledWith("2026-07-08");
    expect(screen.queryByLabelText("日")).not.toBeInTheDocument();
  });

  it("closes without calling onChange when clicking outside", () => {
    const onChange = vi.fn();
    render(
      <div>
        <DateEditPopover
          value="2026-07-05"
          language="ja"
          t={ja}
          onChange={onChange}
          label="2026/07/05"
        />
        <button type="button">outside</button>
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: "2026/07/05" }));
    expect(screen.getByLabelText("日")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole("button", { name: "outside" }));

    expect(screen.queryByLabelText("日")).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("resets the draft fields from the current value each time it is reopened", () => {
    const onChange = vi.fn();
    render(
      <DateEditPopover
        value="2026-07-05"
        language="ja"
        t={ja}
        onChange={onChange}
        label="2026/07/05"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "2026/07/05" }));
    fireEvent.change(screen.getByLabelText("日"), { target: { value: "20" } });
    fireEvent.mouseDown(document.body);

    fireEvent.click(screen.getByRole("button", { name: "2026/07/05" }));
    expect(screen.getByLabelText("日")).toHaveValue(5);
  });

  it("shows the weekday for the currently selected date", () => {
    render(
      <DateEditPopover
        value="2026-07-05"
        language="ja"
        t={ja}
        onChange={() => {}}
        label="2026/07/05"
      />,
    );

    // 2026-07-05 is a Sunday.
    fireEvent.click(screen.getByRole("button", { name: "2026/07/05" }));

    expect(screen.getByText("(日)")).toBeInTheDocument();
  });

  it("updates the weekday live as the day field is edited", () => {
    render(
      <DateEditPopover
        value="2026-07-05"
        language="ja"
        t={ja}
        onChange={() => {}}
        label="2026/07/05"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "2026/07/05" }));

    // 2026-07-08 is a Wednesday.
    fireEvent.change(screen.getByLabelText("日"), { target: { value: "8" } });

    expect(screen.queryByText("(日)")).not.toBeInTheDocument();
    expect(screen.getByText("(水)")).toBeInTheDocument();
  });
});
