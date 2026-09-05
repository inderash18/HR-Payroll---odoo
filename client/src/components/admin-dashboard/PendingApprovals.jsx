import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, UserCheck, Landmark, DollarSign, ChevronRight } from 'lucide-react';

export function PendingApprovals({ approvals = [], onViewItem }) {
  const navigate = useNavigate();

  const getIcon = (type) => {
    switch (type) {
      case 'leave':
        return <CalendarDays size={16} />;
      case 'profile':
        return <UserCheck size={16} />;
      case 'payroll':
        return <Landmark size={16} />;
      case 'reimbursement':
        return <DollarSign size={16} />;
      default:
        return <CalendarDays size={16} />;
    }
  };

  const handleActionClick = (item) => {
    if (onViewItem) {
      onViewItem(item);
    } else {
      if (item.type === 'leave') navigate('/leaves');
      else if (item.type === 'payroll') navigate('/payroll');
      else if (item.type === 'profile') navigate('/employees');
      else navigate('/dashboard');
    }
  };

  return (
    <div className="admin-card-white" id="admin-pending-approvals-card">
      <div className="admin-card-header">
        <div>
          <h2 className="admin-card-title">Pending Approvals</h2>
          <p className="admin-card-sub">Items awaiting administrative and compliance sign-off</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {approvals.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1rem',
              background: '#f8fafc',
              borderRadius: '0.85rem',
              border: '1px solid #f1f5f9',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '0.65rem',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  color: '#0f172a',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                {getIcon(item.type)}
              </div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block' }}>
                  {item.title}
                </strong>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  {item.subtitle}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  background: '#fffbeb',
                  color: '#b45309',
                  border: '1px solid #fde68a',
                }}
              >
                {item.badge}
              </span>

              <button
                type="button"
                className="btn-secondary-clean"
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.74rem' }}
                onClick={() => handleActionClick(item)}
              >
                <span>View</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
