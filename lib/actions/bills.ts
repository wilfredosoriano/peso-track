"use server";

import { createId } from "@paralleldrive/cuid2";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { getOrCreateMonthPeriod } from "@/lib/month-period";
import { evaluateExpression } from "@/lib/expression/evaluate";
import { computeYourShare, splitConfigFromFields } from "@/lib/split";
import { yearMonthFromDueDate, toMonthIndex } from "@/lib/date-utils";
import { billFormSchema, type BillFormInput } from "@/lib/schemas/bill-schema";

/**
 * The server always re-evaluates `amountExpression` and recomputes
 * `amount`/`yourShare` itself — a client-submitted amount is never trusted.
 */
function evaluateOrThrow(expression: string) {
  const evaluated = evaluateExpression(expression);
  if (evaluated.status !== "ok") {
    throw new Error("Amount expression is invalid or incomplete");
  }
  return evaluated.value;
}

/** Converts the form's "YYYY-MM" end-month string into a monthIndex, or null for indefinite recurrence. */
function computeRecurrenceEndMonthIndex(
  isRecurring: boolean,
  recurrenceEndMonth: string | null | undefined,
): number | null {
  if (!isRecurring || !recurrenceEndMonth) return null;
  const { year, month } = yearMonthFromDueDate(recurrenceEndMonth);
  return toMonthIndex(year, month);
}

export async function createBill(input: BillFormInput) {
  const user = await getOrCreateCurrentUser();
  const data = billFormSchema.parse(input);

  // The bill's month is always derived from its own due date — never from
  // whatever month the user happened to be viewing when they clicked "Add
  // Bill" — and auto-creates that month (chain-filling recurring bills
  // forward) if it doesn't exist yet.
  const { year, month: monthNum } = yearMonthFromDueDate(data.dueDate);
  const month = await getOrCreateMonthPeriod(user.id, year, monthNum);

  const amount = evaluateOrThrow(data.amountExpression);
  const yourShare = computeYourShare(amount, splitConfigFromFields(data));
  const id = createId();

  const bill = await db.bill.create({
    data: {
      id,
      userId: user.id,
      monthId: month.id,
      categoryId: data.categoryId ?? null,
      name: data.name,
      expression: data.amountExpression,
      amount,
      dueDate: new Date(data.dueDate),
      notes: data.notes ?? null,
      isRecurring: data.isRecurring,
      recurrenceFrequency: data.isRecurring ? data.recurrenceFrequency : null,
      recurrenceAnchorMonthIndex: data.isRecurring ? month.monthIndex : null,
      recurrenceEndMonthIndex: computeRecurrenceEndMonthIndex(
        data.isRecurring,
        data.recurrenceEndMonth,
      ),
      splitEnabled: data.splitEnabled,
      splitType: data.splitEnabled ? data.splitType : null,
      splitCount: data.splitEnabled && data.splitType === "EQUAL" ? data.splitCount : null,
      splitPercentage:
        data.splitEnabled && data.splitType === "PERCENTAGE" ? data.splitPercentage : null,
      splitPartnerLabel: data.splitPartnerLabel ?? null,
      yourShare,
      rootBillId: id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/bills");
  return { id: bill.id };
}

export async function updateBill(billId: string, input: BillFormInput) {
  const user = await getOrCreateCurrentUser();
  const data = billFormSchema.parse(input);

  const existing = await db.bill.findFirst({ where: { id: billId, userId: user.id } });
  if (!existing) throw new Error("Bill not found");

  // Same rule as createBill: the bill always lives in the month matching its
  // own due date, so editing the due date into a different month moves it.
  const { year, month: monthNum } = yearMonthFromDueDate(data.dueDate);
  const month = await getOrCreateMonthPeriod(user.id, year, monthNum);

  const amount = evaluateOrThrow(data.amountExpression);
  const yourShare = computeYourShare(amount, splitConfigFromFields(data));

  // The recurrence anchor never shifts once set — only assigned fresh the
  // moment a bill first becomes recurring.
  const recurrenceAnchorMonthIndex = data.isRecurring
    ? (existing.recurrenceAnchorMonthIndex ?? month.monthIndex)
    : null;

  const bill = await db.bill.update({
    where: { id: billId },
    data: {
      monthId: month.id,
      categoryId: data.categoryId ?? null,
      name: data.name,
      expression: data.amountExpression,
      amount,
      dueDate: new Date(data.dueDate),
      notes: data.notes ?? null,
      isRecurring: data.isRecurring,
      recurrenceFrequency: data.isRecurring ? data.recurrenceFrequency : null,
      recurrenceAnchorMonthIndex,
      recurrenceEndMonthIndex: computeRecurrenceEndMonthIndex(
        data.isRecurring,
        data.recurrenceEndMonth,
      ),
      splitEnabled: data.splitEnabled,
      splitType: data.splitEnabled ? data.splitType : null,
      splitCount: data.splitEnabled && data.splitType === "EQUAL" ? data.splitCount : null,
      splitPercentage:
        data.splitEnabled && data.splitType === "PERCENTAGE" ? data.splitPercentage : null,
      splitPartnerLabel: data.splitPartnerLabel ?? null,
      yourShare,
      // A changed due date deserves a fresh notification cycle — don't let a
      // stale flag from the old date silently suppress the new one.
      ...(existing.dueDate.getTime() !== new Date(data.dueDate).getTime()
        ? { dueSoonNotified: false, overdueNotified: false }
        : {}),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/bills");
  return { id: bill.id };
}

/** Takes an explicit boolean (not a blind toggle) so optimistic UI can't desync from the server. */
export async function setBillPaid(billId: string, isPaid: boolean) {
  const user = await getOrCreateCurrentUser();
  const bill = await db.bill.update({ where: { id: billId, userId: user.id }, data: { isPaid } });
  revalidatePath("/dashboard");
  revalidatePath("/bills");
  return { id: bill.id, isPaid: bill.isPaid };
}

/**
 * "Pause this one cycle" for a recurring bill — hides it from totals/dashboard
 * without permanently unmarking it as recurring. Deliberately not copied
 * forward (see copyRecurringBillsForward in lib/month-period.ts), so the
 * very next occurrence resumes normally.
 */
export async function setBillPaused(billId: string, isPaused: boolean) {
  const user = await getOrCreateCurrentUser();
  const bill = await db.bill.update({ where: { id: billId, userId: user.id }, data: { isPaused } });
  revalidatePath("/dashboard");
  revalidatePath("/bills");
  return { id: bill.id, isPaused: bill.isPaused };
}

export async function deleteBill(billId: string) {
  const user = await getOrCreateCurrentUser();
  await db.bill.delete({ where: { id: billId, userId: user.id } });
  revalidatePath("/dashboard");
  revalidatePath("/bills");
  return { id: billId };
}

export async function getBill(billId: string) {
  const user = await getOrCreateCurrentUser();
  return db.bill.findFirst({ where: { id: billId, userId: user.id } });
}

export async function getBillHistory(rootBillId: string) {
  const user = await getOrCreateCurrentUser();
  return db.bill.findMany({
    where: { userId: user.id, OR: [{ id: rootBillId }, { rootBillId }] },
    include: { month: true },
    orderBy: { month: { monthIndex: "asc" } },
  });
}
