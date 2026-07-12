import { beforeEach, describe, expect, it } from "vitest";
import { loadShowSummary, saveShowSummary } from "./summaryPreference";

describe("summary preference", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to hiding the summary when nothing is stored", () => {
    expect(loadShowSummary()).toBe(false);
  });

  it("saves and loads a hidden preference", () => {
    saveShowSummary(false);
    expect(loadShowSummary()).toBe(false);
  });

  it("saves and loads a shown preference", () => {
    saveShowSummary(true);
    expect(loadShowSummary()).toBe(true);
  });

  it("defaults to hiding the summary for an unrecognized stored value", () => {
    localStorage.setItem("work-timer-show-summary", "maybe");
    expect(loadShowSummary()).toBe(false);
  });
});
