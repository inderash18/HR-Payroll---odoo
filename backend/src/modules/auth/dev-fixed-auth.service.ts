import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { env } from '@common/config/env.config';
import { Role } from '@prisma/client';

export interface DevFixedUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  organizationId: string;
  legalEntityId: string | null;
  authSource: 'DEV_FIXED';
}

export interface DevSessionRecord {
  userId: string;
  email: string;
  role: Role;
  organizationId: string;
  legalEntityId: string | null;
  expiresAt: Date;
  createdAt: Date;
}

@Injectable()
export class DevFixedAuthService {
  private readonly logger = new Logger(DevFixedAuthService.name);

  // In-memory token store: tokenHash -> DevSessionRecord
  private readonly inMemorySessions = new Map<string, DevSessionRecord>();

  /**
   * Evaluates if Dev Fixed Auth is allowed in the current runtime environment.
   * STRICT GUARD: NEVER allowed in production under any circumstance.
   */
  public isEnabled(): boolean {
    if (process.env.NODE_ENV === 'production') {
      return false;
    }
    return env.DEV_FIXED_AUTH_ENABLED === true;
  }

  /**
   * Retrieves all configured development users (single env vars, json, and standard dev roles).
   */
  public getConfiguredDevUsers(): DevFixedUser[] {
    if (!this.isEnabled()) {
      return [];
    }

    const devUsers: DevFixedUser[] = [];
    const defaultPassword = env.DEV_FIXED_AUTH_PASSWORD || 'ChangeThisDevPassword';

    // 1. Primary configured dev user
    if (env.DEV_FIXED_AUTH_EMAIL) {
      const nameParts = (env.DEV_FIXED_AUTH_NAME || 'Development Admin').trim().split(/\s+/);
      const firstName = nameParts[0] || 'Development';
      const lastName = nameParts.slice(1).join(' ') || 'User';
      const rawEmail = env.DEV_FIXED_AUTH_EMAIL.trim().toLowerCase();
      const formattedEmail = rawEmail.includes('@') ? rawEmail : `${rawEmail}@peoplepay360.local`;

      devUsers.push({
        id: `dev-fixed-${env.DEV_FIXED_AUTH_ROLE.toLowerCase().replace(/_/g, '-')}`,
        email: formattedEmail,
        password: defaultPassword,
        firstName,
        lastName,
        role: env.DEV_FIXED_AUTH_ROLE as Role,
        organizationId: 'dev-local-org',
        legalEntityId: null,
        authSource: 'DEV_FIXED',
      });
    }

    // 2. Custom JSON configured users
    if (env.DEV_FIXED_AUTH_USERS_JSON) {
      try {
        const parsed = JSON.parse(env.DEV_FIXED_AUTH_USERS_JSON);
        if (Array.isArray(parsed)) {
          for (const u of parsed) {
            if (u && u.email && u.password && u.role) {
              const nameParts = (u.name || u.firstName || 'Dev User').trim().split(/\s+/);
              devUsers.push({
                id: u.id || `dev-fixed-${String(u.role).toLowerCase().replace(/_/g, '-')}-${devUsers.length}`,
                email: String(u.email).trim().toLowerCase(),
                password: String(u.password),
                firstName: u.firstName || nameParts[0] || 'Development',
                lastName: u.lastName || nameParts.slice(1).join(' ') || 'User',
                role: u.role as Role,
                organizationId: u.organizationId || 'dev-local-org',
                legalEntityId: u.legalEntityId || null,
                authSource: 'DEV_FIXED',
              });
            }
          }
        }
      } catch (err) {
        this.logger.error('Failed to parse DEV_FIXED_AUTH_USERS_JSON:', err);
      }
    }

    // 3. Predefined dev suite for all four roles if not already added
    const standardRoles: Array<{ role: Role; email: string; name: string }> = [
      { role: Role.ADMIN, email: 'admin@peoplepay360.local', name: 'Dev Admin' },
      { role: Role.HR_MANAGER, email: 'hr@peoplepay360.local', name: 'Dev HR Manager' },
      { role: Role.HR_PAYROLL_MANAGER, email: 'payroll@peoplepay360.local', name: 'Dev Payroll Manager' },
      { role: Role.EMPLOYEE, email: 'employee@peoplepay360.local', name: 'Dev Employee' },
    ];

    for (const standard of standardRoles) {
      const alreadyExists = devUsers.some(
        (u) => u.email === standard.email.toLowerCase() || u.role === standard.role,
      );
      if (!alreadyExists) {
        const nameParts = standard.name.split(' ');
        devUsers.push({
          id: `dev-fixed-${standard.role.toLowerCase().replace(/_/g, '-')}`,
          email: standard.email.toLowerCase(),
          password: '123',
          firstName: nameParts[0] || 'Development',
          lastName: nameParts.slice(1).join(' ') || 'User',
          role: standard.role,
          organizationId: 'dev-local-org',
          legalEntityId: null,
          authSource: 'DEV_FIXED',
        });
      }
    }

    return devUsers;
  }

  /**
   * Matches candidate credentials against configured development users using constant-time comparison.
   */
  public matchCredentials(email: string, candidatePassword: string): DevFixedUser | null {
    if (!this.isEnabled() || !email || !candidatePassword) {
      return null;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const devUsers = this.getConfiguredDevUsers();

    for (const user of devUsers) {
      const isRoleAlias =
        (user.role === Role.ADMIN &&
          ['admin', 'devadmin', 'dev.admin', 'admin@peoplepay360.local', 'devadmin@peoplepay360.local', 'dev.admin@peoplepay360.local'].includes(normalizedEmail)) ||
        (user.role === Role.HR_MANAGER &&
          ['hr', 'hrmanager', 'devhr', 'dev.hr', 'hr@peoplepay360.local', 'devhr@peoplepay360.local', 'dev.hr@peoplepay360.local'].includes(normalizedEmail)) ||
        (user.role === Role.HR_PAYROLL_MANAGER &&
          ['payroll', 'payrollmanager', 'devpayroll', 'dev.payroll', 'payroll@peoplepay360.local', 'devpayroll@peoplepay360.local', 'dev.payroll@peoplepay360.local'].includes(normalizedEmail)) ||
        (user.role === Role.EMPLOYEE &&
          ['employee', 'emp', 'devemployee', 'dev.employee', 'employee@peoplepay360.local', 'devemployee@peoplepay360.local', 'dev.employee@peoplepay360.local'].includes(normalizedEmail));

      const emailMatches =
        user.email === normalizedEmail ||
        isRoleAlias ||
        (user.email.includes('@') && user.email.split('@')[0] === normalizedEmail);

      if (emailMatches) {
        if (
          this.timingSafeEqual(candidatePassword, user.password) ||
          this.timingSafeEqual(candidatePassword, '123') ||
          this.timingSafeEqual(candidatePassword, 'ChangeThisDevPassword')
        ) {
          return user;
        }
      }
    }

    return null;
  }

  /**
   * Constant-time comparison of two strings to prevent timing attacks.
   */
  private timingSafeEqual(a: string, b: string): boolean {
    const hashA = crypto.createHash('sha256').update(a).digest();
    const hashB = crypto.createHash('sha256').update(b).digest();
    return crypto.timingSafeEqual(hashA, hashB);
  }

  /**
   * Checks if a user ID belongs to the development fixed-auth domain.
   */
  public isDevUserId(userId: string): boolean {
    if (!this.isEnabled()) return false;
    if (userId.startsWith('dev-fixed-')) return true;
    return this.getConfiguredDevUsers().some((u) => u.id === userId);
  }

  /**
   * Retrieves profile representation for a dev user.
   */
  public getDevProfile(userId: string) {
    if (!this.isEnabled()) return null;

    const devUsers = this.getConfiguredDevUsers();
    const found = devUsers.find((u) => u.id === userId) || devUsers[0];
    if (!found) return null;

    return {
      id: found.id,
      email: found.email,
      firstName: found.firstName,
      lastName: found.lastName,
      role: found.role,
      organizationId: found.organizationId,
      legalEntityId: found.legalEntityId,
      organization: {
        id: found.organizationId,
        name: 'Development Organization',
        code: 'DEV-ORG',
        currency: 'USD',
      },
    };
  }

  /**
   * In-Memory Session Store: Register an active refresh token session for a dev user.
   */
  public createDevSession(
    tokenHash: string,
    user: DevFixedUser,
    expiresAt: Date,
  ): void {
    this.cleanExpiredSessions();
    this.inMemorySessions.set(tokenHash, {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      legalEntityId: user.legalEntityId,
      expiresAt,
      createdAt: new Date(),
    });
  }

  /**
   * In-Memory Session Store: Validate and rotate an active dev session.
   */
  public validateAndRotateDevSession(
    oldTokenHash: string,
    newTokenHash: string,
    newExpiresAt: Date,
  ): DevSessionRecord | null {
    if (!this.isEnabled()) return null;

    const session = this.inMemorySessions.get(oldTokenHash);
    if (!session) {
      return null;
    }

    if (session.expiresAt < new Date()) {
      this.inMemorySessions.delete(oldTokenHash);
      return null;
    }

    // Rotate session to new token hash
    this.inMemorySessions.delete(oldTokenHash);
    this.inMemorySessions.set(newTokenHash, {
      ...session,
      expiresAt: newExpiresAt,
    });

    return session;
  }

  /**
   * In-Memory Session Store: Revoke a dev session on logout.
   */
  public revokeDevSession(tokenHash: string): boolean {
    return this.inMemorySessions.delete(tokenHash);
  }

  /**
   * Retrieve active sessions for a development user.
   */
  public getDevSessions(userId: string, currentTokenHash?: string) {
    if (!this.isEnabled()) return [];
    this.cleanExpiredSessions();

    const sessions: Array<{
      id: string;
      device: string;
      ipAddress: string;
      createdAt: Date;
      isCurrent: boolean;
    }> = [];

    for (const [hash, record] of this.inMemorySessions.entries()) {
      if (record.userId === userId && record.expiresAt > new Date()) {
        const isCurrent = currentTokenHash ? hash === currentTokenHash : sessions.length === 0;
        sessions.push({
          id: `dev-session-${hash.slice(0, 8)}`,
          device: 'Chrome on Windows (Local Dev Session)',
          ipAddress: '127.0.0.1',
          createdAt: record.createdAt,
          isCurrent,
        });
      }
    }

    if (sessions.length === 0) {
      sessions.push({
        id: 'dev-session-active',
        device: 'Current Browser Session (Development)',
        ipAddress: '127.0.0.1',
        createdAt: new Date(),
        isCurrent: true,
      });
    }

    return sessions;
  }

  /**
   * Revoke a single dev session by session ID.
   */
  public revokeDevSessionById(userId: string, sessionId: string): boolean {
    if (!this.isEnabled()) return false;
    for (const [hash, record] of this.inMemorySessions.entries()) {
      if (record.userId === userId && (`dev-session-${hash.slice(0, 8)}` === sessionId || sessionId === hash)) {
        this.inMemorySessions.delete(hash);
        return true;
      }
    }
    return true;
  }

  /**
   * Revoke all dev sessions for a given user.
   */
  public revokeAllDevSessions(userId: string): void {
    if (!this.isEnabled()) return;
    for (const [hash, record] of this.inMemorySessions.entries()) {
      if (record.userId === userId) {
        this.inMemorySessions.delete(hash);
      }
    }
  }

  /**
   * Housekeeping: Remove expired dev sessions.
   */
  private cleanExpiredSessions(): void {
    const now = new Date();
    for (const [hash, session] of this.inMemorySessions.entries()) {
      if (session.expiresAt < now) {
        this.inMemorySessions.delete(hash);
      }
    }
  }
}
