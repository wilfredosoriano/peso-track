"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BillSort, BillStatusFilter } from "@/components/bills/use-bills-view-model";

interface BillsTableToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: BillStatusFilter;
  onStatusFilterChange: (value: BillStatusFilter) => void;
  sortBy: BillSort;
  onSortByChange: (value: BillSort) => void;
}

export function BillsTableToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
}: BillsTableToolbarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search bill…"
          className="pl-8"
        />
      </div>
      <div className="flex gap-2">
        <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as BillStatusFilter)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => onSortByChange(v as BillSort)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dueDate">Sort by: Due Date</SelectItem>
            <SelectItem value="amount">Sort by: Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
