"use client";

import { useMemo, useState } from "react";
import type { BillListItem } from "@/components/bills/types";
import { useUndoableDelete } from "@/lib/hooks/use-undoable-delete";

export type BillStatusFilter = "all" | "unpaid" | "paid";
export type BillSort = "dueDate" | "amount";

/** Centralizes filter/sort logic shared by both the desktop table and mobile card list. */
export function useBillsViewModel(bills: BillListItem[]) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BillStatusFilter>("all");
  const [sortBy, setSortBy] = useState<BillSort>("dueDate");
  const { schedule: scheduleDelete, cancel: cancelDelete, isPending: isPendingDelete } =
    useUndoableDelete();

  const filtered = useMemo(() => {
    return bills
      .filter((bill) => !isPendingDelete(bill.id))
      .filter((bill) => bill.name.toLowerCase().includes(search.toLowerCase()))
      .filter((bill) => {
        if (statusFilter === "paid") return bill.isPaid;
        if (statusFilter === "unpaid") return !bill.isPaid;
        return true;
      })
      .sort((a, b) =>
        sortBy === "amount"
          ? b.yourShare - a.yourShare
          : new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      );
  }, [bills, search, statusFilter, sortBy, isPendingDelete]);

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    filtered,
    scheduleDelete,
    cancelDelete,
  };
}
