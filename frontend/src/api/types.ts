export type Role = 'ADMIN' | 'HR_PAYROLL_MANAGER' | 'HR_PAYROLL_USER' | 'HR_MANAGER' | 'EMPLOYEE';

export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'CANCELLED';
export type PayrunStatus = 'DRAFT' | 'COMPUTING' | 'COMPUTED' | 'VALIDATED' | 'PAID' | 'CANCELLED';
export type LeaveStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type AllocationStatus = 'DRAFT' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE' | 'HOLIDAY';

export interface User {
  id: string;
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  organization?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface Department {
  id: string;
  name: string;
  code: string;
  _count?: { employees: number };
}

export interface JobPosition {
  id: string;
  title: string;
  code: string;
  departmentId?: string;
  department?: Department;
}

export interface WorkingScheduleLine {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakMinutes: number;
}

export interface WorkingSchedule {
  id: string;
  name: string;
  type: string;
  timezone: string;
  active: boolean;
  lines?: WorkingScheduleLine[];
  _count?: { employees: number; contracts: number };
}

export interface Employee {
  id: string;
  employeeNum: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  personalEmail?: string;
  phone?: string;
  bankName?: string;
  bankAccountMasked?: string;
  taxId?: string;
  departmentId?: string;
  jobPositionId?: string;
  workingScheduleId?: string;
  department?: Department;
  jobPosition?: JobPosition;
  workingSchedule?: WorkingSchedule;
  isActive: boolean;
  joiningDate?: string;
}

export interface Contract {
  id: string;
  name: string;
  employeeId: string;
  structureId: string;
  workingScheduleId?: string;
  wage: number;
  wagePeriod: string;
  startDate: string;
  endDate?: string;
  status: ContractStatus;
  employee?: Employee;
  structure?: { id: string; name: string; code: string };
  workingSchedule?: WorkingSchedule;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  workedHours?: number;
  status: AttendanceStatus;
  employee?: { id: string; firstName: string; lastName: string; employeeNum: string };
}

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  isPaid: boolean;
  requiresAllocation: boolean;
  daysAllowed: number;
  active: boolean;
}

export interface LeaveAllocation {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  allocatedAmount: number;
  consumedAmount: number;
  validFrom: string;
  validUntil: string;
  status: AllocationStatus;
  employee?: Employee;
  leaveType?: LeaveType;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason?: string;
  status: LeaveStatus;
  employee?: Employee;
  leaveType?: LeaveType;
}

export interface SalaryRule {
  id: string;
  structureId: string;
  name: string;
  code: string;
  category: 'BASIC' | 'ALLOWANCE' | 'GROSS' | 'DEDUCTION' | 'CONTRIBUTION' | 'NET';
  sequence: number;
  amountType: 'FIXED' | 'PERCENTAGE' | 'FORMULA';
  amountFixed?: number;
  amountPercentage?: number;
  percentageBasedOn?: string;
  codeFormula?: string;
  isActive: boolean;
}

export interface SalaryStructure {
  id: string;
  name: string;
  code: string;
  description?: string;
  active: boolean;
  rules?: SalaryRule[];
  _count?: { contracts: number };
}

export interface Payrun {
  id: string;
  name: string;
  status: PayrunStatus;
  startDate: string;
  endDate: string;
  totalGross: number;
  totalNet: number;
  payslips?: Payslip[];
  warnings?: PayrollWarning[];
  _count?: { payslips: number };
}

export interface PayslipLine {
  id: string;
  category: string;
  code: string;
  name: string;
  sequence: number;
  amount: number;
  baseAmount?: number;
  rate?: number;
}

export interface Payslip {
  id: string;
  payrunId: string;
  employeeId: string;
  contractId: string;
  periodStart: string;
  periodEnd: string;
  workedDays: number;
  unpaidLeaveDays: number;
  grossSalary: number;
  deductionAmount: number;
  netSalary: number;
  currency: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNum: string;
    workEmail?: string;
    bankName?: string;
    bankAccountMasked?: string;
    department?: { name: string };
    jobPosition?: { title: string };
  };
  payrun?: { id: string; name: string; status: string; startDate: string; endDate: string };
  lines?: PayslipLine[];
}

export interface PayrollWarning {
  id: string;
  code: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'BLOCKING';
  employeeId?: string;
}

export interface DashboardOverview {
  activeEmployees: number;
  activeContracts: number;
  pendingLeaves: number;
  latestPayrun?: {
    id: string;
    name: string;
    status: string;
    startDate: string;
    endDate: string;
    totalGross: number;
    totalNet: number;
  };
  allTimePaidNet: number;
  allTimePaidGross: number;
  departmentHeadcounts: Array<{
    id: string;
    name: string;
    code: string;
    employeeCount: number;
  }>;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  items?: T[];
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
