"use client";

import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ExpressionCalculatorCore } from "@/components/calculator/expression-calculator-core";

/**
 * A single floating calculator available on every page, on both desktop and
 * mobile — replaces the old docked dashboard panel and standalone /calculator
 * page, which were redundant with each other and (on mobile) not even
 * reachable from the bottom tab bar.
 */
export function CalculatorFab() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          aria-label="Open calculator"
          className="fixed right-4 bottom-20 z-40 size-12 rounded-full shadow-lg md:right-6 md:bottom-6"
        >
          <Calculator className="size-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" side="top" className="w-80 sm:w-96">
        <ExpressionCalculatorCore />
      </PopoverContent>
    </Popover>
  );
}
