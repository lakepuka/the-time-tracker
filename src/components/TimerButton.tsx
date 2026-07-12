"use client";

import { AnimatedClockIcon } from "@/components/AnimatedClockIcon";
import { toTimeInputValue } from "@/lib/dateTimeInput";
import { formatTemplate, type Translations } from "@/lib/i18n";

type TimerButtonProps = {
  isActive: boolean;
  onToggle: () => void;
  startedAt?: string | null;
  t: Translations;
};

export function TimerButton({ isActive, onToggle, startedAt, t }: TimerButtonProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={onToggle}
        className={`btn-toy btn-toy-lg ${isActive ? "btn-toy-danger" : "btn-toy-primary"}`}
      >
        {isActive ? t.stop : t.start}
      </button>
      {/* Fixed-height slot so the button doesn't shift when the label appears. */}
      <span className="flex h-5 items-center gap-1.5 whitespace-nowrap text-xs text-zinc-500 dark:text-zinc-400">
        {isActive && startedAt && (
          <>
            <AnimatedClockIcon className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
            {formatTemplate(t.trackingSince, toTimeInputValue(startedAt))}
          </>
        )}
      </span>
    </div>
  );
}
