import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/user.repository.js';
import { organizationRepository } from '../repositories/organization.repository.js';
import { departmentRepository } from '../repositories/department.repository.js';
import { employeeRepository } from '../repositories/employee.repository.js';
import { contractRepository } from '../repositories/contract.repository.js';

export const userService = {
  async list(organizationId, query) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const [total, items] = await userRepository.findMany(organizationId, {
      skip,
      take: limit,
      role: query.role,
      search: query.search,
    });

    return {
      items: items.map((u) => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        isActive: u.isActive,
        lastLoginAt: u.lastLoginAt,
        employee: u.employee,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async findById(organizationId, id) {
    const user = await userRepository.findById(organizationId, id);
    if (!user) throw new Error('User not found');
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      organization: user.organization,
      employee: user.employee,
    };
  },

  async create(organizationId, dto) {
    const existing = await userRepository.findByEmail(organizationId, dto.email);
    if (existing) throw new Error('User with this email already exists in organization');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await userRepository.create({
      organizationId,
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role || 'EMPLOYEE',
      isEmailVerified: true,
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    };
  },

  async update(organizationId, id, dto) {
    const user = await userRepository.findById(organizationId, id);
    if (!user) throw new Error('User not found');

    const updated = await userRepository.update(id, dto);
    return {
      id: updated.id,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
      role: updated.role,
      isActive: updated.isActive,
    };
  },
};

export const organizationService = {
  async findById(id) {
    const org = await organizationRepository.findById(id);
    if (!org) throw new Error('Organization not found');
    return org;
  },

  async listAll() {
    return organizationRepository.findAll();
  },

  async update(id, dto) {
    return organizationRepository.update(id, dto);
  },
};

export const departmentService = {
  async list(organizationId, query = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const [total, items] = await departmentRepository.findMany(organizationId, {
      skip,
      take: limit,
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
    const dept = await departmentRepository.findById(organizationId, id);
    if (!dept) throw new Error('Department not found');
    return dept;
  },

  async create(organizationId, dto) {
    return departmentRepository.create({
      organizationId,
      ...dto,
    });
  },

  async update(organizationId, id, dto) {
    await departmentService.findById(organizationId, id);
    return departmentRepository.update(organizationId, id, dto);
  },
};
