import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto/organization.dto';
import { ConflictError, NotFoundError } from '@common/errors/app-error';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrganizationDto) {
    const existing = await this.prisma.organization.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictError(`Organization with code '${dto.code}' already exists`);
    }

    return this.prisma.organization.create({
      data: dto,
    });
  }

  async findById(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        legalEntities: true,
      },
    });

    if (!org) {
      throw new NotFoundError('Organization not found');
    }

    return org;
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    await this.findById(id);

    if (dto.code) {
      const existing = await this.prisma.organization.findFirst({
        where: { code: dto.code, NOT: { id } },
      });
      if (existing) {
        throw new ConflictError(`Organization with code '${dto.code}' already exists`);
      }
    }

    return this.prisma.organization.update({
      where: { id },
      data: dto,
    });
  }

  async listAll() {
    return this.prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            users: true,
            legalEntities: true,
          },
        },
      },
    });
  }
}
