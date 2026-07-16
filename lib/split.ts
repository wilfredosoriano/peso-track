import { Prisma } from "@/lib/generated/prisma/client";
import { roundToCents } from "@/lib/expression/evaluate";

export type SplitConfig =
  | { splitEnabled: false }
  | { splitEnabled: true; splitType: "EQUAL"; splitCount: number }
  | { splitEnabled: true; splitType: "PERCENTAGE"; splitPercentage: number };

export class SplitValidationError extends Error {}

export function validateSplitConfig(config: SplitConfig): void {
  if (!config.splitEnabled) return;

  if (config.splitType === "EQUAL" && config.splitCount < 2) {
    throw new SplitValidationError("Equal split requires at least 2 people");
  }

  if (
    config.splitType === "PERCENTAGE" &&
    (config.splitPercentage < 0 || config.splitPercentage > 100)
  ) {
    throw new SplitValidationError("Split percentage must be between 0 and 100");
  }
}

/** Rebuilds a {@link SplitConfig} from a Bill row's loosely-typed split columns. */
export function splitConfigFromFields(fields: {
  splitEnabled: boolean;
  splitType?: string | null;
  splitCount?: number | null;
  splitPercentage?: Prisma.Decimal | number | null;
}): SplitConfig {
  if (!fields.splitEnabled) return { splitEnabled: false };

  if (fields.splitType === "EQUAL") {
    return { splitEnabled: true, splitType: "EQUAL", splitCount: fields.splitCount ?? 2 };
  }

  return {
    splitEnabled: true,
    splitType: "PERCENTAGE",
    splitPercentage: Number(fields.splitPercentage ?? 100),
  };
}

/**
 * `yourShare` is always populated (== amount when splitting is disabled) so
 * every dashboard aggregate can be a flat SUM(yourShare) with no branching.
 */
export function computeYourShare(amount: number, config: SplitConfig): Prisma.Decimal {
  validateSplitConfig(config);

  if (!config.splitEnabled) {
    return new Prisma.Decimal(roundToCents(amount));
  }

  if (config.splitType === "EQUAL") {
    return new Prisma.Decimal(roundToCents(amount / config.splitCount));
  }

  return new Prisma.Decimal(roundToCents((amount * config.splitPercentage) / 100));
}
