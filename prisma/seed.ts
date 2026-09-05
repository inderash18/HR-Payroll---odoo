import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create or upsert demo organization
  const organization = await prisma.organization.upsert({
    where: { code: 'DEMO-ORG' },
    update: {},
    create: {
      name: 'PeoplePay360 Global Demo Corp',
      code: 'DEMO-ORG',
      currency: 'USD',
      timezone: 'UTC',
    },
  });

  console.log(`✅ Seeded Organization: ${organization.name} (${organization.id})`);

  // 2. Hash default password
  const passwordHash = await bcrypt.hash('Admin@123456', 10);

  // 3. Seed Admin user
  const adminUser = await prisma.user.upsert({
    where: {
      organizationId_email: {
        organizationId: organization.id,
        email: 'admin@peoplepay360.local',
      },
    },
    update: {},
    create: {
      organizationId: organization.id,
      email: 'admin@peoplepay360.local',
      passwordHash,
      firstName: 'System',
      lastName: 'Administrator',
      role: Role.ADMIN,
    },
  });

  // 4. Seed Payroll Manager
  const payrollManager = await prisma.user.upsert({
    where: {
      organizationId_email: {
        organizationId: organization.id,
        email: 'payroll.manager@peoplepay360.local',
      },
    },
    update: {},
    create: {
      organizationId: organization.id,
      email: 'payroll.manager@peoplepay360.local',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Payroll',
      role: Role.HR_PAYROLL_MANAGER,
    },
  });

  // 5. Seed HR Manager
  const hrManager = await prisma.user.upsert({
    where: {
      organizationId_email: {
        organizationId: organization.id,
        email: 'hr.manager@peoplepay360.local',
      },
    },
    update: {},
    create: {
      organizationId: organization.id,
      email: 'hr.manager@peoplepay360.local',
      passwordHash,
      firstName: 'David',
      lastName: 'HR',
      role: Role.HR_MANAGER,
    },
  });

  // 6. Seed Employee
  const employee = await prisma.user.upsert({
    where: {
      organizationId_email: {
        organizationId: organization.id,
        email: 'employee@peoplepay360.local',
      },
    },
    update: {},
    create: {
      organizationId: organization.id,
      email: 'employee@peoplepay360.local',
      passwordHash,
      firstName: 'John',
      lastName: 'Doe',
      role: Role.EMPLOYEE,
    },
  });

  console.log(`✅ Seeded Users: Admin (${adminUser.email}), Payroll Manager (${payrollManager.email}), HR Manager (${hrManager.email}), Employee (${employee.email})`);

  console.log('🌱 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
