import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:password123@192.168.102.160:5432/peoplepay360?schema=public',
    },
  },
});

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'PeoplePay360@123';

async function main() {
  console.log('🌱 Starting high-speed IT Company HRMS database seed for PeoplePay360 Technologies Pvt. Ltd....');

  const defaultPasswordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  // 1. Organization
  const organization = await prisma.organization.upsert({
    where: { code: 'PP360' },
    update: {
      name: 'PeoplePay360 Technologies Pvt. Ltd.',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
    },
    create: {
      name: 'PeoplePay360 Technologies Pvt. Ltd.',
      code: 'PP360',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
    },
  });
  console.log(`✅ Organization: ${organization.name} (${organization.code})`);

  // 2. Legal Entity
  const legalEntity = await prisma.legalEntity.upsert({
    where: {
      organizationId_code: {
        organizationId: organization.id,
        code: 'PP360-HQ',
      },
    },
    update: {
      name: 'PeoplePay360 Technologies Pvt. Ltd. (HQ Coimbatore)',
      taxId: '33ABCDE1234F1Z5',
      country: 'IN',
      currency: 'INR',
      address: {
        building: 'ELCOT IT Park, 4th Floor',
        street: 'Civil Aerodrome Post',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pincode: '641014',
        country: 'India',
        pan: 'AABCP3600K',
      },
    },
    create: {
      organizationId: organization.id,
      name: 'PeoplePay360 Technologies Pvt. Ltd. (HQ Coimbatore)',
      code: 'PP360-HQ',
      registrationNum: 'U72900TZ2022PTC038912',
      taxId: '33ABCDE1234F1Z5',
      country: 'IN',
      currency: 'INR',
      address: {
        building: 'ELCOT IT Park, 4th Floor',
        street: 'Civil Aerodrome Post',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pincode: '641014',
        country: 'India',
        pan: 'AABCP3600K',
      },
    },
  });

  // 3. Working Schedule
  let schedule = await prisma.workingSchedule.findFirst({
    where: { organizationId: organization.id, name: 'Standard IT 40H (Mon-Fri)' },
  });
  if (!schedule) {
    schedule = await prisma.workingSchedule.create({
      data: {
        organizationId: organization.id,
        name: 'Standard IT 40H (Mon-Fri)',
        type: 'STANDARD_40H',
        timezone: 'Asia/Kolkata',
        active: true,
      },
    });
    const lines = [];
    for (let day = 1; day <= 5; day++) {
      lines.push({
        scheduleId: schedule.id,
        dayOfWeek: day,
        startTime: '09:30',
        endTime: '18:30',
        breakMinutes: 60,
      });
    }
    await prisma.workingScheduleLine.createMany({ data: lines });
  }

  // 4. IT Leave Types
  const leaveTypesData = [
    { code: 'CL', name: 'Casual Leave', daysAllowed: 12, isPaid: true },
    { code: 'SL', name: 'Sick Leave', daysAllowed: 8, isPaid: true },
    { code: 'EL', name: 'Earned Leave', daysAllowed: 15, isPaid: true },
    { code: 'WFH', name: 'Work From Home', daysAllowed: 48, isPaid: true },
    { code: 'COMP_OFF', name: 'Comp-Off', daysAllowed: 10, isPaid: true },
    { code: 'LOP', name: 'Loss of Pay / Unpaid Leave', daysAllowed: 30, isPaid: false },
    { code: 'MAT', name: 'Maternity/Paternity Leave', daysAllowed: 90, isPaid: true },
    { code: 'BER', name: 'Bereavement Leave', daysAllowed: 5, isPaid: true },
  ];

  const leaveTypes = {};
  for (const lt of leaveTypesData) {
    leaveTypes[lt.code] = await prisma.leaveType.upsert({
      where: {
        organizationId_code: {
          organizationId: organization.id,
          code: lt.code,
        },
      },
      update: { name: lt.name, daysAllowed: lt.daysAllowed, isPaid: lt.isPaid },
      create: {
        organizationId: organization.id,
        code: lt.code,
        name: lt.name,
        daysAllowed: lt.daysAllowed,
        isPaid: lt.isPaid,
        requiresAllocation: true,
        approvalRequired: true,
        active: true,
      },
    });
  }

  // 5. Salary Structure & Rules
  let salaryStructure = await prisma.salaryStructure.findFirst({
    where: { organizationId: organization.id, code: 'IND-IT-STANDARD' },
  });
  if (!salaryStructure) {
    salaryStructure = await prisma.salaryStructure.create({
      data: {
        organizationId: organization.id,
        name: 'Indian IT Software Professional CTC Structure',
        code: 'IND-IT-STANDARD',
        description: 'Standard software compensation structure with HRA, Special, Internet, PF, PT, TDS, and LOP calculation',
        active: true,
      },
    });

    await prisma.salaryRule.createMany({
      data: [
        { organizationId: organization.id, structureId: salaryStructure.id, name: 'Basic Salary', code: 'BASIC', category: 'BASIC', sequence: 10, amountType: 'PERCENTAGE', amountPercentage: 40.0, isActive: true },
        { organizationId: organization.id, structureId: salaryStructure.id, name: 'House Rent Allowance (HRA)', code: 'HRA', category: 'ALLOWANCE', sequence: 20, amountType: 'PERCENTAGE', amountPercentage: 20.0, isActive: true },
        { organizationId: organization.id, structureId: salaryStructure.id, name: 'Special Allowance', code: 'SPECIAL', category: 'ALLOWANCE', sequence: 30, amountType: 'PERCENTAGE', amountPercentage: 30.0, isActive: true },
        { organizationId: organization.id, structureId: salaryStructure.id, name: 'Internet / Remote Work Allowance', code: 'INTERNET', category: 'ALLOWANCE', sequence: 40, amountType: 'FIXED', amountFixed: 2000.0, isActive: true },
        { organizationId: organization.id, structureId: salaryStructure.id, name: 'Meal Allowance', code: 'MEAL', category: 'ALLOWANCE', sequence: 50, amountType: 'FIXED', amountFixed: 2200.0, isActive: true },
        { organizationId: organization.id, structureId: salaryStructure.id, name: 'Employee Provident Fund (EPF)', code: 'PF_EE', category: 'DEDUCTION', sequence: 100, amountType: 'FIXED', amountFixed: 1800.0, isActive: true },
        { organizationId: organization.id, structureId: salaryStructure.id, name: 'Professional Tax (PT)', code: 'PT', category: 'DEDUCTION', sequence: 110, amountType: 'FIXED', amountFixed: 200.0, isActive: true },
        { organizationId: organization.id, structureId: salaryStructure.id, name: 'Tax Deducted at Source (TDS)', code: 'TDS', category: 'TAX', sequence: 120, amountType: 'PERCENTAGE', amountPercentage: 5.0, isActive: true },
        { organizationId: organization.id, structureId: salaryStructure.id, name: 'Loss of Pay (Unpaid Leave)', code: 'LOP', category: 'DEDUCTION', sequence: 130, amountType: 'CODE_FORMULA', codeFormula: 'GROSS / 30 * UNPAID_DAYS', isActive: true },
      ],
      skipDuplicates: true,
    });
  }

  // 6. 12 IT Departments
  const departmentsDef = [
    { code: 'ENG', name: 'Engineering', target: 48, headName: 'Aravind Kumar' },
    { code: 'PROD', name: 'Product', target: 12, headName: 'Nithya Raj' },
    { code: 'DESIGN', name: 'UI/UX Design', target: 10, headName: 'Ananya Iyer' },
    { code: 'QA', name: 'Quality Assurance', target: 16, headName: 'Praveen S' },
    { code: 'DEVOPS', name: 'DevOps & Cloud', target: 10, headName: 'Karthik Raman' },
    { code: 'DATA', name: 'Data & AI', target: 12, headName: 'Deepika N' },
    { code: 'SALES', name: 'Sales & Business Dev', target: 18, headName: 'Rahul Menon' },
    { code: 'MKT', name: 'Marketing & Growth', target: 8, headName: 'Meera Krishnan' },
    { code: 'HR', name: 'Human Resources', target: 6, headName: 'Kavya Priya' },
    { code: 'FIN', name: 'Finance & Accounts', target: 6, headName: 'Sanjay Raghavan' },
    { code: 'CS', name: 'Customer Success', target: 10, headName: 'Harish Kumar' },
    { code: 'OPS', name: 'Operations & IT Support', target: 8, headName: 'Sangeetha R' },
  ];

  const departments = {};
  for (const dept of departmentsDef) {
    departments[dept.code] = await prisma.department.upsert({
      where: {
        organizationId_code: {
          organizationId: organization.id,
          code: dept.code,
        },
      },
      update: { name: dept.name, active: true },
      create: {
        organizationId: organization.id,
        code: dept.code,
        name: dept.name,
        active: true,
      },
    });
  }
  console.log(`✅ Created 12 IT Departments/Squads`);

  // 7. Key Role Accounts
  const keyUsersDef = [
    { email: 'platform.admin@peoplepay360.in', firstName: 'Platform', lastName: 'Administrator', role: 'SUPER_ADMIN', deptCode: 'ENG', empNum: 'PP360-1001', title: 'Chief Technology Officer', ctc: 320000, workMode: 'HYBRID', location: 'Coimbatore', empType: 'FULL_TIME', skills: ['Architecture', 'Kubernetes', 'Security', 'PostgreSQL'] },
    { email: 'indhu.admin@peoplepay360.in', firstName: 'Indhu', lastName: 'Mathi', role: 'ORGANIZATION_ADMIN', deptCode: 'OPS', empNum: 'PP360-1002', title: 'Managing Director & COO', ctc: 280000, workMode: 'OFFICE', location: 'Coimbatore', empType: 'FULL_TIME', skills: ['Operations', 'IT Strategy', 'Leadership', 'Compliance'] },
    { email: 'kavya.hr@peoplepay360.in', firstName: 'Kavya', lastName: 'Priya', role: 'HR_MANAGER', deptCode: 'HR', empNum: 'PP360-1003', title: 'Head of Human Resources', ctc: 140000, workMode: 'HYBRID', location: 'Coimbatore', empType: 'FULL_TIME', skills: ['Recruitment', 'HR Analytics', 'Employee Relations'] },
    { email: 'vishal.payroll@peoplepay360.in', firstName: 'Vishal', lastName: 'Shah', role: 'PAYROLL_MANAGER', deptCode: 'FIN', empNum: 'PP360-1004', title: 'Compensation & Payroll Manager', ctc: 125000, workMode: 'HYBRID', location: 'Chennai', empType: 'FULL_TIME', skills: ['Payroll', 'TDS/PF/PT', 'Statutory Audits'] },
    { email: 'finance.manager@peoplepay360.in', firstName: 'Sanjay', lastName: 'Raghavan', role: 'FINANCE_MANAGER', deptCode: 'FIN', empNum: 'PP360-1005', title: 'VP of Finance & Accounts', ctc: 210000, workMode: 'OFFICE', location: 'Coimbatore', empType: 'FULL_TIME', skills: ['Financial Planning', 'Cost Accounting', 'ERP'] },
    { email: 'aravind.manager@peoplepay360.in', firstName: 'Aravind', lastName: 'Kumar', role: 'DEPARTMENT_MANAGER', deptCode: 'ENG', empNum: 'PP360-1006', title: 'VP of Engineering', ctc: 240000, workMode: 'HYBRID', location: 'Coimbatore', empType: 'FULL_TIME', skills: ['React', 'Node.js', 'Distributed Systems', 'Agile'] },
    { email: 'employee@peoplepay360.in', firstName: 'Indersh', lastName: 'Guhan', role: 'EMPLOYEE', deptCode: 'ENG', empNum: 'PP360-1007', title: 'Senior Full Stack Engineer', ctc: 95000, workMode: 'REMOTE', location: 'Coimbatore', empType: 'FULL_TIME', skills: ['React', 'Node.js', 'Express', 'Prisma', 'TypeScript'] },
    { email: 'auditor@peoplepay360.in', firstName: 'Rajeshwari', lastName: 'Venkat', role: 'AUDITOR', deptCode: 'FIN', empNum: 'PP360-1008', title: 'Lead Statutory & Compliance Auditor', ctc: 110000, workMode: 'REMOTE', location: 'Chennai', empType: 'FULL_TIME', skills: ['IT Auditing', 'SOC2 Compliance', 'Audit Trail Analysis'] },
  ];

  const firstNamesPool = ['Aarav', 'Indersh', 'Guhan', 'Muhammad', 'Pughazh', 'Hari', 'Jack', 'Karan', 'Kiruthik', 'Aravind', 'Indhu', 'Kavya', 'Vishal', 'Sanjay', 'Nithya', 'Ananya', 'Praveen', 'Karthik', 'Deepika', 'Rahul', 'Meera', 'Harish', 'Sangeetha', 'Rajeshwari', 'Vikram', 'Divya', 'Surya', 'Pooja', 'Manoj', 'Keerthi', 'Aditya', 'Sneha', 'Pradeep', 'Swetha', 'Dinesh', 'Lavanya', 'Ashwin', 'Shruthi', 'Gautam', 'Pavithra', 'Ramesh', 'Varsha', 'Ajay', 'Reshma', 'Kishore', 'Bhavana', 'Vignesh', 'Sandhya', 'Saravanan', 'Yamini'];
  const lastNamesPool = ['Sharma', 'Kumar', 'Guhan', 'Rifath', 'Endhi', 'Prasath', 'Daniels', 'Malhotra', 'Roshan', 'Raj', 'Iyer', 'Sundaram', 'Raman', 'Natarajan', 'Menon', 'Krishnan', 'Shah', 'Raghavan', 'Ramasamy', 'Venkat', 'Prakash', 'Balakrishnan', 'Subramanian', 'Narayanan', 'Murugan', 'Venkatesh', 'Chandran', 'Srinivasan', 'Gopal', 'Swaminathan'];

  const designationsByDept = {
    ENG: [{ title: 'Principal Software Engineer', min: 180000, max: 260000 }, { title: 'Tech Lead - Full Stack', min: 140000, max: 190000 }, { title: 'Senior Backend Engineer', min: 90000, max: 135000 }, { title: 'Senior Frontend Engineer', min: 85000, max: 130000 }, { title: 'Full Stack Developer', min: 65000, max: 95000 }, { title: 'Associate Software Engineer', min: 32000, max: 48000 }],
    PROD: [{ title: 'Lead Product Manager', min: 160000, max: 220000 }, { title: 'Senior Product Manager', min: 120000, max: 170000 }, { title: 'Product Manager', min: 85000, max: 125000 }, { title: 'Product Analyst', min: 40000, max: 60000 }],
    DESIGN: [{ title: 'Design Lead (UI/UX)', min: 130000, max: 180000 }, { title: 'Senior UI/UX Designer', min: 85000, max: 125000 }, { title: 'Product Designer', min: 60000, max: 90000 }, { title: 'UI Designer', min: 45000, max: 65000 }],
    QA: [{ title: 'QA Automation Lead', min: 130000, max: 175000 }, { title: 'Senior QA Engineer', min: 80000, max: 120000 }, { title: 'QA Engineer', min: 55000, max: 85000 }, { title: 'Software Test Engineer', min: 40000, max: 60000 }],
    DEVOPS: [{ title: 'Lead DevOps Architect', min: 160000, max: 220000 }, { title: 'Senior Cloud Engineer', min: 110000, max: 155000 }, { title: 'Site Reliability Engineer', min: 85000, max: 125000 }],
    DATA: [{ title: 'Principal Data & AI Architect', min: 170000, max: 240000 }, { title: 'Senior AI/ML Engineer', min: 120000, max: 170000 }, { title: 'Data Engineer', min: 75000, max: 115000 }],
    SALES: [{ title: 'Director of Enterprise Sales', min: 160000, max: 230000 }, { title: 'Senior Account Executive', min: 90000, max: 140000 }, { title: 'Inside Sales Specialist', min: 50000, max: 80000 }],
    MKT: [{ title: 'Head of Growth Marketing', min: 130000, max: 180000 }, { title: 'Product Marketing Manager', min: 80000, max: 120000 }, { title: 'Content Strategist', min: 45000, max: 70000 }],
    HR: [{ title: 'Senior Talent Acquisition Specialist', min: 70000, max: 100000 }, { title: 'HR Operations Executive', min: 45000, max: 65000 }],
    FIN: [{ title: 'Senior Financial Analyst', min: 75000, max: 110000 }, { title: 'Accounts & Tax Executive', min: 45000, max: 65000 }],
    CS: [{ title: 'Customer Success Team Lead', min: 90000, max: 130000 }, { title: 'Technical Support Specialist', min: 38000, max: 55000 }],
    OPS: [{ title: 'IT Infrastructure Lead', min: 110000, max: 150000 }, { title: 'System Administrator', min: 40000, max: 60000 }],
  };

  const locationsList = ['Coimbatore', 'Chennai', 'Bengaluru', 'Remote'];
  const workModesList = ['HYBRID', 'OFFICE', 'REMOTE'];
  const empTypesList = ['FULL_TIME', 'FULL_TIME', 'FULL_TIME', 'INTERN', 'CONTRACT', 'CONSULTANT'];

  const allEmployees = [];
  const allUsers = [];

  // Key Users
  for (const k of keyUsersDef) {
    const user = await prisma.user.upsert({
      where: { organizationId_email: { organizationId: organization.id, email: k.email } },
      update: { firstName: k.firstName, lastName: k.lastName, role: k.role, passwordHash: defaultPasswordHash, isActive: true },
      create: { organizationId: organization.id, legalEntityId: legalEntity.id, email: k.email, passwordHash: defaultPasswordHash, firstName: k.firstName, lastName: k.lastName, role: k.role, isActive: true, isEmailVerified: true },
    });
    allUsers.push(user);

    const emp = await prisma.employee.upsert({
      where: { organizationId_employeeNum: { organizationId: organization.id, employeeNum: k.empNum } },
      update: { firstName: k.firstName, lastName: k.lastName, workEmail: k.email, workMode: k.workMode, location: k.location, employmentType: k.empType, skills: k.skills, departmentId: departments[k.deptCode]?.id, userId: user.id, isActive: true },
      create: {
        organizationId: organization.id,
        legalEntityId: legalEntity.id,
        userId: user.id,
        departmentId: departments[k.deptCode]?.id,
        workingScheduleId: schedule.id,
        employeeNum: k.empNum,
        firstName: k.firstName,
        lastName: k.lastName,
        workEmail: k.email,
        personalEmail: `${k.firstName.toLowerCase()}.${k.lastName.toLowerCase()}@gmail.com`,
        phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
        bankName: 'HDFC Bank Ltd.',
        bankAccountMasked: `••••••••${Math.floor(1000 + Math.random() * 9000)}`,
        taxId: `ABCDE${Math.floor(1000 + Math.random() * 9000)}F`,
        joiningDate: new Date('2023-01-15T09:30:00.000Z'),
        workMode: k.workMode,
        location: k.location,
        employmentType: k.empType,
        skills: k.skills,
        isActive: true,
      },
    });

    await prisma.contract.upsert({
      where: { id: `contract-${emp.id}` },
      update: { wage: k.ctc, status: 'ACTIVE' },
      create: {
        id: `contract-${emp.id}`,
        organizationId: organization.id,
        employeeId: emp.id,
        structureId: salaryStructure.id,
        workingScheduleId: schedule.id,
        name: `Employment Contract - ${k.firstName} ${k.lastName}`,
        wage: k.ctc,
        wagePeriod: 'MONTHLY',
        startDate: new Date('2023-01-15T00:00:00.000Z'),
        status: 'ACTIVE',
      },
    });

    allEmployees.push({ ...emp, ctc: k.ctc, title: k.title });
  }

  // Generate ~156 remaining employees
  let empSequence = 1009;
  for (const deptDef of departmentsDef) {
    const existingCount = allEmployees.filter(e => e.departmentId === departments[deptDef.code]?.id).length;
    const toGenerate = deptDef.target - existingCount;
    const deptDesignations = designationsByDept[deptDef.code] || designationsByDept.ENG;

    for (let i = 0; i < toGenerate; i++) {
      const fName = firstNamesPool[(empSequence * 7 + i) % firstNamesPool.length];
      const lName = lastNamesPool[(empSequence * 13 + i) % lastNamesPool.length];
      const email = `${fName.toLowerCase()}.${lName.toLowerCase()}.${empSequence}@peoplepay360.in`;
      const empNum = `PP360-${empSequence}`;
      const desig = deptDesignations[i % deptDesignations.length];
      const ctc = Math.floor(desig.min + Math.random() * (desig.max - desig.min));
      const workMode = workModesList[(i + empSequence) % workModesList.length];
      const location = locationsList[(i + empSequence) % locationsList.length];
      const empType = desig.title.includes('Intern') ? 'INTERN' : empTypesList[(i) % empTypesList.length];

      let skills = ['JavaScript', 'Git', 'Agile'];
      if (deptDef.code === 'ENG') skills = ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Docker', 'AWS'];
      else if (deptDef.code === 'PROD') skills = ['Product Strategy', 'Roadmapping', 'Jira', 'Analytics'];
      else if (deptDef.code === 'DESIGN') skills = ['Figma', 'UI Design', 'Design Systems', 'Prototyping'];
      else if (deptDef.code === 'QA') skills = ['Playwright', 'Jest', 'API Testing', 'Cypress'];
      else if (deptDef.code === 'DEVOPS') skills = ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'Linux'];
      else if (deptDef.code === 'DATA') skills = ['Python', 'PostgreSQL', 'Pandas', 'FastAPI'];
      else if (deptDef.code === 'SALES') skills = ['B2B Sales', 'CRM', 'HubSpot', 'Pipeline Management'];
      else if (deptDef.code === 'MKT') skills = ['SEO', 'Content Strategy', 'Google Ads', 'Brand Growth'];
      else if (deptDef.code === 'HR') skills = ['HR Operations', 'Recruitment', 'Compliance'];
      else if (deptDef.code === 'FIN') skills = ['Financial Analysis', 'TDS & GST', 'Payroll Auditing'];
      else if (deptDef.code === 'CS') skills = ['Zendesk', 'Client Success', 'Troubleshooting'];
      else if (deptDef.code === 'OPS') skills = ['IT Support', 'Network Security', 'Asset Management'];

      const user = await prisma.user.upsert({
        where: { organizationId_email: { organizationId: organization.id, email } },
        update: { firstName: fName, lastName: lName, role: 'EMPLOYEE', passwordHash: defaultPasswordHash },
        create: { organizationId: organization.id, legalEntityId: legalEntity.id, email, passwordHash: defaultPasswordHash, firstName: fName, lastName: lName, role: 'EMPLOYEE', isActive: true, isEmailVerified: true },
      });

      const emp = await prisma.employee.upsert({
        where: { organizationId_employeeNum: { organizationId: organization.id, employeeNum: empNum } },
        update: { firstName: fName, lastName: lName, workEmail: email, workMode, location, employmentType: empType, skills, departmentId: departments[deptDef.code]?.id, userId: user.id, isActive: true },
        create: {
          organizationId: organization.id,
          legalEntityId: legalEntity.id,
          userId: user.id,
          departmentId: departments[deptDef.code]?.id,
          workingScheduleId: schedule.id,
          employeeNum: empNum,
          firstName: fName,
          lastName: lName,
          workEmail: email,
          personalEmail: `${fName.toLowerCase()}.${lName.toLowerCase()}@gmail.com`,
          phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
          bankName: ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'][i % 4],
          bankAccountMasked: `••••••••${Math.floor(1000 + Math.random() * 9000)}`,
          taxId: `ABCDE${Math.floor(1000 + Math.random() * 9000)}K`,
          joiningDate: new Date(2024, (i % 12), (i % 25) + 1),
          workMode,
          location,
          employmentType: empType,
          skills,
          isActive: true,
        },
      });

      await prisma.contract.upsert({
        where: { id: `contract-${emp.id}` },
        update: { wage: ctc, status: 'ACTIVE' },
        create: {
          id: `contract-${emp.id}`,
          organizationId: organization.id,
          employeeId: emp.id,
          structureId: salaryStructure.id,
          workingScheduleId: schedule.id,
          name: `Employment Contract - ${fName} ${lName}`,
          wage: ctc,
          wagePeriod: 'MONTHLY',
          startDate: emp.joiningDate,
          status: 'ACTIVE',
        },
      });

      allEmployees.push({ ...emp, ctc, title: desig.title });
      empSequence++;
    }
  }
  console.log(`✅ Generated total ${allEmployees.length} realistic IT company employees & contracts`);

  // Batch Leave Allocations
  console.log('⏳ Batch inserting leave allocations...');
  const allocationsBatch = [];
  for (const emp of allEmployees) {
    for (const [code, lt] of Object.entries(leaveTypes)) {
      allocationsBatch.push({
        id: `alloc-${emp.id}-${code}`,
        organizationId: organization.id,
        employeeId: emp.id,
        leaveTypeId: lt.id,
        allocatedAmount: lt.daysAllowed,
        consumedAmount: Math.floor(Math.random() * 3),
        validFrom: new Date('2026-01-01T00:00:00.000Z'),
        validUntil: new Date('2026-12-31T23:59:59.000Z'),
        status: 'APPROVED',
      });
    }
  }
  await prisma.leaveAllocation.createMany({
    data: allocationsBatch,
    skipDuplicates: true,
  });
  console.log(`✅ Leave Allocations created (${allocationsBatch.length} records)`);

  // Engineering Manager
  const aravindUser = allUsers.find(u => u.email === 'aravind.manager@peoplepay360.in');
  if (aravindUser && departments.ENG) {
    await prisma.department.update({
      where: { id: departments.ENG.id },
      data: { managerId: aravindUser.id },
    });
  }

  // 8. 6 IT Projects
  const projectsDef = [
    { code: 'P360-HRMS', name: 'PeoplePay360 NextGen HRMS', type: 'INTERNAL_SAAS', status: 'ACTIVE', techStack: ['React', 'Node.js', 'Prisma', 'PostgreSQL', 'Docker', 'Vite', 'TailwindCSS'], deptCode: 'ENG' },
    { code: 'NEXUS-AI', name: 'Nexus AI Analytics Engine', type: 'CLIENT_PROJECT', status: 'ACTIVE', techStack: ['Python', 'FastAPI', 'TensorFlow', 'PostgreSQL', 'Docker', 'AWS'], deptCode: 'DATA' },
    { code: 'FLOW-ERP', name: 'FlowERP Enterprise Suite', type: 'CLIENT_PROJECT', status: 'ACTIVE', techStack: ['React', 'Express', 'Prisma', 'PostgreSQL', 'Redis', 'AWS'], deptCode: 'ENG' },
    { code: 'CLOUD-OPS', name: 'CloudOps Infrastructure Automation', type: 'INTERNAL_PRODUCT', status: 'ACTIVE', techStack: ['Kubernetes', 'Terraform', 'AWS', 'Prometheus', 'Grafana', 'Docker'], deptCode: 'DEVOPS' },
    { code: 'SHOP-360', name: 'Shop360 Omnichannel Commerce', type: 'CLIENT_PROJECT', status: 'ACTIVE', techStack: ['Next.js', 'Node.js', 'PostgreSQL', 'Stripe API', 'TailwindCSS'], deptCode: 'ENG' },
    { code: 'INSIGHT-DATA', name: 'Insight Real-Time Data Pipeline', type: 'CLIENT_PROJECT', status: 'PLANNING', techStack: ['Python', 'Apache Kafka', 'PostgreSQL', 'ClickHouse', 'Docker'], deptCode: 'DATA' },
  ];

  const projects = [];
  const projectMembersBatch = [];
  for (let pIdx = 0; pIdx < projectsDef.length; pIdx++) {
    const p = projectsDef[pIdx];
    const project = await prisma.project.upsert({
      where: { organizationId_code: { organizationId: organization.id, code: p.code } },
      update: { name: p.name, status: p.status, techStack: p.techStack },
      create: {
        organizationId: organization.id,
        departmentId: departments[p.deptCode]?.id,
        managerId: aravindUser?.id,
        name: p.name,
        code: p.code,
        type: p.type,
        status: p.status,
        techStack: p.techStack,
        startDate: new Date('2026-01-15T00:00:00.000Z'),
      },
    });
    projects.push(project);

    const assignedEmps = allEmployees.slice(pIdx * 12, pIdx * 12 + 14);
    for (let j = 0; j < assignedEmps.length; j++) {
      projectMembersBatch.push({
        projectId: project.id,
        employeeId: assignedEmps[j].id,
        roleInProject: j === 0 ? 'TECH_LEAD' : (j < 3 ? 'SENIOR_DEV' : 'MEMBER'),
        allocationPct: j === 0 ? 100 : 75,
      });
    }
  }
  await prisma.projectMember.createMany({ data: projectMembersBatch, skipDuplicates: true });
  console.log(`✅ Created 6 IT Projects & Squad Allocations`);

  // 9. Batch Attendance Logs (Last 45 days for first 50 employees + Today for all)
  console.log('⏳ Generating attendance batch...');
  const attendanceBatch = [];
  const today = new Date('2026-09-05T09:30:00.000Z');

  for (let empIdx = 0; empIdx < allEmployees.length; empIdx++) {
    const emp = allEmployees[empIdx];
    // Today check-in for all employees
    const isTodayLate = empIdx % 11 === 0;
    const isTodayWFH = emp.workMode === 'REMOTE' || (emp.workMode === 'HYBRID' && empIdx % 3 === 0);
    const inHour = isTodayLate ? 10 : 9;
    const inMin = isTodayLate ? 25 : 30;
    attendanceBatch.push({
      organizationId: organization.id,
      employeeId: emp.id,
      date: new Date('2026-09-05T00:00:00.000Z'),
      checkIn: new Date(`2026-09-05T${String(inHour).padStart(2, '0')}:${String(inMin).padStart(2, '0')}:00.000Z`),
      checkOut: new Date('2026-09-05T18:30:00.000Z'),
      workedHours: isTodayLate ? 7.9 : 8.5,
      lateMinutes: isTodayLate ? 25 : 0,
      status: isTodayLate ? 'LATE' : 'PRESENT',
    });

    // Historical 30 days for sample group
    if (empIdx < 35) {
      for (let dayOffset = 1; dayOffset <= 30; dayOffset++) {
        const curDate = new Date(today);
        curDate.setDate(curDate.getDate() - dayOffset);
        if (curDate.getDay() === 0 || curDate.getDay() === 6) continue;

        const dateStr = curDate.toISOString().split('T')[0];
        attendanceBatch.push({
          organizationId: organization.id,
          employeeId: emp.id,
          date: new Date(`${dateStr}T00:00:00.000Z`),
          checkIn: new Date(`${dateStr}T09:30:00.000Z`),
          checkOut: new Date(`${dateStr}T18:30:00.000Z`),
          workedHours: 8.5,
          status: 'PRESENT',
        });
      }
    }
  }

  await prisma.attendance.createMany({
    data: attendanceBatch,
    skipDuplicates: true,
  });
  console.log(`✅ Attendance records batch inserted (${attendanceBatch.length} logs)`);

  // 10. Leave Requests
  const leaveReasons = [
    { type: 'CL', reason: 'Family function in Madurai', days: 2 },
    { type: 'SL', reason: 'Viral fever and medical rest', days: 2 },
    { type: 'WFH', reason: 'Broadband technician scheduled at home', days: 1 },
    { type: 'EL', reason: 'Annual vacation to Kerala with family', days: 5 },
    { type: 'COMP_OFF', reason: 'Deployment support over last Saturday release', days: 1 },
    { type: 'LOP', reason: 'Personal emergency requiring extended travel', days: 3 },
  ];

  for (let idx = 0; idx < 25; idx++) {
    const emp = allEmployees[idx % allEmployees.length];
    const spec = leaveReasons[idx % leaveReasons.length];
    const lt = leaveTypes[spec.type] || leaveTypes.CL;
    const isPending = idx < 12;
    const isRejected = idx === 13;

    const startDate = new Date('2026-09-08T09:30:00.000Z');
    startDate.setDate(startDate.getDate() + (idx * 2) - 10);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + spec.days - 1);

    await prisma.leaveRequest.upsert({
      where: { id: `seed-leave-${emp.id}-${idx}` },
      update: {},
      create: {
        id: `seed-leave-${emp.id}-${idx}`,
        organizationId: organization.id,
        employeeId: emp.id,
        leaveTypeId: lt.id,
        startDate,
        endDate,
        numberOfDays: spec.days,
        reason: spec.reason,
        status: isPending ? 'PENDING_APPROVAL' : (isRejected ? 'REJECTED' : 'APPROVED'),
        approvedById: isPending || isRejected ? null : aravindUser?.id,
        approvedAt: isPending || isRejected ? null : new Date('2026-09-01T11:00:00.000Z'),
      },
    });
  }
  console.log(`✅ Created 25 IT Leave Requests (12 in Pending Approval queue)`);

  // 11. 3 Payroll Runs & Payslips
  const payrollRunsDef = [
    { name: 'July 2026 - Monthly Software Payroll Batch', start: '2026-07-01', end: '2026-07-31', status: 'PAID' },
    { name: 'August 2026 - Monthly Software Payroll Batch', start: '2026-08-01', end: '2026-08-31', status: 'PAID' },
    { name: 'September 2026 - Monthly Software Payroll Batch', start: '2026-09-01', end: '2026-09-30', status: 'COMPUTED' },
  ];

  for (const pDef of payrollRunsDef) {
    const payrun = await prisma.payrun.upsert({
      where: { id: `payrun-${pDef.start}` },
      update: { status: pDef.status },
      create: {
        id: `payrun-${pDef.start}`,
        organizationId: organization.id,
        legalEntityId: legalEntity.id,
        salaryStructureId: salaryStructure.id,
        name: pDef.name,
        startDate: new Date(`${pDef.start}T00:00:00.000Z`),
        endDate: new Date(`${pDef.end}T23:59:59.000Z`),
        status: pDef.status,
        totalGross: 0,
        totalNet: 0,
        computedAt: new Date(),
        validatedAt: pDef.status === 'PAID' ? new Date() : null,
        paidAt: pDef.status === 'PAID' ? new Date() : null,
      },
    });

    let totalGross = 0;
    let totalNet = 0;
    const payslipLinesBatch = [];

    for (let eIdx = 0; eIdx < 30; eIdx++) {
      const emp = allEmployees[eIdx];
      const gross = emp.ctc;
      const deductions = Math.floor(gross * 0.12) + 2000;
      const net = gross - deductions;

      totalGross += gross;
      totalNet += net;

      const payslip = await prisma.payslip.upsert({
        where: { payrunId_employeeId: { payrunId: payrun.id, employeeId: emp.id } },
        update: { grossSalary: gross, deductionAmount: deductions, netSalary: net },
        create: {
          organizationId: organization.id,
          payrunId: payrun.id,
          employeeId: emp.id,
          contractId: `contract-${emp.id}`,
          salaryStructureId: salaryStructure.id,
          periodStart: new Date(`${pDef.start}T00:00:00.000Z`),
          periodEnd: new Date(`${pDef.end}T23:59:59.000Z`),
          scheduledDays: 22,
          workedDays: 21,
          paidLeaveDays: 1,
          unpaidLeaveDays: 0,
          grossSalary: gross,
          deductionAmount: deductions,
          netSalary: net,
          currency: 'INR',
        },
      });

      payslipLinesBatch.push(
        { payslipId: payslip.id, category: 'BASIC', code: 'BASIC', name: 'Basic Salary', sequence: 10, amount: Math.floor(gross * 0.4) },
        { payslipId: payslip.id, category: 'ALLOWANCE', code: 'HRA', name: 'House Rent Allowance', sequence: 20, amount: Math.floor(gross * 0.2) },
        { payslipId: payslip.id, category: 'ALLOWANCE', code: 'SPECIAL', name: 'Special Allowance', sequence: 30, amount: Math.floor(gross * 0.3) },
        { payslipId: payslip.id, category: 'ALLOWANCE', code: 'INTERNET', name: 'Internet / WFH Allowance', sequence: 40, amount: 2000 },
        { payslipId: payslip.id, category: 'DEDUCTION', code: 'PF_EE', name: 'EPF Deduction', sequence: 100, amount: 1800 },
        { payslipId: payslip.id, category: 'DEDUCTION', code: 'PT', name: 'Professional Tax (TN)', sequence: 110, amount: 200 },
        { payslipId: payslip.id, category: 'TAX', code: 'TDS', name: 'TDS (Income Tax)', sequence: 120, amount: Math.floor(gross * 0.05) }
      );
    }

    await prisma.payrun.update({
      where: { id: payrun.id },
      data: { totalGross, totalNet },
    });
    await prisma.payslipLine.createMany({ data: payslipLinesBatch, skipDuplicates: true });
  }
  console.log(`✅ Generated 3 Payroll Batches (July, August, September)`);

  // 12. Announcements
  const announcementsDef = [
    { title: '🚀 Q3 All-Hands & Product Engineering Town Hall', category: 'TOWN_HALL', priority: 'HIGH', content: 'Join us this Friday at 4:30 PM IST for our quarterly company-wide town hall. Leadership will share Q3 delivery milestones, new client acquisitions in APAC, and upcoming technical initiatives.' },
    { title: '🌟 Nexus AI Analytics Engine — Project Kickoff', category: 'ENGINEERING', priority: 'NORMAL', content: 'We are thrilled to commence Phase 1 of Nexus AI Analytics for our enterprise customer. The squad will be led by Aravind Kumar and Deepika N with cutting-edge LLM and FastAPI architecture.' },
    { title: '🛡️ Mandatory Annual Cybersecurity & Data Privacy Refresher', category: 'POLICY', priority: 'HIGH', content: 'All team members across Coimbatore, Chennai, Bengaluru, and Remote locations must complete the 2026 SOC2/ISO 27001 data privacy compliance modules by September 25.' },
    { title: '🎉 Welcome 14 New Engineering & QA Team Members!', category: 'CELEBRATION', priority: 'NORMAL', content: 'Please join us in extending a warm welcome to our newest software developers, QA engineers, and cloud specialists joining across our Coimbatore and Chennai hubs.' },
    { title: '🌴 Revised Work-From-Home & Hybrid Schedule Policy', category: 'POLICY', priority: 'NORMAL', content: 'Starting September 1st, all team members are eligible for 4 flexible WFH days per month with streamlined one-click approvals in PeoplePay360.' },
  ];

  for (let aIdx = 0; aIdx < announcementsDef.length; aIdx++) {
    const ann = announcementsDef[aIdx];
    await prisma.announcement.upsert({
      where: { id: `announcement-${aIdx + 1}` },
      update: { title: ann.title, content: ann.content, priority: ann.priority },
      create: {
        id: `announcement-${aIdx + 1}`,
        organizationId: organization.id,
        authorId: allUsers[1]?.id,
        title: ann.title,
        category: ann.category,
        priority: ann.priority,
        content: ann.content,
        publishedAt: new Date('2026-09-02T10:00:00.000Z'),
      },
    });
  }

  // 13. Notifications
  const notifs = allUsers.map((u) => ({
    organizationId: organization.id,
    userId: u.id,
    type: 'PAYROLL',
    title: 'August 2026 Payslip Available',
    message: 'Your monthly payslip for August 2026 has been generated and is ready for download.',
    link: '/payslips',
    isRead: false,
  }));
  await prisma.notification.createMany({ data: notifs, skipDuplicates: true });

  // 14. Audit Logs
  const auditEvents = [
    { action: 'LOGIN_SUCCESS', entityType: 'User', entityId: 'user-admin', newValues: { ip: '192.168.1.45', device: 'MacBook Pro' } },
    { action: 'PAYROLL_COMPUTED', entityType: 'Payrun', entityId: 'payrun-2026-09-01', newValues: { batch: 'September 2026', totalEmployees: 164 } },
    { action: 'LEAVE_APPROVED', entityType: 'LeaveRequest', entityId: 'leave-1007', newValues: { employee: 'Indersh Guhan', days: 2, status: 'APPROVED' } },
    { action: 'PROJECT_MEMBER_ASSIGNED', entityType: 'Project', entityId: 'project-p360', newValues: { project: 'P360-HRMS', addedMembers: 14 } },
    { action: 'SALARY_STRUCTURE_UPDATED', entityType: 'SalaryStructure', entityId: 'struct-it', newValues: { structure: 'IND-IT-STANDARD' } },
  ];

  await prisma.auditLog.createMany({
    data: auditEvents.map((ev, i) => ({
      organizationId: organization.id,
      userId: allUsers[1]?.id,
      action: ev.action,
      entityType: ev.entityType,
      entityId: ev.entityId,
      newValues: ev.newValues,
      ipAddress: '192.168.102.160',
      userAgent: 'Mozilla/5.0 Chrome/130.0',
      createdAt: new Date(Date.now() - (i * 86400000 * 2)),
    })),
  });

  // SUMMARY
  console.log('\n=============================================================');
  console.log('🎉 MASTER SEED COMPLETED FOR PEOPLEPAY360 TECHNOLOGIES PVT. LTD.');
  console.log('=============================================================');
  console.log(`🏢 Organization:   ${organization.name} (${organization.code})`);
  console.log(`🏛️ Legal Entity:   ${legalEntity.name}`);
  console.log(`📂 Departments:    12 IT Squads & Departments`);
  console.log(`👥 Total Team:     ${allEmployees.length} realistic IT employees`);
  console.log(`💻 Active Projects: ${projects.length} software delivery squads`);
  console.log(`📊 Attendance:     ${attendanceBatch.length} logs with today live clock-ins`);
  console.log(`🌴 Leaves:         25 requests with 12 in pending queue`);
  console.log(`💰 Payroll Runs:   3 monthly batches (July, Aug, Sept)`);
  console.log('-------------------------------------------------------------');
  console.log('🔑 TEST ROLE LOGIN ACCOUNTS (Password: PeoplePay360@123):');
  console.log('1. SUPER_ADMIN:          platform.admin@peoplepay360.in');
  console.log('2. ORGANIZATION_ADMIN:   indhu.admin@peoplepay360.in');
  console.log('3. HR_MANAGER:           kavya.hr@peoplepay360.in');
  console.log('4. PAYROLL_MANAGER:      vishal.payroll@peoplepay360.in');
  console.log('5. FINANCE_MANAGER:      finance.manager@peoplepay360.in');
  console.log('6. DEPARTMENT_MANAGER:   aravind.manager@peoplepay360.in');
  console.log('7. EMPLOYEE:             employee@peoplepay360.in');
  console.log('8. AUDITOR:              auditor@peoplepay360.in');
  console.log('=============================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
