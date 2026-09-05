import { describe, it, expect, vi } from 'vitest';
import { LegalEntitiesService } from './legal-entities.service';
import { PrismaService } from '@common/database/prisma.service';
import { ConflictError, NotFoundError } from '@common/errors/app-error';

describe('LegalEntitiesService', () => {
  it('should create legal entity within organization scope', async () => {
    const mockFindUnique = vi.fn().mockResolvedValue(null);
    const mockCreate = vi.fn().mockResolvedValue({
      id: 'le-1',
      organizationId: 'org-1',
      name: 'Acme US LLC',
      code: 'US01',
      country: 'US',
      currency: 'USD',
    });

    const mockPrisma = {
      legalEntity: {
        findUnique: mockFindUnique,
        create: mockCreate,
      },
    } as unknown as PrismaService;

    const service = new LegalEntitiesService(mockPrisma);
    const result = await service.create('org-1', {
      name: 'Acme US LLC',
      code: 'US01',
      country: 'US',
      currency: 'USD',
    });

    expect(result.id).toBe('le-1');
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        organizationId: 'org-1',
        code: 'US01',
      }),
    });
  });

  it('should prevent duplicate legal entity code within the same organization', async () => {
    const mockFindUnique = vi.fn().mockResolvedValue({ id: 'le-existing', code: 'US01' });

    const mockPrisma = {
      legalEntity: {
        findUnique: mockFindUnique,
      },
    } as unknown as PrismaService;

    const service = new LegalEntitiesService(mockPrisma);

    await expect(
      service.create('org-1', {
        name: 'Acme US LLC',
        code: 'US01',
        country: 'US',
        currency: 'USD',
      }),
    ).rejects.toThrowError(ConflictError);
  });
});
