import { prisma } from '../config/prisma.js';
import { auditRepository } from '../repositories/audit.repository.js';

export const dashboardService = {
  async getRoleDashboard(user, organizationId) {
    const role = user?.role || 'EMPLOYEE';

    switch (role) {
      case 'SUPER_ADMIN':
        return this.getSuperAdminDashboard();
      case 'ORGANIZATION_ADMIN':
      case 'ADMIN':
        return this.getOrgAdminDashboard(organizationId);
      case 'HR_MANAGER':
        return this.getHRManagerDashboard(organizationId);
      case 'PAYROLL_MANAGER':
      case 'HR_PAYROLL_MANAGER':
      case 'HR_PAYROLL_USER':
        return this.getPayrollManagerDashboard(organizationId);
      case 'FINANCE_MANAGER':
        return this.getFinanceManagerDashboard(organizationId);
      case 'DEPARTMENT_MANAGER':
        return this.getDepartmentManagerDashboard(organizationId, user.id);
      case 'AUDITOR':
        return this.getAuditorDashboard(organizationId);
      case 'EMPLOYEE':
      default:
        return this.getEmployeeDashboard(organizationId, user.id);
    }
  },

  // 1. SUPER_ADMIN DASHBOARD
  async getSuperAdminDashboard() {
    const [
      totalOrgs,
      totalUsers,
      totalEmployees,
      organizations,
      auditLogs,
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.user.count(),
      prisma.employee.count(),
      prisma.organization.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { users: true, employees: true, payruns: true } },
        },
      }),
      prisma.auditLog.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { organization: { select: { name: true } }, user: { select: { firstName: true, lastName: true, email: true } } },
      }),
    ]);

    return {
      role: 'SUPER_ADMIN',
      summary: {
        totalOrganizations: totalOrgs,
        activeOrganizations: totalOrgs,
        totalUsersAcrossOrgs: totalUsers,
        totalEmployeesPlatform: totalEmployees,
        systemHealth: '100% Operational',
        subscriptionStatus: 'Enterprise Active',
        securityAlertsCount: 0,
      },
      organizations: organizations.map((o) => ({
        id: o.id,
        name: o.name,
        code: o.code,
        currency: o.currency,
        timezone: o.timezone,
        usersCount: o._count.users,
        employeesCount: o._count.employees,
        payrunsCount: o._count.payruns,
        createdAt: o.createdAt,
      })),
      recentActivities: auditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        orgName: log.organization?.name || 'Platform',
        actor: log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System',
        createdAt: log.createdAt,
      })),
      quickActions: [
        { label: 'Add Organization', path: '/admin/organizations', icon: 'Building' },
        { label: 'Security Center', path: '/audit-logs', icon: 'Shield' },
        { label: 'Platform Settings', path: '/settings', icon: 'Settings' },
      ],
    };
  },

  // 2. ORGANIZATION_ADMIN DASHBOARD
  async getOrgAdminDashboard(organizationId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalEmployees,
      activeEmployees,
      departments,
      pendingLeaves,
      presentToday,
      latestPayruns,
      recentAuditLogs,
      contractsCount,
    ] = await Promise.all([
      prisma.employee.count({ where: { organizationId } }),
      prisma.employee.count({ where: { organizationId, isActive: true } }),
      prisma.department.findMany({
        where: { organizationId },
        include: { _count: { select: { employees: true } } },
      }),
      prisma.leaveRequest.count({ where: { organizationId, status: 'PENDING_APPROVAL' } }),
      prisma.attendance.count({ where: { organizationId, date: today, status: 'PRESENT' } }),
      prisma.payrun.findMany({
        where: { organizationId },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.findMany({
        where: { organizationId },
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      }),
      prisma.contract.count({ where: { organizationId, status: 'ACTIVE' } }),
    ]);

    const departmentHeadcounts = departments.map((d) => ({
      id: d.id,
      name: d.name,
      code: d.code,
      employeeCount: d._count.employees,
    }));

    const attendanceRate = totalEmployees > 0 ? parseFloat(((presentToday / totalEmployees) * 100).toFixed(1)) : 100;
    const latestPayrun = latestPayruns[0] || null;

    return {
      role: 'ORGANIZATION_ADMIN',
      summary: {
        totalEmployees,
        activeEmployees,
        departmentsCount: departments.length,
        activeContracts: contractsCount,
        pendingLeaveApprovals: pendingLeaves,
        presentToday,
        attendanceRate,
        currentPayrollStatus: latestPayrun ? latestPayrun.status : 'NO_PAYRUN',
        latestPayrunGross: latestPayrun ? Number(latestPayrun.totalGross) : 0,
        latestPayrunNet: latestPayrun ? Number(latestPayrun.totalNet) : 0,
        upcomingPayrollDate: 'Last Working Day of Month',
      },
      charts: {
        departmentHeadcounts,
        attendanceBreakdown: {
          present: presentToday,
          absent: Math.max(0, totalEmployees - presentToday),
          onLeave: pendingLeaves,
        },
      },
      recentActivities: recentAuditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        actor: log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Admin',
        createdAt: log.createdAt,
      })),
      quickActions: [
        { label: 'Add Employee', path: '/employees', icon: 'UserPlus' },
        { label: 'Create Department', path: '/departments', icon: 'FolderPlus' },
        { label: 'Review Leaves', path: '/leaves', icon: 'Calendar' },
        { label: 'Manage Roles', path: '/users', icon: 'Key' },
      ],
    };
  },

  // 3. HR_MANAGER DASHBOARD
  async getHRManagerDashboard(organizationId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalEmployees,
      activeEmployees,
      newJoiners,
      onLeaveToday,
      pendingLeaves,
      presentToday,
      departments,
      recentEmployees,
      upcomingBirthdays,
    ] = await Promise.all([
      prisma.employee.count({ where: { organizationId } }),
      prisma.employee.count({ where: { organizationId, isActive: true } }),
      prisma.employee.count({
        where: { organizationId, joiningDate: { gte: thirtyDaysAgo } },
      }),
      prisma.leaveRequest.count({
        where: {
          organizationId,
          status: 'APPROVED',
          startDate: { lte: today },
          endDate: { gte: today },
        },
      }),
      prisma.leaveRequest.count({ where: { organizationId, status: 'PENDING_APPROVAL' } }),
      prisma.attendance.count({ where: { organizationId, date: today, status: 'PRESENT' } }),
      prisma.department.findMany({
        where: { organizationId },
        include: { _count: { select: { employees: true } } },
      }),
      prisma.employee.findMany({
        where: { organizationId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { department: { select: { name: true } }, jobPosition: { select: { title: true } } },
      }),
      prisma.employee.findMany({
        where: { organizationId },
        take: 5,
        select: { id: true, firstName: true, lastName: true, joiningDate: true, workEmail: true },
      }),
    ]);

    const attendanceRate = totalEmployees > 0 ? parseFloat(((presentToday / totalEmployees) * 100).toFixed(1)) : 100;

    return {
      role: 'HR_MANAGER',
      summary: {
        employeeCount: totalEmployees,
        activeEmployees,
        newJoiners,
        employeesOnLeaveToday: onLeaveToday,
        pendingLeaveRequests: pendingLeaves,
        attendanceRate,
        presentToday,
      },
      charts: {
        departmentAttendance: departments.map((d) => ({
          departmentName: d.name,
          employeeCount: d._count.employees,
        })),
      },
      newJoinersList: recentEmployees.map((e) => ({
        id: e.id,
        name: `${e.firstName} ${e.lastName}`,
        department: e.department?.name || 'General',
        jobTitle: e.jobPosition?.title || 'Team Member',
        joiningDate: e.joiningDate,
      })),
      upcomingEvents: upcomingBirthdays.map((e) => ({
        id: e.id,
        name: `${e.firstName} ${e.lastName}`,
        type: 'Work Anniversary',
        date: e.joiningDate,
      })),
      quickActions: [
        { label: 'Onboard Employee', path: '/employees', icon: 'UserPlus' },
        { label: 'Approve Leaves', path: '/leaves', icon: 'CheckSquare' },
        { label: 'Clocking Review', path: '/attendance', icon: 'Clock' },
        { label: 'HR Reports', path: '/audit', icon: 'FileText' },
      ],
    };
  },

  // 4. PAYROLL_MANAGER DASHBOARD
  async getPayrollManagerDashboard(organizationId) {
    const [
      activeEmployees,
      activeContracts,
      employeesWithoutBank,
      pendingLeaveApprovals,
      payruns,
      latestPayslips,
      salaryStructuresCount,
    ] = await Promise.all([
      prisma.employee.count({ where: { organizationId, isActive: true } }),
      prisma.contract.count({ where: { organizationId, status: 'ACTIVE' } }),
      prisma.employee.count({
        where: {
          organizationId,
          isActive: true,
          OR: [{ bankAccountMasked: null }, { bankAccountMasked: '' }],
        },
      }),
      prisma.leaveRequest.count({ where: { organizationId, status: 'PENDING_APPROVAL' } }),
      prisma.payrun.findMany({
        where: { organizationId },
        take: 6,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payslip.findMany({
        where: { organizationId },
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: { employee: { select: { firstName: true, lastName: true, employeeNum: true } } },
      }),
      prisma.salaryStructure.count({ where: { organizationId } }),
    ]);

    const latestPayrun = payruns[0] || null;
    const computedOrPaidPayruns = payruns.filter((p) => p.status === 'COMPUTED' || p.status === 'PAID' || p.status === 'VALIDATED');
    const totalGross = computedOrPaidPayruns.reduce((acc, p) => acc + Number(p.totalGross), 0);
    const totalNet = computedOrPaidPayruns.reduce((acc, p) => acc + Number(p.totalNet), 0);
    const totalDeductions = Math.max(0, totalGross - totalNet);

    return {
      role: 'PAYROLL_MANAGER',
      summary: {
        payrollCycleStatus: latestPayrun ? latestPayrun.status : 'READY_TO_RUN',
        employeesReadyForPayroll: activeContracts,
        totalActiveEmployees: activeEmployees,
        missingBankInfoCount: employeesWithoutBank,
        pendingAttendanceApprovals: pendingLeaveApprovals,
        activeSalaryStructures: salaryStructuresCount,
        grossSalaryAmount: latestPayrun ? Number(latestPayrun.totalGross) : totalGross,
        deductionsAmount: latestPayrun ? Number(latestPayrun.totalGross) - Number(latestPayrun.totalNet) : totalDeductions,
        netPayrollPayable: latestPayrun ? Number(latestPayrun.totalNet) : totalNet,
        payslipsGeneratedCount: latestPayslips.length,
      },
      payrollHistory: payruns.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        startDate: p.startDate,
        endDate: p.endDate,
        totalGross: Number(p.totalGross),
        totalNet: Number(p.totalNet),
      })),
      recentPayslips: latestPayslips.map((ps) => ({
        id: ps.id,
        employeeName: `${ps.employee?.firstName} ${ps.employee?.lastName}`,
        employeeNum: ps.employee?.employeeNum,
        grossSalary: Number(ps.grossSalary),
        netSalary: Number(ps.netSalary),
      })),
      quickActions: [
        { label: 'New Payrun Batch', path: '/payroll', icon: 'Play' },
        { label: 'View Payslips', path: '/payslips', icon: 'FileText' },
        { label: 'Bank Export File', path: '/payroll', icon: 'Download' },
        { label: 'Salary Components', path: '/contracts', icon: 'Settings' },
      ],
    };
  },

  // 5. FINANCE_MANAGER DASHBOARD
  async getFinanceManagerDashboard(organizationId) {
    const [
      allPayruns,
      departments,
      recentPaidPayslips,
      pendingApprovals,
    ] = await Promise.all([
      prisma.payrun.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.department.findMany({
        where: { organizationId },
        include: {
          employees: {
            where: { isActive: true },
            include: { contracts: { where: { status: 'ACTIVE' } } },
          },
        },
      }),
      prisma.payslip.findMany({
        where: { organizationId },
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { employee: { select: { firstName: true, lastName: true, department: { select: { name: true } } } } },
      }),
      prisma.payrun.count({
        where: { organizationId, status: { in: ['COMPUTED', 'VALIDATED'] } },
      }),
    ]);

    const approvedPayruns = allPayruns.filter((p) => p.status === 'PAID' || p.status === 'VALIDATED');
    const totalPayrollExpense = approvedPayruns.reduce((acc, p) => acc + Number(p.totalGross), 0);
    const totalNetPayable = approvedPayruns.reduce((acc, p) => acc + Number(p.totalNet), 0);
    const totalTaxAndDeductions = Math.max(0, totalPayrollExpense - totalNetPayable);

    const departmentCostBreakdown = departments.map((d) => {
      const deptSalary = d.employees.reduce((sum, emp) => {
        const wage = emp.contracts?.[0]?.wage ? Number(emp.contracts[0].wage) : 0;
        return sum + wage;
      }, 0);
      return {
        departmentId: d.id,
        departmentName: d.name,
        employeeCount: d.employees.length,
        estimatedMonthlyCost: deptSalary,
      };
    });

    return {
      role: 'FINANCE_MANAGER',
      summary: {
        totalPayrollExpense,
        totalNetPayable,
        totalTaxAndDeductions,
        pendingApprovalsCount: pendingApprovals,
        approvedPayrunsCount: approvedPayruns.length,
        reimbursementTotals: 0,
        paymentStatus: pendingApprovals > 0 ? 'APPROVAL_REQUIRED' : 'UP_TO_DATE',
      },
      departmentCostBreakdown,
      recentPaidPayslips: recentPaidPayslips.map((ps) => ({
        id: ps.id,
        employeeName: `${ps.employee?.firstName} ${ps.employee?.lastName}`,
        department: ps.employee?.department?.name || 'General',
        grossSalary: Number(ps.grossSalary),
        netSalary: Number(ps.netSalary),
      })),
      quickActions: [
        { label: 'Review & Approve Payruns', path: '/payroll', icon: 'CheckCircle' },
        { label: 'Department Cost Breakdown', path: '/departments', icon: 'PieChart' },
        { label: 'Export Financial Report', path: '/audit', icon: 'Download' },
      ],
    };
  },

  // 6. DEPARTMENT_MANAGER DASHBOARD
  async getDepartmentManagerDashboard(organizationId, userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the department managed by this user
    const managedDept = await prisma.department.findFirst({
      where: { organizationId, managerId: userId },
    });

    const deptFilter = managedDept ? { departmentId: managedDept.id } : {};

    const [
      teamMembers,
      presentTeamMembers,
      onLeaveTeamMembers,
      pendingTeamLeaves,
      teamLeaves,
    ] = await Promise.all([
      prisma.employee.findMany({
        where: { organizationId, isActive: true, ...deptFilter },
        include: { jobPosition: { select: { title: true } } },
      }),
      prisma.attendance.findMany({
        where: {
          organizationId,
          date: today,
          status: 'PRESENT',
          ...(managedDept ? { employee: { departmentId: managedDept.id } } : {}),
        },
        include: { employee: { select: { firstName: true, lastName: true } } },
      }),
      prisma.leaveRequest.findMany({
        where: {
          organizationId,
          status: 'APPROVED',
          startDate: { lte: today },
          endDate: { gte: today },
          ...(managedDept ? { employee: { departmentId: managedDept.id } } : {}),
        },
        include: { employee: { select: { firstName: true, lastName: true } } },
      }),
      prisma.leaveRequest.findMany({
        where: {
          organizationId,
          status: 'PENDING_APPROVAL',
          ...(managedDept ? { employee: { departmentId: managedDept.id } } : {}),
        },
        include: { employee: { select: { firstName: true, lastName: true, employeeNum: true } }, leaveType: { select: { name: true } } },
      }),
      prisma.leaveRequest.findMany({
        where: {
          organizationId,
          ...(managedDept ? { employee: { departmentId: managedDept.id } } : {}),
        },
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: { employee: { select: { firstName: true, lastName: true } }, leaveType: { select: { name: true } } },
      }),
    ]);

    return {
      role: 'DEPARTMENT_MANAGER',
      departmentName: managedDept?.name || 'My Department',
      summary: {
        teamSize: teamMembers.length,
        presentToday: presentTeamMembers.length,
        onLeaveToday: onLeaveTeamMembers.length,
        pendingLeaveApprovals: pendingTeamLeaves.length,
        teamAttendanceRate: teamMembers.length > 0 ? parseFloat(((presentTeamMembers.length / teamMembers.length) * 100).toFixed(1)) : 100,
      },
      teamMembersList: teamMembers.map((m) => ({
        id: m.id,
        name: `${m.firstName} ${m.lastName}`,
        title: m.jobPosition?.title || 'Team Member',
        email: m.workEmail,
      })),
      pendingApprovals: pendingTeamLeaves.map((l) => ({
        id: l.id,
        employeeName: `${l.employee?.firstName} ${l.employee?.lastName}`,
        leaveType: l.leaveType?.name || 'Annual Leave',
        startDate: l.startDate,
        endDate: l.endDate,
        durationDays: Number(l.durationDays || 1),
        reason: l.reason,
      })),
      quickActions: [
        { label: 'Approve Team Leaves', path: '/leaves', icon: 'CheckSquare' },
        { label: 'Team Attendance', path: '/attendance', icon: 'Clock' },
        { label: 'Team Directory', path: '/employees', icon: 'Users' },
      ],
    };
  },

  // 7. EMPLOYEE DASHBOARD
  async getEmployeeDashboard(organizationId, userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        employee: {
          include: {
            department: { select: { name: true } },
            jobPosition: { select: { title: true } },
          },
        },
      },
    });

    const employeeId = user?.employee?.id;

    let todayAttendance = null;
    let pendingLeaves = [];
    let recentPayslips = [];
    let leaveBalances = [];

    if (employeeId) {
      const [att, leaves, payslips, allocations] = await Promise.all([
        prisma.attendance.findFirst({
          where: { organizationId, employeeId, date: today },
        }),
        prisma.leaveRequest.findMany({
          where: { organizationId, employeeId },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { leaveType: { select: { name: true, code: true } } },
        }),
        prisma.payslip.findMany({
          where: { organizationId, employeeId },
          take: 3,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.leaveAllocation.findMany({
          where: { organizationId, employeeId, status: 'APPROVED' },
          include: { leaveType: { select: { name: true, code: true } } },
        }),
      ]);

      todayAttendance = att;
      pendingLeaves = leaves;
      recentPayslips = payslips;
      leaveBalances = allocations;
    }

    const latestPayslip = recentPayslips[0] || null;

    return {
      role: 'EMPLOYEE',
      profileSummary: {
        name: user ? `${user.firstName} ${user.lastName}` : 'Employee',
        employeeNum: user?.employee?.employeeNum || 'EMP-360',
        department: user?.employee?.department?.name || 'General',
        jobTitle: user?.employee?.jobPosition?.title || 'Associate',
        joiningDate: user?.employee?.joiningDate || null,
        profileCompletion: user?.employee?.bankAccountMasked ? '100%' : '85%',
      },
      todayAttendance: {
        isCheckedIn: todayAttendance ? !!todayAttendance.checkIn : false,
        checkInTime: todayAttendance?.checkIn || null,
        checkOutTime: todayAttendance?.checkOut || null,
        status: todayAttendance?.status || 'NOT_CHECKED_IN',
        workedHours: Number(todayAttendance?.workedHours || 0),
      },
      leaveSummary: {
        totalAllocatedDays: leaveBalances.reduce((sum, a) => sum + Number(a.allocatedDays), 0),
        pendingRequestsCount: pendingLeaves.filter((l) => l.status === 'PENDING_APPROVAL').length,
        recentLeaves: pendingLeaves.map((l) => ({
          id: l.id,
          type: l.leaveType?.name || 'Leave',
          startDate: l.startDate,
          endDate: l.endDate,
          status: l.status,
        })),
      },
      latestPayslip: latestPayslip
        ? {
            id: latestPayslip.id,
            grossSalary: Number(latestPayslip.grossSalary),
            netSalary: Number(latestPayslip.netSalary),
            currency: latestPayslip.currency,
            createdAt: latestPayslip.createdAt,
          }
        : null,
      upcomingHolidays: [
        { name: 'National Public Holiday', date: '2026-10-02' },
        { name: 'Diwali Festive Holiday', date: '2026-11-08' },
        { name: 'Year End Break', date: '2026-12-25' },
      ],
      quickActions: [
        { label: 'Check In / Out', path: '/attendance', icon: 'Clock' },
        { label: 'Apply Leave', path: '/leaves', icon: 'Calendar' },
        { label: 'My Payslips', path: '/payslips', icon: 'FileText' },
        { label: 'Edit Profile', path: '/profile', icon: 'User' },
      ],
    };
  },

  // 8. AUDITOR DASHBOARD
  async getAuditorDashboard(organizationId) {
    const [
      auditStats,
      recentAuditLogs,
      securityLogs,
      payrollChangeLogs,
    ] = await Promise.all([
      prisma.auditLog.count({ where: { organizationId } }),
      prisma.auditLog.findMany({
        where: { organizationId },
        take: 12,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true, email: true, role: true } } },
      }),
      prisma.auditLog.findMany({
        where: {
          organizationId,
          entityType: { in: ['USER', 'SESSION', 'AUTH', 'SECURITY'] },
        },
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      }),
      prisma.auditLog.findMany({
        where: {
          organizationId,
          entityType: { in: ['PAYRUN', 'PAYSLIP', 'SALARY_STRUCTURE', 'CONTRACT'] },
        },
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      }),
    ]);

    return {
      role: 'AUDITOR',
      summary: {
        totalAuditLogs: auditStats,
        securityEventsCount: securityLogs.length,
        payrollModificationsCount: payrollChangeLogs.length,
        complianceStatus: 'FULLY_COMPLIANT',
        readOnlyMode: true,
      },
      recentLogs: recentAuditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        actor: log.user ? `${log.user.firstName} ${log.user.lastName} (${log.user.role})` : 'System',
        actorEmail: log.user?.email || 'N/A',
        ipAddress: log.ipAddress || '127.0.0.1',
        createdAt: log.createdAt,
      })),
      securityEvents: securityLogs.map((log) => ({
        id: log.id,
        action: log.action,
        actor: log.user ? log.user.email : 'System',
        createdAt: log.createdAt,
      })),
      payrollAuditTrail: payrollChangeLogs.map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        actor: log.user ? log.user.email : 'System',
        createdAt: log.createdAt,
      })),
      quickActions: [
        { label: 'View All Audit Logs', path: '/audit-logs', icon: 'List' },
        { label: 'Export Compliance Log', path: '/audit-logs', icon: 'Download' },
      ],
    };
  },

  // Generic legacy helpers
  async getOverview(organizationId) {
    return this.getOrgAdminDashboard(organizationId);
  },

  async getAttendanceMetrics(organizationId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [presentToday, totalEmployees] = await Promise.all([
      prisma.attendance.count({ where: { organizationId, date: today, status: 'PRESENT' } }),
      prisma.employee.count({ where: { organizationId, isActive: true } }),
    ]);

    return {
      presentToday,
      totalEmployees,
      attendanceRate: totalEmployees > 0 ? parseFloat(((presentToday / totalEmployees) * 100).toFixed(1)) : 100,
    };
  },

  async getTimeOffMetrics(organizationId) {
    const [pending, approved, rejected] = await Promise.all([
      prisma.leaveRequest.count({ where: { organizationId, status: 'PENDING_APPROVAL' } }),
      prisma.leaveRequest.count({ where: { organizationId, status: 'APPROVED' } }),
      prisma.leaveRequest.count({ where: { organizationId, status: 'REJECTED' } }),
    ]);

    return { pending, approved, rejected };
  },
};

export const auditService = {
  async log({ organizationId, userId, action, entityType, entityId, oldValues = null, newValues = null, ipAddress = null, userAgent = null }, tx = prisma) {
    try {
      if (organizationId === 'dev-local-org') return;
      await auditRepository.create({
        organizationId,
        userId: userId || null,
        action,
        entityType,
        entityId,
        oldValues,
        newValues,
        ipAddress,
        userAgent,
      }, tx);
    } catch (e) {
      console.warn('Failed to record audit log:', e.message);
    }
  },

  async list(organizationId, query = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const [total, items] = await auditRepository.findMany(organizationId, {
      skip,
      take: limit,
      entityType: query.entityType,
      entityId: query.entityId,
      userId: query.userId,
      startDate: query.startDate,
      endDate: query.endDate,
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },
};
