import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { CalculatorFab } from "@/components/calculator/calculator-fab";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 pb-[calc(5rem+max(1.25rem,env(safe-area-inset-bottom)))] md:p-6 md:pb-6">
          {children}
        </main>
      </div>
      <BottomTabBar />
      <CalculatorFab />
    </div>
  );
}
