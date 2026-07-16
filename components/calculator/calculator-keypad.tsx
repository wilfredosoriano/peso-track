"use client";

import { Delete } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalculatorKeypadProps {
  onToken: (token: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onEquals: () => void;
}

const DIGIT_ROWS = [
  ["7", "8", "9", "/"],
  ["4", "5", "6", "*"],
  ["1", "2", "3", "-"],
];

const OPERATOR_LABELS: Record<string, string> = { "/": "÷", "*": "×" };

export function CalculatorKeypad({ onToken, onClear, onBackspace, onEquals }: CalculatorKeypadProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      <Button variant="outline" onClick={onClear}>
        C
      </Button>
      <Button variant="outline" onClick={() => onToken("(")}>
        (
      </Button>
      <Button variant="outline" onClick={() => onToken(")")}>
        )
      </Button>
      <Button variant="outline" onClick={() => onToken("%")}>
        %
      </Button>

      {DIGIT_ROWS.flat().map((key) => (
        <Button key={key} variant="outline" onClick={() => onToken(key)}>
          {OPERATOR_LABELS[key] ?? key}
        </Button>
      ))}

      <Button variant="outline" onClick={() => onToken("0")}>
        0
      </Button>
      <Button variant="outline" onClick={() => onToken(".")}>
        .
      </Button>
      <Button variant="outline" onClick={onBackspace} aria-label="Backspace">
        <Delete className="size-4" />
      </Button>
      <Button variant="outline" onClick={() => onToken("+")}>
        +
      </Button>

      <Button className="col-span-4" onClick={onEquals}>
        =
      </Button>
    </div>
  );
}
