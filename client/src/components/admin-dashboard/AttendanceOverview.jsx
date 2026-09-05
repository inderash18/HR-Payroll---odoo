import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export function AttendanceOverview({ attendanceData }) {
  const navigate = useNavigate();

  if (!attendanceData) return null;

  const { present = 0, onLeave = 0, absent = 0, lateCheckIn = 0, attendanceRate = 100 } = attendanceData;

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
              stroke="#f1f5f9"
              strokeWidth="12"
            />
            <circle
              cx="65"
              cy="65"
              r="52"
              fill="none"
              stroke="#0f172a"
              strokeWidth="12"
              strokeDasharray="326.7"
              strokeDashoffset={326.7 * (1 - attendanceRate / 100)}
              strokeLinecap="round"
              transform="rotate(-90 65 65)"
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', textAlign: 'center' }}>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
              {attendanceRate}%
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#047857', marginTop: '0.2rem' }}>
              ● Operational
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown 4-cell stats */}
      <div className="attendance-breakdown-list">
        <div className="attendance-breakdown-item">
          <div>
            <span className="att-dot" style={{ background: '#047857' }} />
            <span style={{ color: '#64748b' }}>Present</span>
          </div>
          <strong style={{ color: '#0f172a' }}>{present}</strong>
        </div>

        <div className="attendance-breakdown-item">
          <div>
            <span className="att-dot" style={{ background: '#3b82f6' }} />
            <span style={{ color: '#64748b' }}>On Leave</span>
          </div>
          <strong style={{ color: '#0f172a' }}>{onLeave}</strong>
        </div>

        <div className="attendance-breakdown-item">
          <div>
            <span className="att-dot" style={{ background: '#ef4444' }} />
            <span style={{ color: '#64748b' }}>Absent</span>
          </div>
          <strong style={{ color: '#0f172a' }}>{absent}</strong>
        </div>

        <div className="attendance-breakdown-item">
          <div>
            <span className="att-dot" style={{ background: '#f59e0b' }} />
            <span style={{ color: '#64748b' }}>Late</span>
          </div>
          <strong style={{ color: '#0f172a' }}>{lateCheckIn}</strong>
        </div>
      </div>
    </div>
  );
}
