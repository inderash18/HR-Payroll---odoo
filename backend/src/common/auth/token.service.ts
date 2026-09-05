import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { env } from '@common/config/env.config';
import { JwtPayload } from './interfaces/token-payload.interface';
import { UnauthorizedError } from '@common/errors/app-error';

@Injectable()
export class TokenService {
  signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
    });
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired access token');
    }
  }

  generateRefreshToken(): { rawToken: string; tokenHash: string; expiresAt: Date } {
    const rawToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    // Default 7 days expiration
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return { rawToken, tokenHash, expiresAt };
  }

  generateResetToken(): { rawToken: string; tokenHash: string; expiresAt: Date } {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    // 1 hour expiration for password reset
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    return { rawToken, tokenHash, expiresAt };
  }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
