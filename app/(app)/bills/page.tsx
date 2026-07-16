import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BillsView } from "@/components/bills/bills-view";
import { getMonth } from "@/lib/actions/months";
import { parseMonthSearchParam, monthQueryString } from "@/lib/date-utils";
import type { BillListItem } from "@/components/bills/types";

export default async function BillsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;
  const { year, month } = parseMonthSearchParam(monthParam);
  const monthQuery = monthQueryString(year, month);
  const monthPeriod = await getMonth(year, month);

  const bills: BillListItem[] = monthPeriod.bills.map((bill) => ({
    id: bill.id,
    name: bill.name,
    expression: bill.expression,
    yourShare: Number(bill.yourShare),
    dueDate: bill.dueDate,
    isPaid: bill.isPaid,
    isPaused: bill.isPaused,
    isRecurring: bill.isRecurring,
    categoryName: bill.category?.name ?? "Uncategorized",
    categoryColor: bill.category?.color ?? null,
    categoryIcon: bill.category?.icon ?? null,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Bills</h1>
        <Button size="sm" asChild className="hidden md:inline-flex">
          <Link href={`/bills/new${monthQuery}`}>+ Add Bill</Link>
        </Button>
      </div>
      <BillsView bills={bills} />
    </div>
  );
}
