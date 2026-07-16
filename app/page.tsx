import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Zap, RefreshCw, Users, Bell, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: Zap,
    title: "Smart Computation",
    description: "Type expressions and see results instantly.",
  },
  {
    icon: RefreshCw,
    title: "Auto Copy Recurring",
    description: "Recurring bills are auto-copied every month.",
  },
  {
    icon: Users,
    title: "Split Payments",
    description: "Easily split bills and track your share.",
  },
  {
    icon: Bell,
    title: "Never Miss a Due",
    description: "Get reminders before your bills are due.",
  },
  {
    icon: ShieldCheck,
    title: "Your Data, Secured",
    description: "Your bills are private to your account.",
  },
];

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <Image src="/icons/icon-192.png" alt="" width={28} height={28} className="rounded-md" />
          <span className="text-lg font-semibold">PesoTrack</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Track bills. Split shares. Never open a calculator again.
        </h1>
        <p className="max-w-xl text-muted-foreground">
          PesoTrack replaces your Notes app and phone calculator with one place to track monthly
          bills, split shared expenses, and compute totals with live spreadsheet-style formulas.
        </p>
        <Button size="lg" asChild>
          <Link href="/sign-up">Start tracking for free</Link>
        </Button>
      </main>

      <section className="border-t px-6 py-16">
        <h2 className="mb-8 text-center text-lg font-semibold">Why PesoTrack?</h2>
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center gap-2 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <feature.icon className="size-5 text-primary" />
              </div>
              <p className="text-sm font-medium">{feature.title}</p>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
