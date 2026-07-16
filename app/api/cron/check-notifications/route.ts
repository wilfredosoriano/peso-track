import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { sendPushToUser } from "@/lib/push";
import { formatCurrency } from "@/lib/utils/currency";
import { classifyBillNotification } from "@/lib/recurrence";

/**
 * Meant to be hit on a schedule (e.g. Vercel Cron every 15-30 min), not by
 * users — protected by CRON_SECRET rather than Clerk auth (see proxy.ts,
 * which explicitly allows this path through unauthenticated).
 *
 * Dedup: each Bill has `dueSoonNotified`/`overdueNotified` flags so a bill
 * only triggers one push per state, no matter how often this runs.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  const users = await db.user.findMany({
    where: { OR: [{ notifyDueSoon: true }, { notifyOverdue: true }] },
  });

  let notifiedCount = 0;

  for (const user of users) {
    const horizon = new Date(today);
    horizon.setUTCDate(horizon.getUTCDate() + user.notifyDaysAhead);

    const bills = await db.bill.findMany({
      where: {
        userId: user.id,
        isPaid: false,
        isPaused: false,
        dueDate: user.notifyDueSoon ? { lte: horizon } : { lt: today },
      },
    });

    for (const bill of bills) {
      const status = classifyBillNotification(bill, user, today);
      if (!status) continue;

      const isOverdue = status === "overdue";
      if (isOverdue ? bill.overdueNotified : bill.dueSoonNotified) continue;

      await sendPushToUser(user.id, {
        title: isOverdue ? "Bill overdue" : "Bill due soon",
        body: `${bill.name} — ${formatCurrency(Number(bill.yourShare))}`,
        url: "/dashboard",
      });

      await db.bill.update({
        where: { id: bill.id },
        data: isOverdue ? { overdueNotified: true } : { dueSoonNotified: true },
      });

      notifiedCount++;
    }
  }

  return NextResponse.json({ ok: true, notified: notifiedCount });
}
