import { describe, it, expect, vi } from 'vitest';
import { OutboxService } from './outbox.service';
import { PrismaService } from '@common/database/prisma.service';
import { OutboxStatus } from '@prisma/client';

describe('OutboxService', () => {
  it('should publish outbox event with PENDING status', async () => {
    const mockCreate = vi.fn().mockResolvedValue({ id: 'outbox-1' });
    const mockPrisma = {
      outboxEvent: { create: mockCreate },
    } as unknown as PrismaService;

    const service = new OutboxService(mockPrisma);
    const id = await service.publish({
      organizationId: 'org-1',
      eventType: 'PAYSLIP_GENERATED',
      payload: { payslipId: 'ps-99', employeeId: 'emp-1' },
    });

    expect(id).toBe('outbox-1');
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        organizationId: 'org-1',
        eventType: 'PAYSLIP_GENERATED',
        payload: { payslipId: 'ps-99', employeeId: 'emp-1' },
        status: OutboxStatus.PENDING,
      },
    });
  });

  it('should mark event as completed', async () => {
    const mockUpdate = vi.fn().mockResolvedValue({ id: 'outbox-1' });
    const mockPrisma = {
      outboxEvent: { update: mockUpdate },
    } as unknown as PrismaService;

    const service = new OutboxService(mockPrisma);
    await service.markProcessed('outbox-1');

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'outbox-1' },
      data: expect.objectContaining({
        status: OutboxStatus.COMPLETED,
      }),
    });
  });
});
