import { z } from "zod";

export const RECURRENCE_FREQUENCIES = ["MONTHLY", "EVERY_2_MONTHS", "QUARTERLY", "YEARLY"] as const;
export const SPLIT_TYPES = ["EQUAL", "PERCENTAGE"] as const;

export const billFormSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    categoryId: z.string().min(1).optional().nullable(),
    amountExpression: z.string().min(1, "Amount is required"),
    /** Kept as a plain "YYYY-MM-DD" string end-to-end (native date input's format);
     *  converted to a Date only at the Prisma write in lib/actions/bills.ts. */
    dueDate: z.string().min(1, "Due date is required"),
    notes: z.string().optional().nullable(),
    isRecurring: z.boolean(),
    recurrenceFrequency: z.enum(RECURRENCE_FREQUENCIES).optional().nullable(),
    /** "YYYY-MM" (native month input format) — last month a fixed-term bill
     *  (a loan, an installment) should recur. Leave unset for indefinite
     *  recurrence like a subscription. */
    recurrenceEndMonth: z.string().optional().nullable(),
    splitEnabled: z.boolean(),
    splitType: z.enum(SPLIT_TYPES).optional().nullable(),
    splitCount: z.number().int().optional().nullable(),
    splitPercentage: z.number().optional().nullable(),
    splitPartnerLabel: z.string().optional().nullable(),
  })
  .refine((data) => !data.isRecurring || !!data.recurrenceFrequency, {
    message: "Recurrence frequency is required for a recurring bill",
    path: ["recurrenceFrequency"],
  })
  .refine((data) => !data.splitEnabled || !!data.splitType, {
    message: "Split type is required when splitting is enabled",
    path: ["splitType"],
  })
  .refine(
    (data) => !data.splitEnabled || data.splitType !== "EQUAL" || (data.splitCount ?? 0) >= 2,
    { message: "Equal split requires at least 2 people", path: ["splitCount"] },
  )
  .refine(
    (data) =>
      !data.splitEnabled ||
      data.splitType !== "PERCENTAGE" ||
      ((data.splitPercentage ?? -1) >= 0 && (data.splitPercentage ?? -1) <= 100),
    { message: "Split percentage must be between 0 and 100", path: ["splitPercentage"] },
  );

export type BillFormInput = z.infer<typeof billFormSchema>;
