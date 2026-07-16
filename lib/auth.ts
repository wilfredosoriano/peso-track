import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { DEFAULT_CATEGORIES } from "@/lib/constants";

/**
 * Resolves the app-level User row for the signed-in Clerk user, creating it
 * (with seeded default categories) on first access. The Clerk webhook is the
 * primary sync path; this is the fallback so the app works even if the
 * webhook hasn't fired yet (e.g. local dev with no public URL).
 */
export async function getOrCreateCurrentUser() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const existing = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (existing) return existing;

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "";
  const name =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || null;

  try {
    return await db.user.create({
      data: {
        clerkUserId: userId,
        email,
        name,
        categories: {
          create: DEFAULT_CATEGORIES.map((category) => ({ ...category, isDefault: true })),
        },
      },
    });
  } catch (error) {
    // Two concurrent first-time requests (e.g. parallel route segments on
    // initial sign-in) can both race past the findUnique above — the loser
    // just re-fetches the row the winner created instead of erroring.
    const isDuplicateUser =
      error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
    if (!isDuplicateUser) throw error;

    return db.user.findUniqueOrThrow({ where: { clerkUserId: userId } });
  }
}
