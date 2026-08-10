"use client";

import { useEffect } from "react";
import { DisclosureIcon } from "@/components/icons";
import { RecordRow } from "@/components/RecordRow";
import { useCollapsedGroups } from "@/hooks/useCollapsedGroups";
import { formatMonthOnlyLabel, formatYearOnlyLabel } from "@/lib/calendarMonth";
import { formatDurationMinutes, sumNetDurationMinutes } from "@/lib/duration";
import { groupRecordsByYearAndMonth, type MonthGroup } from "@/lib/groupRecordsByMonth";
import type { Language, Translations } from "@/lib/i18n";
import type { WorkRecord } from "@/lib/records";
import { DEFAULT_TIMER_PRECISION, type TimerPrecision } from "@/lib/timerPrecision";

type RecordsTableProps = {
  tabId: string;
  records: WorkRecord[];
  onUpdate: (id: string, patch: Partial<Omit<WorkRecord, "id">>) => void;
  onDelete: (id: string) => void;
  expandDate?: string | null;
  language: Language;
  precision?: TimerPrecision;
  t: Translations;
};

type GroupHeaderProps = {
  label: string;
  totalMinutes: number;
  collapsed: boolean;
  onToggle: () => void;
  language: Language;
  labelClassName: string;
};

/** Collapsible year/month header: label on the left, its total on the right. */
function GroupHeader({
  label,
  totalMinutes,
  collapsed,
  onToggle,
  language,
  labelClassName,
}: GroupHeaderProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={!collapsed}
      className="group flex w-full items-baseline gap-2 py-1 text-left"
    >
      <span className="self-center text-muted group-hover:text-brand">
        <DisclosureIcon open={!collapsed} />
      </span>
      <span className={labelClassName}>{label}</span>
      <span className="h-px flex-1 self-center bg-[color:var(--rule-solid)]" aria-hidden />
      <span className="mono shrink-0 text-xs text-[color:var(--brand)]">
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
  precision: TimerPrecision;
  t: Translations;
};

function MonthTable({ monthGroup, onUpdate, onDelete, language, precision, t }: MonthTableProps) {
  return (
    <div className="border-t-[1.5px] border-[color:var(--rule-top)]">
      <div
        className="rec-headrow ledger-label !text-[0.5625rem] !tracking-[0.1em] text-muted"
        data-sec={precision === "second"}
      >
        <span>{t.columnDate}</span>
        <span>{t.columnTime}</span>
        <span className="text-right">{t.columnAdjustment}</span>
        <span>{t.columnDuration}</span>
        <span>{t.columnMemo}</span>
        <span />
      </div>
      {monthGroup.records.map((record, recordIndex) => (
        <RecordRow
          key={record.id}
          record={record}
          isSameDateAsPrevious={monthGroup.records[recordIndex - 1]?.date === record.date}
          onUpdate={onUpdate}
          onDelete={onDelete}
          language={language}
          precision={precision}
          t={t}
        />
      ))}
    </div>
  );
}

export function RecordsTable({
  tabId,
  records,
  onUpdate,
  onDelete,
  expandDate = null,
  language,
  precision = DEFAULT_TIMER_PRECISION,
  t,
}: RecordsTableProps) {
  const { isCollapsed, toggle, expand } = useCollapsedGroups(tabId);

  useEffect(() => {
    if (!expandDate) return;
    expand(expandDate.slice(0, 4));
    expand(expandDate.slice(0, 7));
  }, [expandDate, expand]);

  if (records.length === 0) {
    return <p className="mono py-8 text-center text-sm text-muted">{t.noRecords}</p>;
  }

  const yearGroups = groupRecordsByYearAndMonth(records);

  return (
    <div className="flex flex-col gap-5">
      {yearGroups.map((yearGroup, index) => {
        const yearCollapsed = isCollapsed(yearGroup.yearKey);

        return (
          <div
            key={yearGroup.yearKey}
            className={index > 0 ? "border-t border-[color:var(--edge-weak)] pt-3" : ""}
          >
            <GroupHeader
              label={formatYearOnlyLabel(yearGroup.year, language)}
              totalMinutes={sumNetDurationMinutes(
                yearGroup.months.flatMap((monthGroup) => monthGroup.records),
              )}
              collapsed={yearCollapsed}
              onToggle={() => toggle(yearGroup.yearKey)}
              language={language}
              labelClassName="mono shrink-0 text-sm font-semibold text-ink"
            />

            {!yearCollapsed && (
              <div className="flex flex-col gap-4 pt-1">
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
                        labelClassName="mono shrink-0 text-xs font-medium text-[color:var(--body)]"
                      />

                      {!monthCollapsed && (
                        <MonthTable
                          monthGroup={monthGroup}
                          onUpdate={onUpdate}
                          onDelete={onDelete}
                          language={language}
                          precision={precision}
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
