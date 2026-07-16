import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DataExportCard() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">Export all bills</p>
        <p className="text-xs text-muted-foreground">
          Downloads every bill across every month as a CSV file
        </p>
      </div>
      <Button variant="outline" size="sm" asChild className="gap-1">
        <a href="/api/export/bills" download>
          <Download className="size-4" />
          Export CSV
        </a>
      </Button>
    </div>
  );
}
