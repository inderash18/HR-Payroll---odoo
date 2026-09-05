import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { OutboxStatus, Prisma } from '@prisma/client';

export interface PublishOutboxEventDto {
  organizationId: string;
  eventType: string;
  payload: Record<string, unknown>;
}

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Insert event into outbox table, typically as part of an existing transaction
   */
  async publish(dto: PublishOutboxEventDto, tx?: Prisma.TransactionClient): Promise<string> {
    const client = tx || this.prisma;
    const event = await client.outboxEvent.create({
      data: {
        organizationId: dto.organizationId,
        eventType: dto.eventType,
        payload: dto.payload as Prisma.InputJsonValue,
        status: OutboxStatus.PENDING,
      },
    });
    return event.id;
  }

  /**
   * Fetch pending outbox events for background dispatcher
   */
  async fetchPendingEvents(batchSize = 50) {
    return this.prisma.outboxEvent.findMany({
      where: {
        status: OutboxStatus.PENDING,
        retryCount: { lt: 5 },
      },
      take: batchSize,
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Mark event as processed or failed
   */
  async markProcessed(id: string): Promise<void> {
    await this.prisma.outboxEvent.update({
      where: { id },
      data: {
        status: OutboxStatus.COMPLETED,
        processedAt: new Date(),
      },
    });
  }

  async markFailed(id: string, errorMessage: string): Promise<void> {
    await this.prisma.outboxEvent.update({
      where: { id },
      data: {
        status: OutboxStatus.FAILED,
        retryCount: { increment: 1 },
        lastError: errorMessage,
      },
    });
  }
}
