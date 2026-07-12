export type ColorSchemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "work-timer-color-scheme";
export const DEFAULT_COLOR_SCHEME_MODE: ColorSchemeMode = "system";

function isColorSchemeMode(value: string): value is ColorSchemeMode {
  return value === "light" || value === "dark" || value === "system";
}

export function loadColorSchemeMode(): ColorSchemeMode {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw && isColorSchemeMode(raw) ? raw : DEFAULT_COLOR_SCHEME_MODE;
}

export function saveColorSchemeMode(mode: ColorSchemeMode): void {
  localStorage.setItem(STORAGE_KEY, mode);
}
