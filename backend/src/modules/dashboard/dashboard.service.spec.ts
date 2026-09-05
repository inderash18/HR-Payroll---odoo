import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '@common/database/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      employee: {
        count: vi.fn().mockResolvedValue(15),
      },
      contract: {
        count: vi.fn().mockResolvedValue(14),
      },
      leaveRequest: {
        count: vi.fn().mockResolvedValue(3),
      },
      payrun: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'pay-1',
          name: 'September 2026 Payroll',
          status: 'COMPUTED',
          totalGross: 90000,
          totalNet: 78300,
        }),
        aggregate: vi.fn().mockResolvedValue({
          _sum: { totalGross: 180000, totalNet: 156600 },
        }),
      },
      department: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'd-1', name: 'Engineering', code: 'ENG', _count: { employees: 10 } },
          { id: 'd-2', name: 'HR', code: 'HR', _count: { employees: 5 } },
        ]),
      },
      attendance: {
        count: vi.fn().mockResolvedValue(12),
      },
      leaveType: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'lt-1', name: 'Paid Vacation', code: 'VAC', isPaid: true, _count: { leaveRequests: 8 } },
        ]),
      },
    };

    service = new DashboardService(mockPrisma as any);
  });

  it('should return calculated overview statistics scoped to organization', async () => {
    const data = await service.getOverview('org-1');

    expect(data.activeEmployees).toBe(15);
    expect(data.activeContracts).toBe(14);
    expect(data.pendingLeaves).toBe(3);
    expect(data.allTimePaidGross).toBe(180000);
    expect(data.allTimePaidNet).toBe(156600);
    expect(data.departmentHeadcounts).toHaveLength(2);
    expect(mockPrisma.employee.count).toHaveBeenCalledWith({
      where: { organizationId: 'org-1', isActive: true },
    });
  });

  it('should return aggregated attendance status metrics', async () => {
    const data = await service.getAttendanceMetrics('org-1', '2026-09-01', '2026-09-30');

    expect(data.present).toBe(12);
    expect(data.absent).toBe(12);
  });

  it('should return time off counts and usage by type', async () => {
    const data = await service.getTimeOffMetrics('org-1');

    expect(data.approvedCount).toBe(3);
    expect(data.usageByType).toHaveLength(1);
    expect(data.usageByType[0].requestCount).toBe(8);
  });
});
