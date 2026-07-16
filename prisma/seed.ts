import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { DEFAULT_CATEGORIES } from "../lib/constants";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

/**
 * Idempotent backfill: seeds any missing default categories for every
 * existing user. New users get theirs automatically at signup (see
 * lib/auth.ts / app/api/webhooks/clerk) — this script only matters if
 * DEFAULT_CATEGORIES changes after users already exist.
 */
async function main() {
  const users = await db.user.findMany({ include: { categories: true } });

  for (const user of users) {
    const existingNames = new Set(user.categories.map((category) => category.name));
    const missing = DEFAULT_CATEGORIES.filter((category) => !existingNames.has(category.name));
    if (missing.length === 0) continue;

    await db.category.createMany({
      data: missing.map((category) => ({ ...category, userId: user.id, isDefault: true })),
    });
    console.log(`Seeded ${missing.length} default categories for ${user.email}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
