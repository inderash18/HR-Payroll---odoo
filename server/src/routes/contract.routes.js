import { Router } from 'express';
import { contractController, scheduleController, attendanceController } from '../controllers/contract.controller.js';
import { leaveController, payrollController, dashboardController, auditController, healthController } from '../controllers/leave.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/roles.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { ROLES } from '../config/constants.js';

import { createContractSchema, updateContractSchema } from '../validators/contract.validator.js';
import { createWorkingScheduleSchema, updateWorkingScheduleSchema } from '../validators/schedule.validator.js';
import { clockInSchema, clockOutSchema } from '../validators/attendance.validator.js';
import { createLeaveTypeSchema, createLeaveRequestSchema, createLeaveAllocationSchema } from '../validators/leave.validator.js';
import { createSalaryStructureSchema, createSalaryRuleSchema, createPayrunSchema } from '../validators/payroll.validator.js';

export const contractRoutes = Router();
contractRoutes.use(authenticate);
contractRoutes.get('/', contractController.list);
contractRoutes.get('/:id', contractController.getById);
contractRoutes.post('/', authorize(ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.HR_PAYROLL_MANAGER), validate(createContractSchema), contractController.create);
contractRoutes.put('/:id', authorize(ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.HR_PAYROLL_MANAGER), validate(updateContractSchema), contractController.update);

export const scheduleRoutes = Router();
scheduleRoutes.use(authenticate);
scheduleRoutes.get('/', scheduleController.list);
scheduleRoutes.get('/:id', scheduleController.getById);
scheduleRoutes.post('/', authorize(ROLES.ADMIN, ROLES.HR_MANAGER), validate(createWorkingScheduleSchema), scheduleController.create);
scheduleRoutes.patch('/:id', authorize(ROLES.ADMIN, ROLES.HR_MANAGER), validate(updateWorkingScheduleSchema), scheduleController.update);

export const attendanceRoutes = Router();
attendanceRoutes.use(authenticate);
attendanceRoutes.get('/', attendanceController.list);
attendanceRoutes.post('/clock-in', validate(clockInSchema), attendanceController.clockIn);
attendanceRoutes.post('/clock-out', validate(clockOutSchema), attendanceController.clockOut);

export const leaveRoutes = Router();
leaveRoutes.use(authenticate);
leaveRoutes.get('/types', leaveController.listTypes);
leaveRoutes.post('/types', authorize(ROLES.ADMIN, ROLES.HR_MANAGER), validate(createLeaveTypeSchema), leaveController.createType);
leaveRoutes.get('/allocations', leaveController.listAllocations);
leaveRoutes.post('/allocations', authorize(ROLES.ADMIN, ROLES.HR_MANAGER), validate(createLeaveAllocationSchema), leaveController.createAllocation);
leaveRoutes.get('/requests', leaveController.listRequests);
leaveRoutes.post('/requests', validate(createLeaveRequestSchema), leaveController.createRequest);
leaveRoutes.post('/requests/:id/approve', authorize(ROLES.ADMIN, ROLES.HR_MANAGER), leaveController.approve);
leaveRoutes.post('/requests/:id/reject', authorize(ROLES.ADMIN, ROLES.HR_MANAGER), leaveController.reject);

export const payrollRoutes = Router();
payrollRoutes.use(authenticate);
payrollRoutes.get('/structures', payrollController.listStructures);
payrollRoutes.post('/structures', authorize(ROLES.ADMIN, ROLES.HR_PAYROLL_MANAGER), validate(createSalaryStructureSchema), payrollController.createStructure);
payrollRoutes.post('/rules', authorize(ROLES.ADMIN, ROLES.HR_PAYROLL_MANAGER), validate(createSalaryRuleSchema), payrollController.createRule);
payrollRoutes.get('/payruns', payrollController.listPayruns);
payrollRoutes.get('/payruns/:id', payrollController.getPayrunById);
payrollRoutes.post('/payruns', authorize(ROLES.ADMIN, ROLES.HR_PAYROLL_MANAGER), validate(createPayrunSchema), payrollController.createPayrun);
payrollRoutes.post('/payruns/:id/compute', authorize(ROLES.ADMIN, ROLES.HR_PAYROLL_MANAGER), payrollController.computePayrun);
payrollRoutes.post('/payruns/:id/validate', authorize(ROLES.ADMIN, ROLES.HR_PAYROLL_MANAGER), payrollController.validatePayrun);
payrollRoutes.post('/payruns/:id/pay', authorize(ROLES.ADMIN, ROLES.HR_PAYROLL_MANAGER), payrollController.markPayrunPaid);
payrollRoutes.post('/payruns/:id/send-payslips', authorize(ROLES.ADMIN, ROLES.HR_PAYROLL_MANAGER), payrollController.sendPayrunPayslips);
payrollRoutes.get('/payslips', payrollController.listPayslips);
payrollRoutes.get('/payslips/:id', payrollController.getPayslipById);
payrollRoutes.get('/payslips/:id/html', payrollController.getPayslipHtml);

export const dashboardRoutes = Router();
dashboardRoutes.use(authenticate);
dashboardRoutes.get('/', dashboardController.getRoleDashboard);
dashboardRoutes.get('/super-admin', dashboardController.getSuperAdmin);
dashboardRoutes.get('/admin', dashboardController.getAdmin);
dashboardRoutes.get('/hr', dashboardController.getHR);
dashboardRoutes.get('/payroll', dashboardController.getPayroll);
dashboardRoutes.get('/finance', dashboardController.getFinance);
dashboardRoutes.get('/manager', dashboardController.getManager);
dashboardRoutes.get('/employee', dashboardController.getEmployee);
dashboardRoutes.get('/auditor', dashboardController.getAuditor);
dashboardRoutes.get('/overview', dashboardController.getOverview);
dashboardRoutes.get('/attendance', dashboardController.getAttendance);
dashboardRoutes.get('/time-off', dashboardController.getTimeOff);

export const auditRoutes = Router();
auditRoutes.use(authenticate);
auditRoutes.get('/', authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.ORGANIZATION_ADMIN, ROLES.AUDITOR, ROLES.HR_MANAGER), auditController.list);

export const healthRoutes = Router();
healthRoutes.get('/liveness', healthController.liveness);
healthRoutes.get('/readiness', healthController.readiness);
