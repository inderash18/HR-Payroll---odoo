import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { userRepository } from '../repositories/user.repository.js';
import { organizationRepository } from '../repositories/organization.repository.js';
import { prisma } from '../config/prisma.js';
import { parseUserAgent } from '../utils/user-agent.js';

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      legalEntityId: user.legalEntityId || null,
      role: user.role,
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
  );
}

function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

export const authService = {
  async registerOrganization(dto) {
    return prisma.$transaction(async (tx) => {
      const existingOrg = await tx.organization.findUnique({
        where: { code: dto.organizationCode },
      });
      if (existingOrg) {
        throw new Error('Organization code already exists');
      }

      const organization = await tx.organization.create({
        data: {
          name: dto.organizationName,
          code: dto.organizationCode,
        },
      });

      const passwordHash = await bcrypt.hash(dto.password, 10);
      const user = await tx.user.create({
        data: {
          organizationId: organization.id,
          email: dto.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: 'ADMIN',
          isEmailVerified: true,
        },
      });

      const accessToken = generateAccessToken(user);
      const rawRefreshToken = generateRefreshToken();
      const tokenHash = hashToken(rawRefreshToken);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await tx.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      return {
        accessToken,
        refreshToken: rawRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organization: { id: organization.id, name: organization.name, code: organization.code },
        },
      };
    });
  },

  async login(dto, meta = {}) {
    let user = await userRepository.findByEmailGlobal(dto.email);

    // Fixed Development Auth Fallback if active and user not found in DB
    if (!user && env.DEV_FIXED_AUTH_ENABLED) {
      const isFixedAdmin =
        dto.email.toLowerCase() === env.DEV_FIXED_AUTH_EMAIL?.toLowerCase() &&
        dto.password === env.DEV_FIXED_AUTH_PASSWORD;

      if (isFixedAdmin) {
        let devOrg = await organizationRepository.findByCode('PP360-IND');
        if (!devOrg) {
          devOrg = await organizationRepository.create({
            name: 'PeoplePay360 India Private Limited',
            code: 'PP360-IND',
          });
        }

        user = await userRepository.findByEmail(devOrg.id, dto.email);
        if (!user) {
          const passwordHash = await bcrypt.hash(dto.password, 10);
          user = await userRepository.create({
            organizationId: devOrg.id,
            email: dto.email,
            passwordHash,
            firstName: env.DEV_FIXED_AUTH_NAME || 'Aarav',
            lastName: 'Sharma',
            role: env.DEV_FIXED_AUTH_ROLE || 'ADMIN',
            isEmailVerified: true,
          });
        }
      }
    }

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('This user account has been deactivated. Please contact your administrator.');
    }

    if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
      const remainingMinutes = Math.ceil((new Date(user.lockoutUntil) - Date.now()) / (1000 * 60));
      throw new Error(`Account temporarily locked. Please try again in ${remainingMinutes} minute(s).`);
    }

    const isDevPassword =
      env.DEV_FIXED_AUTH_ENABLED &&
      dto.password === env.DEV_FIXED_AUTH_PASSWORD;

    const isValidPassword = isDevPassword || (await bcrypt.compare(dto.password, user.passwordHash));
    if (!isValidPassword) {
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      let lockoutUntil = null;
      if (failedAttempts >= 5) {
        lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lockout
      }

      await userRepository.update(user.id, {
        failedLoginAttempts: failedAttempts,
        lockoutUntil,
      });

      throw new Error('Invalid email or password');
    }

    // Reset failed attempts & update last login
    await userRepository.update(user.id, {
      failedLoginAttempts: 0,
      lockoutUntil: null,
      lastLoginAt: new Date(),
    });

    const accessToken = generateAccessToken(user);
    const rawRefreshToken = generateRefreshToken();
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await userRepository.createRefreshToken({
      userId: user.id,
      tokenHash,
      expiresAt,
      ipAddress: meta.ipAddress || null,
      userAgent: meta.userAgent || null,
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organization: user.organization
          ? { id: user.organization.id, name: user.organization.name, code: user.organization.code }
          : null,
      },
    };
  },

  async refreshTokens(rawRefreshToken, meta = {}) {
    if (!rawRefreshToken) {
      throw new Error('Missing refresh token');
    }

    const tokenHash = hashToken(rawRefreshToken);
    const existingToken = await userRepository.findRefreshToken(tokenHash);

    if (!existingToken) {
      throw new Error('Invalid refresh token');
    }

    // Reuse detection: if token is already revoked, revoke the whole family
    if (existingToken.revokedAt) {
      await userRepository.revokeAllUserRefreshTokens(existingToken.userId);
      throw new Error('Compromised session detected. Please log in again.');
    }

    if (new Date(existingToken.expiresAt) < new Date()) {
      throw new Error('Refresh token has expired. Please log in again.');
    }

    const user = existingToken.user;
    if (!user || !user.isActive) {
      throw new Error('User account is inactive or not found');
    }

    const newAccessToken = generateAccessToken(user);
    const newRawRefreshToken = generateRefreshToken();
    const newTokenHash = hashToken(newRawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.$transaction(async (tx) => {
      await userRepository.revokeRefreshToken(existingToken.id, newTokenHash, tx);
      await userRepository.createRefreshToken(
        {
          userId: user.id,
          tokenHash: newTokenHash,
          expiresAt,
          ipAddress: meta.ipAddress || existingToken.ipAddress,
          userAgent: meta.userAgent || existingToken.userAgent,
        },
        tx
      );
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organization: user.organization
          ? { id: user.organization.id, name: user.organization.name, code: user.organization.code }
          : null,
      },
    };
  },

  async logout(rawRefreshToken) {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      const existingToken = await userRepository.findRefreshToken(tokenHash);
      if (existingToken && !existingToken.revokedAt) {
        await userRepository.revokeRefreshToken(existingToken.id);
      }
    }
  },

  async logoutAll(userId) {
    await userRepository.revokeAllUserRefreshTokens(userId);
    return { message: 'All active sessions have been terminated' };
  },

  async getProfile(userId) {
    const user = await userRepository.findById(null, userId);
    if (!user) throw new Error('User not found');
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      organization: user.organization
        ? { id: user.organization.id, name: user.organization.name, code: user.organization.code }
        : null,
      employee: user.employee
        ? { id: user.employee.id, employeeNum: user.employee.employeeNum }
        : null,
    };
  },

  async getUserSessions(userId, currentRefreshToken) {
    const sessions = await userRepository.findActiveUserSessions(userId);
    const currentHash = currentRefreshToken ? hashToken(currentRefreshToken) : null;

    return sessions.map((s) => ({
      id: s.id,
      device: parseUserAgent(s.userAgent),
      ipAddress: s.ipAddress || 'Unknown IP',
      createdAt: s.createdAt,
      isCurrent: s.tokenHash === currentHash,
    }));
  },

  async revokeSession(userId, sessionId) {
    const session = await prisma.refreshToken.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) throw new Error('Session not found');
    await userRepository.revokeRefreshToken(sessionId);
    return { message: 'Session revoked successfully' };
  },

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await userRepository.findById(null, userId);
    if (!user) throw new Error('User not found');

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) throw new Error('Incorrect current password');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await userRepository.update(user.id, { passwordHash });
    await userRepository.revokeAllUserRefreshTokens(user.id);

    return { message: 'Password changed successfully. Please log in again.' };
  },

  async requestPasswordReset({ organizationCode, email }) {
    const org = await organizationRepository.findByCode(organizationCode);
    if (!org) return { message: 'If the account exists, a reset link will be sent.' };

    const user = await userRepository.findByEmail(org.id, email);
    if (!user) return { message: 'If the account exists, a reset link will be sent.' };

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await userRepository.createPasswordResetToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    // In dev / local testing: token can be checked via logs or seed
    console.log(`[AUTH] Password reset token for ${email}: ${rawToken}`);

    return { message: 'If the account exists, a reset token has been dispatched.' };
  },

  async confirmPasswordReset({ token, newPassword }) {
    const tokenHash = hashToken(token);
    const resetRecord = await userRepository.findPasswordResetToken(tokenHash);

    if (!resetRecord || resetRecord.usedAt || new Date(resetRecord.expiresAt) < new Date()) {
      throw new Error('Invalid or expired password reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction(async (tx) => {
      await userRepository.update(resetRecord.userId, { passwordHash }, tx);
      await userRepository.markPasswordResetTokenUsed(resetRecord.id, tx);
      await userRepository.revokeAllUserRefreshTokens(resetRecord.userId, tx);
    });

    return { message: 'Password has been reset successfully. Please log in with your new password.' };
  },
};
