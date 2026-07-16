"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { billFormSchema, type BillFormInput } from "@/lib/schemas/bill-schema";
import { createBill, updateBill } from "@/lib/actions/bills";
import { formatCurrency } from "@/lib/utils/currency";
import { yearMonthFromDueDate, monthQueryString } from "@/lib/date-utils";

export interface BillFormCategory {
  id: string;
  name: string;
}

interface BillFormProps {
  categories: BillFormCategory[];
  billId?: string;
  defaultValues?: Partial<BillFormInput>;
}

const RECURRENCE_LABELS: Record<string, string> = {
  MONTHLY: "Monthly",
  EVERY_2_MONTHS: "Every 2 months",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
};

export function BillForm({ categories, billId, defaultValues }: BillFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [evaluatedAmount, setEvaluatedAmount] = useState<number | null>(() =>
    defaultValues?.amountExpression ? Number(defaultValues.amountExpression) : null,
  );

  const form = useForm<BillFormInput>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      name: "",
      amountExpression: "",
      dueDate: new Date().toISOString().slice(0, 10),
      isRecurring: false,
      splitEnabled: false,
      ...defaultValues,
    },
  });

  const isRecurring = form.watch("isRecurring");
  const splitEnabled = form.watch("splitEnabled");
  const splitType = form.watch("splitType");

  function onSubmit(values: BillFormInput) {
    startTransition(async () => {
      try {
        if (billId) {
          await updateBill(billId, values);
        } else {
          await createBill(values);
        }
        toast.success(billId ? "Bill updated" : "Bill added");
        // Land on whichever month the bill actually landed in (its due
        // date), not wherever the user started — so they immediately see it.
        const { year, month } = yearMonthFromDueDate(values.dueDate);
        router.push(`/bills${monthQueryString(year, month)}`);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bill Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Motorcycle Installment" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amountExpression"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (Your Share)</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 2550"
                  value={field.value}
                  onChange={(event) => {
                    field.onChange(event.target.value);
                    setEvaluatedAmount(event.target.value ? Number(event.target.value) : null);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <Input type="date" value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 rounded-lg border p-4">
          <FormField
            control={form.control}
            name="isRecurring"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between">
                <div>
                  <FormLabel>Recurring</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    This bill will automatically appear every future month
                  </p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {isRecurring && (
            <FormField
              control={form.control}
              name="recurrenceFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(RECURRENCE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {isRecurring && (
            <FormField
              control={form.control}
              name="recurrenceEndMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Payment (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="month"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    For a fixed-term bill like a loan — it won&rsquo;t recur after this month.
                    Leave blank for an ongoing subscription.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="space-y-4 rounded-lg border p-4">
          <FormField
            control={form.control}
            name="splitEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between">
                <FormLabel>Split with someone</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {splitEnabled && (
            <>
              <FormField
                control={form.control}
                name="splitType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Split Type</FormLabel>
                    <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select split type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EQUAL">Equal split</SelectItem>
                        <SelectItem value="PERCENTAGE">Percentage split</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {splitType === "EQUAL" && (
                <FormField
                  control={form.control}
                  name="splitCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of people (including you)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={2}
                          value={field.value ?? ""}
                          onChange={(event) => field.onChange(Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {splitType === "PERCENTAGE" && (
                <FormField
                  control={form.control}
                  name="splitPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your percentage share</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={field.value ?? ""}
                          onChange={(event) => field.onChange(Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="splitPartnerLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Split with (optional label)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Partner" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {evaluatedAmount !== null && (
                <p className="text-sm text-muted-foreground">
                  Total amount: {formatCurrency(evaluatedAmount)}
                </p>
              )}
            </>
          )}
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Add a note…" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Saving…" : billId ? "Save Changes" : "Add Bill"}
        </Button>
      </form>
    </Form>
  );
}
