import "server-only";
import webpush, { WebPushError } from "web-push";
import { db } from "@/lib/db";

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

// Configured lazily (not at module scope) so a missing VAPID setup doesn't
// crash the whole build/app — Next.js evaluates route modules at build time
// to collect page data, which would otherwise throw before env vars exist.
let vapidConfigured = false;

function ensureVapidConfigured(): boolean {
  if (vapidConfigured) return true;

  const { VAPID_SUBJECT, NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = process.env;
  if (!VAPID_SUBJECT || !NEXT_PUBLIC_VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn("Push notifications are not configured (missing VAPID env vars) — skipping.");
    return false;
  }

  webpush.setVapidDetails(VAPID_SUBJECT, NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  vapidConfigured = true;
  return true;
}

/**
 * Sends a push to every device the user has subscribed. A subscription that
 * the push service reports as gone (410/404 — uninstalled, permission
 * revoked, browser data cleared) is deleted so we stop trying it.
 */
export async function sendPushToUser(userId: string, payload: PushPayload) {
  if (!ensureVapidConfigured()) return;

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
