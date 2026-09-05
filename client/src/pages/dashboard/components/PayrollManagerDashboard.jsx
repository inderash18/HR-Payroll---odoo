import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Landmark,
  Play,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  TrendingDown,
  Layers,
} from 'lucide-react';

export function PayrollManagerDashboard({ data }) {
  const navigate = useNavigate();
  const summary = data?.summary || {};
  const payrollHistory = data?.payrollHistory || [];
  const recentPayslips = data?.recentPayslips || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Payroll &amp; Compensation Hub
          </div>
          <h2 className="text-2xl font-black text-gray-900">Payroll Processing Engine</h2>
          <p className="text-xs text-gray-400 mt-0.5">Calculate earnings, deductions, generate payslips, and dispatch bank payment files.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/payroll')}
            className="px-4 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm"
          >
            <Play size={16} />
            New Payrun Batch
          </button>
          <button
            onClick={() => navigate('/payslips')}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition flex items-center gap-2"
          >
            <FileText size={16} />
            Payslips Management
          </button>
          <button
            onClick={() => navigate('/contracts')}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition flex items-center gap-2"
          >
            <Layers size={16} />
            Salary Structures
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Payroll Cycle Status</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Landmark size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">{summary.payrollCycleStatus || 'READY_TO_RUN'}</div>
          <div className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
            <CheckCircle2 size={13} /> {summary.employeesReadyForPayroll || 4} Contracts Ready
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Gross Salary</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">
            ₹{Number(summary.grossSalaryAmount || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-gray-400 font-medium mt-2">Current cycle gross computation</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Net Payable</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Landmark size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600">
            ₹{Number(summary.netPayrollPayable || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-gray-400 font-medium mt-2">After statutory deductions</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Missing Bank/Tax Data</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">{summary.missingBankInfoCount || 0}</div>
          <div className="text-xs text-amber-600 font-semibold mt-2">
            {summary.missingBankInfoCount > 0 ? 'Requires employee action' : 'All accounts verified'}
          </div>
        </div>
      </div>

      {/* Main Grid: Payrun History & Recent Payslips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payrun Batches */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-gray-900">Payroll Payrun Batches</h3>
              <p className="text-xs text-gray-400">Recent compensation calculation batches.</p>
            </div>
            <button onClick={() => navigate('/payroll')} className="text-xs font-bold text-gray-700 hover:text-black flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {payrollHistory.length > 0 ? (
              payrollHistory.map((run) => (
                <div key={run.id} className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{run.name}</div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">
                      {new Date(run.startDate).toLocaleDateString()} – {new Date(run.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">
                      ₹{Number(run.totalNet || 0).toLocaleString('en-IN')}
                    </div>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      {run.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-gray-400">
                No payruns calculated yet. Click "New Payrun Batch" to process payroll.
              </div>
            )}
          </div>
        </div>

        {/* Recent Payslips */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Generated Payslips</h3>
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
                    <div className="text-gray-400 font-mono text-[10px]">{ps.employeeNum}</div>
                  </div>
                  <div className="text-right font-bold text-gray-900">
                    ₹{Number(ps.netSalary).toLocaleString('en-IN')}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400 py-4 text-center">No payslips generated yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
