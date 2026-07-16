import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyTrendChart } from "@/components/reports/monthly-trend-chart";
import { getMonthlyTrend, getDashboardSummary } from "@/lib/actions/dashboard";
import { getMonth } from "@/lib/actions/months";
import { parseMonthSearchParam } from "@/lib/date-utils";
import { formatCurrency } from "@/lib/utils/currency";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;
  const { year, month } = parseMonthSearchParam(monthParam);
  const [trend, monthPeriod] = await Promise.all([getMonthlyTrend(), getMonth(year, month)]);
  const summary = monthPeriod ? await getDashboardSummary(monthPeriod.id) : null;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Reports</h1>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {trend.length === 0 ? (
            <p className="text-sm text-muted-foreground">Not enough history yet.</p>
          ) : (
            <MonthlyTrendChart data={trend} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown — This Month</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {!summary || summary.categoryBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bills yet for this month.</p>
          ) : (
            summary.categoryBreakdown.map((category) => (
              <div key={category.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: category.color ?? "#6b7280" }}
                  />
                  {category.name}
                </div>
                <span className="font-medium">{formatCurrency(category.total)}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
