import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ChevronRight } from 'lucide-react';

export function AttentionNeeded({ alerts = [] }) {
  const navigate = useNavigate();

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'priority-tag priority-high';
      case 'Medium':
        return 'priority-tag priority-medium';
      case 'Low':
        return 'priority-tag priority-low';
      default:
        return 'priority-tag priority-medium';
    }
  };

  return (
    <div className="admin-card-white" id="admin-attention-needed-card">
      <div className="admin-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <AlertCircle size={18} style={{ color: '#b45309' }} />
          <div>
            <h2 className="admin-card-title" style={{ color: '#0f172a' }}>Attention Needed</h2>
            <p className="admin-card-sub">Compliance alerts and operational exceptions</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {alerts.map((item) => (
          <div
            key={item.id}
            className="alert-card-row"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(item.link || '/dashboard')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span className={getPriorityClass(item.priority)}>{item.priority}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>
                {item.text}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.74rem', fontWeight: 700 }}>
              <span>{item.actionText}</span>
              <ChevronRight size={13} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
