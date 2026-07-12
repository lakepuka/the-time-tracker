import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { usePopover } from "./usePopover";

function Fixture() {
  const { isOpen, setIsOpen, containerRef } = usePopover<HTMLDivElement>();

  return (
    <div>
      <div ref={containerRef}>
        <button type="button" onClick={() => setIsOpen((open) => !open)}>
          trigger
        </button>
        {isOpen && <p>panel</p>}
      </div>
      <button type="button">outside</button>
    </div>
  );
}

describe("usePopover", () => {
  it("starts closed", () => {
    render(<Fixture />);
    expect(screen.queryByText("panel")).not.toBeInTheDocument();
  });

  it("opens and closes via setIsOpen", () => {
    render(<Fixture />);

    fireEvent.click(screen.getByRole("button", { name: "trigger" }));
    expect(screen.getByText("panel")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "trigger" }));
    expect(screen.queryByText("panel")).not.toBeInTheDocument();
  });

  it("closes when clicking outside the container", () => {
    render(<Fixture />);
    fireEvent.click(screen.getByRole("button", { name: "trigger" }));

    fireEvent.mouseDown(screen.getByRole("button", { name: "outside" }));

    expect(screen.queryByText("panel")).not.toBeInTheDocument();
  });

  it("stays open when clicking inside the container", () => {
    render(<Fixture />);
    fireEvent.click(screen.getByRole("button", { name: "trigger" }));

    fireEvent.mouseDown(screen.getByText("panel"));

    expect(screen.getByText("panel")).toBeInTheDocument();
  });
});
