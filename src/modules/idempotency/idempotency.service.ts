import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { IdempotencyConflictError } from '@common/errors/app-error';
import * as crypto from 'crypto';
import { Prisma } from '@prisma/client';

export interface IdempotencyCheckResult {
  isCached: boolean;
  statusCode?: number;
  responseBody?: unknown;
}

@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);

  constructor(private readonly prisma: PrismaService) {}

  hashPayload(payload: unknown): string {
    const stringified = typeof payload === 'string' ? payload : JSON.stringify(payload || {});
    return crypto.createHash('sha256').update(stringified).digest('hex');
  }

  async acquireLockOrGetCached(
    key: string,
    organizationId: string,
    userId: string | null,
    requestPath: string,
    bodyHash: string,
    ttlSeconds = 300,
  ): Promise<IdempotencyCheckResult> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    try {
      const existing = await this.prisma.idempotencyKey.findUnique({
        where: { key },
      });

      if (existing) {
        // If request payload hash or path does not match, conflict
        if (existing.requestBodyHash !== bodyHash || existing.requestPath !== requestPath) {
          throw new IdempotencyConflictError(
            'Idempotency key has already been used with different request parameters',
          );
        }

        // If response is already stored and finished
        if (existing.statusCode !== null && existing.responseBody !== null) {
          return {
            isCached: true,
            statusCode: existing.statusCode,
            responseBody: existing.responseBody,
          };
        }

        // Still in progress / locked
        const isLockExpired = existing.expiresAt < new Date();
        if (!isLockExpired) {
          throw new IdempotencyConflictError(
            'A request with this idempotency key is currently being processed',
          );
        }

        // Lock expired, update lock
        await this.prisma.idempotencyKey.update({
          where: { key },
          data: {
            lockedAt: new Date(),
            expiresAt,
            statusCode: null,
            responseBody: Prisma.DbNull,
          },
        });

        return { isCached: false };
      }

      // Create new lock
      await this.prisma.idempotencyKey.create({
        data: {
          key,
          organizationId,
          userId,
          requestPath,
          requestBodyHash: bodyHash,
          expiresAt,
        },
      });

      return { isCached: false };
    } catch (error) {
      if (error instanceof IdempotencyConflictError) {
        throw error;
      }
      this.logger.error(`Error processing idempotency key: ${key}`, error);
      throw error;
    }
  }

  async saveResponse(
    key: string,
    statusCode: number,
    responseBody: unknown,
  ): Promise<void> {
    try {
      await this.prisma.idempotencyKey.update({
        where: { key },
        data: {
          statusCode,
          responseBody: responseBody ? (responseBody as Prisma.InputJsonValue) : Prisma.DbNull,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to save idempotency response for key: ${key}`, error);
    }
  }
}
