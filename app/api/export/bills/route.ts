import { db } from "@/lib/db";
import { getOrCreateCurrentUser } from "@/lib/auth";

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

const HEADER = [
  "Month",
  "Name",
  "Category",
  "Expression",
  "Amount",
  "Your Share",
  "Due Date",
  "Paid",
  "Recurring",
  "Frequency",
];

export async function GET() {
  const user = await getOrCreateCurrentUser();

  const bills = await db.bill.findMany({
    where: { userId: user.id },
    include: { category: true, month: true },
    orderBy: [{ month: { monthIndex: "asc" } }, { dueDate: "asc" }],
  });

  const rows = bills.map((bill) => [
    `${bill.month.year}-${String(bill.month.month).padStart(2, "0")}`,
    bill.name,
    bill.category?.name ?? "Uncategorized",
    bill.expression,
    Number(bill.amount).toFixed(2),
    Number(bill.yourShare).toFixed(2),
    bill.dueDate.toISOString().slice(0, 10),
    bill.isPaid ? "Yes" : "No",
    bill.isRecurring ? "Yes" : "No",
    bill.recurrenceFrequency ?? "",
  ]);

  const csv = [HEADER, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\n");
  const filename = `pesotrack-bills-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
