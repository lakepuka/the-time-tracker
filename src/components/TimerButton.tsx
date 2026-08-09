"use client";

import { useElapsedSeconds } from "@/hooks/useElapsedSeconds";
import { toTimeInputValue } from "@/lib/dateTimeInput";
import { formatDurationMinutes } from "@/lib/duration";
import { formatElapsed } from "@/lib/elapsed";
import { formatTemplate, type Language, type Translations } from "@/lib/i18n";

type TimerButtonProps = {
  isActive: boolean;
  onToggle: () => void;
  startedAt?: string | null;
  /** Net duration of the most recent finished record, for the idle caption. */
  lastDurationMinutes?: number | null;
  /** Name of the active tracker, shown after the ELAPSED label. */
  trackerName?: string;
  language?: Language;
  t: Translations;
};

/**
 * The timer band: a live H:MM:SS elapsed clock and status on the left, the
 * START / STOP paper button on the right. On a narrow screen the two stack and
 * the button goes full width.
 */
export function TimerButton({
  isActive,
  onToggle,
  startedAt,
  lastDurationMinutes,
  trackerName,
  language = "ja",
  t,
}: TimerButtonProps) {
  const seconds = useElapsedSeconds(isActive && startedAt ? startedAt : null);

  const status = isActive
    ? startedAt && formatTemplate(t.measuringSince, toTimeInputValue(startedAt))
    : lastDurationMinutes != null
      ? formatTemplate(t.idleLast, formatDurationMinutes(lastDurationMinutes, language))
      : t.stopped;

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-stretch">
      <div className="flex flex-1 flex-col items-center gap-1.5 sm:items-start">
        <span className="ledger-label !text-[0.625rem] tracking-[0.16em] text-muted">
          ELAPSED{trackerName ? ` / ${trackerName}` : ""}
        </span>
        <div className="flex flex-wrap items-end gap-x-3.5 gap-y-1">
          <span className="mono text-5xl leading-[0.86] tracking-[-0.02em] text-ink sm:text-[76px]">
            {formatElapsed(seconds)}
          </span>
          <span className="flex h-4 items-center gap-1.5 pb-1 whitespace-nowrap">
            {isActive && (
              <span className="pulse-dot h-1.5 w-1.5 shrink-0 rounded-full bg-live" aria-hidden />
            )}
            <span className={`mono text-xs ${isActive ? "text-live" : "text-muted"}`}>
              {status}
            </span>
          </span>
        </div>
      </div>

      <div className="flex items-center sm:border-l sm:border-[color:var(--edge-weak)] sm:pl-6">
        <button
          type="button"
          onClick={onToggle}
          className={`paper-btn w-full text-xl sm:w-auto ${isActive ? "paper-btn--stop" : ""}`}
        >
          {isActive ? t.stop : t.start}
        </button>
      </div>
    </div>
  );
}
