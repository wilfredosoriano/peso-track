import { create } from "zustand";
import { evaluateExpression, type EvaluationResult } from "@/lib/expression/evaluate";

export interface CalculationHistoryEntry {
  expression: string;
  value: number;
}

interface CalculatorState {
  expression: string;
  result: EvaluationResult;
  history: CalculationHistoryEntry[];
  setExpression: (expression: string) => void;
  appendToken: (token: string) => void;
  clear: () => void;
  backspace: () => void;
  commitToHistory: () => void;
}

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  expression: "",
  result: { status: "incomplete" },
  history: [],

  setExpression: (expression) => set({ expression, result: evaluateExpression(expression) }),

  appendToken: (token) => {
    const expression = get().expression + token;
    set({ expression, result: evaluateExpression(expression) });
  },

  clear: () => set({ expression: "", result: { status: "incomplete" } }),

  backspace: () => {
    const expression = get().expression.slice(0, -1);
    set({ expression, result: evaluateExpression(expression) });
  },

  commitToHistory: () => {
    const { expression, result } = get();
    if (result.status !== "ok") return;
    set((state) => ({
      history: [{ expression, value: result.value }, ...state.history].slice(0, 20),
    }));
  },
}));
