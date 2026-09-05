import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LegalEntitiesService } from './legal-entities.service';
import {
  createLegalEntitySchema,
  CreateLegalEntityDto,
  updateLegalEntitySchema,
  UpdateLegalEntityDto,
} from './dto/legal-entity.dto';
import { ZodValidationPipe } from '@common/validation/zod-validation.pipe';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles, CurrentUser } from '@common/auth/decorators/auth.decorator';
import { Role } from '@prisma/client';
import { AuthenticatedUser } from '@common/auth/interfaces/token-payload.interface';

@ApiTags('Legal Entities')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('legal-entities')
export class LegalEntitiesController {
  constructor(private readonly legalEntitiesService: LegalEntitiesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @ApiOperation({ summary: 'Create new legal entity for organization' })
  @ApiResponse({ status: 201, description: 'Legal entity created successfully' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createLegalEntitySchema)) dto: CreateLegalEntityDto,
  ) {
    return this.legalEntitiesService.create(user.organizationId, dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.HR_MANAGER, Role.HR_PAYROLL_MANAGER, Role.HR_PAYROLL_USER)
  @ApiOperation({ summary: 'List all legal entities in current organization' })
  async list(@CurrentUser() user: AuthenticatedUser) {
    return this.legalEntitiesService.list(user.organizationId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.HR_MANAGER, Role.HR_PAYROLL_MANAGER, Role.HR_PAYROLL_USER)
  @ApiOperation({ summary: 'Get legal entity by ID' })
  async getById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.legalEntitiesService.findById(user.organizationId, id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @ApiOperation({ summary: 'Update legal entity' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateLegalEntitySchema)) dto: UpdateLegalEntityDto,
  ) {
    return this.legalEntitiesService.update(user.organizationId, id, dto);
  }
}
