"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { useMonthQuery } from "@/lib/hooks/use-month-query";

export function Sidebar() {
  const pathname = usePathname();
  const monthQuery = useMonthQuery();

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:bg-background">
      <div className="flex items-center gap-2 px-6 py-5">
        <Image src="/icons/icon-192.png" alt="" width={28} height={28} className="rounded-md" />
        <div>
          <p className="text-sm font-semibold leading-none">PesoTrack</p>
          <p className="text-xs text-muted-foreground">Bill Tracker</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={`${item.href}${monthQuery}`}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
