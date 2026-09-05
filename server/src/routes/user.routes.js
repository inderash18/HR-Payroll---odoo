import { Router } from 'express';
import { userController, profileController } from '../controllers/user.controller.js';
import { organizationController } from '../controllers/user.controller.js';
import { departmentController } from '../controllers/user.controller.js';
import { employeeController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requirePermission, validateTenant } from '../middleware/rbac.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createUserSchema, updateUserSchema } from '../validators/user.validator.js';
import { createDepartmentSchema, updateDepartmentSchema } from '../validators/department.validator.js';
import { createEmployeeSchema, updateEmployeeSchema } from '../validators/employee.validator.js';
import {
  updateProfileSchema,
  changePasswordSchema,
  avatarUploadSchema,
  preferencesSchema,
  documentUploadSchema,
} from '../validators/profile.validator.js';

export const userRoutes = Router();
userRoutes.use(authenticate, validateTenant);

// Profile endpoints for logged-in user (MUST be before /:id)
userRoutes.get('/me', profileController.getProfile);
userRoutes.patch('/me', validate(updateProfileSchema), profileController.updateProfile);
userRoutes.patch('/me/password', validate(changePasswordSchema), profileController.changePassword);
userRoutes.post('/me/avatar', validate(avatarUploadSchema), profileController.uploadAvatar);
userRoutes.delete('/me/avatar', profileController.deleteAvatar);
userRoutes.get('/me/preferences', profileController.getPreferences);
userRoutes.patch('/me/preferences', validate(preferencesSchema), profileController.updatePreferences);
userRoutes.get('/me/documents', profileController.getDocuments);
userRoutes.post('/me/documents', validate(documentUploadSchema), profileController.uploadDocument);
userRoutes.delete('/me/documents/:documentId', profileController.deleteDocument);

// General User management (Admin only)
userRoutes.get('/', requirePermission('users.read'), userController.list);
userRoutes.get('/:id', requirePermission('users.read'), userController.getById);
userRoutes.post('/', requirePermission('users.create'), validate(createUserSchema), userController.create);
userRoutes.patch('/:id', requirePermission('users.update'), validate(updateUserSchema), userController.update);

export const organizationRoutes = Router();
organizationRoutes.use(authenticate, validateTenant);
organizationRoutes.get('/current', organizationController.getCurrent);
organizationRoutes.get('/:id', requirePermission('organization.read'), organizationController.getById);
organizationRoutes.get('/', requirePermission('organization.read'), organizationController.listAll);
organizationRoutes.patch('/:id', requirePermission('organization.update'), organizationController.update);

export const departmentRoutes = Router();
departmentRoutes.use(authenticate, validateTenant);
departmentRoutes.get('/', requirePermission('departments.read'), departmentController.list);
departmentRoutes.get('/:id', requirePermission('departments.read'), departmentController.getById);
departmentRoutes.post('/', requirePermission('departments.create'), validate(createDepartmentSchema), departmentController.create);
departmentRoutes.put('/:id', requirePermission('departments.update'), validate(updateDepartmentSchema), departmentController.update);
departmentRoutes.delete('/:id', requirePermission('departments.delete'), departmentController.delete);

export const employeeRoutes = Router();
employeeRoutes.use(authenticate, validateTenant);
employeeRoutes.get('/', requirePermission('employees.read'), employeeController.list);
employeeRoutes.get('/:id', employeeController.getById);
employeeRoutes.post('/', requirePermission('employees.create'), validate(createEmployeeSchema), employeeController.create);
employeeRoutes.put('/:id', requirePermission('employees.update'), validate(updateEmployeeSchema), employeeController.update);
employeeRoutes.delete('/:id', requirePermission('employees.delete'), employeeController.delete);

