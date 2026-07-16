"use server";

import { db } from "@/lib/db";
import { getOrCreateCurrentUser } from "@/lib/auth";

interface PushSubscriptionInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export async function savePushSubscription(subscription: PushSubscriptionInput) {
  const user = await getOrCreateCurrentUser();

  await db.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: { userId: user.id, p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
    create: {
      userId: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });

  return { ok: true };
}

export async function removePushSubscription(endpoint: string) {
  const user = await getOrCreateCurrentUser();
  await db.pushSubscription.deleteMany({ where: { endpoint, userId: user.id } });
  return { ok: true };
}
