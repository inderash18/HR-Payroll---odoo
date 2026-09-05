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

      devUsers.push({
        id: `dev-fixed-${env.DEV_FIXED_AUTH_ROLE.toLowerCase().replace(/_/g, '-')}`,
        email: env.DEV_FIXED_AUTH_EMAIL.trim().toLowerCase(),
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
      { role: Role.ADMIN, email: 'dev.admin@peoplepay360.local', name: 'Dev Admin' },
      { role: Role.HR_MANAGER, email: 'dev.hr@peoplepay360.local', name: 'Dev HR Manager' },
      { role: Role.HR_PAYROLL_MANAGER, email: 'dev.payroll@peoplepay360.local', name: 'Dev Payroll Manager' },
      { role: Role.EMPLOYEE, email: 'dev.employee@peoplepay360.local', name: 'Dev Employee' },
    ];

    for (const standard of standardRoles) {
      const alreadyExists = devUsers.some((u) => u.email === standard.email.toLowerCase());
      if (!alreadyExists) {
        const nameParts = standard.name.split(' ');
        devUsers.push({
          id: `dev-fixed-${standard.role.toLowerCase().replace(/_/g, '-')}`,
          email: standard.email.toLowerCase(),
          password: defaultPassword,
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
      if (user.email === normalizedEmail) {
        if (this.timingSafeEqual(candidatePassword, user.password)) {
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
