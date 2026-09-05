import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Users, FileText, CalendarDays, DollarSign, TrendingUp, UserCheck } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/dashboard/overview');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return <div style={{ padding: '20px' }}>Loading organization metrics...</div>;
  }

  const chartData = data?.departmentHeadcounts?.map((d) => ({
    name: d.code,
    headcount: d.employeeCount,
    fullName: d.name,
  })) || [];

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Executive Dashboard
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Real-time workforce, contract statuses, and payroll distributions.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Active Employees</span>
            <div className="stat-icon-box" style={{ background: 'var(--info-bg)', color: 'var(--info-accent)' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="stat-value">{data?.activeEmployees || 0}</div>
          <div className="stat-subtext">Verified payroll profiles</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Active Contracts</span>
            <div className="stat-icon-box" style={{ background: 'var(--success-bg)', color: 'var(--success-accent)' }}>
              <FileText size={20} />
            </div>
          </div>
          <div className="stat-value">{data?.activeContracts || 0}</div>
          <div className="stat-subtext">Active compensation agreements</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Pending Time-Off</span>
            <div className="stat-icon-box" style={{ background: 'var(--warning-bg)', color: 'var(--warning-accent)' }}>
              <CalendarDays size={20} />
            </div>
          </div>
          <div className="stat-value">{data?.pendingLeaves || 0}</div>
          <div className="stat-subtext">Requests requiring review</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">All-Time Net Paid</span>
            <div className="stat-icon-box" style={{ background: 'var(--info-bg)', color: 'var(--info-accent)' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="stat-value">₹{(data?.allTimePaidNet || 0).toLocaleString()}</div>
          <div className="stat-subtext">Total disbursed earnings</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Department Headcounts</div>
          </div>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  formatter={(val, name, item) => [`${val} staff`, item.payload.fullName]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="headcount" fill="#0f172a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Latest Payroll Batch</div>
          </div>
          {data?.latestPayrun ? (
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                {data.latestPayrun.name}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <span className={`badge badge-${data.latestPayrun.status === 'PAID' ? 'success' : 'info'}`}>
                  {data.latestPayrun.status}
                </span>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  {new Date(data.latestPayrun.startDate).toLocaleDateString()} - {new Date(data.latestPayrun.endDate).toLocaleDateString()}
                </span>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13.5px' }}>
                  <span style={{ color: '#64748b' }}>Gross Disbursed:</span>
                  <strong>₹{data.latestPayrun.totalGross.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 700, color: '#10b981' }}>
                  <span>Net Disbursed:</span>
                  <span>₹{data.latestPayrun.totalNet.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: '#64748b', fontSize: '13.5px', padding: '40px 0', textAlign: 'center' }}>
              No payroll batches computed yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
