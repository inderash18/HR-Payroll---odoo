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
import { EmployeesService } from './employees.service';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  EmployeeQueryDto,
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeQuerySchema,
} from './dto/employee.dto';
import { ZodValidationPipe } from '@common/validation/zod-validation.pipe';

@ApiTags('Employees')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @ApiOperation({ summary: 'Create a new employee profile' })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  async create(
    @Req() req: any,
    @Body(new ZodValidationPipe(createEmployeeSchema)) dto: CreateEmployeeDto,
  ) {
    return this.employeesService.create(req.user.organizationId, dto, req.user.id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.HR_MANAGER, Role.HR_PAYROLL_USER, Role.HR_PAYROLL_MANAGER)
  @ApiOperation({ summary: 'List employees with pagination and filters' })
  async list(
    @Req() req: any,
    @Query(new ZodValidationPipe(employeeQuerySchema)) query: EmployeeQueryDto,
  ) {
    return this.employeesService.list(req.user.organizationId, query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.HR_MANAGER, Role.HR_PAYROLL_USER, Role.HR_PAYROLL_MANAGER)
  @ApiOperation({ summary: 'Get employee details by ID' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.employeesService.findById(req.user.organizationId, id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @ApiOperation({ summary: 'Update an existing employee profile' })
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateEmployeeSchema)) dto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(req.user.organizationId, id, dto, req.user.id);
  }
}
