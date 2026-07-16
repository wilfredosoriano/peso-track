"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ExpressionInput } from "@/components/calculator/expression-input";
import { updateMonthSalary } from "@/lib/actions/months";

export function SalaryEditor({
  monthId,
  currentSalary,
}: {
  monthId: string;
  currentSalary: number | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [expression, setExpression] = useState(currentSalary !== null ? String(currentSalary) : "");
  const [evaluated, setEvaluated] = useState<number | null>(currentSalary);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (evaluated === null) {
      toast.error("Enter a valid amount");
      return;
    }
    startTransition(async () => {
      try {
        await updateMonthSalary(monthId, evaluated);
        toast.success("Salary updated");
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update salary");
      }
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Edit salary" className="shrink-0">
          <Pencil className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-3">
        <p className="text-sm font-medium">Salary for this month</p>
        <ExpressionInput
          value={expression}
          onChange={setExpression}
          onEvaluatedChange={setEvaluated}
          placeholder="e.g. 9000 or 8000+1500"
        />
        <Button size="sm" className="w-full" onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving…" : "Save"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
