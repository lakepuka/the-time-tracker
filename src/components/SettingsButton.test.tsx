import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getTranslations } from "@/lib/i18n";
import type { Tab } from "@/lib/tabs";
import { SettingsButton } from "./SettingsButton";

const tabs: Tab[] = [{ id: "default", name: "タイマー" }];

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      media: "(prefers-color-scheme: dark)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

function renderSettings(overrides: Partial<React.ComponentProps<typeof SettingsButton>> = {}) {
  return render(
    <SettingsButton
      tabs={tabs}
      onAddTab={() => {}}
      onRemoveTab={() => {}}
      onRenameTab={() => {}}
      onImportRecords={() => {}}
      language="ja"
      onChangeLanguage={() => {}}
      showSummary={true}
      onChangeShowSummary={() => {}}
      t={getTranslations("ja")}
      {...overrides}
    />,
  );
}

describe("SettingsButton", () => {
  it("does not show the theme picker until opened", () => {
    renderSettings();

    expect(screen.getByRole("button", { name: "設定" })).toBeInTheDocument();
    expect(screen.queryByText("テーマ")).not.toBeInTheDocument();
  });

  it("shows light/dark/system options when opened", () => {
    renderSettings();

    fireEvent.click(screen.getByRole("button", { name: "設定" }));

    expect(screen.getByText("テーマ")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ライト" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ダーク" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "システム" })).toBeInTheDocument();
  });

  it("marks system as pressed by default", () => {
    renderSettings();
    fireEvent.click(screen.getByRole("button", { name: "設定" }));

    expect(screen.getByRole("button", { name: "システム" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "ライト" })).toHaveAttribute("aria-pressed", "false");
  });

  it("applies the dark class and updates the pressed option when dark is chosen", () => {
    renderSettings();
    fireEvent.click(screen.getByRole("button", { name: "設定" }));

    fireEvent.click(screen.getByRole("button", { name: "ダーク" }));

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(screen.getByRole("button", { name: "ダーク" })).toHaveAttribute("aria-pressed", "true");
  });

  it("closes the panel when clicking outside", () => {
    render(
      <div>
        <SettingsButton
          tabs={tabs}
          onAddTab={() => {}}
          onRemoveTab={() => {}}
          onRenameTab={() => {}}
          onImportRecords={() => {}}
          language="ja"
          onChangeLanguage={() => {}}
          showSummary={true}
          onChangeShowSummary={() => {}}
          t={getTranslations("ja")}
        />
        <button type="button">outside</button>
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: "設定" }));
    expect(screen.getByText("テーマ")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole("button", { name: "outside" }));

    expect(screen.queryByText("テーマ")).not.toBeInTheDocument();
  });

  it("reflects the summary toggle state and calls onChangeShowSummary when toggled", () => {
    const onChangeShowSummary = vi.fn();
    renderSettings({ showSummary: true, onChangeShowSummary });
    fireEvent.click(screen.getByRole("button", { name: "設定" }));

    const toggle = screen.getByRole("switch", { name: "サマリー" });
    expect(toggle).toHaveAttribute("aria-checked", "true");

    fireEvent.click(toggle);

    expect(onChangeShowSummary).toHaveBeenCalledWith(false);
  });

  it("lists the current tabs as editable name fields", () => {
    renderSettings({
      tabs: [
        { id: "default", name: "タイマー" },
        { id: "tab-2", name: "副業B" },
      ],
    });

    fireEvent.click(screen.getByRole("button", { name: "設定" }));

    expect(screen.getByDisplayValue("タイマー")).toBeInTheDocument();
    expect(screen.getByDisplayValue("副業B")).toBeInTheDocument();
  });

  it("calls onRenameTab when a tab's name field is edited", () => {
    const onRenameTab = vi.fn();
    renderSettings({
      tabs: [
        { id: "default", name: "タイマー" },
        { id: "tab-2", name: "副業B" },
      ],
      onRenameTab,
    });
    fireEvent.click(screen.getByRole("button", { name: "設定" }));

    fireEvent.change(screen.getByDisplayValue("副業B"), { target: { value: "副業C" } });

    expect(onRenameTab).toHaveBeenCalledWith("tab-2", "副業C");
  });

  it("does not show a delete button when there is only one tab", () => {
    renderSettings();
    fireEvent.click(screen.getByRole("button", { name: "設定" }));

    expect(screen.queryByRole("button", { name: "タイマーを削除" })).not.toBeInTheDocument();
  });

  it("calls onRemoveTab after confirming deletion", () => {
    const onRemoveTab = vi.fn();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderSettings({
      tabs: [
        { id: "default", name: "タイマー" },
        { id: "tab-2", name: "副業B" },
      ],
      onRemoveTab,
    });
    fireEvent.click(screen.getByRole("button", { name: "設定" }));

    fireEvent.click(screen.getByRole("button", { name: "副業Bを削除" }));

    expect(onRemoveTab).toHaveBeenCalledWith("tab-2");
  });

  it("does not call onRemoveTab when deletion is cancelled", () => {
    const onRemoveTab = vi.fn();
    vi.spyOn(window, "confirm").mockReturnValue(false);
    renderSettings({
      tabs: [
        { id: "default", name: "タイマー" },
        { id: "tab-2", name: "副業B" },
      ],
      onRemoveTab,
    });
    fireEvent.click(screen.getByRole("button", { name: "設定" }));

    fireEvent.click(screen.getByRole("button", { name: "副業Bを削除" }));

    expect(onRemoveTab).not.toHaveBeenCalled();
  });

  it("adds a new tab from the input and clears it afterwards", () => {
    const onAddTab = vi.fn();
    renderSettings({ onAddTab });
    fireEvent.click(screen.getByRole("button", { name: "設定" }));

    fireEvent.change(screen.getByPlaceholderText("新しいタブ名"), {
      target: { value: "副業B" },
    });
    fireEvent.click(screen.getByRole("button", { name: "追加" }));

    expect(onAddTab).toHaveBeenCalledWith("副業B");
    expect(screen.getByPlaceholderText("新しいタブ名")).toHaveValue("");
  });

  it("disables the add button when the input is empty", () => {
    renderSettings();
    fireEvent.click(screen.getByRole("button", { name: "設定" }));

    expect(screen.getByRole("button", { name: "追加" })).toBeDisabled();
  });

  it("shows a language switcher and calls onChangeLanguage when English is chosen", () => {
    const onChangeLanguage = vi.fn();
    renderSettings({ onChangeLanguage });
    fireEvent.click(screen.getByRole("button", { name: "設定" }));

    expect(screen.getByRole("button", { name: "日本語" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "English" }));

    expect(onChangeLanguage).toHaveBeenCalledWith("en");
  });

  it("shows a CSV import button", () => {
    renderSettings();
    fireEvent.click(screen.getByRole("button", { name: "設定" }));

    expect(screen.getByRole("button", { name: "CSVインポート" })).toBeInTheDocument();
  });

  it("parses a selected CSV file and calls onImportRecords", async () => {
    const onImportRecords = vi.fn();
    renderSettings({ onImportRecords });
    fireEvent.click(screen.getByRole("button", { name: "設定" }));

    const csv = "日付,開始,終了,調整(分),稼働時間(分),備考\r\n2026-07-05,10:00,11:00,0,60,客先訪問";
    const file = new File([csv], "records.csv", { type: "text/csv" });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(onImportRecords).toHaveBeenCalledTimes(1));
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

  it("reflects and changes a tab's tracking precision", () => {
    const onChangePrecision = vi.fn();
    renderSettings({
      getPrecision: () => "minute",
      onChangePrecision,
    });
    fireEvent.click(screen.getByRole("button", { name: "設定" }));

    const group = screen.getByRole("group", { name: "タイマーの計測単位" });
    const minute = within(group).getByRole("button", { name: "分" });
    const second = within(group).getByRole("button", { name: "秒" });

    expect(minute).toHaveAttribute("aria-pressed", "true");
    expect(second).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(second);
    expect(onChangePrecision).toHaveBeenCalledWith("default", "second");
  });

  it("shows a footer link to lakepuka.com that opens safely in a new tab", () => {
    renderSettings();
    fireEvent.click(screen.getByRole("button", { name: "設定" }));

    const link = screen.getByRole("link", { name: /lakepuka/ });
    expect(link).toHaveAttribute("href", "https://lakepuka.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows English labels throughout when given English translations", () => {
    renderSettings({ language: "en", t: getTranslations("en") });

    fireEvent.click(screen.getByRole("button", { name: "Settings" }));

    expect(screen.getByText("Theme")).toBeInTheDocument();
    expect(screen.getByText("Language")).toBeInTheDocument();
    expect(screen.getByText("Tabs")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Light" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("New tab name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });
});
