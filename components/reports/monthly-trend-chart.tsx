"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  totalBilled: { label: "Billed", color: "var(--chart-1)" },
  totalPaid: { label: "Paid", color: "var(--chart-2)" },
} satisfies ChartConfig;

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function MonthlyTrendChart({
  data,
}: {
  data: { year: number; month: number; totalBilled: number; totalPaid: number }[];
}) {
  const chartData = data.map((entry) => ({
    label: `${MONTH_NAMES[entry.month - 1]} ${entry.year}`,
    totalBilled: entry.totalBilled,
    totalPaid: entry.totalPaid,
  }));

  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <BarChart data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="totalBilled" fill="var(--color-totalBilled)" radius={4} />
        <Bar dataKey="totalPaid" fill="var(--color-totalPaid)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
