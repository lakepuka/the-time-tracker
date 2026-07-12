"use client";

import { useState } from "react";
import { useColorSchemeMode } from "@/hooks/useColorSchemeMode";
import { useCsvImport } from "@/hooks/useCsvImport";
import { usePopover } from "@/hooks/usePopover";
import type { ColorSchemeMode } from "@/lib/colorScheme";
import { formatTemplate, LANGUAGES, type Language, type Translations } from "@/lib/i18n";
import type { WorkRecord } from "@/lib/records";
import type { Tab } from "@/lib/tabs";

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
  t: Translations;
};

type ToggleProps = {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
};

function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
        checked ? "bg-sky-500 dark:bg-sky-600" : "bg-zinc-300 dark:bg-zinc-600"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
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

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="mb-4 flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
          className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            value === option.id
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
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

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={t.settingsLabel}
        onClick={() => setIsOpen((open) => !open)}
        className="btn-toy btn-toy-icon btn-toy-neutral !text-lg leading-none"
      >
        ⚙
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-3 w-64 rounded-2xl border-2 border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          <h2 className="mb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">{t.theme}</h2>
          <SegmentedControl options={modeOptions} value={mode} onChange={setMode} />

          <h2 className="mb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {t.language}
          </h2>
          <SegmentedControl options={LANGUAGES} value={language} onChange={onChangeLanguage} />

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{t.summary}</h2>
            <Toggle label={t.summary} checked={showSummary} onChange={onChangeShowSummary} />
          </div>

          <h2 className="mb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {t.tabsLabel}
          </h2>
          <ul className="mb-2 flex flex-col gap-1">
            {tabs.map((tab) => (
              <li key={tab.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={tab.name}
                  onChange={(event) => onRenameTab(tab.id, event.target.value)}
                  className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1.5 py-0.5 text-sm text-zinc-700 hover:border-zinc-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-200 dark:hover:border-zinc-600"
                />
                {tabs.length > 1 && (
                  <button
                    type="button"
                    aria-label={formatTemplate(t.deleteTabAriaLabel, tab.name)}
                    onClick={() => handleRemoveTab(tab)}
                    className="rounded px-1.5 py-0.5 text-xs text-zinc-400 hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-700 dark:hover:text-red-400"
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
          <div className="flex gap-1">
            <input
              type="text"
              value={newTabName}
              onChange={(event) => setNewTabName(event.target.value)}
              placeholder={t.newTabPlaceholder}
              className="min-w-0 flex-1 rounded border border-zinc-300 px-1.5 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-900"
            />
            <button
              type="button"
              onClick={handleAddTab}
              disabled={newTabName.trim().length === 0}
              className="btn-toy btn-toy-sm btn-toy-primary"
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
          <button
            type="button"
            onClick={triggerImport}
            className="btn-toy btn-toy-sm btn-toy-neutral mt-4 w-full"
          >
            {t.csvImport}
          </button>
        </div>
      )}
    </div>
  );
}
