import { Injectable, Logger } from '@nestjs/common';
import { RuleCategoryType } from '@prisma/client';

export interface RuleCalculationInput {
  rule: {
    id: string;
    code: string;
    name: string;
    category: RuleCategoryType;
    sequence: number;
    amountType: string;
    amountFixed?: number | null;
    amountPercentage?: number | null;
    percentageBasedOn?: string | null;
    codeFormula?: string | null;
  };
  contractWage: number;
  workedDays: number;
  totalWorkingDays: number;
  unpaidLeaveDays: number;
  computedCategoryTotals: Record<string, number>;
  computedRulesMap: Record<string, number>;
}

export interface CalculatedLine {
  category: RuleCategoryType;
  code: string;
  name: string;
  amount: number;
  baseAmount?: number;
  rate?: number;
}

export interface CalculationResult {
  lines: CalculatedLine[];
  grossSalary: number;
  netSalary: number;
}

@Injectable()
export class PayrollEngineService {
  private readonly logger = new Logger(PayrollEngineService.name);

  /**
   * Computes individual payslip lines deterministically given a contract, worked days, and salary structure rules.
   */
  calculatePayslip(
    contractWage: number,
    rules: RuleCalculationInput['rule'][],
    workedDays: number = 30,
    totalWorkingDays: number = 30,
    unpaidLeaveDays: number = 0,
  ): CalculationResult {
    // Sort rules by sequence ASC
    const sortedRules = [...rules].sort((a, b) => a.sequence - b.sequence);

    const computedRulesMap: Record<string, number> = {};
    const lines: CalculatedLine[] = [];

    let basicAmount = contractWage;
    // Prorate basic wage if unpaid leaves exist
    if (unpaidLeaveDays > 0 && totalWorkingDays > 0) {
      const prorationFactor = Math.max(0, (totalWorkingDays - unpaidLeaveDays) / totalWorkingDays);
      basicAmount = Number((contractWage * prorationFactor).toFixed(2));
    }

    let currentGross = 0;
    let currentDeductions = 0;
    let currentTaxes = 0;

    for (const rule of sortedRules) {
      let amount = 0;
      let baseAmount: number | undefined = undefined;
      let rate: number | undefined = undefined;

      if (rule.category === RuleCategoryType.EARNING && rule.code === 'BASIC') {
        amount = basicAmount;
        baseAmount = contractWage;
      } else if (rule.amountType === 'FIXED') {
        amount = rule.amountFixed ? Number(rule.amountFixed) : 0;
      } else if (rule.amountType === 'PERCENTAGE') {
        rate = rule.amountPercentage ? Number(rule.amountPercentage) : 0;
        if (rule.percentageBasedOn === 'GROSS') {
          baseAmount = currentGross;
        } else {
          baseAmount = basicAmount; // Default base is BASIC
        }
        amount = Number(((baseAmount * rate) / 100).toFixed(2));
      } else if (rule.amountType === 'CODE_FORMULA' && rule.codeFormula) {
        // Safe evaluation of basic formula (e.g. BASIC * 0.1)
        amount = this.evaluateSimpleFormula(rule.codeFormula, basicAmount, currentGross);
      }

      amount = Number(amount.toFixed(2));
      computedRulesMap[rule.code] = amount;

      lines.push({
        category: rule.category,
        code: rule.code,
        name: rule.name,
        amount,
        baseAmount,
        rate,
      });

      if (rule.category === RuleCategoryType.EARNING || rule.category === RuleCategoryType.ALLOWANCE) {
        currentGross += amount;
      } else if (rule.category === RuleCategoryType.DEDUCTION) {
        currentDeductions += amount;
      } else if (rule.category === RuleCategoryType.TAX) {
        currentTaxes += amount;
      }
    }

    const grossSalary = Number(currentGross.toFixed(2));
    const netSalary = Number(Math.max(0, currentGross - currentDeductions - currentTaxes).toFixed(2));

    return {
      lines,
      grossSalary,
      netSalary,
    };
  }

  private evaluateSimpleFormula(formula: string, basic: number, gross: number): number {
    try {
      const sanitized = formula
        .replace(/\bBASIC\b/g, String(basic))
        .replace(/\bGROSS\b/g, String(gross));
      
      // Strict regex check: allow only numbers, operators, parens, decimal points, spaces
      if (!/^[\d\s+\-*/().]+$/.test(sanitized)) {
        this.logger.warn(`Formula '${formula}' contains disallowed characters. Defaulting to 0.`);
        return 0;
      }

      // Safe Function evaluation for numeric math expressions
      const result = new Function(`return (${sanitized});`)();
      return typeof result === 'number' && !isNaN(result) ? result : 0;
    } catch (err) {
      this.logger.error(`Error evaluating formula: ${formula}`, err);
      return 0;
    }
  }
}
