import { Module } from '@nestjs/common';
import { DatabaseModule } from '@common/database/database.module';
import { AuthCommonModule } from '@common/auth/auth-common.module';
import { HealthModule } from '@modules/health/health.module';
import { AuditModule } from '@modules/audit/audit.module';
import { IdempotencyModule } from '@modules/idempotency/idempotency.module';
import { OutboxModule } from '@modules/outbox/outbox.module';
import { AuthModule } from '@modules/auth/auth.module';
import { OrganizationsModule } from '@modules/organizations/organizations.module';
import { LegalEntitiesModule } from '@modules/legal-entities/legal-entities.module';
import { UsersModule } from '@modules/users/users.module';

@Module({
  imports: [
    DatabaseModule,
    AuthCommonModule,
    HealthModule,
    AuditModule,
    IdempotencyModule,
    OutboxModule,
    AuthModule,
    OrganizationsModule,
    LegalEntitiesModule,
    UsersModule,
  ],
})
export class AppModule {}
