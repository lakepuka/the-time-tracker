import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_TIMER_PRECISION,
  floorToMinute,
  loadTimerPrecision,
  saveTimerPrecision,
} from "./timerPrecision";

describe("timer precision storage", () => {
  beforeEach(() => localStorage.clear());

  it("defaults to minute precision", () => {
    expect(DEFAULT_TIMER_PRECISION).toBe("minute");
    expect(loadTimerPrecision("tab-1")).toBe("minute");
  });

  it("persists and reloads a per-tab precision", () => {
    saveTimerPrecision("tab-1", "second");
    expect(loadTimerPrecision("tab-1")).toBe("second");
    expect(loadTimerPrecision("tab-2")).toBe("minute");
  });

  it("falls back to the default for an unrecognized stored value", () => {
    localStorage.setItem("work-timer-precision:tab-1", "nonsense");
    expect(loadTimerPrecision("tab-1")).toBe("minute");
  });
});

describe("floorToMinute", () => {
  it("zeroes seconds and milliseconds", () => {
    const floored = floorToMinute(new Date(2026, 7, 10, 10, 40, 50, 123));
    expect(floored.getSeconds()).toBe(0);
    expect(floored.getMilliseconds()).toBe(0);
    expect(floored.getHours()).toBe(10);
    expect(floored.getMinutes()).toBe(40);
  });

  it("does not mutate the input", () => {
    const original = new Date(2026, 7, 10, 10, 40, 50);
    floorToMinute(original);
    expect(original.getSeconds()).toBe(50);
  });

  it("leaves an already-floored instant unchanged", () => {
    const floored = floorToMinute(new Date(2026, 7, 10, 10, 41, 0, 0));
    expect(floored.getMinutes()).toBe(41);
    expect(floored.getSeconds()).toBe(0);
  });
});
