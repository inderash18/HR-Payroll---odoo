// src/mocks/adminDashboardMock.js
// Realistic Mock Data for PeoplePay360 Organization Admin Dashboard

export const adminDashboardSummary = {
  totalEmployees: {
    value: 248,
    changeText: '+12 this month',
    trend: '+5.1%',
    isPositive: true,
  },
  presentToday: {
    value: 219,
    attendanceRate: '88.3%',
    changeText: '88.3% attendance',
    trend: '+2.4%',
    isPositive: true,
  },
  pendingLeaves: {
    value: 14,
    attentionCount: 6,
    changeText: '6 require attention today',
    trend: 'Needs Action',
    isWarning: true,
  },
  payrollStatus: {
    cycle: 'September Payroll',
    status: 'Processing',
    completionPct: 78,
    changeText: '78% completed',
    trend: 'In Review',
    isPositive: true,
  },
};

export const workforceTrendData = {
  monthly: [
    { label: 'Jan', count: 198, hires: 8, exits: 2 },
    { label: 'Feb', count: 205, hires: 10, exits: 3 },
    { label: 'Mar', count: 210, hires: 9, exits: 4 },
    { label: 'Apr', count: 217, hires: 11, exits: 4 },
    { label: 'May', count: 220, hires: 7, exits: 4 },
    { label: 'Jun', count: 226, hires: 10, exits: 4 },
    { label: 'Jul', count: 230, hires: 8, exits: 4 },
    { label: 'Aug', count: 236, hires: 9, exits: 3 },
    { label: 'Sep', count: 248, hires: 12, exits: 3 },
  ],
  weekly: [
    { label: 'Week 33', count: 241, hires: 2, exits: 0 },
    { label: 'Week 34', count: 243, hires: 3, exits: 1 },
    { label: 'Week 35', count: 245, hires: 3, exits: 1 },
    { label: 'Week 36', count: 248, hires: 4, exits: 1 },
  ],
  quarterly: [
    { label: 'Q1 2026', count: 210, hires: 27, exits: 9 },
    { label: 'Q2 2026', count: 226, hires: 28, exits: 12 },
    { label: 'Q3 2026', count: 248, hires: 29, exits: 10 },
  ],
  metrics: {
    totalWorkforce: 248,
    newHiresMonth: 12,
    departuresMonth: 3,
  },
};

export const attendanceData = {
  present: 219,
  onLeave: 17,
  absent: 8,
  lateCheckIn: 4,
  totalEmployees: 248,
  attendanceRate: 88.3,
};

export const departmentData = [
  { id: 'dept-eng', name: 'Engineering', employees: 76, attendance: 91, status: 'Healthy' },
  { id: 'dept-sales', name: 'Sales', employees: 48, attendance: 85, status: 'Needs Attention' },
  { id: 'dept-hr', name: 'Human Resources', employees: 18, attendance: 94, status: 'Healthy' },
  { id: 'dept-fin', name: 'Finance', employees: 22, attendance: 89, status: 'Healthy' },
  { id: 'dept-ops', name: 'Operations', employees: 54, attendance: 82, status: 'Needs Attention' },
  { id: 'dept-mkt', name: 'Marketing', employees: 30, attendance: 88, status: 'Healthy' },
];

export const pendingApprovals = [
  { id: 'appr-leave', title: 'Leave Requests', count: 14, subtitle: '6 require attention today', type: 'leave', icon: 'CalendarDays', badge: '14 Pending' },
  { id: 'appr-profile', title: 'Employee Profile Updates', count: 7, subtitle: 'Bank & contact changes', type: 'profile', icon: 'UserCheck', badge: '7 Pending' },
  { id: 'appr-payroll', title: 'Payroll Review', count: 1, subtitle: 'September cycle pending sign-off', type: 'payroll', icon: 'Landmark', badge: 'In Review' },
  { id: 'appr-reimb', title: 'Reimbursements', count: 9, subtitle: 'Travel & operational claims', type: 'reimbursement', icon: 'DollarSign', badge: '9 Pending' },
];

export const recentEmployees = [
  {
    id: 'emp-1041',
    name: 'Aadhya Sharma',
    employeeId: 'PP360-1041',
    department: 'Engineering',
    jobTitle: 'Frontend Developer',
    joiningDate: 'Sep 03, 2026',
    status: 'Active',
    avatarInitials: 'AS',
    avatarBg: '#0f172a',
  },
  {
    id: 'emp-1042',
    name: 'Arjun Kumar',
    employeeId: 'PP360-1042',
    department: 'Sales',
    jobTitle: 'Business Executive',
    joiningDate: 'Sep 02, 2026',
    status: 'Active',
    avatarInitials: 'AK',
    avatarBg: '#1e293b',
  },
  {
    id: 'emp-1043',
    name: 'Priya Nair',
    employeeId: 'PP360-1043',
    department: 'Finance',
    jobTitle: 'Finance Analyst',
    joiningDate: 'Sep 01, 2026',
    status: 'Onboarding',
    avatarInitials: 'PN',
    avatarBg: '#334155',
  },
  {
    id: 'emp-1044',
    name: 'Karthik S',
    employeeId: 'PP360-1044',
    department: 'Operations',
    jobTitle: 'Operations Associate',
    joiningDate: 'Aug 30, 2026',
    status: 'Active',
    avatarInitials: 'KS',
    avatarBg: '#0f172a',
  },
  {
    id: 'emp-1045',
    name: 'Meera R',
    employeeId: 'PP360-1045',
    department: 'HR',
    jobTitle: 'Talent Specialist',
    joiningDate: 'Aug 29, 2026',
    status: 'Onboarding',
    avatarInitials: 'MR',
    avatarBg: '#1e293b',
  },
];

export const payrollOverview = {
  cycle: 'September 2026',
  employeesIncluded: 241,
  totalEmployees: 248,
  grossPayroll: 4286500,
  totalDeductions: 624300,
  estimatedNetPayout: 3662200,
  status: 'In Review',
  processingCompletion: 78,
  currency: 'INR',
  currencySymbol: '₹',
};

export const adminRecentActivities = [
  {
    id: 'act-1',
    description: 'Indhu Raj added a new employee, Aadhya Sharma',
    timestamp: '10 minutes ago',
    icon: 'UserPlus',
    category: 'employee',
  },
  {
    id: 'act-2',
    description: 'Payroll Manager submitted September payroll for review',
    timestamp: '35 minutes ago',
    icon: 'Landmark',
    category: 'payroll',
  },
  {
    id: 'act-3',
    description: '3 leave requests were approved by HR Team',
    timestamp: '1 hour ago',
    icon: 'CheckSquare',
    category: 'leave',
  },
  {
    id: 'act-4',
    description: 'Department "Marketing" updated its work schedule',
    timestamp: '2 hours ago',
    icon: 'Clock',
    category: 'schedule',
  },
  {
    id: 'act-5',
    description: 'New employee onboarding started for Priya Nair',
    timestamp: 'Yesterday',
    icon: 'UserCheck',
    category: 'onboarding',
  },
];

export const companyAlerts = [
  {
    id: 'alert-1',
    text: '7 employees have incomplete profile details',
    priority: 'High',
    actionText: 'Review Profiles',
    link: '/employees',
  },
  {
    id: 'alert-2',
    text: '4 employees have not checked in today',
    priority: 'Medium',
    actionText: 'Check Attendance',
    link: '/attendance',
  },
  {
    id: 'alert-3',
    text: '7 employee records are missing bank information',
    priority: 'High',
    actionText: 'Update Bank Details',
    link: '/employees',
  },
  {
    id: 'alert-4',
    text: 'September payroll requires financial approval',
    priority: 'Medium',
    actionText: 'Review Payrun',
    link: '/payroll',
  },
];
