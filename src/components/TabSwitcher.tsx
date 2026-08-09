"use client";

import { useEffect, useRef } from "react";
import { PlusIcon } from "@/components/icons";
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
    <div className="scrollbar-thin flex min-w-0 items-center gap-1.5 overflow-x-auto py-0.5">
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
              className="field field--boxed field-sizing-content min-w-[4rem] max-w-[12rem] shrink-0 text-[0.78rem]"
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
            className="tab"
          >
            {tab.name}
          </button>
        );
      })}
      <button type="button" aria-label={addTabLabel} onClick={onAddTab} className="tab-add">
        <PlusIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
