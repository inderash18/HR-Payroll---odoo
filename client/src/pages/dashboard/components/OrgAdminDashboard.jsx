import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building,
  Clock,
  CalendarDays,
  Plus,
  ArrowUpRight,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { AddEmployeeModal } from '../../../components/modals/AddEmployeeModal';

export function OrgAdminDashboard({ data, onRefresh }) {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const summary = data?.summary || {};
  const charts = data?.charts || {};
  const activities = data?.recentActivities || [];

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Organization Admin Dashboard
          </div>
          <h2 className="text-2xl font-black text-gray-900">Company Overview &amp; Workforce Control</h2>
          <p className="text-xs text-gray-400 mt-0.5">Real-time attendance, departments, active contracts, and payroll status.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} />
            Add Employee
          </button>
          <button
            onClick={() => navigate('/departments')}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition flex items-center gap-2"
          >
            <Building size={16} />
            Departments
          </button>
          <button
            onClick={() => navigate('/payroll')}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition flex items-center gap-2"
          >
            <Landmark size={16} />
            Payroll
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Workforce</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900">{summary.totalEmployees || 4}</div>
          <div className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
            <CheckCircle2 size={13} /> {summary.activeEmployees || 4} Active on Payroll
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Departments</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900">{summary.departmentsCount || 3}</div>
          <div className="text-xs text-gray-400 font-medium mt-2">Active business units</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Attendance Rate</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600">{summary.attendanceRate || 100}%</div>
          <div className="text-xs text-gray-400 font-medium mt-2">{summary.presentToday || 0} clocked in today</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Pending Leaves</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CalendarDays size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900">{summary.pendingLeaveApprovals || 0}</div>
          <div className="text-xs text-amber-600 font-semibold mt-2 flex items-center gap-1">
            <AlertCircle size={13} /> Action required
          </div>
        </div>
      </div>

      {/* Main Content Grid: Department Headcounts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-gray-900">Department Distribution</h3>
              <p className="text-xs text-gray-400">Headcount distribution across company departments.</p>
            </div>
            <button onClick={() => navigate('/departments')} className="text-xs font-bold text-gray-700 hover:text-black flex items-center gap-1">
              Manage <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="space-y-4">
            {(charts.departmentHeadcounts || []).map((dept) => (
              <div key={dept.id || dept.name} className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-black text-white font-bold text-xs flex items-center justify-center">
                    {dept.code || dept.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{dept.name}</div>
                    <div className="text-xs text-gray-400 font-mono">Code: {dept.code || 'DEPT'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-white border border-gray-200 text-xs font-bold text-gray-800 rounded-full">
                    {dept.employeeCount || 1} Employees
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Activities */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-gray-900">Audit Trail</h3>
            <button onClick={() => navigate('/audit-logs')} className="text-xs font-bold text-gray-500 hover:text-black">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {activities.length > 0 ? (
              activities.slice(0, 5).map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-gray-50/60 border border-gray-100 text-xs">
                  <div className="font-bold text-gray-900">{log.action}</div>
                  <div className="text-gray-400 mt-0.5 flex justify-between items-center">
                    <span>{log.actor}</span>
                    <span className="font-mono text-[10px]">{new Date(log.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400 py-4 text-center">No recent activity logs.</div>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddEmployeeModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </div>
  );
}
