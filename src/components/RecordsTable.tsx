"use client";

import { useEffect } from "react";
import { RecordRow } from "@/components/RecordRow";
import { useCollapsedGroups } from "@/hooks/useCollapsedGroups";
import { formatMonthOnlyLabel, formatYearOnlyLabel } from "@/lib/calendarMonth";
import { formatDurationMinutes, sumNetDurationMinutes } from "@/lib/duration";
import { groupRecordsByYearAndMonth, type MonthGroup } from "@/lib/groupRecordsByMonth";
import type { Language, Translations } from "@/lib/i18n";
import type { WorkRecord } from "@/lib/records";

type RecordsTableProps = {
  tabId: string;
  records: WorkRecord[];
  onUpdate: (id: string, patch: Partial<Omit<WorkRecord, "id">>) => void;
  onDelete: (id: string) => void;
  expandDate?: string | null;
  language: Language;
  t: Translations;
};

type GroupHeaderProps = {
  label: string;
  totalMinutes: number;
  collapsed: boolean;
  onToggle: () => void;
  language: Language;
  className: string;
};

function GroupHeader({
  label,
  totalMinutes,
  collapsed,
  onToggle,
  language,
  className,
}: GroupHeaderProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={!collapsed}
      className={`flex w-full items-center gap-1.5 py-1 text-left ${className}`}
    >
      <span>{label}</span>
      <span className="ml-auto font-normal text-zinc-500 dark:text-zinc-400">
        {formatDurationMinutes(totalMinutes, language)}
      </span>
    </button>
  );
}

type MonthTableProps = {
  monthGroup: MonthGroup;
  onUpdate: RecordsTableProps["onUpdate"];
  onDelete: RecordsTableProps["onDelete"];
  language: Language;
  t: Translations;
};

function MonthTable({ monthGroup, onUpdate, onDelete, language, t }: MonthTableProps) {
  return (
    <table className="w-full min-w-[680px] border-collapse text-xs">
      <thead>
        <tr className="border-b border-zinc-300 text-left dark:border-zinc-700">
          <th className="py-1 pr-3">{t.columnDate}</th>
          <th className="py-1 pr-3">{t.columnTime}</th>
          <th className="py-1 pr-3">{t.columnAdjustment}</th>
          <th className="py-1 pr-3 whitespace-nowrap">{t.columnDuration}</th>
          <th className="w-full py-1 pr-3">{t.columnMemo}</th>
          <th className="py-1.5 pr-3" />
        </tr>
      </thead>
      <tbody>
        {monthGroup.records.map((record, recordIndex) => (
          <RecordRow
            key={record.id}
            record={record}
            isSameDateAsPrevious={monthGroup.records[recordIndex - 1]?.date === record.date}
            onUpdate={onUpdate}
            onDelete={onDelete}
            language={language}
            t={t}
          />
        ))}
      </tbody>
    </table>
  );
}

export function RecordsTable({
  tabId,
  records,
  onUpdate,
  onDelete,
  expandDate = null,
  language,
  t,
}: RecordsTableProps) {
  const { isCollapsed, toggle, expand } = useCollapsedGroups(tabId);

  useEffect(() => {
    if (!expandDate) return;
    expand(expandDate.slice(0, 4));
    expand(expandDate.slice(0, 7));
  }, [expandDate, expand]);

  if (records.length === 0) {
    return <p>{t.noRecords}</p>;
  }

  const yearGroups = groupRecordsByYearAndMonth(records);

  return (
    <div className="flex flex-col gap-4">
      {yearGroups.map((yearGroup, index) => {
        const yearCollapsed = isCollapsed(yearGroup.yearKey);

        return (
          <div
            key={yearGroup.yearKey}
            className={index > 0 ? "border-t border-zinc-200 pt-3 dark:border-zinc-700" : ""}
          >
            <GroupHeader
              label={formatYearOnlyLabel(yearGroup.year, language)}
              totalMinutes={sumNetDurationMinutes(
                yearGroup.months.flatMap((monthGroup) => monthGroup.records),
              )}
              collapsed={yearCollapsed}
              onToggle={() => toggle(yearGroup.yearKey)}
              language={language}
              className="text-sm font-bold hover:text-blue-600 dark:hover:text-blue-400"
            />

            {!yearCollapsed && (
              <div className="flex flex-col gap-3">
                {yearGroup.months.map((monthGroup) => {
                  const monthCollapsed = isCollapsed(monthGroup.monthKey);

                  return (
                    <div key={monthGroup.monthKey}>
                      <GroupHeader
                        label={formatMonthOnlyLabel(monthGroup.month, language)}
                        totalMinutes={sumNetDurationMinutes(monthGroup.records)}
                        collapsed={monthCollapsed}
                        onToggle={() => toggle(monthGroup.monthKey)}
                        language={language}
                        className="text-xs font-semibold text-zinc-600 hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400"
                      />

                      {!monthCollapsed && (
                        <MonthTable
                          monthGroup={monthGroup}
                          onUpdate={onUpdate}
                          onDelete={onDelete}
                          language={language}
                          t={t}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
