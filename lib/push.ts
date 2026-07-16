import "server-only";
import webpush, { WebPushError } from "web-push";
import { db } from "@/lib/db";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/**
 * Sends a push to every device the user has subscribed. A subscription that
 * the push service reports as gone (410/404 — uninstalled, permission
 * revoked, browser data cleared) is deleted so we stop trying it.
 */
export async function sendPushToUser(userId: string, payload: PushPayload) {
  const subscriptions = await db.pushSubscription.findMany({ where: { userId } });

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          JSON.stringify(payload),
        );
      } catch (error) {
        const isGone =
          error instanceof WebPushError && (error.statusCode === 404 || error.statusCode === 410);
        if (isGone) {
          await db.pushSubscription.delete({ where: { id: subscription.id } }).catch(() => {});
        } else {
          console.error("Push send failed", subscription.endpoint, error);
        }
      }
    }),
  );
}
