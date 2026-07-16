"use server";

import { db } from "@/lib/db";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { classifyBillNotification } from "@/lib/recurrence";

export interface NotificationItem {
  id: string;
  name: string;
  dueDate: Date;
  yourShare: number;
  status: "overdue" | "due-soon";
}

/** Respects the user's notification preferences — returns [] entirely if both are off. */
export async function getNotifications(): Promise<NotificationItem[]> {
  const user = await getOrCreateCurrentUser();
  if (!user.notifyDueSoon && !user.notifyOverdue) return [];

  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const horizon = new Date(today);
  horizon.setUTCDate(horizon.getUTCDate() + user.notifyDaysAhead);

  const bills = await db.bill.findMany({
    where: {
      userId: user.id,
      isPaid: false,
      isPaused: false,
      dueDate: user.notifyDueSoon ? { lte: horizon } : { lt: today },
    },
    orderBy: { dueDate: "asc" },
    take: 20,
  });

  const items: NotificationItem[] = [];
  for (const bill of bills) {
    const status = classifyBillNotification(bill, user, today);
    if (!status) continue;
    items.push({
      id: bill.id,
      name: bill.name,
      dueDate: bill.dueDate,
      yourShare: Number(bill.yourShare),
      status,
    });
  }
  return items;
}
