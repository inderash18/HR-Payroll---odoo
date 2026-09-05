import { employeeRepository } from '../repositories/employee.repository.js';
import { prisma } from '../config/prisma.js';

export const employeeService = {
  async list(organizationId, query = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const [total, items] = await employeeRepository.findMany(organizationId, {
      skip,
      take: limit,
      departmentId: query.departmentId,
      search: query.search,
      isActive: query.isActive !== undefined ? query.isActive === 'true' || query.isActive === true : undefined,
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
    const employee = await employeeRepository.findById(organizationId, id);
    if (!employee) throw new Error('Employee not found');
    return employee;
  },

  async findByUserId(organizationId, userId) {
    return employeeRepository.findByUserId(organizationId, userId);
  },

  async create(organizationId, dto) {
    const existing = await prisma.employee.findFirst({
      where: {
        organizationId,
        OR: [{ employeeNum: dto.employeeNum }, { workEmail: dto.workEmail }],
      },
    });

    if (existing) {
      throw new Error('An employee with this Employee ID or Work Email already exists');
    }

    return employeeRepository.create({
      organizationId,
      ...dto,
      joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : new Date(),
    });
  },

  async update(organizationId, id, dto) {
    await employeeService.findById(organizationId, id);
    return employeeRepository.update(organizationId, id, {
      ...dto,
      ...(dto.joiningDate ? { joiningDate: new Date(dto.joiningDate) } : {}),
    });
  },
};
