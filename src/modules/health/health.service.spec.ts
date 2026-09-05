import { describe, it, expect, vi } from 'vitest';
import { HealthService } from './health.service';
import { PrismaService } from '@common/database/prisma.service';

describe('HealthService', () => {
  it('should return liveness ok status', () => {
    const mockPrisma = {} as PrismaService;
    const service = new HealthService(mockPrisma);

    const liveness = service.checkLiveness();
    expect(liveness.status).toBe('ok');
    expect(liveness.timestamp).toBeDefined();
  });

  it('should return readiness ok status when database query succeeds', async () => {
    const mockPrisma = {
      $queryRawUnsafe: vi.fn().mockResolvedValue([{ 1: 1 }]),
    } as unknown as PrismaService;

    const service = new HealthService(mockPrisma);
    const readiness = await service.checkReadiness();

    expect(readiness.status).toBe('ok');
    expect(readiness.services.database.status).toBe('up');
    expect(readiness.services.database.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('should return readiness error status when database query fails', async () => {
    const mockPrisma = {
      $queryRawUnsafe: vi.fn().mockRejectedValue(new Error('Connection timeout')),
    } as unknown as PrismaService;

    const service = new HealthService(mockPrisma);
    const readiness = await service.checkReadiness();

    expect(readiness.status).toBe('error');
    expect(readiness.services.database.status).toBe('down');
    expect(readiness.services.database.error).toBe('Connection timeout');
  });
});
