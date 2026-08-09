import { describe, expect, it } from "vitest";
import { elapsedSeconds, formatElapsed } from "./elapsed";

describe("elapsedSeconds", () => {
  it("counts whole seconds since the start instant", () => {
    const start = new Date(2026, 7, 3, 9, 0, 0).toISOString();
    const now = new Date(2026, 7, 3, 9, 1, 30).getTime();
    expect(elapsedSeconds(start, now)).toBe(90);
  });

  it("floors partial seconds", () => {
    const start = new Date(2026, 7, 3, 9, 0, 0).toISOString();
    expect(elapsedSeconds(start, new Date(2026, 7, 3, 9, 0, 0).getTime() + 1999)).toBe(1);
  });

  it("clamps a future start to zero", () => {
    const start = new Date(2026, 7, 3, 9, 0, 10).toISOString();
    expect(elapsedSeconds(start, new Date(2026, 7, 3, 9, 0, 0).getTime())).toBe(0);
  });

  it("returns 0 for an unparseable start", () => {
    expect(elapsedSeconds("not-a-date", Date.parse("2026-08-03T00:00:00Z"))).toBe(0);
  });
});

describe("formatElapsed", () => {
  it("pads minutes and seconds but not hours", () => {
    expect(formatElapsed(0)).toBe("0:00:00");
    expect(formatElapsed(9)).toBe("0:00:09");
    expect(formatElapsed(65)).toBe("0:01:05");
    expect(formatElapsed(3661)).toBe("1:01:01");
  });

  it("lets the hour place grow past a day", () => {
    expect(formatElapsed(25 * 3600 + 2 * 60 + 3)).toBe("25:02:03");
  });

  it("treats negatives and non-finite input as zero", () => {
    expect(formatElapsed(-5)).toBe("0:00:00");
    expect(formatElapsed(Number.NaN)).toBe("0:00:00");
  });
});
