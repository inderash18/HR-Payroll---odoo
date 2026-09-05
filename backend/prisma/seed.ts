import { PrismaClient, Role, AmountType, RuleCategoryType, ContractStatus, LeaveStatus, AllocationStatus, AttendanceStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed for PeoplePay360...');

  // 1. Organization
  const organization = await prisma.organization.upsert({
    where: { code: 'DEMO-ORG' },
    update: {},
    create: {
      name: 'PeoplePay360 Global Demo Corp',
      code: 'DEMO-ORG',
      currency: 'USD',
      timezone: 'America/New_York',
    },
  });
  console.log(`✅ Organization: ${organization.name} (${organization.id})`);

  // 2. Legal Entity
  const legalEntity = await prisma.legalEntity.upsert({
    where: {
      organizationId_code: {
        organizationId: organization.id,
        code: 'PP360-US',
      },
    },
    update: {},
    create: {
      organizationId: organization.id,
      name: 'PeoplePay Technologies LLC',
      code: 'PP360-US',
      country: 'United States',
      currency: 'USD',
      registrationNum: 'REG-US-9874102',
    },
  });
  console.log(`✅ Legal Entity: ${legalEntity.name}`);

  // 3. Working Schedule & Lines
  let schedule = await prisma.workingSchedule.findFirst({
    where: { organizationId: organization.id, name: 'Standard 40H Work Week' },
  });

  if (!schedule) {
    schedule = await prisma.workingSchedule.create({
      data: {
        organizationId: organization.id,
        name: 'Standard 40H Work Week',
        type: 'STANDARD_40H',
        timezone: 'America/New_York',
        active: true,
        lines: {
          create: [
            { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', breakMinutes: 60 },
            { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', breakMinutes: 60 },
            { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', breakMinutes: 60 },
            { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', breakMinutes: 60 },
            { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', breakMinutes: 60 },
          ],
        },
      },
    });
  }
  console.log(`✅ Working Schedule: ${schedule.name}`);

  // 4. Departments
  const deptEngineering = await prisma.department.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'ENG' } },
    update: {},
    create: {
      organizationId: organization.id,
      name: 'Engineering',
      code: 'ENG',
    },
  });

  const deptHR = await prisma.department.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'HR' } },
    update: {},
    create: {
      organizationId: organization.id,
      name: 'Human Resources',
      code: 'HR',
    },
  });

  const deptFinance = await prisma.department.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'FIN' } },
    update: {},
    create: {
      organizationId: organization.id,
      name: 'Finance & Payroll',
      code: 'FIN',
    },
  });
  console.log('✅ Departments: Engineering, Human Resources, Finance & Payroll');

  // 5. Job Positions
  const posSoftwareEngineer = await prisma.jobPosition.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'SWE-SR' } },
    update: {},
    create: {
      organizationId: organization.id,
      departmentId: deptEngineering.id,
      title: 'Senior Software Engineer',
      code: 'SWE-SR',
    },
  });

  const posHRLead = await prisma.jobPosition.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'HR-LEAD' } },
    update: {},
    create: {
      organizationId: organization.id,
      departmentId: deptHR.id,
      title: 'Lead HR Partner',
      code: 'HR-LEAD',
    },
  });

  const posPayrollSpecialist = await prisma.jobPosition.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'PAY-SPEC' } },
    update: {},
    create: {
      organizationId: organization.id,
      departmentId: deptFinance.id,
      title: 'Payroll Specialist',
      code: 'PAY-SPEC',
    },
  });
  console.log('✅ Job Positions seeded');

  // 6. Users
  const adminHash = await bcrypt.hash('Admin@123456', 10);
  const hrHash = await bcrypt.hash('Hr@123456', 10);
  const payrollHash = await bcrypt.hash('Payroll@123456', 10);
  const empHash = await bcrypt.hash('Emp@123456', 10);

  const adminUser = await prisma.user.upsert({
    where: { organizationId_email: { organizationId: organization.id, email: 'admin@peoplepay360.local' } },
    update: {},
    create: {
      organizationId: organization.id,
      legalEntityId: legalEntity.id,
      email: 'admin@peoplepay360.local',
      passwordHash: adminHash,
      firstName: 'System',
      lastName: 'Administrator',
      role: Role.ADMIN,
    },
  });

  const payrollUser = await prisma.user.upsert({
    where: { organizationId_email: { organizationId: organization.id, email: 'payroll.manager@peoplepay360.local' } },
    update: {},
    create: {
      organizationId: organization.id,
      legalEntityId: legalEntity.id,
      email: 'payroll.manager@peoplepay360.local',
      passwordHash: payrollHash,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      role: Role.HR_PAYROLL_MANAGER,
    },
  });

  const hrUser = await prisma.user.upsert({
    where: { organizationId_email: { organizationId: organization.id, email: 'hr.manager@peoplepay360.local' } },
    update: {},
    create: {
      organizationId: organization.id,
      legalEntityId: legalEntity.id,
      email: 'hr.manager@peoplepay360.local',
      passwordHash: hrHash,
      firstName: 'David',
      lastName: 'Mitchell',
      role: Role.HR_MANAGER,
    },
  });

  const empUser = await prisma.user.upsert({
    where: { organizationId_email: { organizationId: organization.id, email: 'employee@peoplepay360.local' } },
    update: {},
    create: {
      organizationId: organization.id,
      legalEntityId: legalEntity.id,
      email: 'employee@peoplepay360.local',
      passwordHash: empHash,
      firstName: 'Alex',
      lastName: 'Johnson',
      role: Role.EMPLOYEE,
    },
  });
  console.log('✅ Users & Roles: Admin, HR Manager, Payroll Manager, Employee');

  // 7. Employees
  const empRecord = await prisma.employee.upsert({
    where: { organizationId_employeeNum: { organizationId: organization.id, employeeNum: 'EMP-00101' } },
    update: {},
    create: {
      organizationId: organization.id,
      legalEntityId: legalEntity.id,
      userId: empUser.id,
      departmentId: deptEngineering.id,
      jobPositionId: posSoftwareEngineer.id,
      workingScheduleId: schedule.id,
      employeeNum: 'EMP-00101',
      firstName: 'Alex',
      lastName: 'Johnson',
      workEmail: 'employee@peoplepay360.local',
      personalEmail: 'alex.johnson.personal@gmail.com',
      phone: '+1-555-0199',
      bankName: 'JPMorgan Chase',
      bankAccountMasked: '••••••••4821',
      taxId: 'US-TAX-982104',
      isActive: true,
    },
  });

  const hrEmpRecord = await prisma.employee.upsert({
    where: { organizationId_employeeNum: { organizationId: organization.id, employeeNum: 'EMP-00102' } },
    update: {},
    create: {
      organizationId: organization.id,
      legalEntityId: legalEntity.id,
      userId: hrUser.id,
      departmentId: deptHR.id,
      jobPositionId: posHRLead.id,
      workingScheduleId: schedule.id,
      employeeNum: 'EMP-00102',
      firstName: 'David',
      lastName: 'Mitchell',
      workEmail: 'hr.manager@peoplepay360.local',
      bankName: 'Bank of America',
      bankAccountMasked: '••••••••7734',
      taxId: 'US-TAX-334190',
      isActive: true,
    },
  });
  console.log(`✅ Employees: Alex Johnson (${empRecord.employeeNum}), David Mitchell (${hrEmpRecord.employeeNum})`);

  // 8. Leave Types
  const leaveVacation = await prisma.leaveType.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'VACATION' } },
    update: {},
    create: {
      organizationId: organization.id,
      name: 'Paid Annual Leave',
      code: 'VACATION',
      isPaid: true,
      requiresAllocation: true,
      approvalRequired: true,
      daysAllowed: 20,
      active: true,
    },
  });

  const leaveSick = await prisma.leaveType.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'SICK' } },
    update: {},
    create: {
      organizationId: organization.id,
      name: 'Sick Leave',
      code: 'SICK',
      isPaid: true,
      requiresAllocation: true,
      approvalRequired: false,
      daysAllowed: 10,
      active: true,
    },
  });

  const leaveUnpaid = await prisma.leaveType.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'UNPAID' } },
    update: {},
    create: {
      organizationId: organization.id,
      name: 'Unpaid Leave / LOP',
      code: 'UNPAID',
      isPaid: false,
      requiresAllocation: false,
      approvalRequired: true,
      daysAllowed: 0,
      active: true,
    },
  });
  console.log('✅ Leave Types: Paid Annual Leave, Sick Leave, Unpaid Leave');

  // 9. Leave Allocations
  let allocation = await prisma.leaveAllocation.findFirst({
    where: { organizationId: organization.id, employeeId: empRecord.id, leaveTypeId: leaveVacation.id },
  });

  if (!allocation) {
    allocation = await prisma.leaveAllocation.create({
      data: {
        organizationId: organization.id,
        employeeId: empRecord.id,
        leaveTypeId: leaveVacation.id,
        allocatedAmount: 12,
        consumedAmount: 2,
        validFrom: new Date('2026-01-01'),
        validUntil: new Date('2026-12-31'),
        status: AllocationStatus.APPROVED,
      },
    });
  }
  console.log(`✅ Leave Allocation: 12 days allocated to ${empRecord.firstName}`);

  // 10. Salary Structure & Rules
  const salaryStructure = await prisma.salaryStructure.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'STD-CORP-2026' } },
    update: {},
    create: {
      organizationId: organization.id,
      name: 'Standard Corporate Salary Structure 2026',
      code: 'STD-CORP-2026',
      description: 'Standard enterprise fulltime salary structure with basic, HRA, special allowances, and statutory deductions',
      active: true,
    },
  });

  // Create ordered salary rules if not present
  const existingRules = await prisma.salaryRule.findMany({ where: { structureId: salaryStructure.id } });
  if (existingRules.length === 0) {
    await prisma.salaryRule.createMany({
      data: [
        {
          organizationId: organization.id,
          structureId: salaryStructure.id,
          name: 'Basic Salary',
          code: 'BASIC',
          category: RuleCategoryType.BASIC,
          sequence: 10,
          amountType: AmountType.PERCENTAGE,
          amountPercentage: 50,
          percentageBasedOn: 'WAGE',
          isActive: true,
        },
        {
          organizationId: organization.id,
          structureId: salaryStructure.id,
          name: 'House Rent Allowance',
          code: 'HRA',
          category: RuleCategoryType.ALLOWANCE,
          sequence: 20,
          amountType: AmountType.PERCENTAGE,
          amountPercentage: 40,
          percentageBasedOn: 'BASIC',
          isActive: true,
        },
        {
          organizationId: organization.id,
          structureId: salaryStructure.id,
          name: 'Special Allowance',
          code: 'SPECIAL',
          category: RuleCategoryType.ALLOWANCE,
          sequence: 30,
          amountType: AmountType.FIXED,
          amountFixed: 500,
          isActive: true,
        },
        {
          organizationId: organization.id,
          structureId: salaryStructure.id,
          name: 'Gross Salary Total',
          code: 'GROSS',
          category: RuleCategoryType.GROSS,
          sequence: 40,
          amountType: AmountType.FORMULA,
          codeFormula: 'BASIC + HRA + SPECIAL',
          isActive: true,
        },
        {
          organizationId: organization.id,
          structureId: salaryStructure.id,
          name: 'Provident Fund / 401(k)',
          code: 'PF',
          category: RuleCategoryType.DEDUCTION,
          sequence: 50,
          amountType: AmountType.PERCENTAGE,
          amountPercentage: 12,
          percentageBasedOn: 'BASIC',
          isActive: true,
        },
        {
          organizationId: organization.id,
          structureId: salaryStructure.id,
          name: 'Income Tax (TDS)',
          code: 'TAX',
          category: RuleCategoryType.DEDUCTION,
          sequence: 60,
          amountType: AmountType.FIXED,
          amountFixed: 300,
          isActive: true,
        },
        {
          organizationId: organization.id,
          structureId: salaryStructure.id,
          name: 'Net Take-Home Pay',
          code: 'NET',
          category: RuleCategoryType.NET,
          sequence: 70,
          amountType: AmountType.FORMULA,
          codeFormula: 'GROSS - PF - TAX',
          isActive: true,
        },
      ],
    });
  }
  console.log(`✅ Salary Structure: ${salaryStructure.name} with 7 ordered rules`);

  // 11. Contracts
  let contract = await prisma.contract.findFirst({
    where: { organizationId: organization.id, employeeId: empRecord.id },
  });

  if (!contract) {
    contract = await prisma.contract.create({
      data: {
        organizationId: organization.id,
        employeeId: empRecord.id,
        structureId: salaryStructure.id,
        workingScheduleId: schedule.id,
        name: 'Fulltime Principal Engineering Contract',
        wage: 6000,
        wagePeriod: 'MONTHLY',
        startDate: new Date('2026-01-01'),
        status: ContractStatus.ACTIVE,
      },
    });
  }
  console.log(`✅ Contract: ${contract.name} for ${empRecord.firstName} ($${contract.wage}/month)`);

  // 12. Attendance records for current month
  for (let d = 1; d <= 5; d++) {
    const attendanceDate = new Date(Date.UTC(2026, 8, d));
    const checkInDate = new Date(Date.UTC(2026, 8, d, 9, 0, 0));
    const checkOutDate = new Date(Date.UTC(2026, 8, d, 17, 30, 0));

    await prisma.attendance.upsert({
      where: {
        organizationId_employeeId_date: {
          organizationId: organization.id,
          employeeId: empRecord.id,
          date: attendanceDate,
        },
      },
      update: {},
      create: {
        organizationId: organization.id,
        employeeId: empRecord.id,
        date: attendanceDate,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        workedHours: 8.5,
        status: AttendanceStatus.PRESENT,
      },
    });
  }
  console.log('✅ Seeded representative attendance entries');

  console.log('\n🎉 ========================================================');
  console.log('🎉 PeoplePay360 database seed completed successfully!');
  console.log('🎉 Login Credentials:');
  console.log('   - ADMIN:           admin@peoplepay360.local           / Admin@123456');
  console.log('   - HR MANAGER:      hr.manager@peoplepay360.local      / Hr@123456');
  console.log('   - PAYROLL MANAGER: payroll.manager@peoplepay360.local / Payroll@123456');
  console.log('   - EMPLOYEE:        employee@peoplepay360.local        / Emp@123456');
  console.log('========================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
