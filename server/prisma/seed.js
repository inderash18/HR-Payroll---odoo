import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const possibleEnvPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'server/.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env'),
];

for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

const databaseUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/peoplepay360?schema=public';

process.env.DATABASE_URL = databaseUrl;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

async function main() {
  console.log('🌱 Starting database seed for PeoplePay360 (JavaScript / Express)...');

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

  // 3. Working Schedule
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

  // 4. Departments
  const deptEngineering = await prisma.department.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'ENG' } },
    update: {},
    create: { organizationId: organization.id, name: 'Engineering & Technology', code: 'ENG' },
  });

  const deptHR = await prisma.department.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'HR' } },
    update: {},
    create: { organizationId: organization.id, name: 'Human Resources & Talent', code: 'HR' },
  });

  const deptFinance = await prisma.department.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'FIN' } },
    update: {},
    create: { organizationId: organization.id, name: 'Finance & Indian Payroll', code: 'FIN' },
  });

  // 5. Job Positions
  const posTechLead = await prisma.jobPosition.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'LEAD_DEV' } },
    update: {},
    create: { organizationId: organization.id, departmentId: deptEngineering.id, title: 'Lead Software Architect', code: 'LEAD_DEV' },
  });

  const posHRLead = await prisma.jobPosition.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'HR_MGR' } },
    update: {},
    create: { organizationId: organization.id, departmentId: deptHR.id, title: 'Senior HR Manager', code: 'HR_MGR' },
  });

  const posPayrollLead = await prisma.jobPosition.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'PAY_MGR' } },
    update: {},
    create: { organizationId: organization.id, departmentId: deptFinance.id, title: 'Payroll Lead', code: 'PAY_MGR' },
  });

  // 6. Users for all 8 Roles (Super Admin, Org Admin, HR Manager, Payroll Manager, Finance Manager, Dept Manager, Employee, Auditor)
  const passwordHash = await bcrypt.hash('admin123', 10);

  const superAdminUser = await prisma.user.upsert({
    where: { organizationId_email: { organizationId: organization.id, email: 'superadmin@peoplepay360.local' } },
    update: { passwordHash, role: 'SUPER_ADMIN' },
    create: {
      organizationId: organization.id,
      email: 'superadmin@peoplepay360.local',
      passwordHash,
      firstName: 'Dev',
      lastName: 'Platform',
      role: 'SUPER_ADMIN',
      isEmailVerified: true,
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { organizationId_email: { organizationId: organization.id, email: 'admin@peoplepay360.local' } },
    update: { passwordHash, role: 'ORGANIZATION_ADMIN' },
    create: {
      organizationId: organization.id,
      email: 'admin@peoplepay360.local',
      passwordHash,
      firstName: 'Aarav',
      lastName: 'Sharma',
      role: 'ORGANIZATION_ADMIN',
      isEmailVerified: true,
    },
  });

  const hrUser = await prisma.user.upsert({
    where: { organizationId_email: { organizationId: organization.id, email: 'hr@peoplepay360.local' } },
    update: { passwordHash, role: 'HR_MANAGER' },
    create: {
      organizationId: organization.id,
      email: 'hr@peoplepay360.local',
      passwordHash,
      firstName: 'Priya',
      lastName: 'Iyer',
      role: 'HR_MANAGER',
      isEmailVerified: true,
    },
  });

  const payrollUser = await prisma.user.upsert({
    where: { organizationId_email: { organizationId: organization.id, email: 'payroll@peoplepay360.local' } },
    update: { passwordHash, role: 'PAYROLL_MANAGER' },
    create: {
      organizationId: organization.id,
      email: 'payroll@peoplepay360.local',
      passwordHash,
      firstName: 'Rajesh',
      lastName: 'Kumar',
      role: 'PAYROLL_MANAGER',
      isEmailVerified: true,
    },
  });

  const financeUser = await prisma.user.upsert({
    where: { organizationId_email: { organizationId: organization.id, email: 'finance@peoplepay360.local' } },
    update: { passwordHash, role: 'FINANCE_MANAGER' },
    create: {
      organizationId: organization.id,
      email: 'finance@peoplepay360.local',
      passwordHash,
      firstName: 'Ananya',
      lastName: 'Deshmukh',
      role: 'FINANCE_MANAGER',
      isEmailVerified: true,
    },
  });

  const deptManagerUser = await prisma.user.upsert({
    where: { organizationId_email: { organizationId: organization.id, email: 'manager@peoplepay360.local' } },
    update: { passwordHash, role: 'DEPARTMENT_MANAGER' },
    create: {
      organizationId: organization.id,
      email: 'manager@peoplepay360.local',
      passwordHash,
      firstName: 'Rohan',
      lastName: 'Verma',
      role: 'DEPARTMENT_MANAGER',
      isEmailVerified: true,
    },
  });

  const empUser = await prisma.user.upsert({
    where: { organizationId_email: { organizationId: organization.id, email: 'employee@peoplepay360.local' } },
    update: { passwordHash, role: 'EMPLOYEE' },
    create: {
      organizationId: organization.id,
      email: 'employee@peoplepay360.local',
      passwordHash,
      firstName: 'Vikram',
      lastName: 'Patel',
      role: 'EMPLOYEE',
      isEmailVerified: true,
    },
  });

  const auditorUser = await prisma.user.upsert({
    where: { organizationId_email: { organizationId: organization.id, email: 'auditor@peoplepay360.local' } },
    update: { passwordHash, role: 'AUDITOR' },
    create: {
      organizationId: organization.id,
      email: 'auditor@peoplepay360.local',
      passwordHash,
      firstName: 'Sneha',
      lastName: 'Iyer',
      role: 'AUDITOR',
      isEmailVerified: true,
    },
  });

  // Assign deptManagerUser to deptEngineering
  await prisma.department.update({
    where: { id: deptEngineering.id },
    data: { managerId: deptManagerUser.id },
  });

  console.log('✅ All 8 SaaS Roles Seeded:');
  console.log('   1. superadmin@peoplepay360.local (SUPER_ADMIN)');
  console.log('   2. admin@peoplepay360.local (ORGANIZATION_ADMIN)');
  console.log('   3. hr@peoplepay360.local (HR_MANAGER)');
  console.log('   4. payroll@peoplepay360.local (PAYROLL_MANAGER)');
  console.log('   5. finance@peoplepay360.local (FINANCE_MANAGER)');
  console.log('   6. manager@peoplepay360.local (DEPARTMENT_MANAGER)');
  console.log('   7. employee@peoplepay360.local (EMPLOYEE)');
  console.log('   8. auditor@peoplepay360.local (AUDITOR)');
  console.log('   (Password: admin123 for all accounts)');

  // 7. Salary Structure & Rules
  const structure = await prisma.salaryStructure.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'IND_EXEC' } },
    update: {},
    create: {
      organizationId: organization.id,
      name: 'Standard Indian CTC Structure',
      code: 'IND_EXEC',
      description: 'Standard Indian compensation model with Basic, HRA, Allowance, and Deductions',
    },
  });

  const rules = [
    { code: 'BASIC', name: 'Basic Salary', category: 'BASIC', sequence: 10, amountType: 'PERCENTAGE', amountPercentage: 50, percentageBasedOn: 'BASE' },
    { code: 'HRA', name: 'House Rent Allowance (HRA)', category: 'ALLOWANCE', sequence: 20, amountType: 'PERCENTAGE', amountPercentage: 25, percentageBasedOn: 'BASE' },
    { code: 'SPECIAL_ALLOWANCE', name: 'Special Allowance', category: 'ALLOWANCE', sequence: 30, amountType: 'PERCENTAGE', amountPercentage: 25, percentageBasedOn: 'BASE' },
    { code: 'PF_EMP', name: 'Provident Fund (Employee)', category: 'DEDUCTION', sequence: 40, amountType: 'PERCENTAGE', amountPercentage: 6, percentageBasedOn: 'BASIC' },
    { code: 'PROF_TAX', name: 'Professional Tax (PT)', category: 'DEDUCTION', sequence: 50, amountType: 'FIXED', amountFixed: 200 },
  ];

  for (const r of rules) {
    await prisma.salaryRule.upsert({
      where: { structureId_code: { structureId: structure.id, code: r.code } },
      update: {},
      create: {
        organizationId: organization.id,
        structureId: structure.id,
        ...r,
      },
    });
  }
  console.log(`✅ Salary Structure: ${structure.name} with ${rules.length} rules.`);

  // 8. Employees & Contracts
  const emp1 = await prisma.employee.upsert({
    where: { organizationId_employeeNum: { organizationId: organization.id, employeeNum: 'EMP-00101' } },
    update: { isActive: true },
    create: {
      organizationId: organization.id,
      userId: adminUser.id,
      departmentId: deptEngineering.id,
      jobPositionId: posTechLead.id,
      workingScheduleId: schedule.id,
      employeeNum: 'EMP-00101',
      firstName: 'Aarav',
      lastName: 'Sharma',
      workEmail: 'aarav.sharma@peoplepay360.local',
      phone: '+91 98765 43210',
      bankName: 'HDFC Bank Ltd',
      bankAccountMasked: '•••• •••• 4821',
      taxId: 'AAAPS1234F',
      joiningDate: new Date('2023-01-15'),
      isActive: true,
    },
  });

  const emp2 = await prisma.employee.upsert({
    where: { organizationId_employeeNum: { organizationId: organization.id, employeeNum: 'EMP-00102' } },
    update: { isActive: true },
    create: {
      organizationId: organization.id,
      userId: empUser.id,
      departmentId: deptEngineering.id,
      jobPositionId: posTechLead.id,
      workingScheduleId: schedule.id,
      employeeNum: 'EMP-00102',
      firstName: 'Vikram',
      lastName: 'Patel',
      workEmail: 'vikram.patel@peoplepay360.local',
      phone: '+91 98765 11223',
      bankName: 'State Bank of India',
      bankAccountMasked: '•••• •••• 9920',
      taxId: 'BBBPV5678K',
      joiningDate: new Date('2024-03-01'),
      isActive: true,
    },
  });

  // Contracts
  const existingContract1 = await prisma.contract.findFirst({
    where: { organizationId: organization.id, employeeId: emp1.id },
  });

  if (!existingContract1) {
    await prisma.contract.create({
      data: {
        organizationId: organization.id,
        employeeId: emp1.id,
        structureId: structure.id,
        workingScheduleId: schedule.id,
        name: 'Aarav Sharma - Principal Executive Contract',
        wage: 150000.00,
        wagePeriod: 'MONTHLY',
        startDate: new Date('2023-01-15'),
        status: 'ACTIVE',
      },
    });
  }

  const existingContract2 = await prisma.contract.findFirst({
    where: { organizationId: organization.id, employeeId: emp2.id },
  });

  if (!existingContract2) {
    await prisma.contract.create({
      data: {
        organizationId: organization.id,
        employeeId: emp2.id,
        structureId: structure.id,
        workingScheduleId: schedule.id,
        name: 'Vikram Patel - Senior Engineer Contract',
        wage: 95000.00,
        wagePeriod: 'MONTHLY',
        startDate: new Date('2024-03-01'),
        status: 'ACTIVE',
      },
    });
  }

  // 9. Leave Types & Allocations
  const leaveCL = await prisma.leaveType.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'CL' } },
    update: {},
    create: { organizationId: organization.id, name: 'Casual Leave (CL)', code: 'CL', daysAllowed: 12, isPaid: true, requiresAllocation: true },
  });

  const leavePL = await prisma.leaveType.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'PL' } },
    update: {},
    create: { organizationId: organization.id, name: 'Privilege / Earned Leave (PL)', code: 'PL', daysAllowed: 18, isPaid: true, requiresAllocation: true },
  });

  const leaveSL = await prisma.leaveType.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: 'SL' } },
    update: {},
    create: { organizationId: organization.id, name: 'Sick / Medical Leave (SL)', code: 'SL', daysAllowed: 10, isPaid: true, requiresAllocation: true },
  });

  console.log('✅ Leave types created: Casual, Privilege, and Sick leaves');
  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
