"use client";

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { billsTableColumns } from "@/components/bills/bills-table-columns";
import type { BillListItem } from "@/components/bills/types";

interface BillsDataTableProps {
  bills: BillListItem[];
  onScheduleDelete: (billId: string, commit: () => void | Promise<void>) => void;
  onCancelDelete: (billId: string) => void;
}

export function BillsDataTable({ bills, onScheduleDelete, onCancelDelete }: BillsDataTableProps) {
  const table = useReactTable({
    data: bills,
    columns: billsTableColumns,
    getCoreRowModel: getCoreRowModel(),
    meta: { onScheduleDelete, onCancelDelete },
  });

  return (
    <div className="hidden overflow-x-auto rounded-md border md:block">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={billsTableColumns.length} className="h-24 text-center text-muted-foreground">
                No bills match your filters.
              </TableCell>
            </TableRow>
          )}
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
