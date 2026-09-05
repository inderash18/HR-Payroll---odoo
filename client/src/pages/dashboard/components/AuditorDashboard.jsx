import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  FileText,
  Lock,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Eye,
  Key,
} from 'lucide-react';

export function AuditorDashboard({ data }) {
  const navigate = useNavigate();
  const summary = data?.summary || {};
  const recentLogs = data?.recentLogs || [];
  const securityEvents = data?.securityEvents || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-slate-900 to-black rounded-2xl p-6 text-white border border-gray-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-amber-400 uppercase mb-1">
            <Lock size={14} /> Strict Read-Only Compliance Portal
          </div>
          <h2 className="text-2xl font-black text-white">System Audit &amp; Regulatory Compliance</h2>
          <p className="text-xs text-gray-300 mt-1">
            Immutable audit logs, security event traces, payroll change tracking, and data export verification.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/audit-logs')}
            className="px-4 py-2.5 bg-white text-gray-900 text-xs font-bold rounded-xl transition hover:bg-gray-100 flex items-center gap-2 shadow-sm"
          >
            <Download size={16} />
            Export Compliance Trail
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Audit Logs</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900">{summary.totalAuditLogs || recentLogs.length || 0}</div>
          <div className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
            <CheckCircle2 size={13} /> Immutable log storage
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Security Events</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Shield size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-indigo-600">{summary.securityEventsCount || securityEvents.length || 0}</div>
          <div className="text-xs text-gray-400 font-medium mt-2">Authentication &amp; role checks</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Payroll Modifications</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Key size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-600">{summary.payrollModificationsCount || 0}</div>
          <div className="text-xs text-gray-400 font-medium mt-2">Wage &amp; structure updates</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Compliance State</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-600 mt-1">100% Compliant</div>
          <div className="text-xs text-gray-400 font-medium mt-2">No integrity violations</div>
        </div>
      </div>

      {/* Main Grid: Audit Trail Table */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-gray-900">Live System Audit Trail</h3>
            <p className="text-xs text-gray-400">Chronological ledger of user, data, and security actions.</p>
          </div>
          <button onClick={() => navigate('/audit-logs')} className="text-xs font-bold text-gray-700 hover:text-black flex items-center gap-1">
            Full Audit Ledger <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="pb-3">Action</th>
                <th className="pb-3">Entity Type</th>
                <th className="pb-3">Actor</th>
                <th className="pb-3">IP Address</th>
                <th className="pb-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentLogs.length > 0 ? (
                recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3 font-bold text-gray-900 text-xs">{log.action}</td>
                    <td className="py-3 font-mono text-xs text-gray-600">{log.entityType}</td>
                    <td className="py-3 text-xs text-gray-800">{log.actor}</td>
                    <td className="py-3 font-mono text-xs text-gray-400">{log.ipAddress}</td>
                    <td className="py-3 text-right font-mono text-xs text-gray-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-xs text-gray-400">
                    No audit records registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
