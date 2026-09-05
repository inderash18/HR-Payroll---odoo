import { Router } from 'express';
import { contractController, scheduleController, attendanceController } from '../controllers/contract.controller.js';
import { leaveController, payrollController, dashboardController, auditController, healthController } from '../controllers/leave.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requirePermission, requireAnyPermission, validateTenant } from '../middleware/rbac.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { PERMISSIONS } from '../config/permissions.js';

import { createContractSchema, updateContractSchema } from '../validators/contract.validator.js';
import { createWorkingScheduleSchema, updateWorkingScheduleSchema } from '../validators/schedule.validator.js';
import { clockInSchema, clockOutSchema } from '../validators/attendance.validator.js';
import { createLeaveTypeSchema, createLeaveRequestSchema, createLeaveAllocationSchema } from '../validators/leave.validator.js';
import { createSalaryStructureSchema, createSalaryRuleSchema, createPayrunSchema } from '../validators/payroll.validator.js';

export const contractRoutes = Router();
contractRoutes.use(authenticate, validateTenant);
contractRoutes.get('/', requireAnyPermission(PERMISSIONS.COMPENSATION_READ, PERMISSIONS.EMPLOYEES_READ), contractController.list);
contractRoutes.get('/:id', requireAnyPermission(PERMISSIONS.COMPENSATION_READ, PERMISSIONS.EMPLOYEES_READ), contractController.getById);
contractRoutes.post('/', requireAnyPermission(PERMISSIONS.COMPENSATION_UPDATE, PERMISSIONS.EMPLOYEES_UPDATE), validate(createContractSchema), contractController.create);
contractRoutes.put('/:id', requireAnyPermission(PERMISSIONS.COMPENSATION_UPDATE, PERMISSIONS.EMPLOYEES_UPDATE), validate(updateContractSchema), contractController.update);

export const scheduleRoutes = Router();
scheduleRoutes.use(authenticate, validateTenant);
scheduleRoutes.get('/', requirePermission(PERMISSIONS.ATTENDANCE_READ_ALL), scheduleController.list);
scheduleRoutes.get('/:id', requirePermission(PERMISSIONS.ATTENDANCE_READ_ALL), scheduleController.getById);
scheduleRoutes.post('/', requirePermission(PERMISSIONS.ATTENDANCE_MANAGE), validate(createWorkingScheduleSchema), scheduleController.create);
scheduleRoutes.patch('/:id', requirePermission(PERMISSIONS.ATTENDANCE_MANAGE), validate(updateWorkingScheduleSchema), scheduleController.update);

export const attendanceRoutes = Router();
attendanceRoutes.use(authenticate, validateTenant);
attendanceRoutes.get('/', requireAnyPermission(PERMISSIONS.ATTENDANCE_READ_ALL, PERMISSIONS.ATTENDANCE_READ_OWN), attendanceController.list);
attendanceRoutes.post('/clock-in', requirePermission(PERMISSIONS.ATTENDANCE_CHECKIN), validate(clockInSchema), attendanceController.clockIn);
attendanceRoutes.post('/clock-out', requirePermission(PERMISSIONS.ATTENDANCE_CHECKOUT), validate(clockOutSchema), attendanceController.clockOut);

export const leaveRoutes = Router();
leaveRoutes.use(authenticate, validateTenant);
leaveRoutes.get('/types', requireAnyPermission(PERMISSIONS.LEAVE_READ_ALL, PERMISSIONS.LEAVE_READ_OWN), leaveController.listTypes);
leaveRoutes.post('/types', requirePermission(PERMISSIONS.LEAVE_APPROVE), validate(createLeaveTypeSchema), leaveController.createType);
leaveRoutes.get('/allocations', requireAnyPermission(PERMISSIONS.LEAVE_READ_ALL, PERMISSIONS.LEAVE_READ_OWN), leaveController.listAllocations);
leaveRoutes.post('/allocations', requirePermission(PERMISSIONS.LEAVE_APPROVE), validate(createLeaveAllocationSchema), leaveController.createAllocation);
leaveRoutes.get('/requests', requireAnyPermission(PERMISSIONS.LEAVE_READ_ALL, PERMISSIONS.LEAVE_READ_OWN), leaveController.listRequests);
leaveRoutes.post('/requests', requireAnyPermission(PERMISSIONS.LEAVE_APPLY, PERMISSIONS.LEAVE_APPROVE), validate(createLeaveRequestSchema), leaveController.createRequest);
leaveRoutes.post('/requests/:id/approve', requirePermission(PERMISSIONS.LEAVE_APPROVE), leaveController.approve);
leaveRoutes.post('/requests/:id/reject', requirePermission(PERMISSIONS.LEAVE_APPROVE), leaveController.reject);

export const payrollRoutes = Router();
payrollRoutes.use(authenticate, validateTenant);
payrollRoutes.get('/structures', requirePermission(PERMISSIONS.SALARY_STRUCTURES_READ), payrollController.listStructures);
payrollRoutes.post('/structures', requirePermission(PERMISSIONS.SALARY_STRUCTURES_CREATE), validate(createSalaryStructureSchema), payrollController.createStructure);
payrollRoutes.post('/rules', requirePermission(PERMISSIONS.SALARY_COMPONENTS_CREATE), validate(createSalaryRuleSchema), payrollController.createRule);
payrollRoutes.get('/payruns', requirePermission(PERMISSIONS.PAYROLL_READ_ALL), payrollController.listPayruns);
payrollRoutes.get('/payruns/:id', requirePermission(PERMISSIONS.PAYROLL_READ_ALL), payrollController.getPayrunById);
payrollRoutes.post('/payruns', requirePermission(PERMISSIONS.PAYROLL_CREATE), validate(createPayrunSchema), payrollController.createPayrun);
payrollRoutes.post('/payruns/:id/compute', requirePermission(PERMISSIONS.PAYROLL_CALCULATE), payrollController.computePayrun);
payrollRoutes.post('/payruns/:id/validate', requirePermission(PERMISSIONS.PAYROLL_SUBMIT), payrollController.validatePayrun);
payrollRoutes.post('/payruns/:id/pay', requirePermission(PERMISSIONS.PAYROLL_SUBMIT), payrollController.markPayrunPaid);
payrollRoutes.post('/payruns/:id/send-payslips', requirePermission(PERMISSIONS.PAYROLL_SUBMIT), payrollController.sendPayrunPayslips);
payrollRoutes.get('/payslips', requireAnyPermission(PERMISSIONS.PAYSLIPS_READ_ALL, PERMISSIONS.PAYSLIPS_READ_OWN), payrollController.listPayslips);
payrollRoutes.get('/payslips/:id', requireAnyPermission(PERMISSIONS.PAYSLIPS_READ_ALL, PERMISSIONS.PAYSLIPS_READ_OWN), payrollController.getPayslipById);
payrollRoutes.get('/payslips/:id/html', requireAnyPermission(PERMISSIONS.PAYSLIPS_READ_ALL, PERMISSIONS.PAYSLIPS_READ_OWN), payrollController.getPayslipHtml);

export const dashboardRoutes = Router();
dashboardRoutes.use(authenticate, validateTenant);
dashboardRoutes.get('/', dashboardController.getRoleDashboard);
dashboardRoutes.get('/super-admin', dashboardController.getSuperAdmin);
dashboardRoutes.get('/admin', requirePermission(PERMISSIONS.ORGANIZATION_READ), dashboardController.getAdmin);
dashboardRoutes.get('/hr', requirePermission(PERMISSIONS.REPORTS_HR_READ), dashboardController.getHR);
dashboardRoutes.get('/payroll', requirePermission(PERMISSIONS.PAYROLL_REPORTS_READ), dashboardController.getPayroll);
dashboardRoutes.get('/finance', dashboardController.getFinance);
dashboardRoutes.get('/manager', dashboardController.getManager);
dashboardRoutes.get('/employee', requirePermission(PERMISSIONS.PROFILE_READ_OWN), dashboardController.getEmployee);
dashboardRoutes.get('/auditor', dashboardController.getAuditor);
dashboardRoutes.get('/overview', dashboardController.getOverview);
dashboardRoutes.get('/attendance', requireAnyPermission(PERMISSIONS.ATTENDANCE_READ_ALL, PERMISSIONS.ATTENDANCE_READ_OWN), dashboardController.getAttendance);
dashboardRoutes.get('/time-off', requireAnyPermission(PERMISSIONS.LEAVE_READ_ALL, PERMISSIONS.LEAVE_READ_OWN), dashboardController.getTimeOff);

export const auditRoutes = Router();
auditRoutes.use(authenticate, validateTenant);
auditRoutes.get('/', requirePermission(PERMISSIONS.AUDIT_READ), auditController.list);

export const healthRoutes = Router();
healthRoutes.get('/liveness', healthController.liveness);
healthRoutes.get('/readiness', healthController.readiness);
