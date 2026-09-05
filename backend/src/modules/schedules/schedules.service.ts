import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { AuditService } from '@modules/audit/audit.service';
import { CreateWorkingScheduleDto, UpdateWorkingScheduleDto } from './dto/schedule.dto';
import { NotFoundError, BadRequestError } from '@common/errors/app-error';

@Injectable()
export class SchedulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Helper to validate schedule lines and calculate total weekly hours
   */
  calculateWeeklyHours(lines: Array<{ startTime: string; endTime: string; breakMinutes: number }>): number {
    let totalMinutes = 0;

    for (const line of lines) {
      const [startH, startM] = line.startTime.split(':').map(Number);
      const [endH, endM] = line.endTime.split(':').map(Number);

      const startTotal = startH * 60 + startM;
      const endTotal = endH * 60 + endM;

      if (endTotal <= startTotal) {
        throw new BadRequestError(`Invalid schedule line: End time (${line.endTime}) must be after start time (${line.startTime})`);
      }

      const durationMinutes = endTotal - startTotal;
      if (line.breakMinutes >= durationMinutes) {
        throw new BadRequestError(`Break minutes (${line.breakMinutes}) cannot exceed or equal shift duration (${durationMinutes} mins)`);
      }

      totalMinutes += durationMinutes - line.breakMinutes;
    }

    return Number((totalMinutes / 60).toFixed(2));
  }

  async create(organizationId: string, dto: CreateWorkingScheduleDto, actorId?: string) {
    this.calculateWeeklyHours(dto.lines);

    return this.prisma.runInTransaction(async (tx) => {
      const schedule = await tx.workingSchedule.create({
        data: {
          organizationId,
          name: dto.name,
          type: dto.type,
          timezone: dto.timezone,
          lines: {
            create: dto.lines.map((line) => ({
              dayOfWeek: line.dayOfWeek,
              startTime: line.startTime,
              endTime: line.endTime,
              breakMinutes: line.breakMinutes,
            })),
          },
        },
        include: {
          lines: { orderBy: { dayOfWeek: 'asc' } },
        },
      });

      await this.auditService.log(
        {
          organizationId,
          userId: actorId || null,
          action: 'WORKING_SCHEDULE_CREATED',
          entityType: 'WorkingSchedule',
          entityId: schedule.id,
          newValues: { name: schedule.name, type: schedule.type },
        },
        tx,
      );

      return schedule;
    });
  }

  async findById(organizationId: string, id: string) {
    const schedule = await this.prisma.workingSchedule.findFirst({
      where: { id, organizationId },
      include: {
        lines: { orderBy: { dayOfWeek: 'asc' } },
        _count: { select: { employees: true, contracts: true } },
      },
    });

    if (!schedule) throw new NotFoundError('Working schedule not found');
    return schedule;
  }

  async list(organizationId: string) {
    return this.prisma.workingSchedule.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        lines: { orderBy: { dayOfWeek: 'asc' } },
        _count: { select: { employees: true, contracts: true } },
      },
    });
  }

  async update(organizationId: string, id: string, dto: UpdateWorkingScheduleDto, actorId?: string) {
    await this.findById(organizationId, id);

    if (dto.lines) {
      this.calculateWeeklyHours(dto.lines);
    }

    return this.prisma.runInTransaction(async (tx) => {
      if (dto.lines) {
        await tx.workingScheduleLine.deleteMany({ where: { scheduleId: id } });
      }

      const updated = await tx.workingSchedule.update({
        where: { id },
        data: {
          ...(dto.name ? { name: dto.name } : {}),
          ...(dto.type ? { type: dto.type } : {}),
          ...(dto.timezone ? { timezone: dto.timezone } : {}),
          ...(dto.active !== undefined ? { active: dto.active } : {}),
          ...(dto.lines
            ? {
                lines: {
                  create: dto.lines.map((line) => ({
                    dayOfWeek: line.dayOfWeek,
                    startTime: line.startTime,
                    endTime: line.endTime,
                    breakMinutes: line.breakMinutes,
                  })),
                },
              }
            : {}),
        },
        include: {
          lines: { orderBy: { dayOfWeek: 'asc' } },
        },
      });

      await this.auditService.log(
        {
          organizationId,
          userId: actorId || null,
          action: 'WORKING_SCHEDULE_UPDATED',
          entityType: 'WorkingSchedule',
          entityId: id,
        },
        tx,
      );

      return updated;
    });
  }
}
