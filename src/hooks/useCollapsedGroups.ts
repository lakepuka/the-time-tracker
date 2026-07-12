"use client";

import { useCallback, useEffect, useState } from "react";
import { loadCollapsedGroups, saveCollapsedGroups } from "@/lib/collapsedGroups";

export function useCollapsedGroups(tabId: string) {
  const [collapsed, setCollapsed] = useState<string[]>([]);

  useEffect(() => {
    // localStorage doesn't exist during SSR; load after mount to avoid a hydration mismatch.
    setCollapsed(loadCollapsedGroups(tabId));
  }, [tabId]);

  const isCollapsed = useCallback((id: string) => collapsed.includes(id), [collapsed]);

  const toggle = useCallback(
    (id: string) => {
      setCollapsed((prev) => {
        const next = prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id];
        saveCollapsedGroups(tabId, next);
        return next;
      });
    },
    [tabId],
  );

  const expand = useCallback(
    (id: string) => {
      setCollapsed((prev) => {
        if (!prev.includes(id)) return prev;
        const next = prev.filter((existing) => existing !== id);
        saveCollapsedGroups(tabId, next);
        return next;
      });
    },
    [tabId],
  );

  return { isCollapsed, toggle, expand };
}
