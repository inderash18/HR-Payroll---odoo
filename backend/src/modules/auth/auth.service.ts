import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { TokenService } from '@common/auth/token.service';
import { AuditService } from '@modules/audit/audit.service';
import { OutboxService } from '@modules/outbox/outbox.service';
import * as bcrypt from 'bcrypt';
import {
  LoginDto,
  RegisterDto,
  RequestPasswordResetDto,
  ConfirmPasswordResetDto,
  ChangePasswordDto,
} from './dto/auth.dto';
import {
  UnauthorizedError,
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@common/errors/app-error';
import { Role } from '@prisma/client';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    organizationId: string;
    legalEntityId?: string | null;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly auditService: AuditService,
    private readonly outboxService: OutboxService,
  ) {}

  async registerOrganization(dto: RegisterDto): Promise<AuthTokens> {
    const existingOrg = await this.prisma.organization.findUnique({
      where: { code: dto.organizationCode },
    });

    if (existingOrg) {
      throw new ConflictError(
        `Organization with code '${dto.organizationCode}' already exists`,
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.runInTransaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: dto.organizationName,
          code: dto.organizationCode,
          currency: dto.currency,
          timezone: dto.timezone,
        },
      });

      const user = await tx.user.create({
        data: {
          organizationId: org.id,
          email: dto.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: Role.ADMIN,
          isEmailVerified: true,
        },
      });

      await this.auditService.log(
        {
          organizationId: org.id,
          userId: user.id,
          action: 'ORGANIZATION_REGISTERED',
          entityType: 'Organization',
          entityId: org.id,
          newValues: { name: org.name, code: org.code, adminEmail: user.email },
        },
        tx,
      );

      const { rawToken, tokenHash, expiresAt } =
        this.tokenService.generateRefreshToken();

      await tx.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      const accessToken = this.tokenService.signAccessToken({
        sub: user.id,
        email: user.email,
        organizationId: org.id,
        legalEntityId: null,
        role: user.role,
      });

      return {
        accessToken,
        refreshToken: rawToken,
        expiresIn: '15m',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organizationId: org.id,
          legalEntityId: null,
        },
      };
    });
  }

  async login(
    dto: LoginDto,
    meta?: { ipAddress?: string; userAgent?: string },
  ): Promise<AuthTokens> {
    let org: any;
    let user: any;

    if (dto.organizationCode) {
      org = await this.prisma.organization.findUnique({
        where: { code: dto.organizationCode },
      });

      if (!org) {
        throw new UnauthorizedError('Invalid credentials or organization code');
      }

      user = await this.prisma.user.findUnique({
        where: {
          organizationId_email: {
            organizationId: org.id,
            email: dto.email,
          },
        },
      });
    } else {
      user = await this.prisma.user.findFirst({
        where: { email: dto.email },
        include: { organization: true },
      });

      if (user) {
        org = user.organization;
      }
    }

    if (!user || !user.isActive || !org) {
      throw new UnauthorizedError('Invalid credentials or account deactivated');
    }

    // Check account lockout
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockoutUntil.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedError(
        `Account is temporarily locked. Try again in ${remainingMinutes} minute(s).`,
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      const failedAttempts = user.failedLoginAttempts + 1;
      let lockoutUntil: Date | null = null;

      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        lockoutUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
        this.logger.warn(`User ${user.email} locked out after ${failedAttempts} failed attempts`);
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
          lockoutUntil,
        },
      });

      await this.auditService.log({
        organizationId: org.id,
        userId: user.id,
        action: 'LOGIN_FAILED',
        entityType: 'User',
        entityId: user.id,
        oldValues: { failedAttempts },
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      });

      throw new UnauthorizedError('Invalid credentials');
    }

    // Reset failed attempts & issue tokens
    const { rawToken, tokenHash, expiresAt } =
      this.tokenService.generateRefreshToken();

    await this.prisma.runInTransaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockoutUntil: null,
          lastLoginAt: new Date(),
        },
      });

      await tx.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
          ipAddress: meta?.ipAddress || null,
          userAgent: meta?.userAgent || null,
        },
      });

      await this.auditService.log(
        {
          organizationId: org.id,
          userId: user.id,
          action: 'LOGIN_SUCCESS',
          entityType: 'User',
          entityId: user.id,
          ipAddress: meta?.ipAddress,
          userAgent: meta?.userAgent,
        },
        tx,
      );
    });

    const accessToken = this.tokenService.signAccessToken({
      sub: user.id,
      email: user.email,
      organizationId: org.id,
      legalEntityId: user.legalEntityId,
      role: user.role,
    });

    return {
      accessToken,
      refreshToken: rawToken,
      expiresIn: '15m',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: org.id,
        legalEntityId: user.legalEntityId,
      },
    };
  }

  async refreshTokens(
    rawRefreshToken: string,
    meta?: { ipAddress?: string; userAgent?: string },
  ): Promise<AuthTokens> {
    if (!rawRefreshToken) {
      throw new UnauthorizedError('Refresh token required');
    }

    const tokenHash = this.tokenService.hashToken(rawRefreshToken);

    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: { organization: true },
        },
      },
    });

    if (!tokenRecord) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Token reuse detection: if a revoked token is used, suspect breach and revoke all tokens for this user!
    if (tokenRecord.revokedAt !== null) {
      this.logger.error(
        `🚨 Refresh token replay attack detected for user ${tokenRecord.userId}! Revoking all sessions.`,
      );
      await this.prisma.refreshToken.updateMany({
        where: { userId: tokenRecord.userId },
        data: { revokedAt: new Date() },
      });

      await this.auditService.log({
        organizationId: tokenRecord.user.organizationId,
        userId: tokenRecord.userId,
        action: 'REFRESH_TOKEN_REPLAY_DETECTED',
        entityType: 'User',
        entityId: tokenRecord.userId,
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      });

      throw new UnauthorizedError('Session revoked due to security violation');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token expired');
    }

    if (!tokenRecord.user.isActive) {
      throw new UnauthorizedError('User account is deactivated');
    }

    // Rotate refresh token
    const newTokens = this.tokenService.generateRefreshToken();

    await this.prisma.runInTransaction(async (tx) => {
      // Revoke current token and link to new one
      await tx.refreshToken.update({
        where: { id: tokenRecord.id },
        data: {
          revokedAt: new Date(),
          replacedByTokenHash: newTokens.tokenHash,
        },
      });

      // Create new active refresh token
      await tx.refreshToken.create({
        data: {
          userId: tokenRecord.userId,
          tokenHash: newTokens.tokenHash,
          expiresAt: newTokens.expiresAt,
          ipAddress: meta?.ipAddress || null,
          userAgent: meta?.userAgent || null,
        },
      });
    });

    const accessToken = this.tokenService.signAccessToken({
      sub: tokenRecord.user.id,
      email: tokenRecord.user.email,
      organizationId: tokenRecord.user.organizationId,
      legalEntityId: tokenRecord.user.legalEntityId,
      role: tokenRecord.user.role,
    });

    return {
      accessToken,
      refreshToken: newTokens.rawToken,
      expiresIn: '15m',
      user: {
        id: tokenRecord.user.id,
        email: tokenRecord.user.email,
        firstName: tokenRecord.user.firstName,
        lastName: tokenRecord.user.lastName,
        role: tokenRecord.user.role,
        organizationId: tokenRecord.user.organizationId,
        legalEntityId: tokenRecord.user.legalEntityId,
      },
    };
  }

  async logout(rawRefreshToken: string): Promise<void> {
    if (!rawRefreshToken) return;

    const tokenHash = this.tokenService.hashToken(rawRefreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async requestPasswordReset(dto: RequestPasswordResetDto): Promise<{ message: string }> {
    const org = await this.prisma.organization.findUnique({
      where: { code: dto.organizationCode },
    });

    if (!org) {
      // Return generic message to prevent tenant enumeration
      return { message: 'If the account exists, a reset link has been dispatched.' };
    }

    const user = await this.prisma.user.findUnique({
      where: {
        organizationId_email: {
          organizationId: org.id,
          email: dto.email,
        },
      },
    });

    if (!user || !user.isActive) {
      return { message: 'If the account exists, a reset link has been dispatched.' };
    }

    const { rawToken, tokenHash, expiresAt } =
      this.tokenService.generateResetToken();

    await this.prisma.runInTransaction(async (tx) => {
      await tx.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      await this.outboxService.publish(
        {
          organizationId: org.id,
          eventType: 'USER_PASSWORD_RESET_REQUESTED',
          payload: {
            userId: user.id,
            email: user.email,
            resetToken: rawToken,
          },
        },
        tx,
      );

      await this.auditService.log(
        {
          organizationId: org.id,
          userId: user.id,
          action: 'PASSWORD_RESET_REQUESTED',
          entityType: 'User',
          entityId: user.id,
        },
        tx,
      );
    });

    return { message: 'If the account exists, a reset link has been dispatched.' };
  }

  async confirmPasswordReset(dto: ConfirmPasswordResetDto): Promise<{ message: string }> {
    const tokenHash = this.tokenService.hashToken(dto.token);

    const tokenRecord = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.usedAt !== null || tokenRecord.expiresAt < new Date()) {
      throw new BadRequestError('Invalid or expired password reset token');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.runInTransaction(async (tx) => {
      await tx.user.update({
        where: { id: tokenRecord.userId },
        data: {
          passwordHash,
          failedLoginAttempts: 0,
          lockoutUntil: null,
        },
      });

      await tx.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: new Date() },
      });

      // Revoke all existing sessions
      await tx.refreshToken.updateMany({
        where: { userId: tokenRecord.userId },
        data: { revokedAt: new Date() },
      });

      await this.auditService.log(
        {
          organizationId: tokenRecord.user.organizationId,
          userId: tokenRecord.userId,
          action: 'PASSWORD_RESET_COMPLETED',
          entityType: 'User',
          entityId: tokenRecord.userId,
        },
        tx,
      );
    });

    return { message: 'Password has been reset successfully. You can now login.' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestError('Current password does not match');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.runInTransaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { passwordHash },
      });

      // Revoke refresh tokens on password change
      await tx.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      await this.auditService.log(
        {
          organizationId: user.organizationId,
          userId: user.id,
          action: 'PASSWORD_CHANGED',
          entityType: 'User',
          entityId: user.id,
        },
        tx,
      );
    });

    return { message: 'Password updated successfully' };
  }
}
