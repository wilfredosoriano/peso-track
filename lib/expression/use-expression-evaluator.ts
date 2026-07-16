import { useMemo } from "react";
import { evaluateExpression, type EvaluationResult } from "@/lib/expression/evaluate";

export function useExpressionEvaluator(expression: string): EvaluationResult {
  return useMemo(() => evaluateExpression(expression), [expression]);
}
