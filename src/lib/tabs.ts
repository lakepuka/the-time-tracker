export type Tab = {
  id: string;
  name: string;
};

export const DEFAULT_TAB_ID = "default";

/** Timers are named Timer1, Timer2, … — language-agnostic, no space. */
export const DEFAULT_TAB_BASE = "Timer";
export const DEFAULT_TAB: Tab = { id: DEFAULT_TAB_ID, name: `${DEFAULT_TAB_BASE}1` };

export function generateTabName(existingTabs: Tab[], baseName: string): string {
  const used = new Set(existingTabs.map((tab) => tab.name));
  let n = 1;
  while (used.has(`${baseName}${n}`)) {
    n++;
  }
  return `${baseName}${n}`;
}

const TABS_KEY = "work-timer-tabs";
const ACTIVE_TAB_KEY = "work-timer-active-tab";

function isTab(value: unknown): value is Tab {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Tab).id === "string" &&
    typeof (value as Tab).name === "string"
  );
}

export function loadTabs(): Tab[] {
  const raw = localStorage.getItem(TABS_KEY);
  if (!raw) return [DEFAULT_TAB];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(isTab)) {
      return parsed;
    }
    return [DEFAULT_TAB];
  } catch {
    return [DEFAULT_TAB];
  }
}

export function saveTabs(tabs: Tab[]): void {
  localStorage.setItem(TABS_KEY, JSON.stringify(tabs));
}

export function loadActiveTabId(): string {
  return localStorage.getItem(ACTIVE_TAB_KEY) ?? DEFAULT_TAB_ID;
}

export function saveActiveTabId(id: string): void {
  localStorage.setItem(ACTIVE_TAB_KEY, id);
}
