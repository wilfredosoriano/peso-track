"use client";

import Link from "next/link";
import { Repeat } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryChip } from "@/components/bills/category-chip";
import { BillStatusPill } from "@/components/bills/bill-status-pill";
import { BillRowActions } from "@/components/bills/bill-row-actions";
import { formatCurrency } from "@/lib/utils/currency";
import { useMonthQuery } from "@/lib/hooks/use-month-query";
import type { BillListItem } from "@/components/bills/types";

interface BillsCardListProps {
  bills: BillListItem[];
  onScheduleDelete: (billId: string, commit: () => void | Promise<void>) => void;
  onCancelDelete: (billId: string) => void;
}

export function BillsCardList({ bills, onScheduleDelete, onCancelDelete }: BillsCardListProps) {
  const monthQuery = useMonthQuery();

  if (bills.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground md:hidden">
        No bills match your filters.
      </p>
    );
  }

  return (
    <div className="space-y-3 md:hidden">
      {bills.map((bill) => (
        <Card key={bill.id}>
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <Link href={`/bills/${bill.id}/edit${monthQuery}`} className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">{bill.name}</p>
                {bill.isRecurring && <Repeat className="size-3.5 shrink-0 text-muted-foreground" />}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <CategoryChip
                  name={bill.categoryName}
                  color={bill.categoryColor}
                  icon={bill.categoryIcon}
                />
                <span className="text-xs text-muted-foreground">
                  {new Date(bill.dueDate).toLocaleDateString("en-PH", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </Link>
            <div className="flex shrink-0 items-center gap-2">
              <div className="text-right">
                <p className="font-medium">{formatCurrency(bill.yourShare)}</p>
                <BillStatusPill isPaid={bill.isPaid} isPaused={bill.isPaused} />
              </div>
              <BillRowActions
                billId={bill.id}
                isPaid={bill.isPaid}
                isPaused={bill.isPaused}
                isRecurring={bill.isRecurring}
                onScheduleDelete={onScheduleDelete}
                onCancelDelete={onCancelDelete}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
