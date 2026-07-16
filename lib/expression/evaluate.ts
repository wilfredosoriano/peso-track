/**
 * Hand-rolled recursive-descent evaluator for the amount-field expression
 * language: numbers, + - * / (), and a trailing "percent of the preceding
 * operand" `%` (e.g. `5100 - 10%` -> `5100 - 510`; a bare `50%` -> `0.5`).
 *
 * Deliberately not `eval()`/`new Function()` — the grammar is small and
 * frozen, and this is safe to run identically on the client (live preview)
 * and the server (authoritative recompute before every write).
 */

export type EvaluationResult =
  | { status: "ok"; value: number }
  | { status: "incomplete" }
  | { status: "error"; message: string };

const ALLOWED_CHARS = /^[0-9.+\-*/%()\s]*$/;

type TokenType = "number" | "+" | "-" | "*" | "/" | "%" | "(" | ")";
interface Token {
  type: TokenType;
  value?: number;
}

class ParseIncomplete extends Error {}
class ParseError extends Error {}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const char = input[i];

    if (/\s/.test(char)) {
      i++;
      continue;
    }

    if ("+-*/%()".includes(char)) {
      tokens.push({ type: char as TokenType });
      i++;
      continue;
    }

    if (/[0-9.]/.test(char)) {
      const start = i;
      while (i < input.length && /[0-9.]/.test(input[i])) i++;
      const raw = input.slice(start, i);
      if ((raw.match(/\./g) ?? []).length > 1) {
        throw new ParseError(`Malformed number "${raw}"`);
      }
      tokens.push({ type: "number", value: Number(raw) });
      continue;
    }

    throw new ParseError(`Unexpected character "${char}"`);
  }

  return tokens;
}

/**
 * Grammar (lowest to highest precedence):
 *   expr    := term ("%")? ((("+" | "-") term ("%")?))*
 *   term    := unary (("*" | "/") unary)*
 *   unary   := ("-")? primary
 *   primary := number | "(" expr ")"
 *
 * A trailing `%` on the first term, or on a term following `+`/`-`, is
 * resolved against the running total to its left (calculator convention),
 * not plain division by 100 in isolation.
 */
class Parser {
  private pos = 0;
  constructor(private tokens: Token[]) {}

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private consume(): Token {
    const token = this.tokens[this.pos];
    if (!token) throw new ParseIncomplete("Unexpected end of expression");
    this.pos++;
    return token;
  }

  parseExpression(): number {
    let value = this.parseTerm();
    if (this.peek()?.type === "%") {
      this.consume();
      value = value / 100;
    }

    while (this.peek()?.type === "+" || this.peek()?.type === "-") {
      const op = this.consume().type;
      let rhs = this.parseTerm();
      if (this.peek()?.type === "%") {
        this.consume();
        rhs = (value * rhs) / 100;
      }
      value = op === "+" ? value + rhs : value - rhs;
    }

    return value;
  }

  private parseTerm(): number {
    let value = this.parseUnary();
    while (this.peek()?.type === "*" || this.peek()?.type === "/") {
      const op = this.consume().type;
      const rhs = this.parseUnary();
      if (op === "/" && rhs === 0) {
        throw new ParseError("Division by zero");
      }
      value = op === "*" ? value * rhs : value / rhs;
    }
    return value;
  }

  private parseUnary(): number {
    if (this.peek()?.type === "-") {
      this.consume();
      return -this.parseUnary();
    }
    return this.parsePrimary();
  }

  private parsePrimary(): number {
    const token = this.consume();

    if (token.type === "number") {
      return token.value!;
    }

    if (token.type === "(") {
      const value = this.parseExpression();
      const closing = this.tokens[this.pos];
      if (!closing) throw new ParseIncomplete("Missing closing parenthesis");
      if (closing.type !== ")") throw new ParseError(`Expected ")", got "${closing.type}"`);
      this.consume();
      return value;
    }

    throw new ParseError(`Unexpected token "${token.type}"`);
  }

  assertConsumed() {
    if (this.pos < this.tokens.length) {
      throw new ParseError(`Unexpected trailing token "${this.tokens[this.pos].type}"`);
    }
  }
}

export function evaluateExpression(rawInput: string): EvaluationResult {
  const input = rawInput.trim();

  if (input.length === 0) {
    return { status: "incomplete" };
  }

  if (!ALLOWED_CHARS.test(input)) {
    return { status: "error", message: "Only numbers and + - * / % ( ) are allowed" };
  }

  try {
    const tokens = tokenize(input);
    const parser = new Parser(tokens);
    const value = parser.parseExpression();
    parser.assertConsumed();

    if (!Number.isFinite(value)) {
      return { status: "error", message: "Result is not a finite number" };
    }
    return { status: "ok", value: roundToCents(value) };
  } catch (error) {
    if (error instanceof ParseIncomplete) {
      return { status: "incomplete" };
    }
    if (error instanceof ParseError) {
      return { status: "error", message: error.message };
    }
    return { status: "error", message: "Invalid expression" };
  }
}

export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}
