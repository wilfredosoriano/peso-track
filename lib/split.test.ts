import { describe, expect, it } from "vitest";
import {
  computeYourShare,
  validateSplitConfig,
  splitConfigFromFields,
  SplitValidationError,
} from "./split";

describe("computeYourShare", () => {
  it("returns the full amount when splitting is disabled", () => {
    expect(computeYourShare(5100, { splitEnabled: false }).toString()).toBe("5100");
  });

  it("divides evenly for an equal split, matching the mockup's Motorcycle example", () => {
    const share = computeYourShare(5100, { splitEnabled: true, splitType: "EQUAL", splitCount: 2 });
    expect(share.toString()).toBe("2550");
  });

  it("computes your percentage share", () => {
    const share = computeYourShare(5000, {
      splitEnabled: true,
      splitType: "PERCENTAGE",
      splitPercentage: 60,
    });
    expect(share.toString()).toBe("3000");
  });

  it("rounds to cents rather than leaving binary-float artifacts", () => {
    const share = computeYourShare(10, { splitEnabled: true, splitType: "EQUAL", splitCount: 3 });
    expect(share.toString()).toBe("3.33");
  });
});

describe("validateSplitConfig", () => {
  it("rejects an equal split with fewer than 2 people", () => {
    expect(() =>
      validateSplitConfig({ splitEnabled: true, splitType: "EQUAL", splitCount: 1 }),
    ).toThrow(SplitValidationError);
  });

  it("rejects a percentage outside 0-100", () => {
    expect(() =>
      validateSplitConfig({ splitEnabled: true, splitType: "PERCENTAGE", splitPercentage: 150 }),
    ).toThrow(SplitValidationError);
    expect(() =>
      validateSplitConfig({ splitEnabled: true, splitType: "PERCENTAGE", splitPercentage: -1 }),
    ).toThrow(SplitValidationError);
  });

  it("accepts valid configs without throwing", () => {
    expect(() =>
      validateSplitConfig({ splitEnabled: true, splitType: "EQUAL", splitCount: 2 }),
    ).not.toThrow();
    expect(() =>
      validateSplitConfig({ splitEnabled: true, splitType: "PERCENTAGE", splitPercentage: 0 }),
    ).not.toThrow();
    expect(() => validateSplitConfig({ splitEnabled: false })).not.toThrow();
  });
});

describe("splitConfigFromFields", () => {
  it("reconstructs a disabled config", () => {
    expect(splitConfigFromFields({ splitEnabled: false })).toEqual({ splitEnabled: false });
  });

  it("reconstructs an equal split, defaulting splitCount to 2 if missing", () => {
    expect(splitConfigFromFields({ splitEnabled: true, splitType: "EQUAL", splitCount: 4 })).toEqual({
      splitEnabled: true,
      splitType: "EQUAL",
      splitCount: 4,
    });
    expect(splitConfigFromFields({ splitEnabled: true, splitType: "EQUAL" })).toEqual({
      splitEnabled: true,
      splitType: "EQUAL",
      splitCount: 2,
    });
  });

  it("reconstructs a percentage split from a Decimal-like value", () => {
    expect(
      splitConfigFromFields({ splitEnabled: true, splitType: "PERCENTAGE", splitPercentage: 60 }),
    ).toEqual({ splitEnabled: true, splitType: "PERCENTAGE", splitPercentage: 60 });
  });
});
