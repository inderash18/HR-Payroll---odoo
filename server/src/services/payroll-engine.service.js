/**
 * Odoo AST Payroll Calculation Engine
 * Evaluates sequenced salary rules, allowances, deductions, gross, and net pay.
 */
export const payrollEngine = {
  computeContractSalary(contract, rules = [], { scheduledDays = 30, workedDays = 30, unpaidLeaveDays = 0 } = {}) {
    const baseWage = Number(contract.wage) || 0;
    const computedLines = [];
    const context = {
      BASE: baseWage,
      CONTRACT_WAGE: baseWage,
      SCHEDULED_DAYS: scheduledDays,
      WORKED_DAYS: workedDays,
      UNPAID_LEAVE_DAYS: unpaidLeaveDays,
      GROSS: 0,
      TOTAL_DEDUCTIONS: 0,
      NET: 0,
    };

    // Sort rules strictly by sequence
    const sortedRules = [...rules].sort((a, b) => a.sequence - b.sequence);

    for (const rule of sortedRules) {
      let amount = 0;
      let rate = rule.amountPercentage ? Number(rule.amountPercentage) : null;
      let baseAmount = null;

      switch (rule.amountType) {
        case 'CONTRACT_BASE':
        case 'FIXED':
          if (rule.amountFixed !== null && rule.amountFixed !== undefined) {
            amount = Number(rule.amountFixed);
          } else {
            // Default to proportion of base wage
            amount = scheduledDays > 0 ? (baseWage / scheduledDays) * (workedDays - unpaidLeaveDays) : baseWage;
          }
          break;

        case 'PERCENTAGE':
          const targetBaseKey = rule.percentageBasedOn || 'BASE';
          baseAmount = context[targetBaseKey] !== undefined ? Number(context[targetBaseKey]) : baseWage;
          amount = (baseAmount * (rate || 0)) / 100;
          break;

        case 'CODE_FORMULA':
        case 'FORMULA':
          try {
            // Simple arithmetic evaluator over context
            if (rule.codeFormula) {
              const formula = rule.codeFormula.replace(/[A-Z_]+/g, (match) => {
                return context[match] !== undefined ? String(context[match]) : '0';
              });
              // Safe limited numeric evaluation
              amount = Function(`'use strict'; return (${formula})`)() || 0;
            }
          } catch (e) {
            console.warn(`Formula execution failed for rule ${rule.code}:`, e.message);
            amount = 0;
          }
          break;

        default:
          amount = Number(rule.amountFixed) || 0;
      }

      amount = parseFloat(amount.toFixed(2));
      context[rule.code] = amount;

      if (['BASIC', 'ALLOWANCE', 'EARNING', 'GROSS'].includes(rule.category)) {
        context.GROSS += amount;
      } else if (['DEDUCTION', 'TAX'].includes(rule.category)) {
        context.TOTAL_DEDUCTIONS += amount;
      }

      computedLines.push({
        category: rule.category,
        code: rule.code,
        name: rule.name,
        sequence: rule.sequence,
        amount,
        baseAmount,
        rate,
      });
    }

    context.NET = parseFloat((context.GROSS - context.TOTAL_DEDUCTIONS).toFixed(2));

    return {
      grossSalary: context.GROSS,
      deductionAmount: context.TOTAL_DEDUCTIONS,
      netSalary: Math.max(0, context.NET),
      lines: computedLines,
    };
  },
};
