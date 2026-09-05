import { describe, it, expect } from 'vitest';

interface ContractRecord {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date | null;
  wage: number;
}

function resolveApplicableContract(contracts: ContractRecord[], periodStart: Date, periodEnd: Date): ContractRecord | null {
  const matches = contracts.filter((c) => {
    const startsBeforePeriodEnd = c.startDate <= periodEnd;
    const endsAfterPeriodStart = c.endDate === null || c.endDate >= periodStart;
    return startsBeforePeriodEnd && endsAfterPeriodStart;
  });

  return matches.length > 0 ? matches[0] : null;
}

function detectContractOverlap(contracts: ContractRecord[], newStart: Date, newEnd: Date | null): boolean {
  return contracts.some((c) => {
    const startsBeforeNewEnd = newEnd === null || c.startDate <= newEnd;
    const endsAfterNewStart = c.endDate === null || c.endDate >= newStart;
    return startsBeforeNewEnd && endsAfterNewStart;
  });
}

describe('Payroll Contract Period Resolution & Overlap Protection', () => {
  const contractA: ContractRecord = {
    id: 'cnt-a',
    name: 'Contract A (H1 2026)',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-06-30'),
    wage: 35000,
  };

  const contractB: ContractRecord = {
    id: 'cnt-b',
    name: 'Contract B (H2 2026 onwards)',
    startDate: new Date('2026-07-01'),
    endDate: null,
    wage: 45000,
  };

  const allContracts = [contractA, contractB];

  it('Directive 147: should resolve Contract A (₹35,000) for May 2026 payrun period', () => {
    const periodStart = new Date('2026-05-01');
    const periodEnd = new Date('2026-05-31');

    const resolved = resolveApplicableContract(allContracts, periodStart, periodEnd);

    expect(resolved).not.toBeNull();
    expect(resolved?.id).toBe('cnt-a');
    expect(resolved?.wage).toBe(35000);
  });

  it('Directive 147: should resolve Contract B (₹45,000) for August 2026 payrun period', () => {
    const periodStart = new Date('2026-08-01');
    const periodEnd = new Date('2026-08-31');

    const resolved = resolveApplicableContract(allContracts, periodStart, periodEnd);

    expect(resolved).not.toBeNull();
    expect(resolved?.id).toBe('cnt-b');
    expect(resolved?.wage).toBe(45000);
  });

  it('Directive 33: should detect invalid overlapping contract dates', () => {
    // Attempt to create a contract overlapping with Contract A (2026-04-01 to 2026-09-30)
    const isOverlapping = detectContractOverlap(
      [contractA],
      new Date('2026-04-01'),
      new Date('2026-09-30'),
    );

    expect(isOverlapping).toBe(true);
  });

  it('Directive 33: should allow non-overlapping subsequent contract', () => {
    // New contract starting right after Contract A ends
    const isOverlapping = detectContractOverlap(
      [contractA],
      new Date('2026-07-01'),
      new Date('2026-12-31'),
    );

    expect(isOverlapping).toBe(false);
  });
});
