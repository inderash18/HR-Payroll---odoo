import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { AuditService } from '@modules/audit/audit.service';
import { ClockInDto, ClockOutDto, AttendanceQueryDto } from './dto/attendance.dto';
import { NotFoundError, BadRequestError, ConflictError } from '@common/errors/app-error';
import { AttendanceStatus, Prisma } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async clockIn(organizationId: string, dto: ClockInDto, actorId?: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, organizationId },
    });
    if (!employee) throw new NotFoundError('Employee not found');

    const today = dto.date ? new Date(dto.date) : new Date();
    today.setHours(0, 0, 0, 0);

    const existingToday = await this.prisma.attendance.findFirst({
      where: {
        organizationId,
        employeeId: dto.employeeId,
        date: today,
      },
    });

    if (existingToday) {
      throw new ConflictError('Employee already has an attendance log for today');
    }

    return this.prisma.runInTransaction(async (tx) => {
      const att = await tx.attendance.create({
        data: {
          organizationId,
          employeeId: dto.employeeId,
          date: today,
          checkIn: new Date(),
          status: AttendanceStatus.PRESENT,
        },
        include: {
          employee: { select: { id: true, firstName: true, lastName: true, employeeNum: true } },
        },
      });

      await this.auditService.log(
        {
          organizationId,
          userId: actorId || null,
          action: 'ATTENDANCE_CLOCK_IN',
          entityType: 'Attendance',
          entityId: att.id,
        },
        tx,
      );

      return att;
    });
  }

  async clockOut(organizationId: string, dto: ClockOutDto, actorId?: string) {
    const att = await this.prisma.attendance.findFirst({
      where: { id: dto.attendanceId, organizationId },
    });

    if (!att) throw new NotFoundError('Attendance record not found');
    if (att.checkOut) throw new BadRequestError('Employee has already clocked out for this session');

    const checkOutTime = new Date();
    const durationMs = checkOutTime.getTime() - att.checkIn.getTime();
    const workedHours = Number((durationMs / (1000 * 60 * 60)).toFixed(2));

    return this.prisma.runInTransaction(async (tx) => {
      const updated = await tx.attendance.update({
        where: { id: dto.attendanceId },
        data: {
          checkOut: checkOutTime,
          workedHours,
        },
        include: {
          employee: { select: { id: true, firstName: true, lastName: true, employeeNum: true } },
        },
      });

      await this.auditService.log(
        {
          organizationId,
          userId: actorId || null,
          action: 'ATTENDANCE_CLOCK_OUT',
          entityType: 'Attendance',
          entityId: att.id,
          newValues: { workedHours },
        },
        tx,
      );

      return updated;
    });
  }

  async list(organizationId: string, query: AttendanceQueryDto) {
    const skip = (query.page - 1) * query.limit;

    const where: Prisma.AttendanceWhereInput = {
      organizationId,
      ...(query.employeeId ? { employeeId: query.employeeId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.attendance.count({ where }),
      this.prisma.attendance.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { date: 'desc' },
        include: {
          employee: { select: { id: true, firstName: true, lastName: true, employeeNum: true } },
        },
      }),
    ]);

    return {
      items,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }
}
