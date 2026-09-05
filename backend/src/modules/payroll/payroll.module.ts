import { Module } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { PayrollEngineService } from './payroll-engine.service';
import { PayrollController } from './payroll.controller';
import { OutboxModule } from '@modules/outbox/outbox.module';

@Module({
  imports: [OutboxModule],
  controllers: [PayrollController],
  providers: [PayrollService, PayrollEngineService],
  exports: [PayrollService, PayrollEngineService],
})
export class PayrollModule {}
