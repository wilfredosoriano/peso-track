"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getOrCreateCurrentUser } from "@/lib/auth";

interface UpdateUserSettingsInput {
  payCutoffDay1?: number;
  payCutoffDay2?: number;
  notifyDueSoon?: boolean;
  notifyOverdue?: boolean;
  notifyDaysAhead?: number;
}

export async function updateUserSettings(input: UpdateUserSettingsInput) {
  const user = await getOrCreateCurrentUser();
  const updated = await db.user.update({ where: { id: user.id }, data: input });
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return updated;
}
