import Link from "next/link";
import { CheckCircle2, Clock, Wallet, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SalaryEditor } from "@/components/dashboard/salary-editor";
import { getMonth } from "@/lib/actions/months";
import { getDashboardSummary } from "@/lib/actions/dashboard";
import { parseMonthSearchParam, monthQueryString } from "@/lib/date-utils";
import { formatCurrency } from "@/lib/utils/currency";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;
  const { year, month } = parseMonthSearchParam(monthParam);
  const monthQuery = monthQueryString(year, month);
  const monthPeriod = await getMonth(year, month);
  const summary = await getDashboardSummary(monthPeriod.id);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Bills"
          value={formatCurrency(summary.totalBills)}
          sub={`${summary.activeBillsCount} bills`}
          icon={FileText}
          tone="default"
        />
        <StatCard
          label="Paid"
          value={formatCurrency(summary.paidTotal)}
          sub={`${summary.paymentProgressPct.toFixed(1)}%`}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Remaining"
          value={formatCurrency(summary.remainingTotal)}
          sub={`${(100 - summary.paymentProgressPct).toFixed(1)}%`}
          icon={Clock}
          tone="warning"
        />
        <StatCard
          label="Salary Left"
          value={summary.salaryLeft !== null ? formatCurrency(summary.salaryLeft) : "—"}
          sub="After bills"
          icon={Wallet}
          tone="default"
          action={<SalaryEditor monthId={monthPeriod.id} currentSalary={summary.salary} />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overall Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{summary.paymentProgressPct.toFixed(1)}% Paid</span>
                <span>
                  {formatCurrency(summary.paidTotal)} of {formatCurrency(summary.totalBills)}
                </span>
              </div>
              <Progress value={summary.paymentProgressPct} />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Recurring Bills</p>
                <p className="font-semibold">
                  {formatCurrency(summary.recurringVsOneTime.recurring)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">One-time Bills</p>
                <p className="font-semibold">
                  {formatCurrency(summary.recurringVsOneTime.oneTime)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Due</CardTitle>
            <Button variant="link" size="sm" asChild>
              <Link href={`/bills${monthQuery}`}>View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.upcomingDue.length === 0 && (
              <p className="text-sm text-muted-foreground">Nothing due — you&rsquo;re all caught up.</p>
            )}
            {summary.upcomingDue.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{bill.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(bill.dueDate).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(Number(bill.yourShare))}</p>
                  <Badge variant="outline" className="text-destructive">
                    Unpaid
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Bills</CardTitle>
          <Button size="sm" asChild>
            <Link href={`/bills/new${monthQuery}`}>+ Add Bill</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {monthPeriod.bills.map((bill) => (
            <div
              key={bill.id}
              className="flex items-center justify-between border-b py-2 text-sm last:border-0"
            >
              <div>
                <p className="font-medium">{bill.name}</p>
                <p className="text-xs text-muted-foreground">
                  {bill.category?.name ?? "Uncategorized"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(Number(bill.yourShare))}</p>
                <Badge variant={bill.isPaused ? "secondary" : bill.isPaid ? "default" : "outline"}>
                  {bill.isPaused ? "Paused" : bill.isPaid ? "Paid" : "Unpaid"}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone,
  action,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "default" | "success" | "warning";
  action?: React.ReactNode;
}) {
  const toneClass =
    tone === "success"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "warning"
        ? "text-amber-600 dark:text-amber-400"
        : "text-primary";

  return (
    <Card>
      <CardContent className="flex items-start justify-between p-4">
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
          <p className="mt-1 text-xl font-semibold">{value}</p>
          <p className="text-xs text-muted-foreground">{sub}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Icon className={`size-5 ${toneClass}`} />
          {action}
        </div>
      </CardContent>
    </Card>
  );
}
