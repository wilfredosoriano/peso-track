"use client";

import { useBillsViewModel } from "@/components/bills/use-bills-view-model";
import { BillsTableToolbar } from "@/components/bills/bills-table-toolbar";
import { BillsDataTable } from "@/components/bills/bills-data-table";
import { BillsCardList } from "@/components/bills/bills-card-list";
import type { BillListItem } from "@/components/bills/types";

export function BillsView({ bills }: { bills: BillListItem[] }) {
  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    filtered,
    scheduleDelete,
    cancelDelete,
  } = useBillsViewModel(bills);

  return (
    <div className="space-y-4">
      <BillsTableToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />
      <BillsDataTable bills={filtered} onScheduleDelete={scheduleDelete} onCancelDelete={cancelDelete} />
      <BillsCardList bills={filtered} onScheduleDelete={scheduleDelete} onCancelDelete={cancelDelete} />
    </div>
  );
}
