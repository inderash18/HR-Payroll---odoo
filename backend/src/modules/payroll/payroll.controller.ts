import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/auth/decorators/auth.decorator';
import { Role } from '@prisma/client';
import { PayrollService } from './payroll.service';
import {
  CreateSalaryStructureDto,
  CreateSalaryRuleDto,
  CreatePayrunDto,
  PayrunQueryDto,
  createSalaryStructureSchema,
  createSalaryRuleSchema,
  createPayrunSchema,
  payrunQuerySchema,
} from './dto/payroll.dto';
import { ZodValidationPipe } from '@common/validation/zod-validation.pipe';

@ApiTags('Payroll')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  // ----------------------------------------------------
  // SALARY STRUCTURES & RULES
  // ----------------------------------------------------
  @Post('structures')
  @Roles(Role.ADMIN, Role.HR_PAYROLL_MANAGER)
  @ApiOperation({ summary: 'Create a salary structure' })
  async createStructure(
    @Req() req: any,
    @Body(new ZodValidationPipe(createSalaryStructureSchema)) dto: CreateSalaryStructureDto,
  ) {
    return this.payrollService.createStructure(req.user.organizationId, dto, req.user.id);
  }

  @Get('structures')
  @Roles(Role.ADMIN, Role.HR_MANAGER, Role.HR_PAYROLL_USER, Role.HR_PAYROLL_MANAGER)
  @ApiOperation({ summary: 'List salary structures with rules' })
  async listStructures(@Req() req: any) {
    return this.payrollService.listStructures(req.user.organizationId);
  }

  @Post('rules')
  @Roles(Role.ADMIN, Role.HR_PAYROLL_MANAGER)
  @ApiOperation({ summary: 'Create a salary rule within a structure' })
  async createRule(
    @Req() req: any,
    @Body(new ZodValidationPipe(createSalaryRuleSchema)) dto: CreateSalaryRuleDto,
  ) {
    return this.payrollService.createRule(req.user.organizationId, dto, req.user.id);
  }

  // ----------------------------------------------------
  // PAYRUN MANAGMENT & EXECUTION
  // ----------------------------------------------------
  @Post('payruns')
  @Roles(Role.ADMIN, Role.HR_PAYROLL_MANAGER)
  @ApiOperation({ summary: 'Create a new payrun batch (Draft status)' })
  async createPayrun(
    @Req() req: any,
    @Body(new ZodValidationPipe(createPayrunSchema)) dto: CreatePayrunDto,
  ) {
    return this.payrollService.createPayrun(req.user.organizationId, dto, req.user.id);
  }

  @Get('payruns')
  @Roles(Role.ADMIN, Role.HR_MANAGER, Role.HR_PAYROLL_USER, Role.HR_PAYROLL_MANAGER)
  @ApiOperation({ summary: 'List payruns with pagination and filter' })
  async listPayruns(
    @Req() req: any,
    @Query(new ZodValidationPipe(payrunQuerySchema)) query: PayrunQueryDto,
  ) {
    return this.payrollService.listPayruns(req.user.organizationId, query);
  }

  @Get('payruns/:id')
  @Roles(Role.ADMIN, Role.HR_MANAGER, Role.HR_PAYROLL_USER, Role.HR_PAYROLL_MANAGER)
  @ApiOperation({ summary: 'Get payrun details with calculated payslips' })
  async findPayrun(@Req() req: any, @Param('id') id: string) {
    return this.payrollService.findPayrunById(req.user.organizationId, id);
  }

  @Post('payruns/:id/compute')
  @Roles(Role.ADMIN, Role.HR_PAYROLL_MANAGER)
  @ApiOperation({ summary: 'Compute salary rules and render payslips for payrun' })
  async computePayrun(@Req() req: any, @Param('id') id: string) {
    return this.payrollService.computePayrun(req.user.organizationId, id, req.user.id);
  }

  @Post('payruns/:id/validate')
  @Roles(Role.ADMIN, Role.HR_PAYROLL_MANAGER)
  @ApiOperation({ summary: 'Validate payrun calculations' })
  async validatePayrun(@Req() req: any, @Param('id') id: string) {
    return this.payrollService.validatePayrun(req.user.organizationId, id, req.user.id);
  }

  @Post('payruns/:id/pay')
  @Roles(Role.ADMIN, Role.HR_PAYROLL_MANAGER)
  @ApiOperation({ summary: 'Mark payrun as Paid and trigger outbox events' })
  async markPayrunPaid(@Req() req: any, @Param('id') id: string) {
    return this.payrollService.markPayrunPaid(req.user.organizationId, id, req.user.id);
  }
}
