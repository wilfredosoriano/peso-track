"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // Avoids a hydration mismatch — next-themes only knows the resolved theme
  // client-side, so we intentionally render a fixed value until mounted, then
  // switch once. This one-time mount flag is next-themes' documented pattern
  // for this exact problem; eslint's set-state-in-effect rule doesn't have a
  // narrower exception for it.
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  return (
    <div className="max-w-sm space-y-2">
      <Label htmlFor="theme-select">Appearance</Label>
      <Select value={mounted ? (theme ?? "system") : "system"} onValueChange={setTheme}>
        <SelectTrigger id="theme-select" className="w-full">
          <SelectValue placeholder="System" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
