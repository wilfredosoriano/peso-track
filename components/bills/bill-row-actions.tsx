"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { MoreVertical, Pencil, Trash2, CheckCircle, Circle, Pause, Play } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setBillPaid, setBillPaused, deleteBill } from "@/lib/actions/bills";
import { useMonthQuery } from "@/lib/hooks/use-month-query";

interface BillRowActionsProps {
  billId: string;
  isPaid: boolean;
  isPaused?: boolean;
  isRecurring?: boolean;
  onScheduleDelete: (billId: string, commit: () => void | Promise<void>) => void;
  onCancelDelete: (billId: string) => void;
}

export function BillRowActions({
  billId,
  isPaid,
  isPaused = false,
  isRecurring = false,
  onScheduleDelete,
  onCancelDelete,
}: BillRowActionsProps) {
  const router = useRouter();
  const monthQuery = useMonthQuery();
  const [isPending, startTransition] = useTransition();

  function handleTogglePaid() {
    startTransition(async () => {
      try {
        await setBillPaid(billId, !isPaid);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update bill");
      }
    });
  }

  function handleTogglePaused() {
    startTransition(async () => {
      try {
        await setBillPaused(billId, !isPaused);
        toast.success(isPaused ? "Bill resumed" : "Bill paused for this cycle");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update bill");
      }
    });
  }

  function handleDelete() {
    onScheduleDelete(billId, async () => {
      try {
        await deleteBill(billId);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete bill");
      }
    });
    toast("Bill deleted", {
      duration: 5000,
      action: { label: "Undo", onClick: () => onCancelDelete(billId) },
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isPending} aria-label="Bill actions">
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleTogglePaid}>
          {isPaid ? <Circle className="size-4" /> : <CheckCircle className="size-4" />}
          Mark as {isPaid ? "Unpaid" : "Paid"}
        </DropdownMenuItem>
        {isRecurring && (
          <DropdownMenuItem onClick={handleTogglePaused}>
            {isPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
            {isPaused ? "Resume this bill" : "Pause this cycle"}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => router.push(`/bills/${billId}/edit${monthQuery}`)}>
          <Pencil className="size-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={handleDelete}>
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
