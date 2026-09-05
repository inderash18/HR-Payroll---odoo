import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  services: {
    database: { status: 'up' | 'down'; latencyMs?: number; error?: string };
    memory: { rss: number; heapUsed: number; heapTotal: number };
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async checkReadiness(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    let dbStatus: 'up' | 'down' = 'down';
    let dbLatency: number | undefined = undefined;
    let dbError: string | undefined = undefined;

    try {
      await this.prisma.$queryRawUnsafe('SELECT 1');
      dbStatus = 'up';
      dbLatency = Date.now() - startTime;
    } catch (err: unknown) {
      dbStatus = 'down';
      dbError = err instanceof Error ? err.message : 'Unknown database error';
      this.logger.error('Health check database connection failed', err);
    }

    const memoryUsage = process.memoryUsage();

    return {
      status: dbStatus === 'up' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: {
          status: dbStatus,
          ...(dbLatency !== undefined ? { latencyMs: dbLatency } : {}),
          ...(dbError ? { error: dbError } : {}),
        },
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        },
      },
    };
  }

  checkLiveness(): { status: 'ok'; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
