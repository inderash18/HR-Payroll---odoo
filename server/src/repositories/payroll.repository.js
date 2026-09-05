import { prisma } from '../config/prisma.js';

export const payrollRepository = {
  // Salary Structures & Rules
  findStructures: (organizationId) => {
    return prisma.salaryStructure.findMany({
      where: { organizationId, active: true },
      orderBy: { name: 'asc' },
      include: {
        rules: { where: { isActive: true }, orderBy: { sequence: 'asc' } },
        _count: { select: { contracts: true } },
      },
    });
  },

  findStructureById: (organizationId, id) => {
    return prisma.salaryStructure.findFirst({
      where: { organizationId, id },
      include: {
        rules: { where: { isActive: true }, orderBy: { sequence: 'asc' } },
      },
    });
  },

  createStructure: (data, tx = prisma) => {
    return tx.salaryStructure.create({ data });
  },

  createRule: (data, tx = prisma) => {
    return tx.salaryRule.create({ data });
  },

  // Payruns
  findPayruns: (organizationId, { skip = 0, take = 50, status, search } = {}) => {
    const where = {
      organizationId,
      ...(status ? { status } : {}),
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
    };

    return Promise.all([
      prisma.payrun.count({ where }),
      prisma.payrun.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { payslips: true, warnings: true } },
        },
      }),
    ]);
  },

  findPayrunById: (organizationId, id) => {
    return prisma.payrun.findFirst({
      where: { organizationId, id },
      include: {
        payslips: {
          include: {
            employee: { select: { id: true, firstName: true, lastName: true, employeeNum: true, department: true } },
          },
        },
        warnings: true,
      },
    });
  },

  createPayrun: (data, tx = prisma) => {
    return tx.payrun.create({ data });
  },

  updatePayrun: (id, data, tx = prisma) => {
    return tx.payrun.update({
      where: { id },
      data,
    });
  },

  // Payslips
  findPayslips: (organizationId, { payrunId, employeeId, skip = 0, take = 50 } = {}) => {
    const where = {
      organizationId,
      ...(payrunId ? { payrunId } : {}),
      ...(employeeId ? { employeeId } : {}),
    };

    return Promise.all([
      prisma.payslip.count({ where }),
      prisma.payslip.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          employee: {
            select: { id: true, firstName: true, lastName: true, employeeNum: true, department: true, workEmail: true },
          },
          payrun: { select: { id: true, name: true, status: true, startDate: true, endDate: true } },
        },
      }),
    ]);
  },

  findPayslipById: (organizationId, id) => {
    return prisma.payslip.findFirst({
      where: { organizationId, id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeNum: true,
            workEmail: true,
            bankName: true,
            bankAccountMasked: true,
            department: { select: { name: true } },
            jobPosition: { select: { title: true } },
          },
        },
        payrun: true,
        lines: { orderBy: { sequence: 'asc' } },
        warnings: true,
      },
    });
  },

  createPayslip: (data, lines = [], tx = prisma) => {
    return tx.payslip.create({
      data: {
        ...data,
        lines: {
          create: lines.map((l) => ({
            category: l.category,
            code: l.code,
            name: l.name,
            sequence: l.sequence,
            amount: l.amount,
            baseAmount: l.baseAmount,
            rate: l.rate,
          })),
        },
      },
      include: { lines: true },
    });
  },

  deletePayrunPayslips: (payrunId, tx = prisma) => {
    return tx.payslip.deleteMany({ where: { payrunId } });
  },

  createPayrollWarnings: (warnings, tx = prisma) => {
    if (!warnings || warnings.length === 0) return;
    return tx.payrollWarning.createMany({ data: warnings });
  },

  deletePayrunWarnings: (payrunId, tx = prisma) => {
    return tx.payrollWarning.deleteMany({ where: { payrunId } });
  },
};

export const auditRepository = {
  create: (data, tx = prisma) => {
    return tx.auditLog.create({ data });
  },

  findMany: (organizationId, { skip = 0, take = 50, entityType, entityId, userId, startDate, endDate } = {}) => {
    const where = {
      organizationId,
      ...(entityType ? { entityType } : {}),
      ...(entityId ? { entityId } : {}),
      ...(userId ? { userId } : {}),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate ? { gte: new Date(startDate) } : {}),
              ...(endDate ? { lte: new Date(endDate) } : {}),
            },
          }
        : {}),
    };

    return Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true, role: true },
          },
        },
      }),
    ]);
  },
};
