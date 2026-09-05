import { contractService } from '../services/contract.service.js';
import { scheduleService } from '../services/schedule.service.js';
import { attendanceService } from '../services/attendance.service.js';
import { employeeRepository } from '../repositories/employee.repository.js';
import { successResponse } from '../utils/response.js';

export const contractController = {
  async list(req, res, next) {
    try {
      const result = await contractService.list(req.user.organizationId, req.query);
      return successResponse(res, result.items, 'Contracts retrieved', 200, result.pagination);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const contract = await contractService.findById(req.user.organizationId, req.params.id);
      return successResponse(res, contract, 'Contract details');
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const contract = await contractService.create(req.user.organizationId, req.body);
      return successResponse(res, contract, 'Contract created', 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const contract = await contractService.update(req.user.organizationId, req.params.id, req.body);
      return successResponse(res, contract, 'Contract updated');
    } catch (err) {
      next(err);
    }
  },
};

export const scheduleController = {
  async list(req, res, next) {
    try {
      const schedules = await scheduleService.list(req.user.organizationId);
      return successResponse(res, schedules, 'Schedules retrieved');
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const schedule = await scheduleService.findById(req.user.organizationId, req.params.id);
      return successResponse(res, schedule, 'Schedule details');
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const schedule = await scheduleService.create(req.user.organizationId, req.body);
      return successResponse(res, schedule, 'Schedule created', 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const schedule = await scheduleService.update(req.user.organizationId, req.params.id, req.body);
      return successResponse(res, schedule, 'Schedule updated');
    } catch (err) {
      next(err);
    }
  },
};

export const attendanceController = {
  async list(req, res, next) {
    try {
      const query = { ...req.query };
      if (req.user.role === 'EMPLOYEE') {
        const emp = await employeeRepository.findByUserId(req.user.organizationId, req.user.id);
        query.employeeId = emp ? emp.id : 'no-match';
      }
      const result = await attendanceService.list(req.user.organizationId, query);
      return successResponse(res, result.items, 'Attendance logs', 200, result.pagination);
    } catch (err) {
      next(err);
    }
  },

  async clockIn(req, res, next) {
    try {
      const log = await attendanceService.clockIn(req.user.organizationId, req.body, req.user.id);
      return successResponse(res, log, 'Clocked in successfully');
    } catch (err) {
      next(err);
    }
  },

  async clockOut(req, res, next) {
    try {
      const log = await attendanceService.clockOut(req.user.organizationId, req.body, req.user.id);
      return successResponse(res, log, 'Clocked out successfully');
    } catch (err) {
      next(err);
    }
  },
};

