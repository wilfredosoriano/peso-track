export function toMonthIndex(year: number, month: number): number {
  return year * 12 + month;
}

export function fromMonthIndex(monthIndex: number): { year: number; month: number } {
  const year = Math.floor((monthIndex - 1) / 12);
  const month = monthIndex - year * 12;
  return { year, month };
}

/** `month` is 1-12. */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Clamps `day` to the last valid day of `year`/`month` (e.g. day 31 in February -> 28/29). */
export function clampDueDate(year: number, month: number, day: number): Date {
  const clampedDay = Math.min(day, daysInMonth(year, month));
  return new Date(Date.UTC(year, month - 1, clampedDay));
}

/** Parses the `?month=YYYY-MM` search param used across (app) routes, defaulting to the current calendar month. */
export function parseMonthSearchParam(value: string | undefined): { year: number; month: number } {
  if (value) {
    const [yearStr, monthStr] = value.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    if (year && month) return { year, month };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

/** Extracts year/month from a "YYYY-MM-DD" due-date string — this is what determines which MonthPeriod a bill belongs to. */
export function yearMonthFromDueDate(dueDate: string): { year: number; month: number } {
  const [yearStr, monthStr] = dueDate.split("-");
  return { year: Number(yearStr), month: Number(monthStr) };
}

/** Formats the `?month=YYYY-MM` query string for a given year/month, for links that need to carry the active month forward. */
export function monthQueryString(year: number, month: number): string {
  return `?month=${year}-${String(month).padStart(2, "0")}`;
}

export const FREQUENCY_INTERVAL_MONTHS: Record<string, number> = {
  MONTHLY: 1,
  EVERY_2_MONTHS: 2,
  QUARTERLY: 3,
  YEARLY: 12,
};
