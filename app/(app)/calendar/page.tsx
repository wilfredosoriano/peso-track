import { Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMonth } from "@/lib/actions/months";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { parseMonthSearchParam, clampDueDate } from "@/lib/date-utils";
import { formatCurrency } from "@/lib/utils/currency";

type CalendarEntry =
  | { kind: "payday"; date: Date }
  | { kind: "bill"; date: Date; id: string; name: string; yourShare: number; isPaid: boolean };

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;
  const { year, month } = parseMonthSearchParam(monthParam);
  const [monthPeriod, user] = await Promise.all([getMonth(year, month), getOrCreateCurrentUser()]);

  // Dedupe in case both payday settings happen to land on the same day.
  const paydayDates = Array.from(new Set([user.payCutoffDay1, user.payCutoffDay2])).map((day) =>
    clampDueDate(year, month, day),
  );

  const entries: CalendarEntry[] = [
    ...paydayDates.map((date): CalendarEntry => ({ kind: "payday", date })),
    ...monthPeriod.bills.map(
      (bill): CalendarEntry => ({
        kind: "bill",
        date: bill.dueDate,
        id: bill.id,
        name: bill.name,
        yourShare: Number(bill.yourShare),
        isPaid: bill.isPaid,
      }),
    ),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Calendar</h1>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing scheduled this month.</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) =>
            entry.kind === "payday" ? (
              <Card key={`payday-${index}`} className="border-emerald-500/30 bg-emerald-500/5">
                <CardContent className="flex items-center gap-3 p-4">
                  <Wallet className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {entry.date.toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                    </p>
                    <p className="font-medium text-emerald-700 dark:text-emerald-400">Payday</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card key={entry.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {entry.date.toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                    </p>
                    <p className="font-medium">{entry.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{formatCurrency(entry.yourShare)}</span>
                    <Badge variant={entry.isPaid ? "default" : "outline"}>
                      {entry.isPaid ? "Paid" : "Unpaid"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ),
          )}
        </div>
      )}
    </div>
  );
}
