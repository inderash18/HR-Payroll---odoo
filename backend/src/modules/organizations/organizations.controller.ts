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
import { OrganizationsService } from './organizations.service';
import {
  createOrganizationSchema,
  CreateOrganizationDto,
  updateOrganizationSchema,
  UpdateOrganizationDto,
} from './dto/organization.dto';
import { ZodValidationPipe } from '@common/validation/zod-validation.pipe';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles, CurrentUser } from '@common/auth/decorators/auth.decorator';
import { Role } from '@prisma/client';
import { AuthenticatedUser } from '@common/auth/interfaces/token-payload.interface';

@ApiTags('Organizations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create new organization (Admin only)' })
  @ApiResponse({ status: 201, description: 'Organization created successfully' })
  async create(
    @Body(new ZodValidationPipe(createOrganizationSchema)) dto: CreateOrganizationDto,
  ) {
    return this.organizationsService.create(dto);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current user organization details' })
  async getCurrent(@CurrentUser() user: AuthenticatedUser) {
    return this.organizationsService.findById(user.organizationId);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get organization by ID (Admin only)' })
  async getById(@Param('id') id: string) {
    return this.organizationsService.findById(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update organization (Admin only)' })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateOrganizationSchema)) dto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(id, dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all organizations (Admin only)' })
  async listAll() {
    return this.organizationsService.listAll();
  }
}
