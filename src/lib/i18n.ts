export type Language = "ja" | "en";

export const LANGUAGES: { id: Language; label: string }[] = [
  { id: "ja", label: "日本語" },
  { id: "en", label: "English" },
];

const STORAGE_KEY = "work-timer-language";
export const DEFAULT_LANGUAGE: Language = "en";

function isLanguage(value: string): value is Language {
  return value === "ja" || value === "en";
}

export function loadLanguage(): Language {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw && isLanguage(raw) ? raw : DEFAULT_LANGUAGE;
}

export function saveLanguage(language: Language): void {
  localStorage.setItem(STORAGE_KEY, language);
}

export type Translations = {
  start: string;
  stop: string;
  trackingSince: string;
  settingsLabel: string;
  theme: string;
  light: string;
  dark: string;
  system: string;
  language: string;
  summary: string;
  tabsLabel: string;
  newTabPlaceholder: string;
  add: string;
  deleteTabAriaLabel: string;
  deleteTabConfirm: string;
  monthlyTotal: string;
  thisMonth: string;
  records: string;
  csvExport: string;
  csvImport: string;
  csvImportSuccess: string;
  csvImportError: string;
  noRecords: string;
  columnDate: string;
  columnTime: string;
  columnAdjustment: string;
  columnDuration: string;
  columnMemo: string;
  inProgress: string;
  deleteLabel: string;
  cancel: string;
  ok: string;
  prevMonth: string;
  nextMonth: string;
  onlyShowing: string;
  yearInputLabel: string;
  monthInputLabel: string;
  dayInputLabel: string;
  addTabLabel: string;
  defaultTabName: string;
};

const ja: Translations = {
  start: "開始",
  stop: "終了",
  trackingSince: "{value}から計測中",
  settingsLabel: "設定",
  theme: "テーマ",
  light: "ライト",
  dark: "ダーク",
  system: "システム",
  language: "言語",
  summary: "サマリー",
  tabsLabel: "タブ",
  newTabPlaceholder: "新しいタブ名",
  add: "追加",
  deleteTabAriaLabel: "{value}を削除",
  deleteTabConfirm: "「{value}」タブとその記録を削除しますか？",
  monthlyTotal: "月ごとの合計時間",
  thisMonth: "今月",
  records: "記録",
  csvExport: "CSVエクスポート",
  csvImport: "CSVインポート",
  csvImportSuccess: "{value}件の記録をインポートしました",
  csvImportError: "CSVファイルの読み込みに失敗しました",
  noRecords: "記録がありません",
  columnDate: "日付",
  columnTime: "時間",
  columnAdjustment: "調整(分)",
  columnDuration: "稼働時間",
  columnMemo: "備考",
  inProgress: "稼働中",
  deleteLabel: "削除",
  cancel: "キャンセル",
  ok: "OK",
  prevMonth: "前の月",
  nextMonth: "次の月",
  onlyShowing: "{value} のみ表示中",
  yearInputLabel: "年",
  monthInputLabel: "月",
  dayInputLabel: "日",
  addTabLabel: "タブを追加",
  defaultTabName: "タイマー",
};

const en: Translations = {
  start: "Start",
  stop: "Stop",
  trackingSince: "Tracking since {value}",
  settingsLabel: "Settings",
  theme: "Theme",
  light: "Light",
  dark: "Dark",
  system: "System",
  language: "Language",
  summary: "Summary",
  tabsLabel: "Tabs",
  newTabPlaceholder: "New tab name",
  add: "Add",
  deleteTabAriaLabel: "Delete {value}",
  deleteTabConfirm: 'Delete the "{value}" tab and all its records?',
  monthlyTotal: "Monthly Totals",
  thisMonth: "This month",
  records: "Records",
  csvExport: "Export CSV",
  csvImport: "Import CSV",
  csvImportSuccess: "Imported {value} record(s)",
  csvImportError: "Failed to read the CSV file",
  noRecords: "No records yet",
  columnDate: "Date",
  columnTime: "Time",
  columnAdjustment: "Adj. (min)",
  columnDuration: "Duration",
  columnMemo: "Notes",
  inProgress: "In progress",
  deleteLabel: "Delete",
  cancel: "Cancel",
  ok: "OK",
  prevMonth: "Previous month",
  nextMonth: "Next month",
  onlyShowing: "Showing {value} only",
  yearInputLabel: "Year",
  monthInputLabel: "Month",
  dayInputLabel: "Day",
  addTabLabel: "Add tab",
  defaultTabName: "Timer",
};

const TRANSLATIONS: Record<Language, Translations> = { ja, en };

export function getTranslations(language: Language): Translations {
  return TRANSLATIONS[language];
}

export function formatTemplate(template: string, value: string): string {
  return template.replace("{value}", value);
}
