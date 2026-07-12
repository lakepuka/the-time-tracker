"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteCollapsedGroupsForTab } from "@/lib/collapsedGroups";
import { deleteRecordsForTab } from "@/lib/records";
import {
  DEFAULT_TAB,
  DEFAULT_TAB_ID,
  loadActiveTabId,
  loadTabs,
  saveActiveTabId,
  saveTabs,
  type Tab,
} from "@/lib/tabs";

type UseTabsDeps = {
  createId?: () => string;
};

const defaultCreateId = () => crypto.randomUUID();

export function useTabs(deps: UseTabsDeps = {}) {
  const createId = deps.createId ?? defaultCreateId;

  const [tabs, setTabs] = useState<Tab[]>([DEFAULT_TAB]);
  const [activeTabId, setActiveTabIdState] = useState<string>(DEFAULT_TAB_ID);

  useEffect(() => {
    // localStorage doesn't exist during SSR; load after mount to avoid a hydration mismatch.
    setTabs(loadTabs());
    setActiveTabIdState(loadActiveTabId());
  }, []);

  const setActiveTabId = useCallback((id: string) => {
    setActiveTabIdState(id);
    saveActiveTabId(id);
  }, []);

  const addTab = useCallback(
    (name: string) => {
      const newTab: Tab = { id: createId(), name };
      setTabs((prev) => {
        const next = [...prev, newTab];
        saveTabs(next);
        return next;
      });
      setActiveTabId(newTab.id);
      return newTab.id;
    },
    [createId, setActiveTabId],
  );

  const removeTab = useCallback(
    (id: string) => {
      setTabs((prev) => {
        if (prev.length <= 1) return prev;

        const next = prev.filter((tab) => tab.id !== id);
        saveTabs(next);
        deleteRecordsForTab(id);
        deleteCollapsedGroupsForTab(id);

        if (activeTabId === id) {
          setActiveTabId(next[0].id);
        }

        return next;
      });
    },
    [activeTabId, setActiveTabId],
  );

  const renameTab = useCallback((id: string, name: string) => {
    setTabs((prev) => {
      const next = prev.map((tab) => (tab.id === id ? { ...tab, name } : tab));
      saveTabs(next);
      return next;
    });
  }, []);

  return { tabs, activeTabId, setActiveTabId, addTab, removeTab, renameTab };
}
