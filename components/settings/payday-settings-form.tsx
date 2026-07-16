"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUserSettings } from "@/lib/actions/settings";

export function PaydaySettingsForm({
  payCutoffDay1,
  payCutoffDay2,
}: {
  payCutoffDay1: number;
  payCutoffDay2: number;
}) {
  const router = useRouter();
  const [day1, setDay1] = useState(payCutoffDay1);
  const [day2, setDay2] = useState(payCutoffDay2);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      try {
        await updateUserSettings({ payCutoffDay1: day1, payCutoffDay2: day2 });
        toast.success("Settings saved");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to save settings");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cutoff-1">First payday</Label>
          <Input
            id="cutoff-1"
            type="number"
            min={1}
            max={31}
            value={day1}
            onChange={(event) => setDay1(Number(event.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cutoff-2">Second payday</Label>
          <Input
            id="cutoff-2"
            type="number"
            min={1}
            max={31}
            value={day2}
            onChange={(event) => setDay2(Number(event.target.value))}
          />
        </div>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
