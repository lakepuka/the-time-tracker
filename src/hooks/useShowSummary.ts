"use client";

import { usePersistentState } from "@/hooks/usePersistentState";
import { DEFAULT_SHOW_SUMMARY, loadShowSummary, saveShowSummary } from "@/lib/summaryPreference";

export function useShowSummary() {
  const [showSummary, setShowSummary] = usePersistentState(
    DEFAULT_SHOW_SUMMARY,
    loadShowSummary,
    saveShowSummary,
  );

  return { showSummary, setShowSummary };
}
