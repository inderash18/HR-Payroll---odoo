import React, { useState } from 'react';
import { Users, UserPlus, UserMinus } from 'lucide-react';

export function WorkforceChart({ trendData }) {
  const [activeTab, setActiveTab] = useState('monthly');

  if (!trendData) return null;

  const dataset = trendData[activeTab] || trendData.monthly;
  const metrics = trendData.metrics || {};

  // Calculate bar height percentages relative to max in dataset
  const maxVal = Math.max(...dataset.map((d) => d.count), 250);

  return (
    <div className="admin-card-white" id="admin-workforce-overview-card">
      <div className="admin-card-header">
        <div>
          <h2 className="admin-card-title">Workforce Overview</h2>
          <p className="admin-card-sub">Headcount growth and monthly retention trends</p>
        </div>

        <div className="tabs-pill-group">
          <button
            type="button"
            className={`tab-pill-btn ${activeTab === 'weekly' ? 'active' : ''}`}
            onClick={() => setActiveTab('weekly')}
          >
            Weekly
          </button>
          <button
            type="button"
            className={`tab-pill-btn ${activeTab === 'monthly' ? 'active' : ''}`}
            onClick={() => setActiveTab('monthly')}
          >
            Monthly
          </button>
          <button
            type="button"
            className={`tab-pill-btn ${activeTab === 'quarterly' ? 'active' : ''}`}
            onClick={() => setActiveTab('quarterly')}
          >
            Quarterly
          </button>
        </div>
      </div>

      {/* Chart visualization */}
      <div className="workforce-chart-bars">
        {dataset.map((item, idx) => {
          const heightPct = Math.round((item.count / maxVal) * 100);
          return (
            <div key={idx} className="chart-col" title={`${item.label}: ${item.count} employees (+${item.hires} hires, -${item.exits} exits)`}>
              <div
                className="chart-bar-wrap"
                style={{
                  height: `${heightPct}%`,
                  background: idx === dataset.length - 1 ? '#0f172a' : '#94a3b8',
                }}
              />
              <span className="chart-bar-label">{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* Footer Metrics */}
      <div className="chart-footer-metrics">
        <div className="chart-metric-item">
          <div className="chart-metric-val" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Users size={16} style={{ color: '#0f172a' }} />
<<<<<<< HEAD
            {metrics.totalWorkforce || (dataset.length > 0 ? dataset[dataset.length - 1].count : 0)}
=======
            {metrics.totalWorkforce || 0}
>>>>>>> 426b5f8 (Update dashboard and roles middleware)
          </div>
          <span className="chart-metric-lbl">Total Workforce</span>
        </div>

        <div className="chart-metric-item">
          <div className="chart-metric-val" style={{ color: '#047857', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <UserPlus size={16} />
            +{metrics.newHiresMonth || 0}
          </div>
          <span className="chart-metric-lbl">New Hires this Month</span>
        </div>

        <div className="chart-metric-item">
          <div className="chart-metric-val" style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <UserMinus size={16} />
            {metrics.departuresMonth || 0}
          </div>
          <span className="chart-metric-lbl">Departures this Month</span>
        </div>
      </div>
    </div>
  );
}
