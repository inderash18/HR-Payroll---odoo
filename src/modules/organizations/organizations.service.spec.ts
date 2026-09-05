import { describe, it, expect, vi } from 'vitest';
import { OrganizationsService } from './organizations.service';
import { PrismaService } from '@common/database/prisma.service';
import { ConflictError, NotFoundError } from '@common/errors/app-error';

describe('OrganizationsService', () => {
  it('should create new organization successfully', async () => {
    const mockFindUnique = vi.fn().mockResolvedValue(null);
    const mockCreate = vi.fn().mockResolvedValue({
      id: 'org-1',
      name: 'Acme Corp',
      code: 'ACME',
      currency: 'USD',
      timezone: 'UTC',
    });

    const mockPrisma = {
      organization: {
        findUnique: mockFindUnique,
        create: mockCreate,
      },
    } as unknown as PrismaService;

    const service = new OrganizationsService(mockPrisma);
    const result = await service.create({
      name: 'Acme Corp',
      code: 'ACME',
      currency: 'USD',
      timezone: 'UTC',
    });

    expect(result.id).toBe('org-1');
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('should throw ConflictError on duplicate code', async () => {
    const mockFindUnique = vi.fn().mockResolvedValue({ id: 'org-existing', code: 'ACME' });

    const mockPrisma = {
      organization: {
        findUnique: mockFindUnique,
      },
    } as unknown as PrismaService;

    const service = new OrganizationsService(mockPrisma);

    await expect(
      service.create({
        name: 'Acme Corp',
        code: 'ACME',
        currency: 'USD',
        timezone: 'UTC',
      }),
    ).rejects.toThrowError(ConflictError);
  });

  it('should throw NotFoundError if organization does not exist', async () => {
    const mockFindUnique = vi.fn().mockResolvedValue(null);

    const mockPrisma = {
      organization: {
        findUnique: mockFindUnique,
      },
    } as unknown as PrismaService;

    const service = new OrganizationsService(mockPrisma);
    await expect(service.findById('non-existent')).rejects.toThrowError(NotFoundError);
  });
});
