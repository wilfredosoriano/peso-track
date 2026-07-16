import { Badge } from "@/components/ui/badge";

export function BillStatusPill({ isPaid, isPaused }: { isPaid: boolean; isPaused?: boolean }) {
  if (isPaused) {
    return <Badge variant="secondary">Paused</Badge>;
  }
  return (
    <Badge variant={isPaid ? "default" : "outline"} className={isPaid ? undefined : "text-destructive"}>
      {isPaid ? "Paid" : "Unpaid"}
    </Badge>
  );
}
