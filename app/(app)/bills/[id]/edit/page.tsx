import { notFound } from "next/navigation";
import { format } from "date-fns";
import { BillForm } from "@/components/bill-form/bill-form";
import { getBill } from "@/lib/actions/bills";
import { listCategories } from "@/lib/actions/categories";
import { fromMonthIndex } from "@/lib/date-utils";

export default async function EditBillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [bill, categories] = await Promise.all([getBill(id), listCategories()]);

  if (!bill) notFound();

  const recurrenceEndMonth = bill.recurrenceEndMonthIndex
    ? (() => {
        const { year, month } = fromMonthIndex(bill.recurrenceEndMonthIndex!);
        return `${year}-${String(month).padStart(2, "0")}`;
      })()
    : undefined;

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-xl font-semibold">Edit Bill</h1>
      <BillForm
        billId={bill.id}
        categories={categories}
        defaultValues={{
          name: bill.name,
          categoryId: bill.categoryId,
          amountExpression: bill.expression,
          dueDate: format(bill.dueDate, "yyyy-MM-dd"),
          notes: bill.notes,
          isRecurring: bill.isRecurring,
          recurrenceFrequency: bill.recurrenceFrequency ?? undefined,
          recurrenceEndMonth,
          splitEnabled: bill.splitEnabled,
          splitType: bill.splitType ?? undefined,
          splitCount: bill.splitCount,
          splitPercentage: bill.splitPercentage ? Number(bill.splitPercentage) : undefined,
          splitPartnerLabel: bill.splitPartnerLabel,
        }}
      />
    </div>
  );
}
