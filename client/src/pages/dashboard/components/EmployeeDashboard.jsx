import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Clock,
  CalendarDays,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  ArrowUpRight,
  Sparkles,
  LogOut as LogOutIcon,
  LogIn as LogInIcon,
} from 'lucide-react';
import { api } from '../../../api/client';

export function EmployeeDashboard({ data, onRefresh }) {
  const navigate = useNavigate();
  const [isClocking, setIsClocking] = useState(false);
  const profile = data?.profileSummary || {};
  const attendance = data?.todayAttendance || {};
  const leave = data?.leaveSummary || {};
  const payslip = data?.latestPayslip;
  const holidays = data?.upcomingHolidays || [];

  const handleClockIn = async () => {
    setIsClocking(true);
    try {
      await api.post('/attendance/clock-in', {});
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error('Clock in failed:', e);
    } finally {
      setIsClocking(false);
    }
  };

  const handleClockOut = async () => {
    setIsClocking(true);
    try {
      await api.post('/attendance/clock-out', {});
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error('Clock out failed:', e);
    } finally {
      setIsClocking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black rounded-2xl p-6 text-white border border-gray-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-emerald-400 uppercase mb-1">
            <Sparkles size={14} /> Employee Self-Service Portal
          </div>
          <h2 className="text-2xl font-black text-white">Welcome back, {profile.name || 'Team Member'}!</h2>
          <p className="text-xs text-gray-300 mt-1">
            {profile.jobTitle} • {profile.department} • ID: <span className="font-mono">{profile.employeeNum}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 border border-white/10"
          >
            <User size={16} />
            My Profile
          </button>
          <button
            onClick={() => navigate('/leaves')}
            className="px-4 py-2.5 bg-white text-gray-900 text-xs font-bold rounded-xl transition hover:bg-gray-100 flex items-center gap-2 shadow-sm"
          >
            <CalendarDays size={16} />
            Apply Leave
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Live Attendance / Clock Control */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Today's Attendance</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock size={18} />
              </div>
            </div>
            <div className="text-xl font-black text-gray-900">
              {attendance.isCheckedIn ? 'Clocked In' : 'Not Clocked In'}
            </div>
            <div className="text-xs text-gray-400 font-medium mt-1">
              {attendance.checkInTime
                ? `In at ${new Date(attendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Ready to start your work day'}
            </div>
          </div>
          <div className="mt-4">
            {attendance.isCheckedIn ? (
              <button
                onClick={handleClockOut}
                disabled={isClocking}
                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <LogOutIcon size={14} /> Clock Out
              </button>
            ) : (
              <button
                onClick={handleClockIn}
                disabled={isClocking}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <LogInIcon size={14} /> Clock In Now
              </button>
            )}
          </div>
        </div>

        {/* Leave Balance */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Leave Balance</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarDays size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900">{leave.totalAllocatedDays || 24} Days</div>
          <div className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
            <CheckCircle2 size={13} /> {leave.pendingRequestsCount || 0} Pending Approvals
          </div>
        </div>

        {/* Latest Payslip */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Latest Payslip</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600">
            {payslip ? `₹${Number(payslip.netSalary).toLocaleString('en-IN')}` : '₹68,000'}
          </div>
          <div className="text-xs text-gray-400 font-medium mt-2">
            <button onClick={() => navigate('/payslips')} className="text-black font-bold hover:underline flex items-center gap-1">
              Download Payslip <Download size={12} />
            </button>
          </div>
        </div>

        {/* Profile Completion */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Profile Status</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <User size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900">{profile.profileCompletion || '100%'}</div>
          <div className="text-xs text-gray-400 font-medium mt-2">Bank &amp; statutory verified</div>
        </div>
      </div>

      {/* Main Grid: My Leaves & Upcoming Holidays */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leave Requests */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-gray-900">My Leave Applications</h3>
              <p className="text-xs text-gray-400">Your recent time-off requests and approval status.</p>
            </div>
            <button onClick={() => navigate('/leaves')} className="text-xs font-bold text-gray-700 hover:text-black flex items-center gap-1">
              Request Time Off <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {(leave.recentLeaves || []).length > 0 ? (
              leave.recentLeaves.map((l) => (
                <div key={l.id} className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-gray-900">{l.type}</div>
                    <div className="text-gray-400 mt-0.5">
                      {new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                    l.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' : 'bg-amber-50 text-amber-700 border border-amber-200/50'
                  }`}>
                    {l.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-gray-400">
                No leave requests submitted yet.
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Holidays */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-4">Upcoming Public Holidays</h3>
          <div className="space-y-3">
            {holidays.map((h, i) => (
              <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs flex items-center justify-between">
                <div className="font-bold text-gray-900">{h.name}</div>
                <div className="font-mono text-gray-500">{h.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
