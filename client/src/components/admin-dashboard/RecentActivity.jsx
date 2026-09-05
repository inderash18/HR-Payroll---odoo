import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Landmark, CheckSquare, Clock, UserCheck, ArrowUpRight } from 'lucide-react';

export function RecentActivity({ activities = [] }) {
  const navigate = useNavigate();

  const getIcon = (category) => {
    switch (category) {
      case 'employee':
        return <UserPlus size={14} />;
      case 'payroll':
        return <Landmark size={14} />;
      case 'leave':
        return <CheckSquare size={14} />;
      case 'schedule':
        return <Clock size={14} />;
      case 'onboarding':
        return <UserCheck size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  return (
    <div className="admin-card-white" id="admin-recent-activity-card">
      <div className="admin-card-header">
        <div>
          <h2 className="admin-card-title">Recent Activity</h2>
          <p className="admin-card-sub">Chronological audit stream of organization events</p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/audit-logs')}
          className="btn-secondary-clean"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.74rem' }}
        >
          <span>Audit Trail</span>
          <ArrowUpRight size={13} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {activities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No recent audit activity logged in the database yet.
          </div>
        ) : (
          activities.map((act) => {
            const desc = act.description || `${act.actor || 'User'} performed ${act.action || 'activity'} on ${act.entityType || 'record'}`;
            const time = act.timestamp || (act.createdAt ? new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently');
            const cat = act.category || (act.entityType?.toLowerCase()) || 'schedule';

            return (
              <div key={act.id} className="activity-item-row">
                <div className="activity-icon-bubble">
                  {getIcon(cat)}
                </div>
                <div>
                  <div className="activity-desc">{desc}</div>
                  <div className="activity-time">{time}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
