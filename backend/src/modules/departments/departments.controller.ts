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
import { DepartmentsService } from './departments.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  DepartmentQueryDto,
  createDepartmentSchema,
  updateDepartmentSchema,
  departmentQuerySchema,
} from './dto/department.dto';
import { ZodValidationPipe } from '@common/validation/zod-validation.pipe';

@ApiTags('Departments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  async create(
    @Req() req: any,
    @Body(new ZodValidationPipe(createDepartmentSchema)) dto: CreateDepartmentDto,
  ) {
    return this.departmentsService.create(req.user.organizationId, dto, req.user.id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.HR_MANAGER, Role.HR_PAYROLL_USER, Role.HR_PAYROLL_MANAGER)
  @ApiOperation({ summary: 'List departments with pagination and search' })
  async list(
    @Req() req: any,
    @Query(new ZodValidationPipe(departmentQuerySchema)) query: DepartmentQueryDto,
  ) {
    return this.departmentsService.list(req.user.organizationId, query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.HR_MANAGER, Role.HR_PAYROLL_USER, Role.HR_PAYROLL_MANAGER)
  @ApiOperation({ summary: 'Get department details by ID' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.departmentsService.findById(req.user.organizationId, id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @ApiOperation({ summary: 'Update an existing department' })
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateDepartmentSchema)) dto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(req.user.organizationId, id, dto, req.user.id);
  }
}
