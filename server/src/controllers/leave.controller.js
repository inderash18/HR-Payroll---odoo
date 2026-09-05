import { leaveService } from '../services/leave.service.js';
import { payrollService } from '../services/payroll.service.js';
import { dashboardService, auditService } from '../services/dashboard.service.js';
import { successResponse } from '../utils/response.js';

export const leaveController = {
  async listTypes(req, res, next) {
    try {
      const types = await leaveService.listTypes(req.user.organizationId);
      return successResponse(res, types, 'Leave types');
    } catch (err) {
      next(err);
    }
  },

  async createType(req, res, next) {
    try {
      const type = await leaveService.createType(req.user.organizationId, req.body);
      return successResponse(res, type, 'Leave type created', 201);
    } catch (err) {
      next(err);
    }
  },

  async listAllocations(req, res, next) {
    try {
      const allocations = await leaveService.listAllocations(req.user.organizationId, req.query.employeeId);
      return successResponse(res, allocations, 'Leave allocations');
    } catch (err) {
      next(err);
    }
  },

  async createAllocation(req, res, next) {
    try {
      const allocation = await leaveService.createAllocation(req.user.organizationId, req.body);
      return successResponse(res, allocation, 'Leave allocation created', 201);
    } catch (err) {
      next(err);
    }
  },

  async listRequests(req, res, next) {
    try {
      const result = await leaveService.listRequests(req.user.organizationId, req.query);
      return successResponse(res, result.items, 'Leave requests', 200, result.pagination);
    } catch (err) {
      next(err);
    }
  },

  async createRequest(req, res, next) {
    try {
      const request = await leaveService.createRequest(req.user.organizationId, req.body, req.user.id);
      return successResponse(res, request, 'Leave request submitted', 201);
    } catch (err) {
      next(err);
    }
  },

  async approve(req, res, next) {
    try {
      const result = await leaveService.approveRequest(req.user.organizationId, req.params.id, req.user.id);
      return successResponse(res, result, 'Leave request approved');
    } catch (err) {
      next(err);
    }
  },

  async reject(req, res, next) {
    try {
      const result = await leaveService.rejectRequest(req.user.organizationId, req.params.id, req.user.id);
      return successResponse(res, result, 'Leave request rejected');
    } catch (err) {
      next(err);
    }
  },
};

export const payrollController = {
  async listStructures(req, res, next) {
    try {
      const structures = await payrollService.listStructures(req.user.organizationId);
      return successResponse(res, structures, 'Salary structures');
    } catch (err) {
      next(err);
    }
  },

  async createStructure(req, res, next) {
    try {
      const structure = await payrollService.createStructure(req.user.organizationId, req.body);
      return successResponse(res, structure, 'Salary structure created', 201);
    } catch (err) {
      next(err);
    }
  },

  async createRule(req, res, next) {
    try {
      const rule = await payrollService.createRule(req.user.organizationId, req.body);
      return successResponse(res, rule, 'Salary rule created', 201);
    } catch (err) {
      next(err);
    }
  },

  async listPayruns(req, res, next) {
    try {
      const result = await payrollService.listPayruns(req.user.organizationId, req.query);
      return successResponse(res, result.items, 'Payruns list', 200, result.pagination);
    } catch (err) {
      next(err);
    }
  },

  async getPayrunById(req, res, next) {
    try {
      const payrun = await payrollService.findPayrunById(req.user.organizationId, req.params.id);
      return successResponse(res, payrun, 'Payrun details');
    } catch (err) {
      next(err);
    }
  },

  async createPayrun(req, res, next) {
    try {
      const payrun = await payrollService.createPayrun(req.user.organizationId, req.body);
      return successResponse(res, payrun, 'Payrun batch created', 201);
    } catch (err) {
      next(err);
    }
  },

  async computePayrun(req, res, next) {
    try {
      const payrun = await payrollService.computePayrun(req.user.organizationId, req.params.id);
      return successResponse(res, payrun, 'Payrun computed successfully');
    } catch (err) {
      next(err);
    }
  },

  async validatePayrun(req, res, next) {
    try {
      const payrun = await payrollService.validatePayrun(req.user.organizationId, req.params.id, req.user.id);
      return successResponse(res, payrun, 'Payrun validated');
    } catch (err) {
      next(err);
    }
  },

  async markPayrunPaid(req, res, next) {
    try {
      const payrun = await payrollService.markPayrunPaid(req.user.organizationId, req.params.id, req.user.id);
      return successResponse(res, payrun, 'Payrun marked as Paid');
    } catch (err) {
      next(err);
    }
  },

  async sendPayrunPayslips(req, res, next) {
    try {
      const result = await payrollService.sendPayrunPayslips(req.user.organizationId, req.params.id);
      return successResponse(res, result, 'Payslips dispatched');
    } catch (err) {
      next(err);
    }
  },

  async listPayslips(req, res, next) {
    try {
      const result = await payrollService.listPayslips(req.user.organizationId, req.query);
      return successResponse(res, result.items, 'Payslips list', 200, result.pagination);
    } catch (err) {
      next(err);
    }
  },

  async getPayslipById(req, res, next) {
    try {
      const payslip = await payrollService.findPayslipById(req.user.organizationId, req.params.id);
      return successResponse(res, payslip, 'Payslip details');
    } catch (err) {
      next(err);
    }
  },

  async getPayslipHtml(req, res, next) {
    try {
      const html = await payrollService.generatePayslipHtml(req.user.organizationId, req.params.id);
      return successResponse(res, { html }, 'Payslip HTML representation');
    } catch (err) {
      next(err);
    }
  },
};

export const dashboardController = {
  async getRoleDashboard(req, res, next) {
    try {
      const data = await dashboardService.getRoleDashboard(req.user, req.user.organizationId);
      return successResponse(res, data, 'Dashboard data fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  async getOverview(req, res, next) {
    try {
      const data = await dashboardService.getRoleDashboard(req.user, req.user.organizationId);
      return successResponse(res, data, 'Dashboard data fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  async getAttendance(req, res, next) {
    try {
      const data = await dashboardService.getAttendanceMetrics(req.user.organizationId);
      return successResponse(res, data, 'Attendance metrics');
    } catch (err) {
      next(err);
    }
  },

  async getTimeOff(req, res, next) {
    try {
      const data = await dashboardService.getTimeOffMetrics(req.user.organizationId);
      return successResponse(res, data, 'Time off metrics');
    } catch (err) {
      next(err);
    }
  },
};

export const auditController = {
  async list(req, res, next) {
    try {
      const result = await auditService.list(req.user.organizationId, req.query);
      return successResponse(res, result.items, 'Audit logs', 200, result.pagination);
    } catch (err) {
      next(err);
    }
  },
};

export const healthController = {
  liveness(req, res) {
    return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  },

  async readiness(req, res) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return res.status(200).json({ status: 'ok', database: 'connected' });
    } catch (err) {
      return res.status(503).json({ status: 'degraded', database: 'disconnected', error: err.message });
    }
  },
};
