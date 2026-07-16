import { BillForm } from "@/components/bill-form/bill-form";
import { listCategories } from "@/lib/actions/categories";

export default async function NewBillPage() {
  const categories = await listCategories();

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-xl font-semibold">Add Bill</h1>
      <BillForm categories={categories} />
    </div>
  );
}
