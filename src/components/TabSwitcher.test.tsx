import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Tab } from "@/lib/tabs";
import { TabSwitcher } from "./TabSwitcher";

const tabs: Tab[] = [
  { id: "default", name: "Timer" },
  { id: "tab-2", name: "副業B" },
];

function renderSwitcher(overrides: Partial<React.ComponentProps<typeof TabSwitcher>> = {}) {
  return render(
    <TabSwitcher
      tabs={tabs}
      activeTabId="default"
      namingTabId={null}
      onSelectTab={() => {}}
      onRenameTab={() => {}}
      onFinishNaming={() => {}}
      onAddTab={() => {}}
      addTabLabel="タブを追加"
      nameInputLabel="新しいタブ名"
      {...overrides}
    />,
  );
}

describe("TabSwitcher", () => {
  it("renders the active tab as a plain button marked with aria-current", () => {
    renderSwitcher();

    const active = screen.getByRole("button", { name: "Timer" });
    expect(active).toHaveAttribute("aria-current", "true");
  });

  it("renders inactive tabs as switch buttons", () => {
    renderSwitcher();

    const inactive = screen.getByRole("button", { name: "副業B" });
    expect(inactive).toHaveAttribute("aria-current", "false");
  });

  it("does not render an editable field when no tab is being named", () => {
    renderSwitcher();

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("calls onSelectTab when an inactive tab is clicked", () => {
    const onSelectTab = vi.fn();
    renderSwitcher({ onSelectTab });

    fireEvent.click(screen.getByRole("button", { name: "副業B" }));

    expect(onSelectTab).toHaveBeenCalledWith("tab-2");
  });

  it("calls onAddTab when the add button is clicked", () => {
    const onAddTab = vi.fn();
    renderSwitcher({ tabs: [tabs[0]], onAddTab });

    fireEvent.click(screen.getByRole("button", { name: "タブを追加" }));

    expect(onAddTab).toHaveBeenCalledOnce();
  });

  it("renders the tab being named as an editable field", () => {
    renderSwitcher({
      tabs: [
        { id: "default", name: "Timer" },
        { id: "new", name: "" },
      ],
      namingTabId: "new",
    });

    const input = screen.getByRole("textbox", { name: "新しいタブ名" });
    expect(input).toHaveValue("");
  });

  it("calls onRenameTab as the user types the new tab's name", () => {
    const onRenameTab = vi.fn();
    renderSwitcher({
      tabs: [
        { id: "default", name: "Timer" },
        { id: "new", name: "" },
      ],
      namingTabId: "new",
      onRenameTab,
    });

    fireEvent.change(screen.getByRole("textbox", { name: "新しいタブ名" }), {
      target: { value: "副業C" },
    });

    expect(onRenameTab).toHaveBeenCalledWith("new", "副業C");
  });

  it("calls onFinishNaming when the naming field loses focus", () => {
    const onFinishNaming = vi.fn();
    renderSwitcher({
      tabs: [
        { id: "default", name: "Timer" },
        { id: "new", name: "" },
      ],
      namingTabId: "new",
      onFinishNaming,
    });

    fireEvent.blur(screen.getByRole("textbox", { name: "新しいタブ名" }));

    expect(onFinishNaming).toHaveBeenCalledWith("new");
  });

  it("finishes naming when Enter is pressed", () => {
    const onFinishNaming = vi.fn();
    renderSwitcher({
      tabs: [
        { id: "default", name: "Timer" },
        { id: "new", name: "" },
      ],
      namingTabId: "new",
      onFinishNaming,
    });

    const input = screen.getByRole("textbox", { name: "新しいタブ名" });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.blur(input);

    expect(onFinishNaming).toHaveBeenCalledWith("new");
  });
});
