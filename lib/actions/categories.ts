"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getOrCreateCurrentUser } from "@/lib/auth";

export async function listCategories() {
  const user = await getOrCreateCurrentUser();
  return db.category.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } });
}

export async function createCategory(input: { name: string; icon?: string; color?: string }) {
  const user = await getOrCreateCurrentUser();
  const category = await db.category.create({
    data: { userId: user.id, name: input.name, icon: input.icon, color: input.color },
  });
  revalidatePath("/categories");
  return category;
}

export async function updateCategory(
  categoryId: string,
  input: { name?: string; icon?: string; color?: string },
) {
  const user = await getOrCreateCurrentUser();
  const category = await db.category.update({
    where: { id: categoryId, userId: user.id },
    data: input,
  });
  revalidatePath("/categories");
  return category;
}

/** Bills referencing a deleted category fall back to "Uncategorized" (onDelete: SetNull). */
export async function deleteCategory(categoryId: string) {
  const user = await getOrCreateCurrentUser();
  await db.category.delete({ where: { id: categoryId, userId: user.id } });
  revalidatePath("/categories");
  revalidatePath("/bills");
  return { id: categoryId };
}
