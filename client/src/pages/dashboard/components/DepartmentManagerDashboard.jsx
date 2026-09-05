import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  CalendarDays,
  CheckSquare,
  XSquare,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';
import { api } from '../../../api/client';

export function DepartmentManagerDashboard({ data, onRefresh }) {
  const navigate = useNavigate();
  const summary = data?.summary || {};
  const teamMembers = data?.teamMembersList || [];
  const pendingApprovals = data?.pendingApprovals || [];
  const departmentName = data?.departmentName || 'My Team';

  const handleApproveLeave = async (leaveId) => {
    try {
      await api.post(`/leaves/requests/${leaveId}/approve`);
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error('Failed to approve leave:', e);
    }
  };

  const handleRejectLeave = async (leaveId) => {
    try {
      await api.post(`/leaves/requests/${leaveId}/reject`);
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error('Failed to reject leave:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Department Team Portal
          </div>
          <h2 className="text-2xl font-black text-gray-900">{departmentName} — Team Management</h2>
          <p className="text-xs text-gray-400 mt-0.5">Manage daily roster attendance and review team member leave requests.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/leaves')}
            className="px-4 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm"
          >
            <CheckSquare size={16} />
            Approve Team Leaves
          </button>
          <button
            onClick={() => navigate('/attendance')}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition flex items-center gap-2"
          >
            <Clock size={16} />
            Team Attendance
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Team Size</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900">{summary.teamSize || teamMembers.length || 2}</div>
          <div className="text-xs text-gray-400 font-medium mt-2">Assigned department members</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Present Today</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600">{summary.presentToday || 0}</div>
          <div className="text-xs text-gray-400 font-medium mt-2">{summary.teamAttendanceRate || 100}% attendance rate</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">On Leave Today</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarDays size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900">{summary.onLeaveToday || 0}</div>
          <div className="text-xs text-gray-400 font-medium mt-2">Approved time off</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Pending Approvals</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckSquare size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900">{summary.pendingLeaveApprovals || pendingApprovals.length || 0}</div>
          <div className="text-xs text-amber-600 font-semibold mt-2 flex items-center gap-1">
            <AlertCircle size={13} /> Requires your decision
          </div>
        </div>
      </div>

      {/* Main Grid: Team Members & Leave Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members List */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-gray-900">Department Team Members</h3>
              <p className="text-xs text-gray-400">Direct reports in {departmentName}.</p>
            </div>
            <button onClick={() => navigate('/employees')} className="text-xs font-bold text-gray-700 hover:text-black flex items-center gap-1">
              View Team <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {teamMembers.length > 0 ? (
              teamMembers.map((emp) => (
                <div key={emp.id} className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-black text-white font-bold text-xs flex items-center justify-center">
                      {emp.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{emp.name}</div>
                      <div className="text-xs text-gray-400">{emp.title} • {emp.email}</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                    Active
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-gray-400">
                No direct team members assigned to your department.
              </div>
            )}
          </div>
        </div>

        {/* Leave Requests Queue */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-4">Pending Leave Requests</h3>
          <div className="space-y-3">
            {pendingApprovals.length > 0 ? (
              pendingApprovals.map((l) => (
                <div key={l.id} className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-100 text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="font-bold text-gray-900">{l.employeeName}</div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      {l.leaveType}
                    </span>
                  </div>
                  <div className="text-gray-500 text-[11px]">
                    {new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()} ({l.durationDays} days)
                  </div>
                  {l.reason && <div className="text-gray-600 italic text-[11px]">"{l.reason}"</div>}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleApproveLeave(l.id)}
                      className="flex-1 py-1.5 bg-black hover:bg-gray-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 size={13} /> Approve
                    </button>
                    <button
                      onClick={() => handleRejectLeave(l.id)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-xs"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400 py-6 text-center">No pending leave approvals.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
