import { describe, expect, it } from "vitest";
import {
  daysInMonth,
  firstWeekdayOfMonth,
  formatMonthOnlyLabel,
  formatYearMonthLabel,
  formatYearOnlyLabel,
  shiftMonth,
  toDateKey,
} from "./calendarMonth";

describe("daysInMonth", () => {
  it("returns 31 for July", () => {
    expect(daysInMonth(2026, 6)).toBe(31);
  });

  it("returns 28 for February in a non-leap year", () => {
    expect(daysInMonth(2026, 1)).toBe(28);
  });

  it("returns 29 for February in a leap year", () => {
    expect(daysInMonth(2024, 1)).toBe(29);
  });
});

describe("firstWeekdayOfMonth", () => {
  it("returns the weekday index (0=Sunday) of the 1st of the month", () => {
    // 2026-07-01 is a Wednesday
    expect(firstWeekdayOfMonth(2026, 6)).toBe(3);
  });
});

describe("toDateKey", () => {
  it("formats a zero-padded YYYY-MM-DD key", () => {
    expect(toDateKey(2026, 0, 2)).toBe("2026-01-02");
  });
});

describe("shiftMonth", () => {
  it("moves forward within the same year", () => {
    expect(shiftMonth({ year: 2026, month: 5 }, 1)).toEqual({ year: 2026, month: 6 });
  });

  it("wraps forward into the next year", () => {
    expect(shiftMonth({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 });
  });

  it("wraps backward into the previous year", () => {
    expect(shiftMonth({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 });
  });
});

describe("formatYearMonthLabel", () => {
  it("formats a year/month as a Japanese label by default", () => {
    expect(formatYearMonthLabel({ year: 2026, month: 6 })).toBe("2026年07月");
  });

  it("formats a year/month as an English label when requested", () => {
    expect(formatYearMonthLabel({ year: 2026, month: 6 }, "en")).toBe("Jul 2026");
  });
});

describe("formatYearOnlyLabel", () => {
  it("appends 年 by default", () => {
    expect(formatYearOnlyLabel(2026)).toBe("2026年");
  });

  it("returns the bare year number in English", () => {
    expect(formatYearOnlyLabel(2026, "en")).toBe("2026");
  });
});

describe("formatMonthOnlyLabel", () => {
  it("formats a zero-padded 月 label by default", () => {
    expect(formatMonthOnlyLabel(6)).toBe("07月");
  });

  it("formats the abbreviated English month name when requested", () => {
    expect(formatMonthOnlyLabel(6, "en")).toBe("Jul");
  });
});
