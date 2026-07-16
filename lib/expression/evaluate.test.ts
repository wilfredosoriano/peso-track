import { describe, expect, it } from "vitest";
import { evaluateExpression } from "./evaluate";

function ok(input: string) {
  const result = evaluateExpression(input);
  if (result.status !== "ok") throw new Error(`Expected ok, got ${JSON.stringify(result)}`);
  return result.value;
}

describe("evaluateExpression", () => {
  it("evaluates basic arithmetic", () => {
    expect(ok("5100/2")).toBe(2550);
    expect(ok("9000-2600-2200-3000")).toBe(1200);
    expect(ok("1500*3")).toBe(4500);
    expect(ok("(2600+2200)/2")).toBe(2400);
  });

  it("respects operator precedence", () => {
    expect(ok("2+3*4")).toBe(14);
    expect(ok("(2+3)*4")).toBe(20);
  });

  it("handles unary minus", () => {
    expect(ok("-5+10")).toBe(5);
    expect(ok("10--5")).toBe(15);
  });

  it("handles decimals and rounds to cents", () => {
    expect(ok("10/3")).toBe(3.33);
    expect(ok("0.1+0.2")).toBe(0.3);
  });

  it("applies % as percent-of-preceding-value in +/- context", () => {
    expect(ok("5100-10%")).toBe(4590);
    expect(ok("5000+10%")).toBe(5500);
  });

  it("applies a bare % as divide-by-100", () => {
    expect(ok("50%")).toBe(0.5);
  });

  it("treats a blank or partially-typed expression as incomplete", () => {
    expect(evaluateExpression("")).toEqual({ status: "incomplete" });
    expect(evaluateExpression("   ")).toEqual({ status: "incomplete" });
    expect(evaluateExpression("5100/")).toEqual({ status: "incomplete" });
    expect(evaluateExpression("(2600+2200")).toEqual({ status: "incomplete" });
  });

  it("reports malformed expressions as errors", () => {
    expect(evaluateExpression("5100//2").status).toBe("error");
    expect(evaluateExpression("2600++2200)").status).toBe("error");
    expect(evaluateExpression("5100 & 2").status).toBe("error");
  });

  it("reports division by zero as an error", () => {
    expect(evaluateExpression("10/0").status).toBe("error");
  });
});
