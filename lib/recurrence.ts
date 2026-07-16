import { FREQUENCY_INTERVAL_MONTHS } from "@/lib/date-utils";

/**
 * Is `targetMonthIndex` an eligible occurrence for a bill recurring at
 * `frequency`, anchored to `anchorMonthIndex` (the month its very first
 * occurrence landed in — never shifts across copies)? Pure so it's testable
 * without touching the database.
 *
 * `endMonthIndex`, if set, is the last month this bill should recur — for
 * loans/installments with a fixed term (e.g. a 24-month motorcycle loan),
 * unlike a subscription that recurs indefinitely.
 */
export function isRecurrenceDue(
  targetMonthIndex: number,
  anchorMonthIndex: number,
  frequency: string | null | undefined,
  endMonthIndex?: number | null,
): boolean {
  const interval = frequency ? FREQUENCY_INTERVAL_MONTHS[frequency] : null;
  if (!interval) return false;
  if (endMonthIndex != null && targetMonthIndex > endMonthIndex) return false;
  return (targetMonthIndex - anchorMonthIndex) % interval === 0;
}

export type NotificationStatus = "overdue" | "due-soon" | null;

export interface NotifiableBill {
  dueDate: Date;
  isPaid: boolean;
}

export interface NotificationPrefs {
  notifyDueSoon: boolean;
  notifyOverdue: boolean;
  notifyDaysAhead: number;
}

/**
 * Classifies a bill against a user's notification preferences as of `today`
 * (a UTC midnight Date) — shared by the in-app bell (lib/actions/notifications.ts)
 * and the push cron (app/api/cron/check-notifications) so the two can't drift
 * apart, and so this logic is testable independent of the database.
 */
export function classifyBillNotification(
  bill: NotifiableBill,
  prefs: NotificationPrefs,
  today: Date,
): NotificationStatus {
  if (bill.isPaid) return null;

  const isOverdue = bill.dueDate.getTime() < today.getTime();
  if (isOverdue) {
    return prefs.notifyOverdue ? "overdue" : null;
  }

  if (!prefs.notifyDueSoon) return null;

  const horizon = new Date(today);
  horizon.setUTCDate(horizon.getUTCDate() + prefs.notifyDaysAhead);
  return bill.dueDate.getTime() <= horizon.getTime() ? "due-soon" : null;
}
