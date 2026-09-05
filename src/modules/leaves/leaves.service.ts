import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { AuditService } from '@modules/audit/audit.service';
import { CreateLeaveTypeDto, CreateLeaveRequestDto, LeaveQueryDto } from './dto/leave.dto';
import { NotFoundError, BadRequestError, ConflictError } from '@common/errors/app-error';
import { LeaveStatus, Prisma } from '@prisma/client';

@Injectable()
export class LeavesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  // ----------------------------------------------------
  // LEAVE TYPES
  // ----------------------------------------------------
  async createLeaveType(organizationId: string, dto: CreateLeaveTypeDto, actorId?: string) {
    const existing = await this.prisma.leaveType.findUnique({
      where: { organizationId_code: { organizationId, code: dto.code } },
    });

    if (existing) {
      throw new ConflictError(`Leave type code '${dto.code}' already exists`);
    }

    return this.prisma.runInTransaction(async (tx) => {
      const type = await tx.leaveType.create({
        data: {
          organizationId,
          name: dto.name,
          code: dto.code,
          isPaid: dto.isPaid,
          daysAllowed: dto.daysAllowed,
        },
      });

      await this.auditService.log(
        {
          organizationId,
          userId: actorId || null,
          action: 'LEAVE_TYPE_CREATED',
          entityType: 'LeaveType',
          entityId: type.id,
          newValues: { name: type.name, code: type.code },
        },
        tx,
      );

      return type;
    });
  }

  async listLeaveTypes(organizationId: string) {
    return this.prisma.leaveType.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ----------------------------------------------------
  // LEAVE REQUESTS & APPROVAL WORKFLOW
  // ----------------------------------------------------
  async createLeaveRequest(organizationId: string, dto: CreateLeaveRequestDto, actorId?: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, organizationId },
    });
    if (!employee) throw new NotFoundError('Employee not found');

    const leaveType = await this.prisma.leaveType.findFirst({
      where: { id: dto.leaveTypeId, organizationId },
    });
    if (!leaveType) throw new NotFoundError('Leave type not found');

    return this.prisma.runInTransaction(async (tx) => {
      const request = await tx.leaveRequest.create({
        data: {
          organizationId,
          employeeId: dto.employeeId,
          leaveTypeId: dto.leaveTypeId,
          startDate: dto.startDate,
          endDate: dto.endDate,
          numberOfDays: dto.numberOfDays,
          reason: dto.reason || null,
          status: LeaveStatus.PENDING_APPROVAL,
        },
        include: {
          employee: { select: { id: true, firstName: true, lastName: true } },
          leaveType: { select: { id: true, name: true, isPaid: true } },
        },
      });

      await this.auditService.log(
        {
          organizationId,
          userId: actorId || null,
          action: 'LEAVE_REQUEST_CREATED',
          entityType: 'LeaveRequest',
          entityId: request.id,
          newValues: { numberOfDays: Number(request.numberOfDays), status: request.status },
        },
        tx,
      );

      return request;
    });
  }

  async approveLeaveRequest(organizationId: string, id: string, approverUserId: string) {
    const req = await this.prisma.leaveRequest.findFirst({
      where: { id, organizationId },
    });

    if (!req) throw new NotFoundError('Leave request not found');
    if (req.status !== LeaveStatus.PENDING_APPROVAL) {
      throw new BadRequestError(`Cannot approve request in status '${req.status}'`);
    }

    return this.prisma.runInTransaction(async (tx) => {
      const updated = await tx.leaveRequest.update({
        where: { id },
        data: {
          status: LeaveStatus.APPROVED,
          approvedById: approverUserId,
        },
        include: {
          employee: { select: { id: true, firstName: true, lastName: true } },
          leaveType: { select: { id: true, name: true } },
        },
      });

      await this.auditService.log(
        {
          organizationId,
          userId: approverUserId,
          action: 'LEAVE_REQUEST_APPROVED',
          entityType: 'LeaveRequest',
          entityId: id,
        },
        tx,
      );

      return updated;
    });
  }

  async rejectLeaveRequest(organizationId: string, id: string, approverUserId: string) {
    const req = await this.prisma.leaveRequest.findFirst({
      where: { id, organizationId },
    });

    if (!req) throw new NotFoundError('Leave request not found');

    return this.prisma.runInTransaction(async (tx) => {
      const updated = await tx.leaveRequest.update({
        where: { id },
        data: {
          status: LeaveStatus.REJECTED,
          approvedById: approverUserId,
        },
      });

      await this.auditService.log(
        {
          organizationId,
          userId: approverUserId,
          action: 'LEAVE_REQUEST_REJECTED',
          entityType: 'LeaveRequest',
          entityId: id,
        },
        tx,
      );

      return updated;
    });
  }

  async listLeaveRequests(organizationId: string, query: LeaveQueryDto) {
    const skip = (query.page - 1) * query.limit;

    const where: Prisma.LeaveRequestWhereInput = {
      organizationId,
      ...(query.employeeId ? { employeeId: query.employeeId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.leaveRequest.count({ where }),
      this.prisma.leaveRequest.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          employee: { select: { id: true, firstName: true, lastName: true, employeeNum: true } },
          leaveType: { select: { id: true, name: true, isPaid: true } },
          approvedBy: { select: { id: true, firstName: true, lastName: true } },
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
