import { Injectable, Logger } from '@nestjs/common';
import { RuleCategoryType, AmountType } from '@prisma/client';
import { SafeMathParser } from '@common/utils/safe-math.parser';

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
}

export interface CalculatedLine {
  category: RuleCategoryType;
  code: string;
  name: string;
  sequence: number;
  amount: number;
  baseAmount?: number;
  rate?: number;
}

export interface CalculationResult {
  lines: CalculatedLine[];
  grossSalary: number;
  deductionsTotal: number;
  netSalary: number;
  warnings: Array<{ code: string; message: string; severity: 'INFO' | 'WARNING' | 'BLOCKING' }>;
}

@Injectable()
export class PayrollEngineService {
  private readonly logger = new Logger(PayrollEngineService.name);

  /**
   * Computes individual payslip lines deterministically given a contract, worked days, and salary structure rules.
   * Uses SafeMathParser (Shunting-Yard) for formula execution.
   */
  calculatePayslip(
    contractWage: number,
    rules: RuleCalculationInput['rule'][],
    workedDays: number = 30,
    totalWorkingDays: number = 30,
    unpaidLeaveDays: number = 0,
    options?: { hasBankDetails?: boolean; hasMissingCheckout?: boolean },
  ): CalculationResult {
    // Sort rules by sequence ASC
    const sortedRules = [...rules].sort((a, b) => a.sequence - b.sequence);

    const contextMap: Record<string, number> = {
      WAGE: contractWage,
      WORKED_DAYS: workedDays,
      TOTAL_WORKING_DAYS: totalWorkingDays,
      UNPAID_DAYS: unpaidLeaveDays,
    };

    const lines: CalculatedLine[] = [];
    const warnings: CalculationResult['warnings'] = [];

    // Prorate basic base wage if unpaid leaves exist
    let prorationFactor = 1.0;
    if (unpaidLeaveDays > 0 && totalWorkingDays > 0) {
      prorationFactor = Math.max(0, (totalWorkingDays - unpaidLeaveDays) / totalWorkingDays);
    }
    const proratedWage = Number((contractWage * prorationFactor).toFixed(2));
    contextMap['PRORATED_WAGE'] = proratedWage;

    let currentGross = 0;
    let currentDeductions = 0;

    for (const rule of sortedRules) {
      let amount = 0;
      let baseAmount: number | undefined = undefined;
      let rate: number | undefined = undefined;

      const upperAmountType = String(rule.amountType).toUpperCase();

      if (
        (rule.category === RuleCategoryType.BASIC || rule.code === 'BASIC') &&
        (upperAmountType === 'CONTRACT_BASE' || upperAmountType === 'FIXED') &&
        (!rule.amountFixed || rule.amountFixed === 0)
      ) {
        amount = proratedWage;
        baseAmount = contractWage;
      } else if (upperAmountType === 'FIXED') {
        amount = rule.amountFixed ? Number(rule.amountFixed) : 0;
      } else if (upperAmountType === 'PERCENTAGE') {
        rate = rule.amountPercentage ? Number(rule.amountPercentage) : 0;
        const baseKey = (rule.percentageBasedOn || 'BASIC').toUpperCase();

        if (baseKey === 'GROSS') {
          baseAmount = currentGross;
        } else if (baseKey === 'WAGE' || baseKey === 'CONTRACT_WAGE') {
          baseAmount = contractWage;
        } else if (contextMap[baseKey] !== undefined) {
          baseAmount = contextMap[baseKey];
        } else {
          baseAmount = proratedWage;
        }

        amount = Number(((baseAmount * rate) / 100).toFixed(2));
      } else if (
        (upperAmountType === 'FORMULA' || upperAmountType === 'CODE_FORMULA') &&
        rule.codeFormula
      ) {
        try {
          amount = SafeMathParser.evaluate(rule.codeFormula, contextMap);
        } catch (err) {
          this.logger.error(`Error calculating formula rule '${rule.code}': ${rule.codeFormula}`, err);
          warnings.push({
            code: 'INVALID_SALARY_RULE',
            message: `Formula execution failed for rule ${rule.code}: ${(err as Error).message}`,
            severity: 'BLOCKING',
          });
          amount = 0;
        }
      }

      amount = Number(amount.toFixed(2));
      contextMap[rule.code.toUpperCase()] = amount;

      lines.push({
        category: rule.category,
        code: rule.code,
        name: rule.name,
        sequence: rule.sequence,
        amount,
        baseAmount,
        rate,
      });

      if (
        rule.category === RuleCategoryType.BASIC ||
        rule.category === RuleCategoryType.ALLOWANCE ||
        rule.category === RuleCategoryType.EARNING
      ) {
        currentGross += amount;
      } else if (
        rule.category === RuleCategoryType.DEDUCTION ||
        rule.category === RuleCategoryType.TAX
      ) {
        currentDeductions += amount;
      }

      contextMap['GROSS'] = Number(currentGross.toFixed(2));
      contextMap['TOTAL_DEDUCTIONS'] = Number(currentDeductions.toFixed(2));
    }

    const grossSalary = Number(currentGross.toFixed(2));
    const deductionsTotal = Number(currentDeductions.toFixed(2));
    const netSalary = Number(Math.max(0, grossSalary - deductionsTotal).toFixed(2));

    // Automated warnings checks
    if (grossSalary - deductionsTotal < 0) {
      warnings.push({
        code: 'NEGATIVE_NET_SALARY',
        message: `Deductions ($${deductionsTotal}) exceed gross salary ($${grossSalary})`,
        severity: 'BLOCKING',
      });
    }

    if (options?.hasBankDetails === false) {
      warnings.push({
        code: 'MISSING_BANK_DETAILS',
        message: 'Employee bank account details are missing for direct disbursement',
        severity: 'WARNING',
      });
    }

    if (options?.hasMissingCheckout) {
      warnings.push({
        code: 'MISSING_CHECKOUT',
        message: 'Employee has incomplete attendance check-outs during the period',
        severity: 'INFO',
      });
    }

    return {
      lines,
      grossSalary,
      deductionsTotal,
      netSalary,
      warnings,
    };
  }
}
