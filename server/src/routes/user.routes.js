import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { organizationController } from '../controllers/user.controller.js';
import { departmentController } from '../controllers/user.controller.js';
import { employeeController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/roles.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { ROLES } from '../config/constants.js';
import { createUserSchema, updateUserSchema } from '../validators/user.validator.js';
import { createDepartmentSchema, updateDepartmentSchema } from '../validators/department.validator.js';
import { createEmployeeSchema, updateEmployeeSchema } from '../validators/employee.validator.js';

export const userRoutes = Router();
userRoutes.use(authenticate);
userRoutes.get('/', authorize(ROLES.ADMIN, ROLES.HR_MANAGER), userController.list);
userRoutes.get('/:id', authorize(ROLES.ADMIN, ROLES.HR_MANAGER), userController.getById);
userRoutes.post('/', authorize(ROLES.ADMIN), validate(createUserSchema), userController.create);
userRoutes.patch('/:id', authorize(ROLES.ADMIN), validate(updateUserSchema), userController.update);

export const organizationRoutes = Router();
organizationRoutes.use(authenticate);
organizationRoutes.get('/current', organizationController.getCurrent);
organizationRoutes.get('/:id', authorize(ROLES.ADMIN), organizationController.getById);
organizationRoutes.get('/', authorize(ROLES.ADMIN), organizationController.listAll);
organizationRoutes.patch('/:id', authorize(ROLES.ADMIN), organizationController.update);

export const departmentRoutes = Router();
departmentRoutes.use(authenticate);
departmentRoutes.get('/', departmentController.list);
departmentRoutes.get('/:id', departmentController.getById);
departmentRoutes.post('/', authorize(ROLES.ADMIN, ROLES.HR_MANAGER), validate(createDepartmentSchema), departmentController.create);
departmentRoutes.put('/:id', authorize(ROLES.ADMIN, ROLES.HR_MANAGER), validate(updateDepartmentSchema), departmentController.update);

export const employeeRoutes = Router();
employeeRoutes.use(authenticate);
employeeRoutes.get('/', employeeController.list);
employeeRoutes.get('/:id', employeeController.getById);
employeeRoutes.post('/', authorize(ROLES.ADMIN, ROLES.HR_MANAGER), validate(createEmployeeSchema), employeeController.create);
employeeRoutes.put('/:id', authorize(ROLES.ADMIN, ROLES.HR_MANAGER), validate(updateEmployeeSchema), employeeController.update);
