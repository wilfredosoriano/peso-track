"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateUserSettings } from "@/lib/actions/settings";

interface NotificationSettingsFormProps {
  notifyDueSoon: boolean;
  notifyOverdue: boolean;
  notifyDaysAhead: number;
}

export function NotificationSettingsForm({
  notifyDueSoon,
  notifyOverdue,
  notifyDaysAhead,
}: NotificationSettingsFormProps) {
  const router = useRouter();
  const [dueSoon, setDueSoon] = useState(notifyDueSoon);
  const [overdue, setOverdue] = useState(notifyOverdue);
  const [daysAhead, setDaysAhead] = useState(notifyDaysAhead);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      try {
        await updateUserSettings({
          notifyDueSoon: dueSoon,
          notifyOverdue: overdue,
          notifyDaysAhead: daysAhead,
        });
        toast.success("Notification preferences saved");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to save preferences");
      }
    });
  }

  return (
    <div className="max-w-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label>Due soon</Label>
          <p className="text-xs text-muted-foreground">Notify before a bill&apos;s due date</p>
        </div>
        <Switch checked={dueSoon} onCheckedChange={setDueSoon} />
      </div>

      {dueSoon && (
        <div className="space-y-2">
          <Label htmlFor="days-ahead">Days ahead</Label>
          <Input
            id="days-ahead"
            type="number"
            min={1}
            max={30}
            value={daysAhead}
            onChange={(event) => setDaysAhead(Number(event.target.value))}
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <Label>Overdue</Label>
          <p className="text-xs text-muted-foreground">Notify when a bill is past due</p>
        </div>
        <Switch checked={overdue} onCheckedChange={setOverdue} />
      </div>

      <Button size="sm" onClick={handleSave} disabled={isPending}>
        {isPending ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}
