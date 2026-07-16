"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fromMonthIndex, toMonthIndex, parseMonthSearchParam } from "@/lib/date-utils";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Reads/writes the active month via the `?month=YYYY-MM` search param (see
 * plan: State Management). Navigating to a month that doesn't exist yet is
 * fine — `getMonth` auto-creates it (chain-filling recurring bills forward)
 * on the next page load, so there's no separate "create month" step.
 */
export function MonthSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { year, month } = parseMonthSearchParam(searchParams.get("month") ?? undefined);
  const monthIndex = toMonthIndex(year, month);

  function goToOffset(offset: number) {
    const next = fromMonthIndex(monthIndex + offset);
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", `${next.year}-${String(next.month).padStart(2, "0")}`);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" onClick={() => goToOffset(-1)} aria-label="Previous month">
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-32 text-center text-sm font-medium">
        {MONTH_NAMES[month - 1]} {year}
      </span>
      <Button variant="ghost" size="icon" onClick={() => goToOffset(1)} aria-label="Next month">
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
