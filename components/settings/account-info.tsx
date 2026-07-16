"use client";

import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function AccountInfo({ email }: { email: string }) {
  const router = useRouter();
  const { signOut } = useClerk();

  function handleSignOut() {
    signOut(() => router.push("/"));
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">Signed in as</p>
        <p className="font-medium">{email}</p>
      </div>
      <Button variant="outline" size="sm" onClick={handleSignOut}>
        Sign out
      </Button>
    </div>
  );
}
