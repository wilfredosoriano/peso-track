import { Suspense } from "react";
import { UserButton } from "@clerk/nextjs";
import { MonthSwitcher } from "@/components/layout/month-switcher";
import { AddBillButton } from "@/components/layout/add-bill-button";
import { NotificationBell } from "@/components/layout/notification-bell";
import { getNotifications } from "@/lib/actions/notifications";

export async function TopBar() {
  const notifications = await getNotifications();

  return (
    <header className="flex items-center justify-between border-b bg-background px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 md:px-6 md:pt-3">
      <Suspense fallback={<div className="h-9 w-56" />}>
        <MonthSwitcher />
      </Suspense>
      <div className="flex items-center gap-2">
        <Suspense fallback={<div className="h-8 w-24" />}>
          <AddBillButton />
        </Suspense>
        <NotificationBell notifications={notifications} />
        <UserButton />
      </div>
    </header>
  );
}
