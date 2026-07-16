import type { NextRequest } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { db } from "@/lib/db";
import { DEFAULT_CATEGORIES } from "@/lib/constants";

export async function POST(request: NextRequest) {
  let event;
  try {
    event = await verifyWebhook(request);
  } catch (error) {
    console.error("Clerk webhook verification failed", error);
    return new Response("Webhook verification failed", { status: 400 });
  }

  switch (event.type) {
    case "user.created":
    case "user.updated": {
      const { id, email_addresses, first_name, last_name } = event.data;
      const email = email_addresses?.[0]?.email_address ?? "";
      const name = [first_name, last_name].filter(Boolean).join(" ") || null;

      await db.user.upsert({
        where: { clerkUserId: id },
        update: { email, name },
        create: {
          clerkUserId: id,
          email,
          name,
          categories: {
            create: DEFAULT_CATEGORIES.map((category) => ({ ...category, isDefault: true })),
          },
        },
      });
      break;
    }
    case "user.deleted": {
      if (event.data.id) {
        await db.user.deleteMany({ where: { clerkUserId: event.data.id } });
      }
      break;
    }
  }

  return new Response("OK", { status: 200 });
}
