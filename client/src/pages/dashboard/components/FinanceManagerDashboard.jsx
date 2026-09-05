import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  CheckCircle,
  Clock,
  PieChart,
  Download,
  Building,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export function FinanceManagerDashboard({ data }) {
  const navigate = useNavigate();
  const summary = data?.summary || {};
  const costBreakdown = data?.departmentCostBreakdown || [];
  const recentPayslips = data?.recentPaidPayslips || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Finance &amp; Compensation Audit
          </div>
          <h2 className="text-2xl font-black text-gray-900">Financial Payroll Approvals &amp; Cost Analysis</h2>
          <p className="text-xs text-gray-400 mt-0.5">Approve payroll runs, review cost centers, and reconcile tax and statutory deductions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/payroll')}
            className="px-4 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm"
          >
            <CheckCircle size={16} />
            Review &amp; Approve Payruns
          </button>
          <button
            onClick={() => navigate('/audit')}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition flex items-center gap-2"
          >
            <Download size={16} />
            Export Financials
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Payroll Expense</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">
            ₹{Number(summary.totalPayrollExpense || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-gray-400 font-medium mt-2">Approved monthly gross</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Net Disbursement</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            ₹{Number(summary.totalNetPayable || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-gray-400 font-medium mt-2">Net bank transfer payable</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Tax &amp; Deductions</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <PieChart size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">
            ₹{Number(summary.totalTaxAndDeductions || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-gray-400 font-medium mt-2">PF, PT, TDS statutory withholding</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Approval Queue</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">{summary.pendingApprovalsCount || 0}</div>
          <div className="text-xs text-amber-600 font-semibold mt-2">
            {summary.pendingApprovalsCount > 0 ? 'Payrun batches waiting for sign-off' : 'All payruns validated'}
          </div>
        </div>
      </div>

      {/* Main Grid: Cost Center Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost Center Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-gray-900">Department Cost Breakdown</h3>
              <p className="text-xs text-gray-400">Monthly compensation expense by department / cost center.</p>
            </div>
            <button onClick={() => navigate('/departments')} className="text-xs font-bold text-gray-700 hover:text-black flex items-center gap-1">
              Cost Centers <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="space-y-4">
            {costBreakdown.map((dept) => (
              <div key={dept.departmentId || dept.departmentName} className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-black text-white font-bold text-xs flex items-center justify-center">
                    <Building size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{dept.departmentName}</div>
                    <div className="text-xs text-gray-400">{dept.employeeCount} active headcount</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">
                    ₹{Number(dept.estimatedMonthlyCost || 68000).toLocaleString('en-IN')} / mo
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">Monthly allocation</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Paid Payslips Log */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Reconciled Payslips</h3>
            <button onClick={() => navigate('/payslips')} className="text-xs font-bold text-gray-500 hover:text-black">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {recentPayslips.length > 0 ? (
              recentPayslips.map((ps) => (
                <div key={ps.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900">{ps.employeeName}</div>
                    <div className="text-gray-400 text-[10px]">{ps.department}</div>
                  </div>
                  <div className="text-right font-bold text-emerald-600">
                    ₹{Number(ps.netSalary).toLocaleString('en-IN')}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400 py-4 text-center">No paid records found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
