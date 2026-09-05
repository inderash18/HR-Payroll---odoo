import { userService, organizationService, departmentService } from '../services/user.service.js';
import { employeeService } from '../services/employee.service.js';
import { successResponse } from '../utils/response.js';

export const userController = {
  async list(req, res, next) {
    try {
      const result = await userService.list(req.user.organizationId, req.query);
      return successResponse(res, result.items, 'Users retrieved', 200, result.pagination);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const user = await userService.findById(req.user.organizationId, req.params.id);
      return successResponse(res, user, 'User details');
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const user = await userService.create(req.user.organizationId, req.body);
      return successResponse(res, user, 'User created successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const user = await userService.update(req.user.organizationId, req.params.id, req.body);
      return successResponse(res, user, 'User updated successfully');
    } catch (err) {
      next(err);
    }
  },
};

export const organizationController = {
  async getCurrent(req, res, next) {
    try {
      const org = await organizationService.findById(req.user.organizationId);
      return successResponse(res, org, 'Organization details');
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const org = await organizationService.findById(req.params.id);
      return successResponse(res, org, 'Organization details');
    } catch (err) {
      next(err);
    }
  },

  async listAll(req, res, next) {
    try {
      const orgs = await organizationService.listAll();
      return successResponse(res, orgs, 'Organizations list');
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const org = await organizationService.update(req.params.id, req.body);
      return successResponse(res, org, 'Organization updated');
    } catch (err) {
      next(err);
    }
  },
};

export const departmentController = {
  async list(req, res, next) {
    try {
      const result = await departmentService.list(req.user.organizationId, req.query);
      return successResponse(res, result.items, 'Departments list', 200, result.pagination);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const dept = await departmentService.findById(req.user.organizationId, req.params.id);
      return successResponse(res, dept, 'Department details');
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const dept = await departmentService.create(req.user.organizationId, req.body);
      return successResponse(res, dept, 'Department created', 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const dept = await departmentService.update(req.user.organizationId, req.params.id, req.body);
      return successResponse(res, dept, 'Department updated');
    } catch (err) {
      next(err);
    }
  },
};

export const employeeController = {
  async list(req, res, next) {
    try {
      const result = await employeeService.list(req.user.organizationId, req.query);
      return successResponse(res, result.items, 'Employees list', 200, result.pagination);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const emp = await employeeService.findById(req.user.organizationId, req.params.id);
      return successResponse(res, emp, 'Employee details');
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const emp = await employeeService.create(req.user.organizationId, req.body);
      return successResponse(res, emp, 'Employee created', 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const emp = await employeeService.update(req.user.organizationId, req.params.id, req.body);
      return successResponse(res, emp, 'Employee updated');
    } catch (err) {
      next(err);
    }
  },
};
