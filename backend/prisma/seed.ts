import { PrismaClient, Role, AmountType, RuleCategoryType, ContractStatus, LeaveStatus, AllocationStatus, AttendanceStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Indian Corporate database seed for PeoplePay360...');

  // 1. Organization
  const organization = await prisma.organization.upsert({
    where: { code: 'PP360-IND' },
    update: {},
    create: {
      name: 'PeoplePay360 India Private Limited',
      code: 'PP360-IND',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
    },
  });
  console.log(`✅ Organization: ${organization.name} (${organization.id})`);

  // 2. Legal Entity
  const legalEntity = await prisma.legalEntity.upsert({
    where: {
      organizationId_code: {
        organizationId: organization.id,
        code: 'PP360-KA',
      },
    },
    update: {},
    create: {
      organizationId: organization.id,
      name: 'PeoplePay Technologies India Private Limited',
      code: 'PP360-KA',
      country: 'India',
      currency: 'INR',
      registrationNum: 'U72200KA2026PTC184920',
    },
  });
  console.log(`✅ Legal Entity: ${legalEntity.name}`);

  // 3. Working Schedule & Lines (Indian General Shift: 09:30 AM - 06:30 PM)
  let schedule = await prisma.workingSchedule.findFirst({
    where: { organizationId: organization.id, name: 'Standard Indian General Shift (09:30 - 18:30)' },
  });

  if (!schedule) {
    schedule = await prisma.workingSchedule.create({
      data: {
        organizationId: organization.id,
        name: 'Standard Indian General Shift (09:30 - 18:30)',
        type: 'STANDARD_40H',
        timezone: 'Asia/Kolkata',
        active: true,
        lines: {
          create: [
            { dayOfWeek: 1, startTime: '09:30', endTime: '18:30', breakMinutes: 60 },
            { dayOfWeek: 2, startTime: '09:30', endTime: '18:30', breakMinutes: 60 },
            { dayOfWeek: 3, startTime: '09:30', endTime: '18:30', breakMinutes: 60 },
            { dayOfWeek: 4, startTime: '09:30', endTime: '18:30', breakMinutes: 60 },
            { dayOfWeek: 5, startTime: '09:30', endTime: '18:30', breakMinutes: 60 },
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
      name: 'Engineering & Technology',
      code: 'ENG',
    },
  });

  const deptHR = await prisma.department.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'HR' } },
    update: {},
    create: {
      organizationId: organization.id,
      name: 'Human Resources & Talent',
      code: 'HR',
    },
  });

  const deptFinance = await prisma.department.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'FIN' } },
    update: {},
    create: {
      organizationId: organization.id,
      name: 'Finance & Indian Payroll',
      code: 'FIN',
    },
  });

  const deptOperations = await prisma.department.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'OPS' } },
    update: {},
    create: {
      organizationId: organization.id,
      name: 'Operations & Service Delivery',
      code: 'OPS',
    },
  });
  console.log('✅ Departments: Engineering, Human Resources, Finance & Indian Payroll, Operations');

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
      title: 'Lead HR Business Partner',
      code: 'HR-LEAD',
    },
  });

  const posPayrollSpecialist = await prisma.jobPosition.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'PAY-SPEC' } },
    update: {},
    create: {
      organizationId: organization.id,
      departmentId: deptFinance.id,
      title: 'Payroll Compliance Lead',
      code: 'PAY-SPEC',
    },
  });

  const posOpsLead = await prisma.jobPosition.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'OPS-LEAD' } },
    update: {},
    create: {
      organizationId: organization.id,
      departmentId: deptOperations.id,
      title: 'Operations Shift Lead',
      code: 'OPS-LEAD',
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
      firstName: 'Rahul',
      lastName: 'Verma',
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
      firstName: 'Priya',
      lastName: 'Patel',
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
      firstName: 'Aarav',
      lastName: 'Sharma',
      role: Role.EMPLOYEE,
    },
  });
  console.log('✅ Users & Roles: Admin, HR Manager (Priya Patel), Payroll Manager (Rahul Verma), Employee (Aarav Sharma)');

  // 7. Employees
  const empRecord1 = await prisma.employee.upsert({
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
      firstName: 'Aarav',
      lastName: 'Sharma',
      workEmail: 'aarav.sharma@peoplepay360.local',
      personalEmail: 'aarav.sharma@gmail.com',
      phone: '+91-9876543210',
      bankName: 'HDFC Bank',
      bankAccountMasked: '••••••••4821',
      taxId: 'ABCPS1234K',
      isActive: true,
    },
  });

  const empRecord2 = await prisma.employee.upsert({
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
      firstName: 'Priya',
      lastName: 'Patel',
      workEmail: 'priya.patel@peoplepay360.local',
      personalEmail: 'priya.patel@gmail.com',
      phone: '+91-9876543211',
      bankName: 'ICICI Bank',
      bankAccountMasked: '••••••••7734',
      taxId: 'BNYPI8765L',
      isActive: true,
    },
  });

  const empRecord3 = await prisma.employee.upsert({
    where: { organizationId_employeeNum: { organizationId: organization.id, employeeNum: 'EMP-00103' } },
    update: {},
    create: {
      organizationId: organization.id,
      legalEntityId: legalEntity.id,
      userId: payrollUser.id,
      departmentId: deptFinance.id,
      jobPositionId: posPayrollSpecialist.id,
      workingScheduleId: schedule.id,
      employeeNum: 'EMP-00103',
      firstName: 'Rahul',
      lastName: 'Verma',
      workEmail: 'rahul.verma@peoplepay360.local',
      personalEmail: 'rahul.verma@gmail.com',
      phone: '+91-9876543212',
      bankName: 'State Bank of India',
      bankAccountMasked: '••••••••3321',
      taxId: 'DKPAD9088M',
      isActive: true,
    },
  });

  const empRecord4 = await prisma.employee.upsert({
    where: { organizationId_employeeNum: { organizationId: organization.id, employeeNum: 'EMP-00104' } },
    update: {},
    create: {
      organizationId: organization.id,
      legalEntityId: legalEntity.id,
      departmentId: deptOperations.id,
      jobPositionId: posOpsLead.id,
      workingScheduleId: schedule.id,
      employeeNum: 'EMP-00104',
      firstName: 'Sneha',
      lastName: 'Iyer',
      workEmail: 'sneha.iyer@peoplepay360.local',
      personalEmail: 'sneha.iyer@gmail.com',
      phone: '+91-9876543213',
      bankName: 'Axis Bank',
      bankAccountMasked: '••••••••9912',
      taxId: 'CPSVS5544R',
      isActive: true,
    },
  });
  console.log(`✅ Employees: Aarav Sharma, Priya Patel, Rahul Verma, Sneha Iyer`);

  // 8. Leave Types (Indian Statutory Structure)
  const leaveEL = await prisma.leaveType.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'PL' } },
    update: {},
    create: {
      organizationId: organization.id,
      name: 'Earned / Privilege Leave (PL)',
      code: 'PL',
      isPaid: true,
      requiresAllocation: true,
      approvalRequired: true,
      daysAllowed: 18,
      active: true,
    },
  });

  const leaveCL = await prisma.leaveType.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'CL' } },
    update: {},
    create: {
      organizationId: organization.id,
      name: 'Casual Leave (CL)',
      code: 'CL',
      isPaid: true,
      requiresAllocation: true,
      approvalRequired: false,
      daysAllowed: 12,
      active: true,
    },
  });

  const leaveSL = await prisma.leaveType.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'SL' } },
    update: {},
    create: {
      organizationId: organization.id,
      name: 'Sick / Medical Leave (SL)',
      code: 'SL',
      isPaid: true,
      requiresAllocation: true,
      approvalRequired: false,
      daysAllowed: 10,
      active: true,
    },
  });

  const leaveLOP = await prisma.leaveType.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'LOP' } },
    update: {},
    create: {
      organizationId: organization.id,
      name: 'Loss of Pay / Unpaid (LOP)',
      code: 'LOP',
      isPaid: false,
      requiresAllocation: false,
      approvalRequired: true,
      daysAllowed: 0,
      active: true,
    },
  });
  console.log('✅ Leave Types: Privilege Leave (PL), Casual Leave (CL), Sick Leave (SL), LOP');

  // 9. Leave Allocations
  let allocation = await prisma.leaveAllocation.findFirst({
    where: { organizationId: organization.id, employeeId: empRecord1.id, leaveTypeId: leaveEL.id },
  });

  if (!allocation) {
    allocation = await prisma.leaveAllocation.create({
      data: {
        organizationId: organization.id,
        employeeId: empRecord1.id,
        leaveTypeId: leaveEL.id,
        allocatedAmount: 18,
        consumedAmount: 2,
        validFrom: new Date('2026-01-01'),
        validUntil: new Date('2026-12-31'),
        status: AllocationStatus.APPROVED,
      },
    });
  }
  console.log(`✅ Leave Allocation: 18 days allocated to ${empRecord1.firstName}`);

  // 10. Indian Salary Structure & Rules (EPF, HRA, PT, TDS)
  const salaryStructure = await prisma.salaryStructure.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'STD-INDIA-2026' } },
    update: {},
    create: {
      organizationId: organization.id,
      name: 'Standard Indian Corporate Salary Structure 2026',
      code: 'STD-INDIA-2026',
      description: 'Indian enterprise fulltime salary structure with Basic 50%, HRA 40%, Special Allowance, EPF 12%, Professional Tax, and TDS',
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
          name: 'Basic Pay',
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
          name: 'House Rent Allowance (HRA)',
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
          amountFixed: 8500,
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
          name: 'Provident Fund (EPF 12%)',
          code: 'EPF',
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
          name: 'Professional Tax (PT)',
          code: 'PT',
          category: RuleCategoryType.DEDUCTION,
          sequence: 60,
          amountType: AmountType.FIXED,
          amountFixed: 200,
          isActive: true,
        },
        {
          organizationId: organization.id,
          structureId: salaryStructure.id,
          name: 'Income Tax (TDS)',
          code: 'TDS',
          category: RuleCategoryType.DEDUCTION,
          sequence: 70,
          amountType: AmountType.FIXED,
          amountFixed: 2500,
          isActive: true,
        },
        {
          organizationId: organization.id,
          structureId: salaryStructure.id,
          name: 'Net Take-Home Pay',
          code: 'NET',
          category: RuleCategoryType.NET,
          sequence: 80,
          amountType: AmountType.FORMULA,
          codeFormula: 'GROSS - EPF - PT - TDS',
          isActive: true,
        },
      ],
    });
  }
  console.log(`✅ Salary Structure: ${salaryStructure.name} with Indian statutory rules (EPF, PT, TDS)`);

  // 11. Contracts
  let contract1 = await prisma.contract.findFirst({
    where: { organizationId: organization.id, employeeId: empRecord1.id },
  });

  if (!contract1) {
    contract1 = await prisma.contract.create({
      data: {
        organizationId: organization.id,
        employeeId: empRecord1.id,
        structureId: salaryStructure.id,
        workingScheduleId: schedule.id,
        name: 'Senior Engineering Employment Agreement (Bengaluru)',
        wage: 85000,
        wagePeriod: 'MONTHLY',
        startDate: new Date('2026-01-01'),
        status: ContractStatus.ACTIVE,
      },
    });
  }

  let contract2 = await prisma.contract.findFirst({
    where: { organizationId: organization.id, employeeId: empRecord2.id },
  });

  if (!contract2) {
    contract2 = await prisma.contract.create({
      data: {
        organizationId: organization.id,
        employeeId: empRecord2.id,
        structureId: salaryStructure.id,
        workingScheduleId: schedule.id,
        name: 'Lead HR Business Partner Employment Agreement',
        wage: 65000,
        wagePeriod: 'MONTHLY',
        startDate: new Date('2026-01-01'),
        status: ContractStatus.ACTIVE,
      },
    });
  }

  let contract3 = await prisma.contract.findFirst({
    where: { organizationId: organization.id, employeeId: empRecord3.id },
  });

  if (!contract3) {
    contract3 = await prisma.contract.create({
      data: {
        organizationId: organization.id,
        employeeId: empRecord3.id,
        structureId: salaryStructure.id,
        workingScheduleId: schedule.id,
        name: 'Payroll Compliance Lead Employment Agreement',
        wage: 72000,
        wagePeriod: 'MONTHLY',
        startDate: new Date('2026-01-01'),
        status: ContractStatus.ACTIVE,
      },
    });
  }

  let contract4 = await prisma.contract.findFirst({
    where: { organizationId: organization.id, employeeId: empRecord4.id },
  });

  if (!contract4) {
    contract4 = await prisma.contract.create({
      data: {
        organizationId: organization.id,
        employeeId: empRecord4.id,
        structureId: salaryStructure.id,
        workingScheduleId: schedule.id,
        name: 'Operations Lead Employment Agreement',
        wage: 68000,
        wagePeriod: 'MONTHLY',
        startDate: new Date('2026-01-01'),
        status: ContractStatus.ACTIVE,
      },
    });
  }
  console.log(`✅ Contracts: Seeded Indian contracts (₹85k, ₹65k, ₹72k, ₹68k)`);

  // 12. Attendance records for current month
  for (let d = 1; d <= 5; d++) {
    const attendanceDate = new Date(Date.UTC(2026, 8, d));
    const checkInDate = new Date(Date.UTC(2026, 8, d, 4, 0, 0)); // 09:30 IST is 04:00 UTC
    const checkOutDate = new Date(Date.UTC(2026, 8, d, 13, 0, 0)); // 18:30 IST is 13:00 UTC

    await prisma.attendance.upsert({
      where: {
        organizationId_employeeId_date: {
          organizationId: organization.id,
          employeeId: empRecord1.id,
          date: attendanceDate,
        },
      },
      update: {},
      create: {
        organizationId: organization.id,
        employeeId: empRecord1.id,
        date: attendanceDate,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        workedHours: 9.0,
        status: AttendanceStatus.PRESENT,
      },
    });
  }
  console.log('✅ Seeded representative Indian shift attendance entries');

  console.log('\n🎉 ========================================================');
  console.log('🎉 PeoplePay360 India database seed completed successfully!');
  console.log('🎉 Login Credentials:');
  console.log('   - ADMIN:           admin@peoplepay360.local           / Admin@123456 (or fixed dev: admin / 123)');
  console.log('   - HR MANAGER:      hr.manager@peoplepay360.local      / Hr@123456    (or fixed dev: hr / 123)');
  console.log('   - PAYROLL MANAGER: payroll.manager@peoplepay360.local / Payroll@123456 (or fixed dev: payroll / 123)');
  console.log('   - EMPLOYEE:        employee@peoplepay360.local        / Emp@123456    (or fixed dev: emp / 123)');
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
