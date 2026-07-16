"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Repeat } from "lucide-react";
import type { BillListItem } from "@/components/bills/types";
import { CategoryChip } from "@/components/bills/category-chip";
import { BillStatusPill } from "@/components/bills/bill-status-pill";
import { BillRowActions } from "@/components/bills/bill-row-actions";
import { formatCurrency } from "@/lib/utils/currency";

declare module "@tanstack/react-table" {
  // TData is required to match TanStack's own TableMeta<TData> signature for
  // declaration merging, even though these particular fields don't use it.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData> {
    onScheduleDelete?: (billId: string, commit: () => void | Promise<void>) => void;
    onCancelDelete?: (billId: string) => void;
  }
}

const columnHelper = createColumnHelper<BillListItem>();

export const billsTableColumns = [
  columnHelper.accessor("name", {
    header: "Bill Name",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor("categoryName", {
    header: "Category",
    cell: (info) => (
      <CategoryChip
        name={info.getValue()}
        color={info.row.original.categoryColor}
        icon={info.row.original.categoryIcon}
      />
    ),
  }),
  columnHelper.accessor("yourShare", {
    header: "Amount (Your Share)",
    cell: (info) => (
      <div>
        <p className="text-xs text-muted-foreground">{info.row.original.expression}</p>
        <p className="font-medium">= {formatCurrency(info.getValue())}</p>
      </div>
    ),
  }),
  columnHelper.accessor("dueDate", {
    header: "Due Date",
    cell: (info) =>
      new Date(info.getValue()).toLocaleDateString("en-PH", { month: "short", day: "numeric" }),
  }),
  columnHelper.accessor("isPaid", {
    header: "Status",
    cell: (info) => (
      <BillStatusPill isPaid={info.getValue()} isPaused={info.row.original.isPaused} />
    ),
  }),
  columnHelper.accessor("isRecurring", {
    header: "Recurring",
    cell: (info) =>
      info.getValue() ? <Repeat className="size-4 text-muted-foreground" /> : null,
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: (info) => {
      const meta = info.table.options.meta;
      return (
        <BillRowActions
          billId={info.row.original.id}
          isPaid={info.row.original.isPaid}
          isPaused={info.row.original.isPaused}
          isRecurring={info.row.original.isRecurring}
          onScheduleDelete={meta!.onScheduleDelete!}
          onCancelDelete={meta!.onCancelDelete!}
        />
      );
    },
  }),
];
