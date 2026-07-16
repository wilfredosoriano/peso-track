"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatCurrency } from "@/lib/utils/currency";
import type { NotificationItem } from "@/lib/actions/notifications";

export function NotificationBell({ notifications }: { notifications: NotificationItem[] }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="size-5" />
          {notifications.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {notifications.length > 9 ? "9+" : notifications.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <p className="mb-2 text-sm font-medium">Notifications</p>
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">You&rsquo;re all caught up.</p>
        ) : (
          <div className="space-y-2">
            {notifications.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.dueDate).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(item.yourShare)}</p>
                  <Badge variant={item.status === "overdue" ? "destructive" : "outline"}>
                    {item.status === "overdue" ? "Overdue" : "Due soon"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
