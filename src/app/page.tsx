"use client";

import { useEffect, useState } from "react";
import { CalendarHeatmap } from "@/components/CalendarHeatmap";
import { Card } from "@/components/Card";
import { MonthlySummary } from "@/components/MonthlySummary";
import { RecordsTable } from "@/components/RecordsTable";
import { SettingsButton } from "@/components/SettingsButton";
import { TabSwitcher } from "@/components/TabSwitcher";
import { TimerButton } from "@/components/TimerButton";
import { useLanguage } from "@/hooks/useLanguage";
import { useShowSummary } from "@/hooks/useShowSummary";
import { useTabs } from "@/hooks/useTabs";
import { useWorkTimer } from "@/hooks/useWorkTimer";
import { buildCsvFilename, recordsToCsv } from "@/lib/csv";
import { formatTemplate, type Language } from "@/lib/i18n";
import { generateTabName } from "@/lib/tabs";

function downloadCsv(
  records: Parameters<typeof recordsToCsv>[0],
  language: Language,
  tabName: string,
) {
  const csv = recordsToCsv(records, language);
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = buildCsvFilename(tabName);
  link.click();
  URL.revokeObjectURL(url);
}

export default function Home() {
  const { tabs, activeTabId, setActiveTabId, addTab, removeTab, renameTab } = useTabs();
  const { records, activeRecord, toggle, updateRecord, deleteRecord, importRecords } =
    useWorkTimer(activeTabId);
  const { language, setLanguage, t } = useLanguage();
  const { showSummary, setShowSummary } = useShowSummary();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [namingTabId, setNamingTabId] = useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset the day filter whenever the active tab changes
  useEffect(() => {
    setSelectedDate(null);
  }, [activeTabId]);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  function handleAddTab() {
    const id = addTab("");
    setNamingTabId(id);
  }

  function handleFinishNaming(id: string) {
    const tab = tabs.find((candidate) => candidate.id === id);
    if (tab && tab.name.trim() === "") {
      renameTab(id, generateTabName(tabs, t.defaultTabName));
    }
    setNamingTabId(null);
  }

  const visibleRecords = selectedDate
    ? records.filter((record) => record.date === selectedDate)
    : records;

  const timerButton = (
    <div className="flex flex-col items-center gap-4">
      <TimerButton
        isActive={activeRecord !== null}
        onToggle={toggle}
        startedAt={activeRecord?.startedAt}
        t={t}
      />
    </div>
  );

  const summaryCard = (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start lg:flex-col lg:items-stretch">
        <div className="flex justify-center sm:justify-start lg:justify-center">
          <CalendarHeatmap
            records={records}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            language={language}
            t={t}
          />
        </div>
        <div className="min-w-0 flex-1 border-zinc-100 sm:border-l sm:pl-4 lg:border-l-0 lg:border-t lg:pl-0 lg:pt-4 dark:border-zinc-700">
          <MonthlySummary records={records} language={language} t={t} />
        </div>
      </div>
    </Card>
  );

  const recordsCard = (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{t.records}</h2>
        <div className="flex items-center gap-2">
          {selectedDate && (
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="rounded-full border-2 border-blue-200 bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800 hover:bg-blue-200 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-200 dark:hover:bg-blue-900"
            >
              {formatTemplate(t.onlyShowing, selectedDate)} ✕
            </button>
          )}
          <button
            type="button"
            onClick={() => downloadCsv(records, language, activeTab.name)}
            disabled={records.length === 0}
            className="btn-toy btn-toy-sm btn-toy-neutral"
          >
            {t.csvExport}
          </button>
        </div>
      </div>
      <div className="scrollbar-thin overflow-x-auto">
        <RecordsTable
          tabId={activeTabId}
          records={visibleRecords}
          onUpdate={updateRecord}
          onDelete={deleteRecord}
          expandDate={selectedDate}
          language={language}
          t={t}
        />
      </div>
    </Card>
  );

  return (
    <div className="flex flex-1 justify-center">
      <main className="flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6">
        <div className="flex items-center gap-2">
          <TabSwitcher
            tabs={tabs}
            activeTabId={activeTabId}
            namingTabId={namingTabId}
            onSelectTab={setActiveTabId}
            onRenameTab={renameTab}
            onFinishNaming={handleFinishNaming}
            onAddTab={handleAddTab}
            addTabLabel={t.addTabLabel}
            nameInputLabel={t.newTabPlaceholder}
          />
          <SettingsButton
            tabs={tabs}
            onAddTab={addTab}
            onRemoveTab={removeTab}
            onRenameTab={renameTab}
            onImportRecords={importRecords}
            language={language}
            onChangeLanguage={setLanguage}
            showSummary={showSummary}
            onChangeShowSummary={setShowSummary}
            t={t}
          />
        </div>

        {showSummary ? (
          <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start lg:gap-6">
            <div className="flex flex-col gap-5">
              {timerButton}
              {summaryCard}
            </div>
            {recordsCard}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {timerButton}
            {recordsCard}
          </div>
        )}
      </main>
    </div>
  );
}
