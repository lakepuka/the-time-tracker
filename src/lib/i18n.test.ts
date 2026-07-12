import { beforeEach, describe, expect, it } from "vitest";
import { formatTemplate, getTranslations, LANGUAGES, loadLanguage, saveLanguage } from "./i18n";

describe("i18n language repository", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("lists the supported languages", () => {
    expect(LANGUAGES.map((l) => l.id)).toEqual(["ja", "en"]);
  });

  it("defaults to English when nothing is stored", () => {
    expect(loadLanguage()).toBe("en");
  });

  it("falls back to English for an invalid stored value", () => {
    localStorage.setItem("work-timer-language", "fr");
    expect(loadLanguage()).toBe("en");
  });

  it("saves and loads a chosen language", () => {
    saveLanguage("ja");
    expect(loadLanguage()).toBe("ja");
  });
});

describe("getTranslations", () => {
  it("returns Japanese strings for ja", () => {
    expect(getTranslations("ja").start).toBe("開始");
    expect(getTranslations("ja").stop).toBe("終了");
  });

  it("returns English strings for en", () => {
    expect(getTranslations("en").start).toBe("Start");
    expect(getTranslations("en").stop).toBe("Stop");
  });
});

describe("formatTemplate", () => {
  it("substitutes {value} with the given string", () => {
    expect(formatTemplate("{value}から計測中", "10:30")).toBe("10:30から計測中");
    expect(formatTemplate("Tracking since {value}", "10:30")).toBe("Tracking since 10:30");
  });
});
