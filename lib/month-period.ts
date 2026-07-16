import "server-only";
import { db } from "@/lib/db";
import { computeYourShare, splitConfigFromFields } from "@/lib/split";
import { toMonthIndex, fromMonthIndex, clampDueDate } from "@/lib/date-utils";
import { isRecurrenceDue } from "@/lib/recurrence";
import type { Prisma } from "@/lib/generated/prisma/client";

/** Hard cap on how many empty months a single lookup will chain-create, so a mistyped far-future due date can't spam the table. */
const MAX_CHAIN_FILL_MONTHS = 120;

type Tx = Prisma.TransactionClient;
type MonthPeriodRow = { id: string; monthIndex: number; salary: Prisma.Decimal | null };

/** Copies `priorMonth`'s eligible recurring bills forward into `newMonth`, per the plan's cadence-anchoring rule. */
async function copyRecurringBillsForward(
  tx: Tx,
  userId: string,
  priorMonth: MonthPeriodRow,
  newMonth: { id: string; year: number; month: number; monthIndex: number },
) {
  const recurringBills = await tx.bill.findMany({ where: { monthId: priorMonth.id, isRecurring: true } });

  for (const bill of recurringBills) {
    const anchor = bill.recurrenceAnchorMonthIndex ?? priorMonth.monthIndex;
    if (
      !isRecurrenceDue(
        newMonth.monthIndex,
        anchor,
        bill.recurrenceFrequency,
        bill.recurrenceEndMonthIndex,
      )
    )
      continue;

    const dueDate = clampDueDate(newMonth.year, newMonth.month, bill.dueDate.getUTCDate());
    const yourShare = computeYourShare(Number(bill.amount), splitConfigFromFields(bill));

    await tx.bill.create({
      data: {
        userId,
        monthId: newMonth.id,
        categoryId: bill.categoryId,
        name: bill.name,
        expression: bill.expression,
        amount: bill.amount,
        dueDate,
        isPaid: false,
        notes: bill.notes,
        isRecurring: bill.isRecurring,
        recurrenceFrequency: bill.recurrenceFrequency,
        recurrenceAnchorMonthIndex: anchor,
        recurrenceEndMonthIndex: bill.recurrenceEndMonthIndex,
        splitEnabled: bill.splitEnabled,
        splitType: bill.splitType,
        splitCount: bill.splitCount,
        splitPercentage: bill.splitPercentage,
        splitPartnerLabel: bill.splitPartnerLabel,
        yourShare,
        originBillId: bill.id,
        rootBillId: bill.rootBillId ?? bill.id,
      },
    });
  }
}

/**
 * Finds the MonthPeriod for `year`/`month` for this user, creating it (and
 * any missing months in between the last one on record and this one) if
 * needed — each step copies forward eligible recurring bills from the month
 * before it, so a recurring bill keeps appearing in every future month
 * without the user ever having to manually "create" that month first.
 *
 * Not exported as a Server Action (no "use server" in this file) — it takes
 * a trusted, already-resolved `userId`, which must never be client-supplied.
 */
export async function getOrCreateMonthPeriod(userId: string, year: number, month: number) {
  const monthIndex = toMonthIndex(year, month);

  const existing = await db.monthPeriod.findUnique({ where: { userId_year_month: { userId, year, month } } });
  if (existing) return existing;

  let cursor = await db.monthPeriod.findFirst({
    where: { userId, monthIndex: { lt: monthIndex } },
    orderBy: { monthIndex: "desc" },
  });

  const startIndex = cursor ? cursor.monthIndex + 1 : monthIndex;
  if (monthIndex - startIndex > MAX_CHAIN_FILL_MONTHS) {
    throw new Error("That due date is too far in the future — please double-check it.");
  }

  let result: Awaited<ReturnType<typeof db.monthPeriod.create>> | null = null;
  for (let idx = startIndex; idx <= monthIndex; idx++) {
    const { year: stepYear, month: stepMonth } = fromMonthIndex(idx);
    const priorForStep = cursor;

    result = await db.$transaction(async (tx) => {
      const newMonth = await tx.monthPeriod.create({
        data: { userId, year: stepYear, month: stepMonth, monthIndex: idx, salary: priorForStep?.salary ?? null },
      });

      if (priorForStep) {
        await copyRecurringBillsForward(tx, userId, priorForStep, newMonth);
      }

      return newMonth;
    });

    cursor = result;
  }

  return result!;
}
