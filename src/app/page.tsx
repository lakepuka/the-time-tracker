"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarHeatmap } from "@/components/CalendarHeatmap";
import { CloseIcon } from "@/components/icons";
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
import { toDateKeyFromDate } from "@/lib/dateTimeInput";
import {
  computeNetDurationMinutes,
  formatDurationMinutes,
  sumNetDurationMinutes,
} from "@/lib/duration";
import { formatTemplate, type Language } from "@/lib/i18n";
import { formatMonthLabel } from "@/lib/monthlySummary";
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
  const [currentMonthKey, setCurrentMonthKey] = useState<string | null>(null);

  // Deferred to the client so the month total matches the user's clock, not the server's.
  useEffect(() => {
    setCurrentMonthKey(toDateKeyFromDate(new Date()).slice(0, 7));
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset the day filter whenever the active tab changes
  useEffect(() => {
    setSelectedDate(null);
  }, [activeTabId]);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  // The most recently finished record's net duration, for the idle timer caption.
  const lastDurationMinutes = useMemo(() => {
    const finished = records.filter((record) => record.endedAt);
    if (finished.length === 0) return null;
    const latest = finished.reduce((a, b) => (a.startedAt >= b.startedAt ? a : b));
    return computeNetDurationMinutes(
      latest.startedAt,
      latest.endedAt as string,
      latest.adjustmentMinutes ?? 0,
    );
  }, [records]);

  const monthTotalMinutes = useMemo(
    () =>
      currentMonthKey
        ? sumNetDurationMinutes(records.filter((record) => record.date.startsWith(currentMonthKey)))
        : 0,
    [records, currentMonthKey],
  );

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

  const recordsSection = (
    <section className="min-w-0 flex-1 px-4 py-4 sm:px-6">
      <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h2 className="ledger-label">{t.records}</h2>
        <div className="flex items-center gap-2">
          {currentMonthKey && (
            <span className="mono text-[11px] text-muted">
              {formatMonthLabel(currentMonthKey, language)} {t.total}{" "}
              <b className="text-[13px] font-semibold text-ink">
                {formatDurationMinutes(monthTotalMinutes, language)}
              </b>
            </span>
          )}
          {selectedDate && (
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="chip !min-h-0 gap-1 px-2 py-0.5"
            >
              <span className="mono">{formatTemplate(t.onlyShowing, selectedDate)}</span>
              <CloseIcon className="h-3 w-3" />
            </button>
          )}
          <button
            type="button"
            onClick={() => downloadCsv(records, language, activeTab.name)}
            disabled={records.length === 0}
            className="chip !min-h-0 px-2 py-0.5"
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
    </section>
  );

  const summarySection = (
    <aside className="flex flex-col gap-4 border-t border-[color:var(--edge-weak)] px-5 py-4 lg:border-t-0 lg:border-l">
      <CalendarHeatmap
        records={records}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        language={language}
        t={t}
      />
      <div className="border-t border-[color:var(--edge-weak)] pt-3">
        <MonthlySummary records={records} language={language} t={t} />
      </div>
    </aside>
  );

  return (
    <div className="flex flex-1 justify-center p-1.5 sm:p-4">
      <main className="sheet w-full max-w-[1000px] self-start rounded-2xl sm:rounded-none">
        {/* Header band: logo, trackers, settings. */}
        <header className="band flex items-center justify-between gap-3 border-b border-[color:var(--edge-strong)] px-4 py-3 sm:px-6">
          <div className="hidden shrink-0 items-baseline gap-2.5 sm:flex">
            <span className="mono text-[13px] font-bold tracking-[0.22em] text-[color:var(--ink-logo)] uppercase">
              The Time Tracker
            </span>
            <span className="mono text-[10.5px] text-muted">v2 / local only</span>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-initial sm:justify-end">
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
        </header>

        {/* Timer band: live elapsed + START/STOP. */}
        <div className="band border-b border-[color:var(--edge-strong)] px-4 py-5 sm:px-6">
          <TimerButton
            isActive={activeRecord !== null}
            onToggle={toggle}
            startedAt={activeRecord?.startedAt}
            lastDurationMinutes={lastDurationMinutes}
            trackerName={activeTab.name}
            language={language}
            t={t}
          />
        </div>

        {/* Body: records, and (optionally) calendar + monthly. */}
        {showSummary ? (
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_268px]">
            {recordsSection}
            {summarySection}
          </div>
        ) : (
          recordsSection
        )}
      </main>
    </div>
  );
}
