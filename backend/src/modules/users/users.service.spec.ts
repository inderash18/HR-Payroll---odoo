import { describe, it, expect, vi } from 'vitest';
import { UsersService } from './users.service';
import { PrismaService } from '@common/database/prisma.service';
import { AuditService } from '@modules/audit/audit.service';
import { Role } from '@prisma/client';
import { ConflictError, NotFoundError } from '@common/errors/app-error';

describe('UsersService', () => {
  const mockAuditService = {
    log: vi.fn().mockResolvedValue(undefined),
  } as unknown as AuditService;

  it('should create user under organization and record audit log', async () => {
    const mockFindUnique = vi.fn().mockResolvedValue(null);
    const mockCreatedUser = {
      id: 'u-1',
      email: 'hr@example.com',
      firstName: 'Alice',
      lastName: 'Smith',
      role: Role.HR_MANAGER,
      isActive: true,
      legalEntityId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockTx = {
      user: {
        create: vi.fn().mockResolvedValue(mockCreatedUser),
      },
    };

    const mockPrisma = {
      user: { findUnique: mockFindUnique },
      runInTransaction: vi.fn((cb) => cb(mockTx)),
    } as unknown as PrismaService;

    const service = new UsersService(mockPrisma, mockAuditService);
    const result = await service.create('org-1', {
      email: 'hr@example.com',
      password: 'StrongPassword123!',
      firstName: 'Alice',
      lastName: 'Smith',
      role: Role.HR_MANAGER,
    });

    expect(result.id).toBe('u-1');
    expect(result.role).toBe(Role.HR_MANAGER);
    expect(mockAuditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: 'org-1',
        action: 'USER_CREATED',
        entityId: 'u-1',
      }),
      mockTx,
    );
  });

  it('should throw ConflictError if user email already exists in organization', async () => {
    const mockPrisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({ id: 'existing-u' }),
      },
    } as unknown as PrismaService;

    const service = new UsersService(mockPrisma, mockAuditService);

    await expect(
      service.create('org-1', {
        email: 'hr@example.com',
        password: 'StrongPassword123!',
        firstName: 'Alice',
        lastName: 'Smith',
        role: Role.HR_MANAGER,
      }),
    ).rejects.toThrowError(ConflictError);
  });
});
