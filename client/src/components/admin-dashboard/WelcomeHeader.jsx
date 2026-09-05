import React from 'react';
import { Download, Plus, Calendar } from 'lucide-react';

export function WelcomeHeader({ userName = 'Indhu', onAddEmployee, onDownloadReport }) {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="admin-welcome-card" id="admin-welcome-section">
      <div>
        <h1 className="admin-welcome-title">Good morning, {userName} 👋</h1>
        <p className="admin-welcome-sub">
          Here’s what’s happening across PeoplePay360 Technologies today.
        </p>
      </div>

      <div className="admin-welcome-actions">
        <div className="btn-secondary-clean" style={{ cursor: 'default' }}>
          <Calendar size={15} style={{ color: '#64748b' }} />
          <span>{today}</span>
        </div>

        <button
          type="button"
          className="btn-secondary-clean"
          id="btn-download-report"
          onClick={onDownloadReport}
        >
          <Download size={15} />
          <span>Download Report</span>
        </button>

        <button
          type="button"
          className="btn-primary-black"
          id="btn-admin-add-employee"
          onClick={onAddEmployee}
        >
          <Plus size={16} />
          <span>Add Employee</span>
        </button>
      </div>
    </div>
  );
}
