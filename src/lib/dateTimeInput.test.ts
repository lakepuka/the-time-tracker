import { describe, expect, it } from "vitest";
import {
  combineDateAndTime,
  pad2,
  toDisplayDate,
  toTimeInputValue,
  weekdayLabel,
  weekdayLabels,
} from "./dateTimeInput";

describe("pad2", () => {
  it("pads single-digit numbers with a leading zero", () => {
    expect(pad2(5)).toBe("05");
  });

  it("leaves two-digit numbers unchanged", () => {
    expect(pad2(30)).toBe("30");
  });
});

describe("toTimeInputValue", () => {
  it("formats an ISO string into a local time input value", () => {
    const iso = new Date(2026, 6, 5, 10, 30, 0).toISOString();
    expect(toTimeInputValue(iso)).toBe("10:30");
  });

  it("pads single-digit hours and minutes", () => {
    const iso = new Date(2026, 0, 2, 9, 5, 0).toISOString();
    expect(toTimeInputValue(iso)).toBe("09:05");
  });
});

describe("combineDateAndTime", () => {
  it("combines a date input value and a time input value into an ISO string", () => {
    const iso = combineDateAndTime("2026-07-05", "10:30");
    const expected = new Date(2026, 6, 5, 10, 30, 0).toISOString();

    expect(iso).toBe(expected);
  });
});

describe("toDisplayDate", () => {
  it("replaces dashes with slashes", () => {
    expect(toDisplayDate("2026-07-05")).toBe("2026/07/05");
  });
});

describe("weekdayLabel", () => {
  it("returns the Japanese weekday label for a given year/month/day", () => {
    expect(weekdayLabel(2026, 7, 5)).toBe(
      ["日", "月", "火", "水", "木", "金", "土"][new Date(2026, 6, 5).getDay()],
    );
  });

  it("matches a known Sunday", () => {
    // 2026-01-04 is a Sunday.
    expect(weekdayLabel(2026, 1, 4)).toBe("日");
  });

  it("rolls over into the next month for an out-of-range day", () => {
    // 2026-02-30 rolls over to 2026-03-02.
    expect(weekdayLabel(2026, 2, 30)).toBe(weekdayLabel(2026, 3, 2));
  });

  it("returns the English weekday label when requested", () => {
    // 2026-07-05 is a Sunday.
    expect(weekdayLabel(2026, 7, 5, "en")).toBe("Sun");
  });
});

describe("weekdayLabels", () => {
  it("returns the Japanese weekday labels by default", () => {
    expect(weekdayLabels()).toEqual(["日", "月", "火", "水", "木", "金", "土"]);
  });

  it("returns the English weekday labels when requested", () => {
    expect(weekdayLabels("en")).toEqual(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  });
});
