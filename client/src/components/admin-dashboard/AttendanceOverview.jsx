import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export function AttendanceOverview({ attendanceData }) {
  const navigate = useNavigate();

  if (!attendanceData) return null;

  const {
    present = 0,
    onLeave = 0,
    absent = 0,
    lateCheckIn = 0,
    late = 0,
    attendanceRate: propRate,
  } = attendanceData;

  const lateCount = lateCheckIn || late || 0;
  const total = present + onLeave + absent + lateCount;
  const calculatedRate = total > 0 ? Math.round(((present + lateCount) / total) * 100) : 100;
  const rate = propRate !== undefined ? Math.round(Number(propRate)) : calculatedRate;

  // Dynamic status text and indicator color based on rate
  let statusText = '● Operational';
  let statusColor = 'var(--success)';
  if (rate < 75) {
    statusText = '● Attention Needed';
    statusColor = 'var(--danger)';
  } else if (rate < 90) {
    statusText = '● Moderate';
    statusColor = 'var(--warning)';
  }

  const strokeColor = rate < 75 ? 'var(--danger)' : rate < 90 ? 'var(--warning)' : 'var(--primary)';

  return (
    <div className="admin-card-white" id="admin-attendance-overview-card">
      <div className="admin-card-header">
        <div>
          <h2 className="admin-card-title">Today's Attendance</h2>
          <p className="admin-card-sub">Daily check-in and roster compliance</p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/attendance')}
          className="btn-secondary-clean"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.74rem' }}
        >
          <span>Details</span>
          <ArrowUpRight size={13} />
        </button>
      </div>

      {/* Donut / Radial Visualization */}
      <div className="attendance-visual-box">
        <div style={{ position: 'relative', width: '130px', height: '130px', display: 'grid', placeItems: 'center' }}>
          <svg width="130" height="130" viewBox="0 0 130 130">
            <circle
              cx="65"
              cy="65"
              r="52"
              fill="none"
              stroke="var(--surface-soft)"
              strokeWidth="12"
            />
            <circle
              cx="65"
              cy="65"
              r="52"
              fill="none"
              stroke={strokeColor}
              strokeWidth="12"
              strokeDasharray="326.7"
              strokeDashoffset={326.7 * (1 - Math.min(100, Math.max(0, rate)) / 100)}
              strokeLinecap="round"
              transform="rotate(-90 65 65)"
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', textAlign: 'center' }}>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
              {rate}%
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: statusColor, marginTop: '0.2rem' }}>
              {statusText}
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown 4-cell stats */}
      <div className="attendance-breakdown-list">
        <div className="attendance-breakdown-item">
          <div>
            <span className="att-dot" style={{ background: 'var(--success)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Present</span>
          </div>
          <strong style={{ color: 'var(--text-primary)' }}>{present}</strong>
        </div>

        <div className="attendance-breakdown-item">
          <div>
            <span className="att-dot" style={{ background: 'var(--secondary)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>On Leave</span>
          </div>
          <strong style={{ color: 'var(--text-primary)' }}>{onLeave}</strong>
        </div>

        <div className="attendance-breakdown-item">
          <div>
            <span className="att-dot" style={{ background: 'var(--danger)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Absent</span>
          </div>
          <strong style={{ color: 'var(--text-primary)' }}>{absent}</strong>
        </div>

        <div className="attendance-breakdown-item">
          <div>
            <span className="att-dot" style={{ background: 'var(--warning)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Late</span>
          </div>
          <strong style={{ color: 'var(--text-primary)' }}>{lateCount}</strong>
        </div>
      </div>
    </div>
  );
}
