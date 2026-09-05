import { Module } from '@nestjs/common';
import { DatabaseModule } from '@common/database/database.module';
import { HealthModule } from '@modules/health/health.module';
import { AuditModule } from '@modules/audit/audit.module';
import { IdempotencyModule } from '@modules/idempotency/idempotency.module';
import { OutboxModule } from '@modules/outbox/outbox.module';

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    AuditModule,
    IdempotencyModule,
    OutboxModule,
  ],
})
export class AppModule {}
