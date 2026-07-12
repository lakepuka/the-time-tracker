"use client";

import { useEffect } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";
import {
  type ColorSchemeMode,
  DEFAULT_COLOR_SCHEME_MODE,
  loadColorSchemeMode,
  saveColorSchemeMode,
} from "@/lib/colorScheme";

function applyColorScheme(mode: ColorSchemeMode): (() => void) | undefined {
  const root = document.documentElement;

  if (mode === "light") {
    root.classList.remove("dark");
    return;
  }

  if (mode === "dark") {
    root.classList.add("dark");
    return;
  }

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  root.classList.toggle("dark", media.matches);

  function handleChange(event: { matches: boolean }) {
    root.classList.toggle("dark", event.matches);
  }

  media.addEventListener("change", handleChange);
  return () => media.removeEventListener("change", handleChange);
}

export function useColorSchemeMode() {
  const [mode, setMode] = usePersistentState(
    DEFAULT_COLOR_SCHEME_MODE,
    loadColorSchemeMode,
    saveColorSchemeMode,
  );

  useEffect(() => applyColorScheme(mode), [mode]);

  return { mode, setMode };
}
