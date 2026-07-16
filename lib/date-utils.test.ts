import { describe, expect, it } from "vitest";
import {
  toMonthIndex,
  fromMonthIndex,
  daysInMonth,
  clampDueDate,
  parseMonthSearchParam,
  yearMonthFromDueDate,
  monthQueryString,
} from "./date-utils";

describe("toMonthIndex / fromMonthIndex", () => {
  it("round-trips for a range of months", () => {
    for (const [year, month] of [[2026, 1], [2026, 7], [2026, 12], [2025, 3]] as const) {
      expect(fromMonthIndex(toMonthIndex(year, month))).toEqual({ year, month });
    }
  });
});

describe("daysInMonth", () => {
  it("returns 28 for February in a non-leap year", () => {
    expect(daysInMonth(2026, 2)).toBe(28);
  });

  it("returns 29 for February in a leap year", () => {
    expect(daysInMonth(2024, 2)).toBe(29);
  });

  it("returns 30/31 for other months", () => {
    expect(daysInMonth(2026, 4)).toBe(30);
    expect(daysInMonth(2026, 12)).toBe(31);
  });
});

describe("clampDueDate", () => {
  it("keeps a valid day unchanged", () => {
    expect(clampDueDate(2026, 7, 15).getUTCDate()).toBe(15);
  });

  it("clamps day 31 down to February's last valid day", () => {
    expect(clampDueDate(2026, 2, 31).getUTCDate()).toBe(28);
    expect(clampDueDate(2024, 2, 31).getUTCDate()).toBe(29);
  });
});

describe("yearMonthFromDueDate", () => {
  it("extracts year/month from a YYYY-MM-DD string", () => {
    expect(yearMonthFromDueDate("2026-08-15")).toEqual({ year: 2026, month: 8 });
  });
});

describe("monthQueryString", () => {
  it("formats and zero-pads the month", () => {
    expect(monthQueryString(2026, 8)).toBe("?month=2026-08");
    expect(monthQueryString(2026, 12)).toBe("?month=2026-12");
  });
});

describe("parseMonthSearchParam", () => {
  it("parses a valid YYYY-MM value", () => {
    expect(parseMonthSearchParam("2026-08")).toEqual({ year: 2026, month: 8 });
  });

  it("falls back to the current calendar month when unset", () => {
    const now = new Date();
    expect(parseMonthSearchParam(undefined)).toEqual({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    });
  });
});
