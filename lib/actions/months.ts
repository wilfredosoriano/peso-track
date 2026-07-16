"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { getOrCreateMonthPeriod } from "@/lib/month-period";

export async function listMonths() {
  const user = await getOrCreateCurrentUser();
  return db.monthPeriod.findMany({
    where: { userId: user.id },
    orderBy: { monthIndex: "asc" },
    select: { id: true, year: true, month: true, monthIndex: true },
  });
}

/** Auto-creates the month (and chain-fills any gap since the last month on record) if it doesn't exist yet. */
export async function getMonth(year: number, month: number) {
  const user = await getOrCreateCurrentUser();
  const monthPeriod = await getOrCreateMonthPeriod(user.id, year, month);
  return db.monthPeriod.findUniqueOrThrow({
    where: { id: monthPeriod.id },
    include: { bills: { include: { category: true }, orderBy: { dueDate: "asc" } } },
  });
}

export async function updateMonthSalary(monthId: string, salary: number) {
  const user = await getOrCreateCurrentUser();
  const updated = await db.monthPeriod.update({
    where: { id: monthId, userId: user.id },
    data: { salary },
  });
  revalidatePath("/dashboard");
  return { id: updated.id, salary: updated.salary ? Number(updated.salary) : null };
}
