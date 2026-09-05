import { Router } from 'express';
import authRoutes from './auth.routes.js';
import { userRoutes, organizationRoutes, departmentRoutes, employeeRoutes } from './user.routes.js';
import { contractRoutes, scheduleRoutes, attendanceRoutes, leaveRoutes, payrollRoutes, dashboardRoutes, auditRoutes, healthRoutes } from './contract.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/organizations', organizationRoutes);
router.use('/departments', departmentRoutes);
router.use('/employees', employeeRoutes);
router.use('/contracts', contractRoutes);
router.use('/working-schedules', scheduleRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/leaves', leaveRoutes);
router.use('/payroll', payrollRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/health', healthRoutes);

export default router;
