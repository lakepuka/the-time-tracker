const STORAGE_KEY_PREFIX = "work-timer-collapsed-groups";

function collapsedGroupsStorageKey(tabId: string): string {
  return `${STORAGE_KEY_PREFIX}:${tabId}`;
}

export function loadCollapsedGroups(tabId: string): string[] {
  const raw = localStorage.getItem(collapsedGroupsStorageKey(tabId));
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function saveCollapsedGroups(tabId: string, ids: string[]): void {
  localStorage.setItem(collapsedGroupsStorageKey(tabId), JSON.stringify(ids));
}

export function deleteCollapsedGroupsForTab(tabId: string): void {
  localStorage.removeItem(collapsedGroupsStorageKey(tabId));
}
