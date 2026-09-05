import { describe, it, expect, vi } from 'vitest';
import { IdempotencyService } from './idempotency.service';
import { PrismaService } from '@common/database/prisma.service';
import { IdempotencyConflictError } from '@common/errors/app-error';

describe('IdempotencyService', () => {
  it('should hash payloads consistently', () => {
    const service = new IdempotencyService({} as PrismaService);
    const hash1 = service.hashPayload({ amount: 100, currency: 'USD' });
    const hash2 = service.hashPayload({ amount: 100, currency: 'USD' });
    const hash3 = service.hashPayload({ amount: 200, currency: 'USD' });

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
  });

  it('should acquire new lock when key does not exist', async () => {
    const mockFindUnique = vi.fn().mockResolvedValue(null);
    const mockCreate = vi.fn().mockResolvedValue({ key: 'key-1' });

    const mockPrisma = {
      idempotencyKey: {
        findUnique: mockFindUnique,
        create: mockCreate,
      },
    } as unknown as PrismaService;

    const service = new IdempotencyService(mockPrisma);
    const result = await service.acquireLockOrGetCached(
      'key-1',
      'org-1',
      'user-1',
      '/payrun/compute',
      'hash-123',
    );

    expect(result.isCached).toBe(false);
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('should return cached response when request is completed', async () => {
    const mockFindUnique = vi.fn().mockResolvedValue({
      key: 'key-1',
      organizationId: 'org-1',
      requestPath: '/payrun/compute',
      requestBodyHash: 'hash-123',
      statusCode: 200,
      responseBody: { success: true },
      expiresAt: new Date(Date.now() + 10000),
    });

    const mockPrisma = {
      idempotencyKey: {
        findUnique: mockFindUnique,
      },
    } as unknown as PrismaService;

    const service = new IdempotencyService(mockPrisma);
    const result = await service.acquireLockOrGetCached(
      'key-1',
      'org-1',
      'user-1',
      '/payrun/compute',
      'hash-123',
    );

    expect(result.isCached).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.responseBody).toEqual({ success: true });
  });

  it('should throw IdempotencyConflictError if payload hash differs for same key', async () => {
    const mockFindUnique = vi.fn().mockResolvedValue({
      key: 'key-1',
      organizationId: 'org-1',
      requestPath: '/payrun/compute',
      requestBodyHash: 'different-hash',
      expiresAt: new Date(Date.now() + 10000),
    });

    const mockPrisma = {
      idempotencyKey: {
        findUnique: mockFindUnique,
      },
    } as unknown as PrismaService;

    const service = new IdempotencyService(mockPrisma);

    await expect(
      service.acquireLockOrGetCached(
        'key-1',
        'org-1',
        'user-1',
        '/payrun/compute',
        'my-hash',
      ),
    ).rejects.toThrowError(IdempotencyConflictError);
  });
});
