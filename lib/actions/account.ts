"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

/**
 * Deletes the local User row first (cascades to categories/months/bills),
 * then the actual Clerk account — rather than relying on the `user.deleted`
 * webhook, which may not be configured (e.g. no public URL in local dev).
 */
export async function deleteAccount() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.user.deleteMany({ where: { clerkUserId: userId } });

  const client = await clerkClient();
  await client.users.deleteUser(userId);
}
