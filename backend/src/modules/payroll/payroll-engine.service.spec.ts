import { describe, it, expect } from 'vitest';
import { PayrollEngineService } from './payroll-engine.service';
import { RuleCategoryType } from '@prisma/client';

describe('PayrollEngineService', () => {
  const service = new PayrollEngineService();

  it('should compute Directive 148 salary structure accurately', () => {
    // Structure:
    // 10 BASIC: Contract Base = 40,000
    // 20 HRA: 40% of BASIC = 16,000
    // 30 SPECIAL: Fixed = 4,000
    // 40 PF: 12% of BASIC = 4,800
    // 50 TAX: Fixed = 3,000
    // GROSS = 60,000, NET = 52,200
    const rules = [
      {
        id: 'r1',
        code: 'BASIC',
        name: 'Basic Salary',
        category: RuleCategoryType.BASIC,
        sequence: 10,
        amountType: 'CONTRACT_BASE',
      },
      {
        id: 'r2',
        code: 'HRA',
        name: 'House Rent Allowance',
        category: RuleCategoryType.ALLOWANCE,
        sequence: 20,
        amountType: 'PERCENTAGE',
        amountPercentage: 40,
        percentageBasedOn: 'BASIC',
      },
      {
        id: 'r3',
        code: 'SPECIAL',
        name: 'Special Allowance',
        category: RuleCategoryType.ALLOWANCE,
        sequence: 30,
        amountType: 'FIXED',
        amountFixed: 4000,
      },
      {
        id: 'r4',
        code: 'PF',
        name: 'Provident Fund',
        category: RuleCategoryType.DEDUCTION,
        sequence: 40,
        amountType: 'PERCENTAGE',
        amountPercentage: 12,
        percentageBasedOn: 'BASIC',
      },
      {
        id: 'r5',
        code: 'TAX',
        name: 'Income Tax',
        category: RuleCategoryType.DEDUCTION,
        sequence: 50,
        amountType: 'FIXED',
        amountFixed: 3000,
      },
    ];

    const result = service.calculatePayslip(40000, rules, 30, 30, 0);

    expect(result.grossSalary).toBe(60000);
    expect(result.deductionsTotal).toBe(7800);
    expect(result.netSalary).toBe(52200);

    const basicLine = result.lines.find((l) => l.code === 'BASIC');
    const hraLine = result.lines.find((l) => l.code === 'HRA');
    const pfLine = result.lines.find((l) => l.code === 'PF');

    expect(basicLine?.amount).toBe(40000);
    expect(hraLine?.amount).toBe(16000);
    expect(pfLine?.amount).toBe(4800);
  });

  it('should prorate basic wage on unpaid leaves', () => {
    const rules = [
      {
        id: 'r1',
        code: 'BASIC',
        name: 'Basic Salary',
        category: RuleCategoryType.BASIC,
        sequence: 10,
        amountType: 'CONTRACT_BASE',
      },
    ];

    // 30 total days, 3 unpaid days -> 90%
    const result = service.calculatePayslip(30000, rules, 27, 30, 3);
    expect(result.grossSalary).toBe(27000);
    expect(result.netSalary).toBe(27000);
  });

  it('should generate blocking warning when deductions exceed gross', () => {
    const rules = [
      {
        id: 'r1',
        code: 'BASIC',
        name: 'Basic Salary',
        category: RuleCategoryType.BASIC,
        sequence: 10,
        amountType: 'FIXED',
        amountFixed: 1000,
      },
      {
        id: 'r2',
        code: 'GARNISHMENT',
        name: 'Garnishment',
        category: RuleCategoryType.DEDUCTION,
        sequence: 20,
        amountType: 'FIXED',
        amountFixed: 1500,
      },
    ];

    const result = service.calculatePayslip(1000, rules);
    expect(result.warnings.some((w) => w.code === 'NEGATIVE_NET_SALARY')).toBe(true);
  });
});
