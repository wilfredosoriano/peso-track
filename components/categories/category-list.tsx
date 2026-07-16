"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteCategory } from "@/lib/actions/categories";
import { getCategoryIcon } from "@/lib/category-icons";
import { useUndoableDelete } from "@/lib/hooks/use-undoable-delete";

interface CategoryListItem {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  isDefault: boolean;
}

export function CategoryList({ categories }: { categories: CategoryListItem[] }) {
  const router = useRouter();
  const { schedule, cancel, isPending } = useUndoableDelete();

  function handleDelete(category: CategoryListItem) {
    schedule(category.id, async () => {
      try {
        await deleteCategory(category.id);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete category");
      }
    });
    toast(`"${category.name}" deleted`, {
      duration: 5000,
      action: { label: "Undo", onClick: () => cancel(category.id) },
    });
  }

  const visibleCategories = categories.filter((category) => !isPending(category.id));

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {visibleCategories.map((category) => {
        const Icon = getCategoryIcon(category.icon);
        return (
          <Card key={category.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${category.color ?? "#6b7280"}20` }}
                >
                  <Icon className="size-3.5" style={{ color: category.color ?? "#6b7280" }} />
                </span>
                <span className="font-medium">{category.name}</span>
              </div>
              {!category.isDefault && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(category)}
                  aria-label={`Delete ${category.name}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
