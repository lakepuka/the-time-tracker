"use client";

import { useEffect, useRef } from "react";
import type { Tab } from "@/lib/tabs";

type TabSwitcherProps = {
  tabs: Tab[];
  activeTabId: string;
  namingTabId: string | null;
  onSelectTab: (id: string) => void;
  onRenameTab: (id: string, name: string) => void;
  onFinishNaming: (id: string) => void;
  onAddTab: () => void;
  addTabLabel: string;
  nameInputLabel: string;
};

const activeTabClass =
  "shrink-0 whitespace-nowrap rounded-full border-2 border-sky-400 bg-sky-100 px-3 py-1.5 text-sm font-bold text-sky-900 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-100";
const inactiveTabClass =
  "shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-bold text-zinc-600 transition-colors hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700";

export function TabSwitcher({
  tabs,
  activeTabId,
  namingTabId,
  onSelectTab,
  onRenameTab,
  onFinishNaming,
  onAddTab,
  addTabLabel,
  nameInputLabel,
}: TabSwitcherProps) {
  const namingInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (namingTabId) {
      namingInputRef.current?.focus();
    }
  }, [namingTabId]);

  return (
    <div className="scrollbar-thin flex min-w-0 flex-1 items-center gap-1 overflow-x-auto rounded-full border-2 border-zinc-200 bg-white p-1.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      {tabs.map((tab) => {
        if (tab.id === namingTabId) {
          return (
            <input
              key={tab.id}
              ref={namingInputRef}
              type="text"
              value={tab.name}
              aria-label={nameInputLabel}
              onChange={(event) => onRenameTab(tab.id, event.target.value)}
              onBlur={() => onFinishNaming(tab.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
              }}
              className="field-sizing-content min-w-[4rem] max-w-[12rem] shrink-0 rounded-full border-2 border-sky-400 bg-sky-100 px-3 py-1.5 text-sm font-bold text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-100"
            />
          );
        }

        const isActive = tab.id === activeTabId;

        return (
          <button
            key={tab.id}
            type="button"
            aria-current={isActive}
            onClick={() => onSelectTab(tab.id)}
            className={isActive ? activeTabClass : inactiveTabClass}
          >
            {tab.name}
          </button>
        );
      })}
      <button
        type="button"
        aria-label={addTabLabel}
        onClick={onAddTab}
        className="btn-toy btn-toy-icon btn-toy-primary shrink-0 !text-lg"
      >
        +
      </button>
    </div>
  );
}
