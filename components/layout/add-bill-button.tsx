"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMonthQuery } from "@/lib/hooks/use-month-query";

export function AddBillButton() {
  const monthQuery = useMonthQuery();

  return (
    <Button asChild size="sm" className="hidden gap-1 sm:inline-flex">
      <Link href={`/bills/new${monthQuery}`}>
        <Plus className="size-4" />
        Add Bill
      </Link>
    </Button>
  );
}
