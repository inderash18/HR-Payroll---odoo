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
import { DepartmentsModule } from '@modules/departments/departments.module';
import { EmployeesModule } from '@modules/employees/employees.module';
import { SchedulesModule } from '@modules/schedules/schedules.module';
import { ContractsModule } from '@modules/contracts/contracts.module';
import { PayrollModule } from '@modules/payroll/payroll.module';
import { LeavesModule } from '@modules/leaves/leaves.module';
import { AttendanceModule } from '@modules/attendance/attendance.module';
import { DashboardModule } from '@modules/dashboard/dashboard.module';

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
    DepartmentsModule,
    EmployeesModule,
    SchedulesModule,
    ContractsModule,
    PayrollModule,
    LeavesModule,
    AttendanceModule,
    DashboardModule,
  ],
})
export class AppModule {}


