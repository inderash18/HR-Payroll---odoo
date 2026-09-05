/**
 * Safe Mathematical Expression Evaluator using Shunting-Yard (RPN) Algorithm.
 * Strictly avoids `eval()` and `new Function()`.
 */

export class SafeMathParser {
  private static readonly PRECEDENCE: Record<string, number> = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '^': 3,
  };

  /**
   * Evaluates a mathematical expression safely using context variables.
   * Example: `(BASIC * 0.4) + SPECIAL - 500`
   */
  static evaluate(expression: string, context: Record<string, number> = {}): number {
    const tokens = this.tokenize(expression);
    const rpn = this.toRPN(tokens);
    return this.evaluateRPN(rpn, context);
  }

  /**
   * Tokenizes an expression into numbers, operators, identifiers, and parentheses.
   */
  private static tokenize(expression: string): string[] {
    const tokens: string[] = [];
    let current = '';

    for (let i = 0; i < expression.length; i++) {
      const char = expression[i];

      if (/\s/.test(char)) {
        if (current) {
          tokens.push(current);
          current = '';
        }
        continue;
      }

      if ('+-*/^()'.includes(char)) {
        if (current) {
          tokens.push(current);
          current = '';
        }
        tokens.push(char);
      } else if (/[a-zA-Z0-9_.]/.test(char)) {
        current += char;
      } else {
        throw new Error(`Invalid character in expression: '${char}'`);
      }
    }

    if (current) {
      tokens.push(current);
    }

    return tokens;
  }

  /**
   * Converts infix tokens to Reverse Polish Notation (RPN) using Dijkstra's Shunting-Yard algorithm.
   */
  private static toRPN(tokens: string[]): string[] {
    const output: string[] = [];
    const operatorStack: string[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // Number or Identifier
      if (!'+-*/^()'.includes(token)) {
        output.push(token);
      } else if (token === '(') {
        operatorStack.push(token);
      } else if (token === ')') {
        while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
          output.push(operatorStack.pop()!);
        }
        if (operatorStack.length === 0) {
          throw new Error('Mismatched parentheses in formula');
        }
        operatorStack.pop(); // Pop '('
      } else {
        // Operator
        // Handle unary minus: if at start or immediately after '(' or another operator
        if (token === '-' && (i === 0 || '+-*/^('.includes(tokens[i - 1]))) {
          // Unary minus treated as "0 [next-token] -"
          output.push('0');
        }

        while (
          operatorStack.length > 0 &&
          operatorStack[operatorStack.length - 1] !== '(' &&
          (this.PRECEDENCE[operatorStack[operatorStack.length - 1]] || 0) >= (this.PRECEDENCE[token] || 0)
        ) {
          output.push(operatorStack.pop()!);
        }
        operatorStack.push(token);
      }
    }

    while (operatorStack.length > 0) {
      const op = operatorStack.pop()!;
      if (op === '(' || op === ')') {
        throw new Error('Mismatched parentheses in formula');
      }
      output.push(op);
    }

    return output;
  }

  /**
   * Evaluates RPN tokens with variable substitution from context.
   */
  private static evaluateRPN(rpn: string[], context: Record<string, number>): number {
    const stack: number[] = [];

    for (const token of rpn) {
      if (!'+-*/^'.includes(token)) {
        // Numerical literal
        const num = Number(token);
        if (!isNaN(num)) {
          stack.push(num);
        } else {
          // Variable lookup from context
          const upperKey = token.toUpperCase();
          if (Object.prototype.hasOwnProperty.call(context, upperKey)) {
            stack.push(Number(context[upperKey]) || 0);
          } else if (Object.prototype.hasOwnProperty.call(context, token)) {
            stack.push(Number(context[token]) || 0);
          } else {
            throw new Error(`Unknown identifier '${token}' in payroll formula`);
          }
        }
      } else {
        // Operator
        if (stack.length < 2) {
          throw new Error(`Invalid formula structure near operator '${token}'`);
        }
        const b = stack.pop()!;
        const a = stack.pop()!;

        switch (token) {
          case '+':
            stack.push(a + b);
            break;
          case '-':
            stack.push(a - b);
            break;
          case '*':
            stack.push(a * b);
            break;
          case '/':
            if (b === 0) {
              throw new Error('Division by zero in payroll calculation');
            }
            stack.push(a / b);
            break;
          case '^':
            stack.push(Math.pow(a, b));
            break;
        }
      }
    }

    if (stack.length !== 1) {
      throw new Error('Formula resulted in an invalid evaluation state');
    }

    const result = stack[0];
    return Number(result.toFixed(2));
  }
}
