"use client";

import { useState } from "react";
import { CloseIcon, SettingsIcon } from "@/components/icons";
import { useColorSchemeMode } from "@/hooks/useColorSchemeMode";
import { useCsvImport } from "@/hooks/useCsvImport";
import { usePopover } from "@/hooks/usePopover";
import type { ColorSchemeMode } from "@/lib/colorScheme";
import { formatTemplate, LANGUAGES, type Language, type Translations } from "@/lib/i18n";
import type { WorkRecord } from "@/lib/records";
import type { Tab } from "@/lib/tabs";
import { DEFAULT_TIMER_PRECISION, type TimerPrecision } from "@/lib/timerPrecision";

type SettingsButtonProps = {
  tabs: Tab[];
  onAddTab: (name: string) => void;
  onRemoveTab: (id: string) => void;
  onRenameTab: (id: string, name: string) => void;
  onImportRecords: (records: Omit<WorkRecord, "id">[]) => void;
  language: Language;
  onChangeLanguage: (language: Language) => void;
  showSummary: boolean;
  onChangeShowSummary: (value: boolean) => void;
  getPrecision?: (tabId: string) => TimerPrecision;
  onChangePrecision?: (tabId: string, precision: TimerPrecision) => void;
  t: Translations;
};

type ToggleProps = {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
};

/** A paper switch: an outlined square that slides along a ruled track. */
function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-5 w-11 shrink-0 items-center"
    >
      <span className="h-px w-full bg-[color:var(--edge-strong)]" aria-hidden />
      <span
        aria-hidden
        className={`absolute top-0 h-5 w-5 border bg-paper transition-[left] duration-150 ${
          checked
            ? "left-6 border-[color:var(--brand)]"
            : "left-0 border-[color:var(--edge-strong)]"
        }`}
      />
    </button>
  );
}

type SegmentedControlProps<T extends string> = {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
};

/** Adjacent cells sharing one 1px rule, like an option table on the sheet. */
function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="mb-4 flex border border-[color:var(--tab-idle-edge)]">
      {options.map((option, index) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
          className={`min-h-8 flex-1 px-2 py-1 text-[0.6875rem] ${
            index > 0 ? "border-l border-[color:var(--tab-idle-edge)]" : ""
          } ${
            value === option.id
              ? "bg-[color:var(--field-bg)] font-semibold text-[color:var(--brand)]"
              : "text-[color:var(--body)] hover:text-[color:var(--brand)]"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

type PrecisionToggleProps = {
  value: TimerPrecision;
  onChange: (precision: TimerPrecision) => void;
  label: string;
  t: Translations;
};

/** Compact per-tab unit switch: 分 | 秒. */
function PrecisionToggle({ value, onChange, label, t }: PrecisionToggleProps) {
  const options: { id: TimerPrecision; text: string }[] = [
    { id: "minute", text: t.unitMinute },
    { id: "second", text: t.unitSecond },
  ];
  return (
    <fieldset
      aria-label={label}
      className="m-0 flex min-w-0 shrink-0 border border-[color:var(--tab-idle-edge)] p-0"
    >
      {options.map((option, index) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
          className={`min-h-6 px-2 py-0.5 text-[0.6875rem] ${
            index > 0 ? "border-l border-[color:var(--tab-idle-edge)]" : ""
          } ${
            value === option.id
              ? "bg-[color:var(--field-bg)] font-semibold text-[color:var(--brand)]"
              : "text-[color:var(--muted)] hover:text-[color:var(--brand)]"
          }`}
        >
          {option.text}
        </button>
      ))}
    </fieldset>
  );
}

export function SettingsButton({
  tabs,
  onAddTab,
  onRemoveTab,
  onRenameTab,
  onImportRecords,
  language,
  onChangeLanguage,
  showSummary,
  onChangeShowSummary,
  getPrecision = () => DEFAULT_TIMER_PRECISION,
  onChangePrecision = () => {},
  t,
}: SettingsButtonProps) {
  const { isOpen, setIsOpen, containerRef } = usePopover<HTMLDivElement>();
  const [newTabName, setNewTabName] = useState("");
  const { mode, setMode } = useColorSchemeMode();
  const { fileInputRef, triggerImport, handleFileChange } = useCsvImport(onImportRecords, t);

  const modeOptions: { id: ColorSchemeMode; label: string }[] = [
    { id: "light", label: t.light },
    { id: "dark", label: t.dark },
    { id: "system", label: t.system },
  ];

  function handleRemoveTab(tab: Tab) {
    if (window.confirm(formatTemplate(t.deleteTabConfirm, tab.name))) {
      onRemoveTab(tab.id);
    }
  }

  function handleAddTab() {
    const name = newTabName.trim();
    if (!name) return;
    onAddTab(name);
    setNewTabName("");
  }

  const sectionLabel = "ledger-label mb-2 !text-[0.625rem] text-muted";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={t.settingsLabel}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="chip !h-8 !w-8 !min-h-0 !px-0"
      >
        <SettingsIcon className="h-4 w-4" />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-2 w-68 border border-[color:var(--edge-strong)] bg-paper p-3">
          <h2 className={sectionLabel}>{t.theme}</h2>
          <SegmentedControl options={modeOptions} value={mode} onChange={setMode} />

          <h2 className={sectionLabel}>{t.language}</h2>
          <SegmentedControl options={LANGUAGES} value={language} onChange={onChangeLanguage} />

          <div className="mb-4 flex items-center justify-between">
            <h2 className="ledger-label !text-[0.625rem] text-muted">{t.summary}</h2>
            <Toggle label={t.summary} checked={showSummary} onChange={onChangeShowSummary} />
          </div>

          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="ledger-label !text-[0.625rem] text-muted">{t.tabsLabel}</h2>
            <span className="text-[0.625rem] text-muted">{t.trackingUnit}</span>
          </div>
          <ul className="mb-2 flex flex-col gap-1.5">
            {tabs.map((tab) => (
              <li key={tab.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={tab.name}
                  onChange={(event) => onRenameTab(tab.id, event.target.value)}
                  className="field min-w-0 flex-1"
                />
                <PrecisionToggle
                  value={getPrecision(tab.id)}
                  onChange={(precision) => onChangePrecision(tab.id, precision)}
                  label={formatTemplate(t.precisionAriaLabel, tab.name)}
                  t={t}
                />
                {tabs.length > 1 && (
                  <button
                    type="button"
                    aria-label={formatTemplate(t.deleteTabAriaLabel, tab.name)}
                    onClick={() => handleRemoveTab(tab)}
                    className="text-[color:var(--del)] hover:text-[color:var(--stop)]"
                  >
                    <CloseIcon className="h-3.5 w-3.5" />
                  </button>
                )}
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTabName}
              onChange={(event) => setNewTabName(event.target.value)}
              placeholder={t.newTabPlaceholder}
              className="field field--boxed min-w-0 flex-1"
            />
            <button
              type="button"
              onClick={handleAddTab}
              disabled={newTabName.trim().length === 0}
              className="chip shrink-0"
            >
              {t.add}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <button type="button" onClick={triggerImport} className="chip mt-4 w-full">
            {t.csvImport}
          </button>
        </div>
      )}
    </div>
  );
}
