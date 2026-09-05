import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { CreateLegalEntityDto, UpdateLegalEntityDto } from './dto/legal-entity.dto';
import { ConflictError, NotFoundError } from '@common/errors/app-error';
import { Prisma } from '@prisma/client';

@Injectable()
export class LegalEntitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, dto: CreateLegalEntityDto) {
    const existing = await this.prisma.legalEntity.findUnique({
      where: {
        organizationId_code: {
          organizationId,
          code: dto.code,
        },
      },
    });

    if (existing) {
      throw new ConflictError(
        `Legal entity with code '${dto.code}' already exists in this organization`,
      );
    }

    return this.prisma.legalEntity.create({
      data: {
        organizationId,
        name: dto.name,
        code: dto.code,
        registrationNum: dto.registrationNum || null,
        taxId: dto.taxId || null,
        country: dto.country,
        currency: dto.currency,
        address: dto.address ? (dto.address as Prisma.InputJsonValue) : Prisma.DbNull,
      },
    });
  }

  async findById(organizationId: string, id: string) {
    const entity = await this.prisma.legalEntity.findFirst({
      where: { id, organizationId },
    });

    if (!entity) {
      throw new NotFoundError('Legal entity not found');
    }

    return entity;
  }

  async list(organizationId: string) {
    return this.prisma.legalEntity.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });
  }

  async update(organizationId: string, id: string, dto: UpdateLegalEntityDto) {
    await this.findById(organizationId, id);

    if (dto.code) {
      const existing = await this.prisma.legalEntity.findFirst({
        where: {
          organizationId,
          code: dto.code,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictError(
          `Legal entity with code '${dto.code}' already exists in this organization`,
        );
      }
    }

    return this.prisma.legalEntity.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.code ? { code: dto.code } : {}),
        ...(dto.registrationNum !== undefined ? { registrationNum: dto.registrationNum } : {}),
        ...(dto.taxId !== undefined ? { taxId: dto.taxId } : {}),
        ...(dto.country ? { country: dto.country } : {}),
        ...(dto.currency ? { currency: dto.currency } : {}),
        ...(dto.address !== undefined
          ? { address: dto.address ? (dto.address as Prisma.InputJsonValue) : Prisma.DbNull }
          : {}),
      },
    });
  }
}
