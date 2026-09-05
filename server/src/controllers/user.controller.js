import { userService, profileService, organizationService, departmentService } from '../services/user.service.js';
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

export const profileController = {
  async getProfile(req, res, next) {
    try {
      const profile = await profileService.getProfile(req.user.id);
      return successResponse(res, profile, 'Profile retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const updated = await profileService.updateProfile(req.user.id, req.body);
      return successResponse(res, updated, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async changePassword(req, res, next) {
    try {
      const result = await profileService.updatePassword(
        req.user.id,
        req.body.currentPassword,
        req.body.newPassword
      );
      return successResponse(res, result, 'Password updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async uploadAvatar(req, res, next) {
    try {
      const result = await profileService.uploadAvatar(req.user.id, req.body.avatarData);
      return successResponse(res, result, 'Profile photo updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async deleteAvatar(req, res, next) {
    try {
      const result = await profileService.deleteAvatar(req.user.id);
      return successResponse(res, result, 'Profile photo removed successfully');
    } catch (err) {
      next(err);
    }
  },

  async getPreferences(req, res, next) {
    try {
      const prefs = await profileService.getPreferences(req.user.id);
      return successResponse(res, prefs, 'User preferences retrieved');
    } catch (err) {
      next(err);
    }
  },

  async updatePreferences(req, res, next) {
    try {
      const updated = await profileService.updatePreferences(req.user.id, req.body);
      return successResponse(res, updated, 'Preferences updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async getDocuments(req, res, next) {
    try {
      const docs = await profileService.getUserDocuments(req.user.id);
      return successResponse(res, docs, 'User documents retrieved');
    } catch (err) {
      next(err);
    }
  },

  async uploadDocument(req, res, next) {
    try {
      const doc = await profileService.uploadUserDocument(req.user.id, req.body);
      return successResponse(res, doc, 'Document uploaded successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async deleteDocument(req, res, next) {
    try {
      const result = await profileService.deleteUserDocument(req.user.id, req.params.documentId);
      return successResponse(res, result, 'Document deleted successfully');
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

  async delete(req, res, next) {
    try {
      const result = await departmentService.delete(req.user.organizationId, req.params.id);
      return successResponse(res, result, 'Department deleted successfully');
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
      // If user is regular employee without employees.read permission, ensure they can only access their own record
      if (req.user.role === 'EMPLOYEE') {
        const ownEmp = await employeeService.findByUserId(req.user.organizationId, req.user.id);
        if (!ownEmp || ownEmp.id !== req.params.id) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to perform this action',
            error: { code: 'FORBIDDEN' },
          });
        }
      }

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

  async delete(req, res, next) {
    try {
      const result = await employeeService.delete(req.user.organizationId, req.params.id);
      return successResponse(res, result, 'Employee deleted successfully');
    } catch (err) {
      next(err);
    }
  },
};

