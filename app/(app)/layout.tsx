import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Ensures the User row (+ seeded default categories) exists even if the
  // Clerk webhook hasn't fired yet — see lib/auth.ts.
  await getOrCreateCurrentUser();

  return <AppShell>{children}</AppShell>;
}
