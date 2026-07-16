import { describe, expect, it } from "vitest";
import { isRecurrenceDue, classifyBillNotification } from "./recurrence";

describe("isRecurrenceDue", () => {
  it("is due every month for MONTHLY, regardless of offset from the anchor", () => {
    expect(isRecurrenceDue(100, 100, "MONTHLY")).toBe(true);
    expect(isRecurrenceDue(105, 100, "MONTHLY")).toBe(true);
  });

  it("is due every 2 months for EVERY_2_MONTHS, not the months in between", () => {
    expect(isRecurrenceDue(102, 100, "EVERY_2_MONTHS")).toBe(true);
    expect(isRecurrenceDue(101, 100, "EVERY_2_MONTHS")).toBe(false);
  });

  it("is due every 3 months for QUARTERLY, and skips the two months in between", () => {
    expect(isRecurrenceDue(103, 100, "QUARTERLY")).toBe(true);
    expect(isRecurrenceDue(101, 100, "QUARTERLY")).toBe(false);
    expect(isRecurrenceDue(102, 100, "QUARTERLY")).toBe(false);
  });

  it("is due every 12 months for YEARLY", () => {
    expect(isRecurrenceDue(112, 100, "YEARLY")).toBe(true);
    expect(isRecurrenceDue(106, 100, "YEARLY")).toBe(false);
  });

  it("is never due with no frequency (a non-recurring bill)", () => {
    expect(isRecurrenceDue(103, 100, null)).toBe(false);
    expect(isRecurrenceDue(103, 100, undefined)).toBe(false);
  });

  it("handles a target before the anchor consistently (still on-cadence months match)", () => {
    expect(isRecurrenceDue(97, 100, "QUARTERLY")).toBe(true);
    expect(isRecurrenceDue(98, 100, "QUARTERLY")).toBe(false);
  });

  it("stops recurring once the target passes a fixed-term end month (a loan's last payment)", () => {
    expect(isRecurrenceDue(112, 100, "MONTHLY", 112)).toBe(true);
    expect(isRecurrenceDue(113, 100, "MONTHLY", 112)).toBe(false);
  });

  it("recurs indefinitely when no end month is set", () => {
    expect(isRecurrenceDue(500, 100, "MONTHLY", null)).toBe(true);
    expect(isRecurrenceDue(500, 100, "MONTHLY", undefined)).toBe(true);
  });
});

describe("classifyBillNotification", () => {
  const today = new Date(Date.UTC(2026, 6, 16)); // July 16, 2026

  it("never notifies for a paid bill", () => {
    const bill = { dueDate: new Date(Date.UTC(2026, 6, 10)), isPaid: true };
    const prefs = { notifyDueSoon: true, notifyOverdue: true, notifyDaysAhead: 3 };
    expect(classifyBillNotification(bill, prefs, today)).toBeNull();
  });

  it("classifies a past-due unpaid bill as overdue when overdue notifications are on", () => {
    const bill = { dueDate: new Date(Date.UTC(2026, 6, 10)), isPaid: false };
    const prefs = { notifyDueSoon: true, notifyOverdue: true, notifyDaysAhead: 3 };
    expect(classifyBillNotification(bill, prefs, today)).toBe("overdue");
  });

  it("suppresses overdue when the user turned that preference off", () => {
    const bill = { dueDate: new Date(Date.UTC(2026, 6, 10)), isPaid: false };
    const prefs = { notifyDueSoon: true, notifyOverdue: false, notifyDaysAhead: 3 };
    expect(classifyBillNotification(bill, prefs, today)).toBeNull();
  });

  it("classifies a bill within the days-ahead window as due-soon", () => {
    const bill = { dueDate: new Date(Date.UTC(2026, 6, 18)), isPaid: false }; // +2 days
    const prefs = { notifyDueSoon: true, notifyOverdue: true, notifyDaysAhead: 3 };
    expect(classifyBillNotification(bill, prefs, today)).toBe("due-soon");
  });

  it("includes the exact horizon boundary day (inclusive)", () => {
    const bill = { dueDate: new Date(Date.UTC(2026, 6, 19)), isPaid: false }; // +3 days, == horizon
    const prefs = { notifyDueSoon: true, notifyOverdue: true, notifyDaysAhead: 3 };
    expect(classifyBillNotification(bill, prefs, today)).toBe("due-soon");
  });

  it("does not flag a bill further out than the days-ahead window", () => {
    const bill = { dueDate: new Date(Date.UTC(2026, 6, 25)), isPaid: false }; // +9 days
    const prefs = { notifyDueSoon: true, notifyOverdue: true, notifyDaysAhead: 3 };
    expect(classifyBillNotification(bill, prefs, today)).toBeNull();
  });

  it("suppresses due-soon when the user turned that preference off", () => {
    const bill = { dueDate: new Date(Date.UTC(2026, 6, 18)), isPaid: false };
    const prefs = { notifyDueSoon: false, notifyOverdue: true, notifyDaysAhead: 3 };
    expect(classifyBillNotification(bill, prefs, today)).toBeNull();
  });
});
