import { departmentRepository } from '../repositories/department.repository.js';

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

  async delete(organizationId, id) {
    await departmentService.findById(organizationId, id);
    return departmentRepository.delete(organizationId, id);
  },
};
