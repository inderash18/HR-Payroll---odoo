import { contractRepository } from '../repositories/contract.repository.js';
import { employeeRepository } from '../repositories/employee.repository.js';

export const contractService = {
  async list(organizationId, query = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const [total, items] = await contractRepository.findMany(organizationId, {
      skip,
      take: limit,
      employeeId: query.employeeId,
      status: query.status,
      search: query.search,
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

  async findById(organizationId, id) {
    const contract = await contractRepository.findById(organizationId, id);
    if (!contract) throw new Error('Contract not found');
    return contract;
  },

  async create(organizationId, dto) {
    const employee = await employeeRepository.findById(organizationId, dto.employeeId);
    if (!employee) throw new Error('Employee not found');

    const startDate = new Date(dto.startDate);
    const endDate = dto.endDate ? new Date(dto.endDate) : null;

    if (endDate && endDate <= startDate) {
      throw new Error('Contract End Date must be after Start Date');
    }

    // Check for active overlapping contracts
    if (dto.status === 'ACTIVE') {
      const overlapping = await contractRepository.findOverlapping(
        organizationId,
        dto.employeeId,
        startDate,
        endDate
      );

      if (overlapping.length > 0) {
        throw new Error(
          `Contract overlap error: Employee already has an active contract (${overlapping[0].name}) covering this period.`
        );
      }
    }

    return contractRepository.create({
      organizationId,
      ...dto,
      startDate,
      endDate,
    });
  },

  async update(organizationId, id, dto) {
    const existing = await contractService.findById(organizationId, id);

    const startDate = dto.startDate ? new Date(dto.startDate) : existing.startDate;
    const endDate = dto.endDate !== undefined ? (dto.endDate ? new Date(dto.endDate) : null) : existing.endDate;

    if (endDate && endDate <= startDate) {
      throw new Error('Contract End Date must be after Start Date');
    }

    const status = dto.status || existing.status;
    if (status === 'ACTIVE') {
      const overlapping = await contractRepository.findOverlapping(
        organizationId,
        existing.employeeId,
        startDate,
        endDate,
        id
      );

      if (overlapping.length > 0) {
        throw new Error(
          `Contract overlap error: Employee already has an active contract (${overlapping[0].name}) covering this period.`
        );
      }
    }

    return contractRepository.update(organizationId, id, {
      ...dto,
      ...(dto.startDate ? { startDate: new Date(dto.startDate) } : {}),
      ...(dto.endDate !== undefined ? { endDate: dto.endDate ? new Date(dto.endDate) : null } : {}),
    });
  },
};
