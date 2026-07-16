import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PauseToggleButton } from "@/components/recurring/pause-toggle-button";
import { getMonth } from "@/lib/actions/months";
import { parseMonthSearchParam, fromMonthIndex } from "@/lib/date-utils";
import { formatCurrency } from "@/lib/utils/currency";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatEndMonth(monthIndex: number): string {
  const { year, month } = fromMonthIndex(monthIndex);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

const FREQUENCY_LABELS: Record<string, string> = {
  MONTHLY: "Monthly",
  EVERY_2_MONTHS: "Every 2 months",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
};

export default async function RecurringPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;
  const { year, month } = parseMonthSearchParam(monthParam);
  const monthPeriod = await getMonth(year, month);
  const recurringBills = monthPeriod?.bills.filter((bill) => bill.isRecurring) ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Recurring Bills</h1>
      {recurringBills.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recurring bills set up yet.</p>
      ) : (
        <div className="space-y-2">
          {recurringBills.map((bill) => (
            <Card key={bill.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{bill.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {bill.category?.name ?? "Uncategorized"}
                    {bill.recurrenceEndMonthIndex &&
                      ` · Ends ${formatEndMonth(bill.recurrenceEndMonthIndex)}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">{formatCurrency(Number(bill.yourShare))}</span>
                  {bill.isPaused && <Badge variant="secondary">Paused</Badge>}
                  <Badge variant="secondary">
                    {bill.recurrenceFrequency ? FREQUENCY_LABELS[bill.recurrenceFrequency] : "—"}
                  </Badge>
                  <PauseToggleButton billId={bill.id} isPaused={bill.isPaused} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
