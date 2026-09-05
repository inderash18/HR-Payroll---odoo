import { describe, it, expect } from 'vitest';
import { SafeMathParser } from './safe-math.parser';

describe('SafeMathParser', () => {
  it('should evaluate basic arithmetic', () => {
    expect(SafeMathParser.evaluate('10 + 20')).toBe(30);
    expect(SafeMathParser.evaluate('100 - 45')).toBe(55);
    expect(SafeMathParser.evaluate('12 * 5')).toBe(60);
    expect(SafeMathParser.evaluate('100 / 4')).toBe(25);
    expect(SafeMathParser.evaluate('2 ^ 3')).toBe(8);
  });

  it('should respect operator precedence and parentheses', () => {
    expect(SafeMathParser.evaluate('10 + 20 * 2')).toBe(50);
    expect(SafeMathParser.evaluate('(10 + 20) * 2')).toBe(60);
    expect(SafeMathParser.evaluate('100 - (20 + 30)')).toBe(50);
  });

  it('should substitute variables accurately from context', () => {
    const context = {
      BASIC: 40000,
      SPECIAL: 4000,
    };

    const hra = SafeMathParser.evaluate('BASIC * 0.40', context);
    expect(hra).toBe(16000);

    const gross = SafeMathParser.evaluate('BASIC + HRA + SPECIAL', {
      ...context,
      HRA: hra,
    });
    expect(gross).toBe(60000);

    const pf = SafeMathParser.evaluate('BASIC * 0.12', context);
    expect(pf).toBe(4800);

    const tax = 3000;
    const net = SafeMathParser.evaluate('GROSS - PF - TAX', {
      GROSS: gross,
      PF: pf,
      TAX: tax,
    });
    expect(net).toBe(52200);
  });

  it('should throw error on division by zero', () => {
    expect(() => SafeMathParser.evaluate('100 / 0')).toThrowError('Division by zero');
  });

  it('should throw error on unknown variable identifier', () => {
    expect(() => SafeMathParser.evaluate('UNKNOWN_VAR * 2')).toThrowError(
      "Unknown identifier 'UNKNOWN_VAR'",
    );
  });

  it('should throw error on invalid syntax or mismatched parentheses', () => {
    expect(() => SafeMathParser.evaluate('(10 + 20')).toThrowError('Mismatched parentheses');
    expect(() => SafeMathParser.evaluate('10 ++ 20')).toThrowError();
  });
});
