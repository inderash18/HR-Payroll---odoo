// Mock and persistent data store for PeoplePay360 Admin Modules

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'HR_MANAGER' | 'HR_PAYROLL_MANAGER' | 'HR_PAYROLL_USER' | 'EMPLOYEE';
  department: string;
  status: 'ACTIVE' | 'INACTIVE';
  employeeId: string | null;
  mfaEnabled: boolean;
  lastLogin: string;
}

export interface RoleItem {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  permissions: {
    dashboard: ('view' | 'edit')[];
    users: ('view' | 'create' | 'edit' | 'delete')[];
    roles: ('view' | 'create' | 'edit' | 'delete')[];
    organization: ('view' | 'create' | 'edit' | 'delete')[];
    employees: ('view' | 'create' | 'edit' | 'delete')[];
    payroll: ('view' | 'create' | 'edit' | 'delete')[];
    settings: ('view' | 'edit')[];
  };
}

export interface OrganizationInfo {
  name: string;
  code: string;
  legalEntity: string;
  taxId: string;
  country: string;
  currency: string;
  timezone: string;
  headquarters: string;
  foundedYear: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  country: string;
  employeeCount: number;
  isHQ: boolean;
}

export interface DepartmentItem {
  id: string;
  name: string;
  code: string;
  head: string;
  headcount: number;
  budget: string;
  branch: string;
}

export interface BusinessUnit {
  id: string;
  name: string;
  code: string;
  head: string;
  departments: string[];
}

export interface EmployeeRecord {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  grade: string;
  manager: string;
  status: 'ACTIVE' | 'PROBATION' | 'SUSPENDED' | 'TERMINATED';
  linkedUserId: string | null;
  joinDate: string;
  salary: string;
}

export interface JobPositionItem {
  id: string;
  code: string;
  title: string;
  department: string;
  grade: string;
  openings: number;
  filled: number;
}

export interface JobGradeItem {
  id: string;
  code: string;
  level: string;
  minSalary: string;
  maxSalary: string;
  experienceYears: string;
  hierarchyRank: number;
}

export interface WorkflowItem {
  id: string;
  name: string;
  type: 'LEAVE' | 'PAYROLL' | 'EXPENSE' | 'PROMOTION';
  approvalChain: string[];
  status: 'ACTIVE' | 'DRAFT';
  slaHours: number;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entity: string;
  details: string;
  ipAddress: string;
  type: 'ACTIVITY' | 'LOGIN' | 'RECORD_CHANGE' | 'SECURITY' | 'APPROVAL';
}

export interface DocumentItem {
  id: string;
  name: string;
  category: 'Contract' | 'Identification' | 'Tax' | 'Policy' | 'Review';
  employeeName: string;
  size: string;
  version: string;
  uploadedAt: string;
  accessLevel: 'Confidential' | 'HR Only' | 'Public';
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'EMAIL' | 'SYSTEM';
  subject: string;
  trigger: string;
  active: boolean;
}

// Initial Mock Store
export const adminDataStore = {
  users: [
    {
      id: 'usr-1',
      name: 'Jerome Bell',
      email: 'admin@peoplepay360.local',
      role: 'ADMIN',
      department: 'Executive Office',
      status: 'ACTIVE',
      employeeId: 'EMP-001',
      mfaEnabled: true,
      lastLogin: 'Today at 02:15 PM',
    },
    {
      id: 'usr-2',
      name: 'Sarah Jenkins',
      email: 'payroll.manager@peoplepay360.local',
      role: 'HR_PAYROLL_MANAGER',
      department: 'Finance & Payroll',
      status: 'ACTIVE',
      employeeId: 'EMP-002',
      mfaEnabled: true,
      lastLogin: 'Yesterday at 05:40 PM',
    },
    {
      id: 'usr-3',
      name: 'David Mitchell',
      email: 'hr.manager@peoplepay360.local',
      role: 'HR_MANAGER',
      department: 'Human Resources',
      status: 'ACTIVE',
      employeeId: 'EMP-003',
      mfaEnabled: false,
      lastLogin: 'Sep 3, 2026',
    },
    {
      id: 'usr-4',
      name: 'Emily Watson',
      email: 'emily.w@peoplepay360.local',
      role: 'HR_PAYROLL_USER',
      department: 'Finance & Payroll',
      status: 'ACTIVE',
      employeeId: 'EMP-004',
      mfaEnabled: true,
      lastLogin: 'Sep 2, 2026',
    },
    {
      id: 'usr-5',
      name: 'Alexandre Dubois',
      email: 'alex.dubois@peoplepay360.local',
      role: 'EMPLOYEE',
      department: 'Engineering',
      status: 'ACTIVE',
      employeeId: 'EMP-005',
      mfaEnabled: false,
      lastLogin: 'Aug 30, 2026',
    },
    {
      id: 'usr-6',
      name: 'Michael Chang',
      email: 'm.chang@peoplepay360.local',
      role: 'EMPLOYEE',
      department: 'Product & Design',
      status: 'INACTIVE',
      employeeId: null,
      mfaEnabled: false,
      lastLogin: 'July 14, 2026',
    },
  ] as UserItem[],

  roles: [
    {
      id: 'role-admin',
      name: 'Global Administrator',
      description: 'Unrestricted full access across all organization modules, finances, and system policies.',
      usersCount: 2,
      permissions: {
        dashboard: ['view', 'edit'],
        users: ['view', 'create', 'edit', 'delete'],
        roles: ['view', 'create', 'edit', 'delete'],
        organization: ['view', 'create', 'edit', 'delete'],
        employees: ['view', 'create', 'edit', 'delete'],
        payroll: ['view', 'create', 'edit', 'delete'],
        settings: ['view', 'edit'],
      },
    },
    {
      id: 'role-payroll-mgr',
      name: 'HR & Payroll Manager',
      description: 'Management of pay runs, salary structures, tax deductions, and approval chains.',
      usersCount: 4,
      permissions: {
        dashboard: ['view'],
        users: ['view'],
        roles: ['view'],
        organization: ['view'],
        employees: ['view', 'create', 'edit'],
        payroll: ['view', 'create', 'edit', 'delete'],
        settings: ['view'],
      },
    },
    {
      id: 'role-hr-mgr',
      name: 'HR Operations Lead',
      description: 'Employee onboarding, attendance tracking, leave allocation, and departmental structure.',
      usersCount: 3,
      permissions: {
        dashboard: ['view'],
        users: ['view', 'create', 'edit'],
        roles: ['view'],
        organization: ['view', 'create', 'edit'],
        employees: ['view', 'create', 'edit'],
        payroll: ['view'],
        settings: ['view'],
      },
    },
    {
      id: 'role-emp',
      name: 'Standard Employee',
      description: 'Personal self-service: attendance punch, leave requests, payslip downloads.',
      usersCount: 110,
      permissions: {
        dashboard: ['view'],
        users: [],
        roles: [],
        organization: ['view'],
        employees: ['view'],
        payroll: ['view'],
        settings: [],
      },
    },
  ] as RoleItem[],

  organization: {
    name: 'PeoplePay360 Global Technologies',
    code: 'DEMO-ORG',
    legalEntity: 'PeoplePay Technologies LLC',
    taxId: 'US-EIN-98-7654321',
    country: 'United States',
    currency: 'USD ($)',
    timezone: 'America/New_York (UTC-5)',
    headquarters: '100 Broadway Ave, New York, NY 10005',
    foundedYear: '2021',
  } as OrganizationInfo,

  branches: [
    { id: 'br-1', name: 'New York Headquarters', code: 'NY-HQ', city: 'New York', country: 'United States', employeeCount: 78, isHQ: true },
    { id: 'br-2', name: 'London Innovation Center', code: 'LON-TECH', city: 'London', country: 'United Kingdom', employeeCount: 32, isHQ: false },
    { id: 'br-3', name: 'Singapore APAC Hub', code: 'SG-APAC', city: 'Singapore', country: 'Singapore', employeeCount: 18, isHQ: false },
  ] as Branch[],

  departments: [
    { id: 'dept-1', name: 'Engineering', code: 'ENG', head: 'Alexandre Dubois', headcount: 45, budget: '$450,000 / mo', branch: 'New York HQ' },
    { id: 'dept-2', name: 'Finance & Payroll', code: 'FIN', head: 'Sarah Jenkins', headcount: 12, budget: '$120,000 / mo', branch: 'New York HQ' },
    { id: 'dept-3', name: 'Human Resources', code: 'HR', head: 'David Mitchell', headcount: 8, budget: '$80,000 / mo', branch: 'New York HQ' },
    { id: 'dept-4', name: 'Product & Design', code: 'PRD', head: 'Clara Vance', headcount: 24, budget: '$260,000 / mo', branch: 'London Innovation' },
    { id: 'dept-5', name: 'Sales & Marketing', code: 'MKT', head: 'Marcus Brody', headcount: 28, budget: '$290,000 / mo', branch: 'New York HQ' },
    { id: 'dept-6', name: 'Customer Operations', code: 'OPS', head: 'Elena Rostova', headcount: 11, budget: '$95,000 / mo', branch: 'Singapore APAC' },
  ] as DepartmentItem[],

  businessUnits: [
    { id: 'bu-1', name: 'Enterprise Core Services', code: 'BU-CORE', head: 'Jerome Bell', departments: ['Engineering', 'Product & Design'] },
    { id: 'bu-2', name: 'Commercial & Growth', code: 'BU-GROWTH', head: 'Marcus Brody', departments: ['Sales & Marketing', 'Customer Operations'] },
    { id: 'bu-3', name: 'Corporate Operations', code: 'BU-CORP', head: 'Sarah Jenkins', departments: ['Finance & Payroll', 'Human Resources'] },
  ] as BusinessUnit[],

  employees: [
    {
      id: 'emp-1',
      code: 'EMP-001',
      firstName: 'Jerome',
      lastName: 'Bell',
      email: 'jerome.bell@peoplepay360.local',
      phone: '+1 (555) 234-5678',
      department: 'Executive Office',
      position: 'Chief Executive Officer',
      grade: 'L5 Executive',
      manager: 'Board of Directors',
      status: 'ACTIVE',
      linkedUserId: 'usr-1',
      joinDate: '2021-03-01',
      salary: '$185,000 / yr',
    },
    {
      id: 'emp-2',
      code: 'EMP-002',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'sarah.j@peoplepay360.local',
      phone: '+1 (555) 345-6789',
      department: 'Finance & Payroll',
      position: 'Director of Payroll & Compensation',
      grade: 'L4 Principal',
      manager: 'Jerome Bell',
      status: 'ACTIVE',
      linkedUserId: 'usr-2',
      joinDate: '2021-06-15',
      salary: '$140,000 / yr',
    },
    {
      id: 'emp-3',
      code: 'EMP-003',
      firstName: 'David',
      lastName: 'Mitchell',
      email: 'david.m@peoplepay360.local',
      phone: '+1 (555) 456-7890',
      department: 'Human Resources',
      position: 'Head of People Operations',
      grade: 'L4 Principal',
      manager: 'Jerome Bell',
      status: 'ACTIVE',
      linkedUserId: 'usr-3',
      joinDate: '2021-09-01',
      salary: '$132,000 / yr',
    },
    {
      id: 'emp-4',
      code: 'EMP-004',
      firstName: 'Emily',
      lastName: 'Watson',
      email: 'emily.w@peoplepay360.local',
      phone: '+1 (555) 567-8901',
      department: 'Finance & Payroll',
      position: 'Senior Payroll Specialist',
      grade: 'L3 Senior',
      manager: 'Sarah Jenkins',
      status: 'ACTIVE',
      linkedUserId: 'usr-4',
      joinDate: '2022-01-10',
      salary: '$95,000 / yr',
    },
    {
      id: 'emp-5',
      code: 'EMP-005',
      firstName: 'Alexandre',
      lastName: 'Dubois',
      email: 'alex.d@peoplepay360.local',
      phone: '+1 (555) 678-9012',
      department: 'Engineering',
      position: 'Principal Staff Engineer',
      grade: 'L4 Principal',
      manager: 'Jerome Bell',
      status: 'ACTIVE',
      linkedUserId: 'usr-5',
      joinDate: '2022-04-18',
      salary: '$165,000 / yr',
    },
    {
      id: 'emp-6',
      code: 'EMP-006',
      firstName: 'Samantha',
      lastName: 'Ray',
      email: 's.ray@peoplepay360.local',
      phone: '+1 (555) 789-0123',
      department: 'Engineering',
      position: 'Full Stack Engineer',
      grade: 'L2 Associate',
      manager: 'Alexandre Dubois',
      status: 'PROBATION',
      linkedUserId: null,
      joinDate: '2026-07-01',
      salary: '$88,000 / yr',
    },
  ] as EmployeeRecord[],

  positions: [
    { id: 'pos-1', code: 'SWE-SR', title: 'Senior Software Engineer', department: 'Engineering', grade: 'L3 Senior', openings: 3, filled: 12 },
    { id: 'pos-2', code: 'PAY-SPEC', title: 'Payroll Specialist', department: 'Finance & Payroll', grade: 'L2 Associate', openings: 1, filled: 4 },
    { id: 'pos-3', code: 'HR-LEAD', title: 'Lead People Partner', department: 'Human Resources', grade: 'L4 Principal', openings: 0, filled: 2 },
    { id: 'pos-4', code: 'PRD-MGR', title: 'Product Manager', department: 'Product & Design', grade: 'L3 Senior', openings: 2, filled: 6 },
    { id: 'pos-5', code: 'ACC-DIR', title: 'Finance Controller', department: 'Finance & Payroll', grade: 'L5 Executive', openings: 0, filled: 1 },
  ] as JobPositionItem[],

  grades: [
    { id: 'grd-1', code: 'L1', level: 'Entry Level / Junior', minSalary: '$45,000', maxSalary: '$70,000', experienceYears: '0 - 2 yrs', hierarchyRank: 1 },
    { id: 'grd-2', code: 'L2', level: 'Mid-Level Associate', minSalary: '$70,000', maxSalary: '$100,000', experienceYears: '2 - 5 yrs', hierarchyRank: 2 },
    { id: 'grd-3', code: 'L3', level: 'Senior Specialist', minSalary: '$100,000', maxSalary: '$140,000', experienceYears: '5 - 8 yrs', hierarchyRank: 3 },
    { id: 'grd-4', code: 'L4', level: 'Lead / Principal', minSalary: '$140,000', maxSalary: '$190,000', experienceYears: '8 - 12 yrs', hierarchyRank: 4 },
    { id: 'grd-5', code: 'L5', level: 'Director / Executive', minSalary: '$190,000', maxSalary: '$320,000', experienceYears: '12+ yrs', hierarchyRank: 5 },
  ] as JobGradeItem[],

  workflows: [
    { id: 'wf-1', name: 'Paid Time Off (PTO) Approval', type: 'LEAVE', approvalChain: ['Direct Manager', 'HR Operations'], status: 'ACTIVE', slaHours: 24 },
    { id: 'wf-2', name: 'Salary Compensation Adjustment', type: 'PAYROLL', approvalChain: ['Department Head', 'Finance Director', 'CEO'], status: 'ACTIVE', slaHours: 72 },
    { id: 'wf-3', name: 'Discretionary Expense Reimbursement', type: 'EXPENSE', approvalChain: ['Finance Specialist', 'VP Finance'], status: 'ACTIVE', slaHours: 48 },
    { id: 'wf-4', name: 'Internal Promotion & Grade Change', type: 'PROMOTION', approvalChain: ['Division Head', 'HR VP'], status: 'ACTIVE', slaHours: 96 },
  ] as WorkflowItem[],

  auditLogs: [
    { id: 'aud-1', timestamp: 'Today at 02:40 PM', actor: 'Jerome Bell', action: 'Approved Leave Request', entity: 'Leave #LR-2026-89', details: 'Approved 3 days PTO for Alexandre Dubois', ipAddress: '192.168.1.104', type: 'APPROVAL' },
    { id: 'aud-2', timestamp: 'Today at 01:15 PM', actor: 'Sarah Jenkins', action: 'Executed Payroll Batch', entity: 'Payrun #AUG-2026', details: 'Calculated 128 payslips, total disbursement $62,456.00', ipAddress: '192.168.1.112', type: 'RECORD_CHANGE' },
    { id: 'aud-3', timestamp: 'Today at 09:00 AM', actor: 'System Security', action: 'User Sign In', entity: 'User #usr-1', details: 'MFA verified successfully via TOTP', ipAddress: '192.168.1.104', type: 'LOGIN' },
    { id: 'aud-4', timestamp: 'Yesterday at 04:22 PM', actor: 'David Mitchell', action: 'Updated Job Grade', entity: 'JobGrade #grd-3', details: 'Adjusted senior salary band upper ceiling to $140,000', ipAddress: '192.168.1.108', type: 'RECORD_CHANGE' },
    { id: 'aud-5', timestamp: 'Sep 3, 2026', actor: 'Security Sentinel', action: 'Blocked Anomaly Login', entity: 'User #usr-6', details: 'Repeated failed login from unrecognized IP: 85.203.44.12', ipAddress: '85.203.44.12', type: 'SECURITY' },
  ] as AuditLogItem[],

  documents: [
    { id: 'doc-1', name: 'Standard Employment Agreement 2026.pdf', category: 'Contract', employeeName: 'Alexandre Dubois', size: '1.4 MB', version: 'v2.1', uploadedAt: '2026-08-10', accessLevel: 'Confidential' },
    { id: 'doc-2', name: 'W-4 Federal Tax Withholding Certificate.pdf', category: 'Tax', employeeName: 'Sarah Jenkins', size: '420 KB', version: 'v1.0', uploadedAt: '2026-07-22', accessLevel: 'HR Only' },
    { id: 'doc-3', name: 'Annual Performance Appraisal Review.pdf', category: 'Review', employeeName: 'Emily Watson', size: '890 KB', version: 'v1.2', uploadedAt: '2026-08-01', accessLevel: 'Confidential' },
    { id: 'doc-4', name: 'Corporate Global Remote Work Policy.pdf', category: 'Policy', employeeName: 'All Staff', size: '2.8 MB', version: 'v3.0', uploadedAt: '2026-01-15', accessLevel: 'Public' },
  ] as DocumentItem[],

  notificationTemplates: [
    { id: 'ntf-1', name: 'New Employee Welcome Email', type: 'EMAIL', subject: 'Welcome to PeoplePay360, {{firstName}}!', trigger: 'On Employee Creation', active: true },
    { id: 'ntf-2', name: 'Leave Request Approved Notification', type: 'SYSTEM', subject: 'Your leave request for {{dates}} has been approved', trigger: 'On Leave Approval', active: true },
    { id: 'ntf-3', name: 'Monthly Payslip Available Alert', type: 'EMAIL', subject: 'Your Payslip for {{monthYear}} is Ready for Download', trigger: 'On Payrun Finalized', active: true },
    { id: 'ntf-4', name: 'Security Alert: New Device Login', type: 'SYSTEM', subject: 'Security Notice: Login from new IP detected', trigger: 'On Unrecognized Login', active: true },
  ] as NotificationTemplate[],

  systemSettings: {
    companyName: 'PeoplePay360 Global Technologies LLC',
    currency: 'USD ($)',
    language: 'English (US)',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '12 Hours (AM/PM)',
    fiscalYearStart: 'January 1st',
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: '587',
    senderEmail: 'notifications@peoplepay360.com',
    enforceMfa: true,
    sessionTimeoutMins: 60,
    passwordMinLength: 12,
    passwordRequireSpecialChar: true,
  },
};
