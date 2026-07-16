"use client";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/currency";
import { useCalculatorStore } from "@/lib/stores/calculator-store";
import { CalculatorKeypad } from "@/components/calculator/calculator-keypad";
import { QuickValueButtons, type QuickValue } from "@/components/calculator/quick-value-buttons";

/**
 * Pure UI: input + live result + keypad + quick-values, no chrome. Wrapped by
 * CalculatorFab (a single floating button + popover, same on desktop and
 * mobile, mounted once in AppShell) so the parsing/keypad logic lives once.
 */
export function ExpressionCalculatorCore({ quickValues = [] }: { quickValues?: QuickValue[] }) {
  const { expression, result, setExpression, appendToken, clear, backspace, commitToHistory } =
    useCalculatorStore();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <input
          value={expression}
          onChange={(event) => setExpression(event.target.value)}
          placeholder="Type an expression…"
          className="w-full border-b bg-transparent pb-2 font-mono text-lg outline-none"
        />
        <p
          className={cn(
            "text-3xl font-semibold",
            result.status === "error" && "text-base text-destructive",
            result.status === "incomplete" && "text-muted-foreground",
          )}
        >
          {result.status === "ok"
            ? `= ${formatCurrency(result.value)}`
            : result.status === "error"
              ? result.message
              : "= ₱—"}
        </p>
      </div>

      <CalculatorKeypad
        onToken={appendToken}
        onClear={clear}
        onBackspace={backspace}
        onEquals={commitToHistory}
      />

      <QuickValueButtons items={quickValues} onInsert={appendToken} />
    </div>
  );
}
