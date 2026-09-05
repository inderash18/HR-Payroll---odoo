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
import { ContractsService } from './contracts.service';
import {
  CreateContractDto,
  UpdateContractDto,
  ContractQueryDto,
  createContractSchema,
  updateContractSchema,
  contractQuerySchema,
} from './dto/contract.dto';
import { ZodValidationPipe } from '@common/validation/zod-validation.pipe';

@ApiTags('Contracts')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.HR_MANAGER, Role.HR_PAYROLL_MANAGER)
  @ApiOperation({ summary: 'Create an employment contract' })
  @ApiResponse({ status: 201, description: 'Contract created successfully' })
  async create(
    @Req() req: any,
    @Body(new ZodValidationPipe(createContractSchema)) dto: CreateContractDto,
  ) {
    return this.contractsService.create(req.user.organizationId, dto, req.user.id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.HR_MANAGER, Role.HR_PAYROLL_USER, Role.HR_PAYROLL_MANAGER)
  @ApiOperation({ summary: 'List contracts with pagination and filters' })
  async list(
    @Req() req: any,
    @Query(new ZodValidationPipe(contractQuerySchema)) query: ContractQueryDto,
  ) {
    return this.contractsService.list(req.user.organizationId, query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.HR_MANAGER, Role.HR_PAYROLL_USER, Role.HR_PAYROLL_MANAGER)
  @ApiOperation({ summary: 'Get contract details by ID' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.contractsService.findById(req.user.organizationId, id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.HR_MANAGER, Role.HR_PAYROLL_MANAGER)
  @ApiOperation({ summary: 'Update an employment contract' })
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateContractSchema)) dto: UpdateContractDto,
  ) {
    return this.contractsService.update(req.user.organizationId, id, dto, req.user.id);
  }
}
