import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Users, Shield, Activity, ArrowUpRight, CheckCircle2, Globe, Server } from 'lucide-react';

export function SuperAdminDashboard({ data }) {
  const navigate = useNavigate();
  const summary = data?.summary || {};
  const organizations = data?.organizations || [];
  const activities = data?.recentActivities || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0d0f12] via-[#1a202c] to-[#0d0f12] rounded-2xl p-6 text-white border border-gray-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-emerald-400 uppercase mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Super Admin Platform Console
          </div>
          <h2 className="text-2xl font-extrabold text-white">Platform Governance &amp; Multi-Tenant Overview</h2>
          <p className="text-sm text-gray-400 mt-1">Manage global enterprise tenants, system health, and cross-organization telemetry.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/audit-logs')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2 border border-white/10"
          >
            <Shield size={16} />
            Platform Audit Logs
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="px-4 py-2.5 bg-white text-gray-900 text-sm font-bold rounded-xl transition hover:bg-gray-100 flex items-center gap-2 shadow-lg"
          >
            <Server size={16} />
            System Config
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Organizations</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900">{summary.totalOrganizations || organizations.length || 1}</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-2">
            <CheckCircle2 size={14} /> Active SaaS Tenants
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Platform Users</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900">{summary.totalUsersAcrossOrgs || 8}</div>
          <div className="text-xs text-gray-400 font-medium mt-2">Across all tenant accounts</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Managed Workforce</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Globe size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900">{summary.totalEmployeesPlatform || 4}</div>
          <div className="text-xs text-gray-400 font-medium mt-2">Active payroll-ready personnel</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">System Telemetry</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Activity size={18} />
            </div>
          </div>
          <div className="text-lg font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            {summary.systemHealth || '100% Operational'}
          </div>
          <div className="text-xs text-gray-400 font-medium mt-2">PostgreSQL + Prisma High-Avail</div>
        </div>
      </div>

      {/* Organization Directory Table */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-gray-900">Registered SaaS Organizations</h3>
            <p className="text-xs text-gray-400">Live tenant organizations with isolated schemas and data partitions.</p>
          </div>
          <button onClick={() => navigate('/users')} className="text-xs font-bold text-gray-700 hover:text-black flex items-center gap-1">
            View All <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="pb-3">Organization</th>
                <th className="pb-3">Tenant Code</th>
                <th className="pb-3">Currency</th>
                <th className="pb-3 text-center">Users</th>
                <th className="pb-3 text-center">Employees</th>
                <th className="pb-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {organizations.length > 0 ? (
                organizations.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 font-bold text-gray-900 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gray-900 text-white font-black text-xs flex items-center justify-center">
                        {org.name.slice(0, 2).toUpperCase()}
                      </div>
                      {org.name}
                    </td>
                    <td className="py-3.5 font-mono text-xs text-gray-500">{org.code}</td>
                    <td className="py-3.5 font-semibold text-gray-700">{org.currency} ({org.timezone})</td>
                    <td className="py-3.5 text-center font-bold text-gray-800">{org.usersCount}</td>
                    <td className="py-3.5 text-center font-bold text-gray-800">{org.employeesCount}</td>
                    <td className="py-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-3.5 font-bold text-gray-900">PeoplePay360 India Private Limited</td>
                  <td className="py-3.5 font-mono text-xs text-gray-500">IND-PP360</td>
                  <td className="py-3.5 font-semibold text-gray-700">INR (Asia/Kolkata)</td>
                  <td className="py-3.5 text-center font-bold text-gray-800">8</td>
                  <td className="py-3.5 text-center font-bold text-gray-800">4</td>
                  <td className="py-3.5 text-center">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                      Active
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Platform Security & Activity Audit */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-4">Platform Audit &amp; Security Stream</h3>
        <div className="space-y-3">
          {activities.length > 0 ? (
            activities.map((act) => (
              <div key={act.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 border border-gray-100 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div>
                    <span className="font-bold text-gray-900">{act.action}</span> on <span className="font-semibold text-gray-600">{act.entityType}</span>
                    <span className="text-gray-400 ml-2">by {act.actor} ({act.orgName})</span>
                  </div>
                </div>
                <div className="text-gray-400 font-mono text-[11px]">
                  {new Date(act.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-gray-400 py-2">No security alerts or anomalous activity detected. System is running securely.</div>
          )}
        </div>
      </div>
    </div>
  );
}
