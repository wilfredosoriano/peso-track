import { Skeleton } from "@/components/ui/skeleton";

export default function BillsLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="hidden h-8 w-28 md:block" />
      </div>
      <div className="flex justify-between gap-2">
        <Skeleton className="h-9 w-full max-w-xs" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-40" />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}
