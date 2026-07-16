"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { savePushSubscription, removePushSubscription } from "@/lib/actions/push-subscriptions";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

type Status = "checking" | "unsupported" | "subscribed" | "unsubscribed";

export function PushNotificationToggle() {
  const [status, setStatus] = useState<Status>("checking");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supported =
      typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
    if (!supported) {
      // One-time browser feature detection — window/navigator only exist
      // client-side, so this can't be computed outside an effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("unsupported");
      return;
    }

    let cancelled = false;
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        if (!cancelled) setStatus(subscription ? "subscribed" : "unsubscribed");
      })
      .catch(() => {
        if (!cancelled) setStatus("unsubscribed");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleEnable() {
    startTransition(async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;

        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          toast.error("Notification permission was not granted");
          return;
        }

        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!publicKey) throw new Error("Push is not configured on this deployment");

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
        });

        const json = subscription.toJSON();
        if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
          throw new Error("Subscription is missing required fields");
        }

        await savePushSubscription({
          endpoint: json.endpoint,
          keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        });
        setStatus("subscribed");
        toast.success("Push notifications enabled on this device");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to enable push notifications",
        );
      }
    });
  }

  function handleDisable() {
    startTransition(async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await removePushSubscription(subscription.endpoint);
          await subscription.unsubscribe();
        }
        setStatus("unsubscribed");
        toast.success("Push notifications disabled on this device");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to disable push notifications",
        );
      }
    });
  }

  if (status === "unsupported") {
    return (
      <p className="text-sm text-muted-foreground">
        Push notifications aren&rsquo;t supported in this browser. On iOS, Safari only supports
        this after adding PesoTrack to your Home Screen.
      </p>
    );
  }

  const subscribed = status === "subscribed";

  return (
    <div className="flex items-center justify-between">
      <div>
        <Label>Push notifications on this device</Label>
        <p className="text-xs text-muted-foreground">
          Get an alert even when PesoTrack isn&rsquo;t open
        </p>
      </div>
      <Button
        size="sm"
        variant={subscribed ? "outline" : "default"}
        onClick={subscribed ? handleDisable : handleEnable}
        disabled={isPending || status === "checking"}
      >
        {isPending ? "Working…" : subscribed ? "Disable" : "Enable"}
      </Button>
    </div>
  );
}
