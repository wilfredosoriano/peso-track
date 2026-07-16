"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOBILE_TAB_ITEMS } from "@/components/layout/nav-items";
import { useMonthQuery } from "@/lib/hooks/use-month-query";

export function BottomTabBar() {
  const pathname = usePathname();
  const monthQuery = useMonthQuery();
  const [firstTab, secondTab, thirdTab] = MOBILE_TAB_ITEMS;

  const renderTab = (item: (typeof MOBILE_TAB_ITEMS)[number]) => {
    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
    return (
      <Link
        key={item.href}
        href={`${item.href}${monthQuery}`}
        className={cn(
          "flex flex-1 flex-col items-center gap-1 py-2 text-xs",
          isActive ? "text-primary" : "text-muted-foreground",
        )}
      >
        <item.icon className="size-5" />
        {item.label}
      </Link>
    );
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
      {renderTab(firstTab)}
      {renderTab(secondTab)}
      <Link
        href={`/bills/new${monthQuery}`}
        className="mx-2 -mt-6 flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
      >
        <Plus className="size-6" />
      </Link>
      {renderTab(thirdTab)}
      <Link
        href={`/settings${monthQuery}`}
        className={cn(
          "flex flex-1 flex-col items-center gap-1 py-2 text-xs",
          pathname === "/settings" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <MoreHorizontal className="size-5" />
        More
      </Link>
    </nav>
  );
}
