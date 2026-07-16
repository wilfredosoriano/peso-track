"use client";

import { useSearchParams } from "next/navigation";

/**
 * Returns the current `?month=YYYY-MM` query suffix (or "" if unset), so
 * internal links/redirects can carry the active month forward instead of
 * silently falling back to today's month the moment you navigate elsewhere.
 */
export function useMonthQuery(): string {
  const searchParams = useSearchParams();
  const month = searchParams.get("month");
  return month ? `?month=${month}` : "";
}
