"use client";

import { usePersistentState } from "@/hooks/usePersistentState";
import { DEFAULT_LANGUAGE, getTranslations, loadLanguage, saveLanguage } from "@/lib/i18n";

export function useLanguage() {
  const [language, setLanguage] = usePersistentState(DEFAULT_LANGUAGE, loadLanguage, saveLanguage);

  return { language, setLanguage, t: getTranslations(language) };
}
