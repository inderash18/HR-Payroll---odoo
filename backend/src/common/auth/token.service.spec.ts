import { describe, it, expect } from 'vitest';
import { TokenService } from './token.service';
import { Role } from '@prisma/client';
import { UnauthorizedError } from '@common/errors/app-error';

describe('TokenService', () => {
  const service = new TokenService();

  it('should sign and verify access token correctly', () => {
    const payload = {
      sub: 'user-123',
      email: 'user@example.com',
      organizationId: 'org-456',
      legalEntityId: null,
      role: Role.HR_MANAGER,
    };

    const token = service.signAccessToken(payload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    const decoded = service.verifyAccessToken(token);
    expect(decoded.sub).toBe(payload.sub);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.organizationId).toBe(payload.organizationId);
    expect(decoded.role).toBe(Role.HR_MANAGER);
  });

  it('should throw UnauthorizedError on invalid access token', () => {
    expect(() => service.verifyAccessToken('invalid.token.here')).toThrowError(
      UnauthorizedError,
    );
  });

  it('should generate secure refresh token and SHA-256 hash', () => {
    const { rawToken, tokenHash, expiresAt } = service.generateRefreshToken();

    expect(rawToken).toBeDefined();
    expect(rawToken.length).toBe(80); // 40 bytes hex
    expect(tokenHash).toBe(service.hashToken(rawToken));
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
  });
});
