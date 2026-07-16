"use server";

import { db } from "@/lib/db";
import { getOrCreateCurrentUser } from "@/lib/auth";

function sum(values: number[]) {
  return values.reduce((acc, value) => acc + value, 0);
}

/**
 * "Salary Left" = salary - totalBills (projected leftover across all bills,
 * not just paid ones) — see the plan's "Assumptions Resolved" section for
 * why this definition, not salary - paidTotal, was chosen.
 */
export async function getDashboardSummary(monthId: string) {
  const user = await getOrCreateCurrentUser();
  const month = await db.monthPeriod.findFirst({
    where: { id: monthId, userId: user.id },
    include: { bills: { include: { category: true } } },
  });
  if (!month) throw new Error("Month not found");

  // Paused bills are excluded from every total — they're still visible in
  // the full Bills list (with a "Paused" badge) so the user can resume them,
  // but they shouldn't count against this month's money.
  const bills = month.bills.filter((bill) => !bill.isPaused);
  const shares = bills.map((bill) => Number(bill.yourShare));
  const totalBills = sum(shares);
  const paidTotal = sum(bills.filter((bill) => bill.isPaid).map((bill) => Number(bill.yourShare)));
  const remainingTotal = totalBills - paidTotal;
  const paymentProgressPct = totalBills > 0 ? (paidTotal / totalBills) * 100 : 0;
  const salary = month.salary ? Number(month.salary) : null;
  const salaryLeft = salary !== null ? salary - totalBills : null;

  const recurringVsOneTime = {
    recurring: sum(bills.filter((bill) => bill.isRecurring).map((bill) => Number(bill.yourShare))),
    oneTime: sum(bills.filter((bill) => !bill.isRecurring).map((bill) => Number(bill.yourShare))),
  };

  const categoryTotals = new Map<string, { name: string; color: string | null; total: number }>();
  for (const bill of bills) {
    const key = bill.categoryId ?? "uncategorized";
    const existing = categoryTotals.get(key);
    const amount = Number(bill.yourShare);
    if (existing) {
      existing.total += amount;
    } else {
      categoryTotals.set(key, {
        name: bill.category?.name ?? "Uncategorized",
        color: bill.category?.color ?? null,
        total: amount,
      });
    }
  }

  const upcomingDue = bills
    .filter((bill) => !bill.isPaid)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 5);

  return {
    totalBills,
    paidTotal,
    remainingTotal,
    paymentProgressPct,
    salary,
    salaryLeft,
    recurringVsOneTime,
    categoryBreakdown: Array.from(categoryTotals.values()),
    upcomingDue,
    activeBillsCount: bills.length,
  };
}

export async function getMonthlyTrend(monthsBack = 6) {
  const user = await getOrCreateCurrentUser();
  const months = await db.monthPeriod.findMany({
    where: { userId: user.id },
    orderBy: { monthIndex: "desc" },
    take: monthsBack,
    include: { bills: true },
  });

  return months
    .map((month) => ({
      year: month.year,
      month: month.month,
      totalBilled: sum(month.bills.map((bill) => Number(bill.yourShare))),
      totalPaid: sum(
        month.bills.filter((bill) => bill.isPaid).map((bill) => Number(bill.yourShare)),
      ),
    }))
    .reverse();
}
