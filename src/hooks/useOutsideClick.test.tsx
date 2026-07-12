import { fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { useOutsideClick } from "./useOutsideClick";

function Fixture({ onOutsideClick, enabled }: { onOutsideClick: () => void; enabled: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, onOutsideClick, enabled);

  return (
    <div>
      <div ref={ref}>
        <button type="button">inside</button>
      </div>
      <button type="button">outside</button>
    </div>
  );
}

describe("useOutsideClick", () => {
  it("calls the handler when clicking outside the referenced element", () => {
    const onOutsideClick = vi.fn();
    render(<Fixture onOutsideClick={onOutsideClick} enabled />);

    fireEvent.mouseDown(screen.getByRole("button", { name: "outside" }));

    expect(onOutsideClick).toHaveBeenCalledOnce();
  });

  it("does not call the handler when clicking inside", () => {
    const onOutsideClick = vi.fn();
    render(<Fixture onOutsideClick={onOutsideClick} enabled />);

    fireEvent.mouseDown(screen.getByRole("button", { name: "inside" }));

    expect(onOutsideClick).not.toHaveBeenCalled();
  });

  it("does nothing when disabled", () => {
    const onOutsideClick = vi.fn();
    render(<Fixture onOutsideClick={onOutsideClick} enabled={false} />);

    fireEvent.mouseDown(screen.getByRole("button", { name: "outside" }));

    expect(onOutsideClick).not.toHaveBeenCalled();
  });
});
