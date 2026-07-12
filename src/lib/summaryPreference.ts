const STORAGE_KEY = "work-timer-show-summary";
export const DEFAULT_SHOW_SUMMARY = false;

export function loadShowSummary(): boolean {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === "true") return true;
  if (raw === "false") return false;
  return DEFAULT_SHOW_SUMMARY;
}

export function saveShowSummary(value: boolean): void {
  localStorage.setItem(STORAGE_KEY, String(value));
}
