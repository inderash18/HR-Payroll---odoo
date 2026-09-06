import { prisma } from '../config/prisma.js';

export const searchService = {
  async search(user, query = '', limit = 10) {
    const q = (query || '').trim();
    const organizationId = user.organizationId;
    const role = user.role || 'EMPLOYEE';
    const userId = user.id;

    const maxItems = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 25);
    const groups = [];

    if (!q || q.length < 1) {
      return { query: q, groups: [] };
    }

    // Role Capabilities
    const isAdmin = ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN'].includes(role);
    const isHR = ['HR_MANAGER', 'DEPARTMENT_MANAGER'].includes(role) || isAdmin;
    const isPayroll = ['PAYROLL_MANAGER', 'HR_PAYROLL_MANAGER', 'FINANCE_MANAGER'].includes(role) || isAdmin;
    const isAuditor = role === 'AUDITOR' || isAdmin;

    // 1. Search Employees / People
    try {
      const employees = await prisma.employee.findMany({
        where: {
          organizationId,
          isActive: true,
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { workEmail: { contains: q, mode: 'insensitive' } },
            { employeeNum: { contains: q, mode: 'insensitive' } },
            { jobPosition: { title: { contains: q, mode: 'insensitive' } } },
            { department: { name: { contains: q, mode: 'insensitive' } } },
          ],
        },
        include: {
          department: { select: { name: true } },
          jobPosition: { select: { title: true } },
        },
        take: maxItems,
      });

      if (employees.length > 0) {
        groups.push({
          type: 'employees',
          label: 'People',
          results: employees.map((emp) => {
            const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee';
            const roleTitle = emp.jobPosition?.title || 'Team Member';
            const deptName = emp.department?.name || 'General';
            return {
              id: emp.id,
              type: 'employee',
              title: fullName,
              subtitle: `${roleTitle} · ${deptName}`,
              badge: emp.employeeNum,
              status: emp.isActive ? 'Active' : 'Inactive',
              route: isHR ? `/employees?search=${encodeURIComponent(emp.employeeNum || fullName)}` : `/employees`,
              avatarUrl: null,
            };
          }),
        });
      }
    } catch (err) {
      console.error('Search employees error:', err);
    }

    // 2. Search Departments (Admin, HR, Auditor, or general directory)
    if (isHR || isAuditor || true) {
      try {
        const departments = await prisma.department.findMany({
          where: {
            organizationId,
            active: true,
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { code: { contains: q, mode: 'insensitive' } },
            ],
          },
          include: {
            _count: { select: { employees: true } },
          },
          take: maxItems,
        });

        if (departments.length > 0) {
          groups.push({
            type: 'departments',
            label: 'Departments',
            results: departments.map((dept) => ({
              id: dept.id,
              type: 'department',
              title: dept.name,
              subtitle: `${dept._count?.employees || 0} Employees · Code: ${dept.code}`,
              badge: dept.code,
              status: dept.active ? 'Active' : 'Inactive',
              route: `/departments`,
            })),
          });
        }
      } catch (err) {
        console.error('Search departments error:', err);
      }
    }

    // 3. Search Payroll Runs (Payroll Managers, Admins, Auditors)
    if (isPayroll || isAuditor) {
      try {
        const payruns = await prisma.payrun.findMany({
          where: {
            organizationId,
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
            ],
          },
          orderBy: { createdAt: 'desc' },
          take: maxItems,
        });

        if (payruns.length > 0) {
          groups.push({
            type: 'payroll',
            label: 'Payroll Batches',
            results: payruns.map((pr) => ({
              id: pr.id,
              type: 'payrun',
              title: pr.name,
              subtitle: `Gross: ₹${Number(pr.totalGross || 0).toLocaleString('en-IN')} · Net: ₹${Number(pr.totalNet || 0).toLocaleString('en-IN')}`,
              badge: pr.status,
              status: pr.status,
              route: `/payroll`,
            })),
          });
        }
      } catch (err) {
        console.error('Search payroll error:', err);
      }
    }

    // 4. Search Payslips
    try {
      const payslipWhere = {
        organizationId,
        OR: [
          { employee: { firstName: { contains: q, mode: 'insensitive' } } },
          { employee: { lastName: { contains: q, mode: 'insensitive' } } },
          { employee: { employeeNum: { contains: q, mode: 'insensitive' } } },
          { payrun: { name: { contains: q, mode: 'insensitive' } } },
        ],
      };

      // If regular employee, restrict strictly to their own payslips
      if (!isPayroll && !isAdmin && !isAuditor) {
        const ownEmp = await prisma.employee.findFirst({
          where: { organizationId, userId },
          select: { id: true },
        });
        if (ownEmp) {
          payslipWhere.employeeId = ownEmp.id;
        } else {
          payslipWhere.id = 'non-existent';
        }
      }

      const payslips = await prisma.payslip.findMany({
        where: payslipWhere,
        include: {
          employee: { select: { firstName: true, lastName: true, employeeNum: true } },
          payrun: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: maxItems,
      });

      if (payslips.length > 0) {
        groups.push({
          type: 'payslips',
          label: 'Payslips',
          results: payslips.map((ps) => {
            const empName = `${ps.employee?.firstName || ''} ${ps.employee?.lastName || ''}`.trim();
            return {
              id: ps.id,
              type: 'payslip',
              title: `${empName} — ${ps.payrun?.name || 'Payslip'}`,
              subtitle: `Net Salary: ₹${Number(ps.netSalary || 0).toLocaleString('en-IN')} · ID: ${ps.employee?.employeeNum || ''}`,
              badge: '₹' + Number(ps.netSalary || 0).toLocaleString('en-IN'),
              status: 'Validated',
              route: `/payslips`,
            };
          }),
        });
      }
    } catch (err) {
      console.error('Search payslips error:', err);
    }

    // 5. Search Leave Requests
    try {
      const leaveWhere = {
        organizationId,
        OR: [
          { reason: { contains: q, mode: 'insensitive' } },
          { leaveType: { name: { contains: q, mode: 'insensitive' } } },
          { employee: { firstName: { contains: q, mode: 'insensitive' } } },
          { employee: { lastName: { contains: q, mode: 'insensitive' } } },
        ],
      };

      // If regular employee, restrict to own leaves
      if (!isHR && !isAdmin && !isAuditor) {
        const ownEmp = await prisma.employee.findFirst({
          where: { organizationId, userId },
          select: { id: true },
        });
        if (ownEmp) {
          leaveWhere.employeeId = ownEmp.id;
        } else {
          leaveWhere.id = 'non-existent';
        }
      }

      const leaves = await prisma.leaveRequest.findMany({
        where: leaveWhere,
        include: {
          employee: { select: { firstName: true, lastName: true } },
          leaveType: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: maxItems,
      });

      if (leaves.length > 0) {
        groups.push({
          type: 'leaves',
          label: 'Leave & Attendance',
          results: leaves.map((lr) => {
            const empName = `${lr.employee?.firstName || ''} ${lr.employee?.lastName || ''}`.trim();
            return {
              id: lr.id,
              type: 'leave',
              title: `${empName} — ${lr.leaveType?.name || 'Leave'}`,
              subtitle: `${lr.numberOfDays || 1} day(s) · ${lr.reason || 'No reason specified'}`,
              badge: lr.status,
              status: lr.status,
              route: `/leaves`,
            };
          }),
        });
      }
    } catch (err) {
      console.error('Search leaves error:', err);
    }

    // 6. Search Announcements
    try {
      const announcements = await prisma.announcement.findMany({
        where: {
          organizationId,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
          ],
        },
        orderBy: { publishedAt: 'desc' },
        take: maxItems,
      });

      if (announcements.length > 0) {
        groups.push({
          type: 'announcements',
          label: 'Announcements',
          results: announcements.map((an) => ({
            id: an.id,
            type: 'announcement',
            title: an.title,
            subtitle: `${an.category} · Priority: ${an.priority}`,
            badge: an.priority,
            status: an.category,
            route: `/dashboard`,
          })),
        });
      }
    } catch (err) {
      console.error('Search announcements error:', err);
    }

    // 7. Search Audit Logs (Only Admins / Auditors)
    if (isAuditor) {
      try {
        const auditLogs = await prisma.auditLog.findMany({
          where: {
            organizationId,
            OR: [
              { action: { contains: q, mode: 'insensitive' } },
              { entityType: { contains: q, mode: 'insensitive' } },
            ],
          },
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: maxItems,
        });

        if (auditLogs.length > 0) {
          groups.push({
            type: 'audit',
            label: 'Audit & Security Logs',
            results: auditLogs.map((log) => ({
              id: log.id,
              type: 'audit',
              title: `${log.action} (${log.entityType})`,
              subtitle: `Triggered by ${log.user?.email || 'System'} at ${new Date(log.createdAt).toLocaleTimeString()}`,
              badge: log.entityType,
              status: 'Logged',
              route: `/audit-logs`,
            })),
          });
        }
      } catch (err) {
        console.error('Search audit logs error:', err);
      }
    }

    return {
      query: q,
      groups,
    };
  },
};
