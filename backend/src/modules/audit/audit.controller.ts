import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { auditQuerySchema, AuditQueryDto } from './dto/audit.dto';
import { ZodValidationPipe } from '@common/validation/zod-validation.pipe';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/auth/decorators/auth.decorator';
import { Role } from '@prisma/client';

@ApiTags('Audit Logs')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get paginated audit logs for an organization' })
  @ApiResponse({ status: 200, description: 'List of audit log entries' })
  async getAuditLogs(
    @Req() req: any,
    @Query(new ZodValidationPipe(auditQuerySchema)) query: AuditQueryDto,
  ) {
    return this.auditService.findByQuery({
      ...query,
      organizationId: req.user.organizationId,
    });
  }
}
