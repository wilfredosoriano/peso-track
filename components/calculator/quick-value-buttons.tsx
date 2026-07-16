"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface QuickValue {
  label: string;
  /** The literal text inserted into the expression, e.g. "9000" or "(2600+2200)". */
  token: string;
}

interface QuickValueButtonsProps {
  items: QuickValue[];
  onInsert: (token: string) => void;
}

export function QuickValueButtons({ items, onInsert }: QuickValueButtonsProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Insert quick value</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Button
            key={item.label}
            variant="secondary"
            size="sm"
            className="gap-1"
            onClick={() => onInsert(item.token)}
          >
            <Plus className="size-3" />
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
