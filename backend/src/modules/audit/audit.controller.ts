import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { auditQuerySchema, AuditQueryDto } from './dto/audit.dto';
import { ZodValidationPipe } from '@common/validation/zod-validation.pipe';

@ApiTags('Audit Logs')
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @UsePipes(new ZodValidationPipe(auditQuerySchema))
  @ApiOperation({ summary: 'Get paginated audit logs for an organization' })
  @ApiResponse({ status: 200, description: 'List of audit log entries' })
  async getAuditLogs(@Query() query: AuditQueryDto) {
    return this.auditService.findByQuery(query);
  }
}
