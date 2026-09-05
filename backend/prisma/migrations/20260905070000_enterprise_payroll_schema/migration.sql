-- CreateEnum
CREATE TYPE "AllocationStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REFUSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "WarningSeverity" AS ENUM ('INFO', 'WARNING', 'BLOCKING');

-- CreateEnum
CREATE TYPE "EmailDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AmountType" ADD VALUE 'FORMULA';
ALTER TYPE "AmountType" ADD VALUE 'CONTRACT_BASE';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AttendanceStatus" ADD VALUE 'OVERTIME';
ALTER TYPE "AttendanceStatus" ADD VALUE 'MISSING_CHECKOUT';
ALTER TYPE "AttendanceStatus" ADD VALUE 'HOLIDAY';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RuleCategoryType" ADD VALUE 'BASIC';
ALTER TYPE "RuleCategoryType" ADD VALUE 'GROSS';
ALTER TYPE "RuleCategoryType" ADD VALUE 'CONTRIBUTION';
ALTER TYPE "RuleCategoryType" ADD VALUE 'NET';

-- AlterTable
ALTER TABLE "attendances" ADD COLUMN     "late_minutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "manually_modified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "modification_reason" TEXT,
ADD COLUMN     "modified_by_id" TEXT,
ADD COLUMN     "overtime_minutes" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "contracts" ADD COLUMN     "working_schedule_id" TEXT,
ALTER COLUMN "wage" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "departments" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "bank_account_masked" TEXT,
ADD COLUMN     "bank_name" TEXT,
ADD COLUMN     "personal_email" TEXT,
ADD COLUMN     "tax_id" TEXT,
ADD COLUMN     "termination_date" TIMESTAMP(3),
ADD COLUMN     "working_schedule_id" TEXT;

-- AlterTable
ALTER TABLE "job_positions" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "leave_requests" ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "refused_at" TIMESTAMP(3),
ADD COLUMN     "refused_by_id" TEXT;

-- AlterTable
ALTER TABLE "leave_types" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "approval_required" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "requires_allocation" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "payruns" ADD COLUMN     "computed_at" TIMESTAMP(3),
ADD COLUMN     "paid_at" TIMESTAMP(3),
ADD COLUMN     "paid_by_id" TEXT,
ADD COLUMN     "salary_structure_id" TEXT,
ADD COLUMN     "validated_at" TIMESTAMP(3),
ADD COLUMN     "validated_by_id" TEXT,
ALTER COLUMN "total_gross" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "total_net" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "payslip_lines" ADD COLUMN     "sequence" INTEGER NOT NULL DEFAULT 10,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "base_amount" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "payslips" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "deduction_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "paid_leave_days" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "period_end" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "period_start" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "salary_structure_id" TEXT,
ADD COLUMN     "scheduled_days" DECIMAL(5,2) NOT NULL DEFAULT 0,
ALTER COLUMN "gross_salary" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "net_salary" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "salary_rules" ALTER COLUMN "amount_fixed" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "salary_structures" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- DropEnum
DROP TYPE "AttendanceCorrectionStatus";

-- CreateTable
CREATE TABLE "working_schedules" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'STANDARD_40H',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "working_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "working_schedule_lines" (
    "id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "break_minutes" INTEGER NOT NULL DEFAULT 60,

    CONSTRAINT "working_schedule_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_allocations" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "leave_type_id" TEXT NOT NULL,
    "allocated_amount" DECIMAL(5,2) NOT NULL,
    "consumed_amount" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "status" "AllocationStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payrun_employees" (
    "id" TEXT NOT NULL,
    "payrun_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payrun_employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_warnings" (
    "id" TEXT NOT NULL,
    "payrun_id" TEXT NOT NULL,
    "payslip_id" TEXT,
    "employee_id" TEXT,
    "code" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" "WarningSeverity" NOT NULL DEFAULT 'WARNING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payroll_warnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_delivery_records" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "payslip_id" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "status" "EmailDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "sent_at" TIMESTAMP(3),
    "failure_reason" TEXT,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_delivery_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "working_schedules_organization_id_idx" ON "working_schedules"("organization_id");

-- CreateIndex
CREATE INDEX "working_schedule_lines_schedule_id_day_of_week_idx" ON "working_schedule_lines"("schedule_id", "day_of_week");

-- CreateIndex
CREATE INDEX "leave_allocations_organization_id_employee_id_leave_type_id_idx" ON "leave_allocations"("organization_id", "employee_id", "leave_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "payrun_employees_payrun_id_employee_id_key" ON "payrun_employees"("payrun_id", "employee_id");

-- CreateIndex
CREATE INDEX "payroll_warnings_payrun_id_severity_idx" ON "payroll_warnings"("payrun_id", "severity");

-- CreateIndex
CREATE INDEX "email_delivery_records_organization_id_status_idx" ON "email_delivery_records"("organization_id", "status");

-- CreateIndex
CREATE INDEX "contracts_start_date_end_date_idx" ON "contracts"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "employees_department_id_idx" ON "employees"("department_id");

-- CreateIndex
CREATE INDEX "leave_requests_start_date_end_date_idx" ON "leave_requests"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "payruns_start_date_end_date_idx" ON "payruns"("start_date", "end_date");

-- CreateIndex
CREATE UNIQUE INDEX "payslips_payrun_id_employee_id_key" ON "payslips"("payrun_id", "employee_id");

-- AddForeignKey
ALTER TABLE "working_schedules" ADD CONSTRAINT "working_schedules_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "working_schedule_lines" ADD CONSTRAINT "working_schedule_lines_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "working_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_working_schedule_id_fkey" FOREIGN KEY ("working_schedule_id") REFERENCES "working_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_working_schedule_id_fkey" FOREIGN KEY ("working_schedule_id") REFERENCES "working_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_allocations" ADD CONSTRAINT "leave_allocations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_allocations" ADD CONSTRAINT "leave_allocations_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_allocations" ADD CONSTRAINT "leave_allocations_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_refused_by_id_fkey" FOREIGN KEY ("refused_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payruns" ADD CONSTRAINT "payruns_salary_structure_id_fkey" FOREIGN KEY ("salary_structure_id") REFERENCES "salary_structures"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrun_employees" ADD CONSTRAINT "payrun_employees_payrun_id_fkey" FOREIGN KEY ("payrun_id") REFERENCES "payruns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrun_employees" ADD CONSTRAINT "payrun_employees_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_warnings" ADD CONSTRAINT "payroll_warnings_payrun_id_fkey" FOREIGN KEY ("payrun_id") REFERENCES "payruns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_warnings" ADD CONSTRAINT "payroll_warnings_payslip_id_fkey" FOREIGN KEY ("payslip_id") REFERENCES "payslips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_warnings" ADD CONSTRAINT "payroll_warnings_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_delivery_records" ADD CONSTRAINT "email_delivery_records_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_delivery_records" ADD CONSTRAINT "email_delivery_records_payslip_id_fkey" FOREIGN KEY ("payslip_id") REFERENCES "payslips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

