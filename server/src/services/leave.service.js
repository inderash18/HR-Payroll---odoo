import { leaveRepository } from '../repositories/leave.repository.js';
import { employeeRepository } from '../repositories/employee.repository.js';
import { prisma } from '../config/prisma.js';

export const leaveService = {
  // Types
  async listTypes(organizationId) {
    return leaveRepository.findTypes(organizationId);
  },

  async createType(organizationId, dto) {
    return leaveRepository.createType({
      organizationId,
      ...dto,
    });
  },

  // Allocations
  async listAllocations(organizationId, employeeId) {
    return leaveRepository.findAllocations(organizationId, employeeId);
  },

  async createAllocation(organizationId, dto) {
    return leaveRepository.createAllocation({
      organizationId,
      ...dto,
      validFrom: new Date(dto.validFrom),
      validUntil: new Date(dto.validUntil),
      status: 'APPROVED',
    });
  },

  // Requests
  async listRequests(organizationId, query = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const [total, items] = await leaveRepository.findRequests(organizationId, {
      skip,
      take: limit,
      employeeId: query.employeeId,
      status: query.status,
      startDate: query.startDate,
      endDate: query.endDate,
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async createRequest(organizationId, dto, userId) {
    let employeeId = dto.employeeId;
    if (!employeeId) {
      const emp = await employeeRepository.findByUserId(organizationId, userId);
      if (!emp) throw new Error('No employee profile associated with current user');
      employeeId = emp.id;
    }

    const leaveType = await leaveRepository.findTypeById(organizationId, dto.leaveTypeId);
    if (!leaveType) throw new Error('Leave type not found');

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (endDate < startDate) throw new Error('End date cannot be before start date');

    // Check available leave allocation balance if required
    if (leaveType.requiresAllocation) {
      const allocation = await leaveRepository.findActiveAllocation(
        organizationId,
        employeeId,
        dto.leaveTypeId,
        startDate
      );

      if (!allocation) {
        throw new Error('No approved leave allocation found for this period');
      }

      const available = Number(allocation.allocatedAmount) - Number(allocation.consumedAmount);
      if (Number(dto.numberOfDays) > available) {
        throw new Error(`Insufficient leave balance. Available: ${available} day(s), Requested: ${dto.numberOfDays} day(s)`);
      }
    }

    return leaveRepository.createRequest({
      organizationId,
      employeeId,
      leaveTypeId: dto.leaveTypeId,
      startDate,
      endDate,
      numberOfDays: dto.numberOfDays,
      reason: dto.reason || null,
      status: 'PENDING_APPROVAL',
    });
  },

  async approveRequest(organizationId, id, approverUserId) {
    const request = await leaveRepository.findRequestById(organizationId, id);
    if (!request) throw new Error('Leave request not found');
    if (request.status !== 'PENDING_APPROVAL') {
      throw new Error(`Cannot approve leave request in ${request.status} status`);
    }

    return prisma.$transaction(async (tx) => {
      // If allocation is required, deduct from consumed amount
      if (request.leaveType.requiresAllocation) {
        const allocation = await tx.leaveAllocation.findFirst({
          where: {
            organizationId,
            employeeId: request.employeeId,
            leaveTypeId: request.leaveTypeId,
            status: 'APPROVED',
            validFrom: { lte: request.startDate },
            validUntil: { gte: request.startDate },
          },
        });

        if (allocation) {
          await tx.leaveAllocation.update({
            where: { id: allocation.id },
            data: {
              consumedAmount: { increment: request.numberOfDays },
            },
          });
        }
      }

      return tx.leaveRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedById: approverUserId,
          approvedAt: new Date(),
        },
      });
    });
  },

  async rejectRequest(organizationId, id, rejecterUserId) {
    const request = await leaveRepository.findRequestById(organizationId, id);
    if (!request) throw new Error('Leave request not found');
    if (request.status !== 'PENDING_APPROVAL') {
      throw new Error(`Cannot reject leave request in ${request.status} status`);
    }

    return leaveRepository.updateRequest(organizationId, id, {
      status: 'REJECTED',
      refusedById: rejecterUserId,
      refusedAt: new Date(),
    });
  },
};
