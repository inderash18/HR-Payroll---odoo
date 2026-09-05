import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  CalendarDays,
  Clock,
  CheckSquare,
  Gift,
  Award,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { AddEmployeeModal } from '../../../components/modals/AddEmployeeModal';

export function HRManagerDashboard({ data, onRefresh }) {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const summary = data?.summary || {};
  const newJoiners = data?.newJoinersList || [];
  const upcomingEvents = data?.upcomingEvents || [];
  const charts = data?.charts || {};

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            HR &amp; People Operations
          </div>
          <h2 className="text-2xl font-black text-gray-900">Talent &amp; Workforce Lifecycle</h2>
          <p className="text-xs text-gray-400 mt-0.5">Manage employee onboarding, daily attendance, leave approvals, and talent compliance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm"
          >
            <UserPlus size={16} />
            Onboard Employee
          </button>
          <button
            onClick={() => navigate('/leaves')}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition flex items-center gap-2"
          >
            <CheckSquare size={16} />
            Leave Approvals
          </button>
          <button
            onClick={() => navigate('/audit')}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition flex items-center gap-2"
          >
            <FileText size={16} />
            HR Reports
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Headcount</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900">{summary.employeeCount || 4}</div>
          <div className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
            <CheckCircle2 size={13} /> {summary.activeEmployees || 4} Active Employees
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">New Joiners (30d)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserPlus size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600">{summary.newJoiners || 1}</div>
          <div className="text-xs text-gray-400 font-medium mt-2">Recently inducted talent</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Pending Leave Requests</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CalendarDays size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900">{summary.pendingLeaveRequests || 0}</div>
          <div className="text-xs text-amber-600 font-semibold mt-2 flex items-center gap-1">
            <AlertCircle size={13} /> Awaiting HR sign-off
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Attendance Rate</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-600">{summary.attendanceRate || 100}%</div>
          <div className="text-xs text-gray-400 font-medium mt-2">{summary.employeesOnLeaveToday || 0} on approved leave today</div>
        </div>
      </div>

      {/* Main Grid: Onboarding Pipeline & Celebrations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New Joiners / Recent Onboarding */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-gray-900">Recent Employee Onboarding</h3>
              <p className="text-xs text-gray-400">Employees added to the workforce lifecycle.</p>
            </div>
            <button onClick={() => navigate('/employees')} className="text-xs font-bold text-gray-700 hover:text-black flex items-center gap-1">
              Workforce Directory <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="pb-3">Employee</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Job Title</th>
                  <th className="pb-3 text-right">Joining Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {newJoiners.length > 0 ? (
                  newJoiners.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-3.5 font-bold text-gray-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gray-900 text-white font-bold text-xs flex items-center justify-center">
                          {emp.name.slice(0, 2).toUpperCase()}
                        </div>
                        {emp.name}
                      </td>
                      <td className="py-3.5 text-xs text-gray-600 font-semibold">{emp.department}</td>
                      <td className="py-3.5 text-xs text-gray-600">{emp.jobTitle}</td>
                      <td className="py-3.5 text-right font-mono text-xs text-gray-500">
                        {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : 'Active'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-xs text-gray-400">
                      No new joiners in the last 30 days.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Milestones & Celebrations */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Gift size={18} className="text-amber-500" />
            <h3 className="text-base font-bold text-gray-900">Upcoming Milestones</h3>
          </div>
          <div className="space-y-3">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((evt) => (
                <div key={evt.id} className="p-3 rounded-xl bg-amber-50/60 border border-amber-100/60 text-xs">
                  <div className="font-bold text-gray-900">{evt.name}</div>
                  <div className="text-amber-700 font-medium mt-0.5">{evt.type}</div>
                  <div className="text-gray-400 font-mono text-[10px] mt-1">
                    {evt.date ? new Date(evt.date).toLocaleDateString() : 'Upcoming'}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-400 text-center">
                No birthdays or anniversaries scheduled this week.
              </div>
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
