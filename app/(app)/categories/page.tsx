import { CategoryList } from "@/components/categories/category-list";
import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
import { listCategories } from "@/lib/actions/categories";

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Categories</h1>
        <CategoryFormDialog />
      </div>
      <CategoryList categories={categories} />
    </div>
  );
}
