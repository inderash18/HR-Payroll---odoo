import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import { PrismaService } from '@common/database/prisma.service';
import { TokenService } from '@common/auth/token.service';
import { AuditService } from '@modules/audit/audit.service';
import { OutboxService } from '@modules/outbox/outbox.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UnauthorizedError } from '@common/errors/app-error';

describe('AuthService', () => {
  let authService: AuthService;
  let mockPrisma: any;
  let mockTokenService: any;
  let mockAuditService: any;
  let mockOutboxService: any;

  beforeEach(() => {
    mockTokenService = {
      signAccessToken: vi.fn().mockReturnValue('mock-access-token'),
      generateRefreshToken: vi.fn().mockReturnValue({
        rawToken: 'raw-refresh-token',
        tokenHash: 'hash-of-refresh-token',
        expiresAt: new Date(Date.now() + 100000),
      }),
      generateResetToken: vi.fn().mockReturnValue({
        rawToken: 'raw-reset-token',
        tokenHash: 'hash-of-reset-token',
        expiresAt: new Date(Date.now() + 3600000),
      }),
      hashToken: vi.fn().mockImplementation((t: string) => `hash-${t}`),
    };

    mockAuditService = {
      log: vi.fn().mockResolvedValue(undefined),
    };

    mockOutboxService = {
      publish: vi.fn().mockResolvedValue('outbox-1'),
    };

    mockPrisma = {
      organization: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      refreshToken: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      passwordResetToken: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      runInTransaction: vi.fn((cb) => cb(mockPrisma)),
    };

    authService = new AuthService(
      mockPrisma as PrismaService,
      mockTokenService as TokenService,
      mockAuditService as AuditService,
      mockOutboxService as OutboxService,
    );
  });

  it('should login successfully with correct credentials', async () => {
    const passwordHash = await bcrypt.hash('CorrectPassword123!', 10);
    mockPrisma.organization.findUnique.mockResolvedValue({ id: 'org-1', code: 'ORG01' });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'u-1',
      organizationId: 'org-1',
      email: 'user@example.com',
      passwordHash,
      firstName: 'Jane',
      lastName: 'Doe',
      role: Role.EMPLOYEE,
      isActive: true,
      failedLoginAttempts: 0,
      lockoutUntil: null,
      legalEntityId: null,
    });

    const result = await authService.login({
      organizationCode: 'ORG01',
      email: 'user@example.com',
      password: 'CorrectPassword123!',
    });

    expect(result.accessToken).toBe('mock-access-token');
    expect(result.refreshToken).toBe('raw-refresh-token');
    expect(result.user.email).toBe('user@example.com');
  });

  it('should throw UnauthorizedError and increment failed attempts on invalid password', async () => {
    const passwordHash = await bcrypt.hash('CorrectPassword123!', 10);
    mockPrisma.organization.findUnique.mockResolvedValue({ id: 'org-1', code: 'ORG01' });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'u-1',
      organizationId: 'org-1',
      email: 'user@example.com',
      passwordHash,
      isActive: true,
      failedLoginAttempts: 2,
      lockoutUntil: null,
    });

    await expect(
      authService.login({
        organizationCode: 'ORG01',
        email: 'user@example.com',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrowError(UnauthorizedError);

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u-1' },
      data: expect.objectContaining({ failedLoginAttempts: 3 }),
    });
  });

  it('should detect token replay attack and revoke all user refresh tokens', async () => {
    mockPrisma.refreshToken.findUnique.mockResolvedValue({
      id: 'rt-1',
      userId: 'u-1',
      tokenHash: 'hash-revoked-token',
      revokedAt: new Date(Date.now() - 10000), // Already revoked!
      expiresAt: new Date(Date.now() + 50000),
      user: { id: 'u-1', organizationId: 'org-1', isActive: true },
    });

    await expect(authService.refreshTokens('revoked-token')).rejects.toThrowError(
      UnauthorizedError,
    );

    expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { userId: 'u-1' },
      data: expect.objectContaining({ revokedAt: expect.any(Date) }),
    });
  });
});
