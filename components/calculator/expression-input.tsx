"use client";

import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/currency";
import { useExpressionEvaluator } from "@/lib/expression/use-expression-evaluator";

interface ExpressionInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onEvaluatedChange?: (value: number | null) => void;
  placeholder?: string;
}

/**
 * Small inline variant of the live expression evaluator, used wherever a
 * single amount needs a spreadsheet-style formula (e.g. the Add Bill form).
 * The full keypad/quick-values UI lives in ExpressionCalculatorCore instead.
 */
export function ExpressionInput({
  id,
  value,
  onChange,
  onEvaluatedChange,
  placeholder,
}: ExpressionInputProps) {
  const result = useExpressionEvaluator(value);

  useEffect(() => {
    onEvaluatedChange?.(result.status === "ok" ? result.value : null);
  }, [result, onEvaluatedChange]);

  return (
    <div className="space-y-1">
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? "e.g. 5100/2"}
        inputMode="decimal"
        className="font-mono"
      />
      <p
        className={cn(
          "text-sm",
          result.status === "ok" && "text-muted-foreground",
          result.status === "incomplete" && "text-muted-foreground/60",
          result.status === "error" && "text-destructive",
        )}
      >
        {result.status === "ok"
          ? `= ${formatCurrency(result.value)}`
          : result.status === "error"
            ? result.message
            : "= ₱—"}
      </p>
    </div>
  );
}
