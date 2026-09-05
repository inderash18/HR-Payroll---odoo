import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['error', 'warn']
          : ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to PostgreSQL database via Prisma');
    } catch (error) {
      if (process.env.NODE_ENV === 'production') {
        this.logger.error('Failed to connect to PostgreSQL database in production', error);
        throw error;
      } else {
        this.logger.warn(
          '⚠️ Could not connect to PostgreSQL database on startup. Backend started in development mode (fixed-auth fallback available if configured).',
        );
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma database connection disconnected');
  }

  /**
   * Helper to execute transactional operations with explicit isolation level if needed
   */
  async runInTransaction<T>(
    fn: (tx: PrismaClient) => Promise<T>,
    options?: { timeout?: number; maxWait?: number },
  ): Promise<T> {
    return this.$transaction(async (tx) => {
      return fn(tx as PrismaClient);
    }, options);
  }
}
