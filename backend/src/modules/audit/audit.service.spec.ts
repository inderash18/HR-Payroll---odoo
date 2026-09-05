import { describe, it, expect, vi } from 'vitest';
import { AuditService } from './audit.service';
import { PrismaService } from '@common/database/prisma.service';

describe('AuditService', () => {
  it('should call prisma auditLog.create with mapped parameters', async () => {
    const mockCreate = vi.fn().mockResolvedValue({ id: 'audit-123' });
    const mockPrisma = {
      auditLog: { create: mockCreate },
    } as unknown as PrismaService;

    const service = new AuditService(mockPrisma);

    await service.log({
      organizationId: '11111111-1111-1111-1111-111111111111',
      userId: '22222222-2222-2222-2222-222222222222',
      action: 'EMPLOYEE_SALARY_UPDATED',
      entityType: 'Employee',
      entityId: 'emp-99',
      oldValues: { salary: 5000 },
      newValues: { salary: 5500 },
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    });

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        organizationId: '11111111-1111-1111-1111-111111111111',
        action: 'EMPLOYEE_SALARY_UPDATED',
        entityType: 'Employee',
        entityId: 'emp-99',
      }),
    });
  });

  it('should not throw if prisma auditLog.create fails', async () => {
    const mockCreate = vi.fn().mockRejectedValue(new Error('DB failure'));
    const mockPrisma = {
      auditLog: { create: mockCreate },
    } as unknown as PrismaService;

    const service = new AuditService(mockPrisma);

    await expect(
      service.log({
        organizationId: '11111111-1111-1111-1111-111111111111',
        action: 'TEST_ACTION',
        entityType: 'Test',
        entityId: 'test-1',
      }),
    ).resolves.not.toThrow();
  });
});
