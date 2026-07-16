"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Pause, Play } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setBillPaused } from "@/lib/actions/bills";

export function PauseToggleButton({ billId, isPaused }: { billId: string; isPaused: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
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

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={isPending} className="gap-1">
      {isPaused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
      {isPaused ? "Resume" : "Pause"}
    </Button>
  );
}
