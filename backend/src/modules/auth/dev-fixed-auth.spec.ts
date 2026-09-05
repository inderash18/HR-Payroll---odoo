import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DevFixedAuthService } from './dev-fixed-auth.service';
import { env } from '@common/config/env.config';
import { Role } from '@prisma/client';

describe('DevFixedAuthService (Unit)', () => {
  let service: DevFixedAuthService;
  const originalNodeEnv = process.env.NODE_ENV;
  const originalEnabled = env.DEV_FIXED_AUTH_ENABLED;

  beforeEach(() => {
    service = new DevFixedAuthService();
    process.env.NODE_ENV = 'development';
    (env as any).DEV_FIXED_AUTH_ENABLED = true;
    (env as any).DEV_FIXED_AUTH_EMAIL = 'devadmin@peoplepay360.local';
    (env as any).DEV_FIXED_AUTH_PASSWORD = 'ChangeThisDevPassword';
    (env as any).DEV_FIXED_AUTH_ROLE = 'ADMIN';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    (env as any).DEV_FIXED_AUTH_ENABLED = originalEnabled;
  });

  it('should be enabled in development when DEV_FIXED_AUTH_ENABLED is true', () => {
    expect(service.isEnabled()).toBe(true);
  });

  it('CRITICAL: must be strictly disabled when NODE_ENV is production even if DEV_FIXED_AUTH_ENABLED is true', () => {
    process.env.NODE_ENV = 'production';
    (env as any).DEV_FIXED_AUTH_ENABLED = true;

    expect(service.isEnabled()).toBe(false);
    expect(service.matchCredentials('devadmin@peoplepay360.local', 'ChangeThisDevPassword')).toBeNull();
    expect(service.getConfiguredDevUsers()).toEqual([]);
  });

  it('should match configured primary dev admin credentials', () => {
    const user = service.matchCredentials('devadmin@peoplepay360.local', 'ChangeThisDevPassword');
    expect(user).toBeDefined();
    expect(user?.email).toBe('devadmin@peoplepay360.local');
    expect(user?.role).toBe(Role.ADMIN);
    expect(user?.authSource).toBe('DEV_FIXED');
    expect(user?.organizationId).toBe('dev-local-org');
  });

  it('should reject invalid password for known dev user with constant-time check', () => {
    const user = service.matchCredentials('devadmin@peoplepay360.local', 'WrongDevPassword');
    expect(user).toBeNull();
  });

  it('should reject unknown email addresses', () => {
    const user = service.matchCredentials('unknown@domain.local', 'ChangeThisDevPassword');
    expect(user).toBeNull();
  });

  it('should provide multi-role default credentials for ADMIN, HR_MANAGER, HR_PAYROLL_MANAGER, EMPLOYEE', () => {
    const devUsers = service.getConfiguredDevUsers();
    const roles = devUsers.map((u) => u.role);

    expect(roles).toContain(Role.ADMIN);
    expect(roles).toContain(Role.HR_MANAGER);
    expect(roles).toContain(Role.HR_PAYROLL_MANAGER);
    expect(roles).toContain(Role.EMPLOYEE);

    const hrUser = service.matchCredentials('dev.hr@peoplepay360.local', 'ChangeThisDevPassword');
    expect(hrUser).toBeDefined();
    expect(hrUser?.role).toBe(Role.HR_MANAGER);

    const empUser = service.matchCredentials('dev.employee@peoplepay360.local', 'ChangeThisDevPassword');
    expect(empUser).toBeDefined();
    expect(empUser?.role).toBe(Role.EMPLOYEE);
  });

  it('should support custom users configured via DEV_FIXED_AUTH_USERS_JSON', () => {
    (env as any).DEV_FIXED_AUTH_USERS_JSON = JSON.stringify([
      {
        email: 'custom.tester@peoplepay360.local',
        password: 'CustomPassword123',
        role: 'HR_MANAGER',
        name: 'Custom Tester',
      },
    ]);

    const customUser = service.matchCredentials(
      'custom.tester@peoplepay360.local',
      'CustomPassword123',
    );
    expect(customUser).toBeDefined();
    expect(customUser?.email).toBe('custom.tester@peoplepay360.local');
    expect(customUser?.role).toBe(Role.HR_MANAGER);
    expect(customUser?.firstName).toBe('Custom');

    (env as any).DEV_FIXED_AUTH_USERS_JSON = '';
  });

  it('should manage in-memory session lifecycle: create, rotate, and revoke', () => {
    const devUser = service.matchCredentials('devadmin@peoplepay360.local', 'ChangeThisDevPassword')!;
    const initialHash = 'hash-token-123';
    const initialExpiry = new Date(Date.now() + 1000 * 60 * 60);

    // 1. Create dev session
    service.createDevSession(initialHash, devUser, initialExpiry);

    // 2. Rotate dev session
    const rotatedHash = 'hash-token-456';
    const rotatedExpiry = new Date(Date.now() + 1000 * 60 * 60 * 2);
    const session = service.validateAndRotateDevSession(initialHash, rotatedHash, rotatedExpiry);

    expect(session).toBeDefined();
    expect(session?.userId).toBe(devUser.id);

    // Old hash should no longer exist
    const oldAttempt = service.validateAndRotateDevSession(initialHash, 'new-hash', rotatedExpiry);
    expect(oldAttempt).toBeNull();

    // 3. Revoke dev session
    const revoked = service.revokeDevSession(rotatedHash);
    expect(revoked).toBe(true);

    const revokedAttempt = service.validateAndRotateDevSession(rotatedHash, 'another-hash', rotatedExpiry);
    expect(revokedAttempt).toBeNull();
  });

  it('should return dev profile with organization context', () => {
    const profile = service.getDevProfile('dev-fixed-admin');
    expect(profile).toBeDefined();
    expect(profile?.email).toBe('devadmin@peoplepay360.local');
    expect(profile?.organization.id).toBe('dev-local-org');
    expect(profile?.organization.name).toBe('Development Organization');
  });
});
