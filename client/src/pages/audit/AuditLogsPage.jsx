import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { ShieldAlert } from 'lucide-react';

export function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/audit');
      setLogs(res.data?.logs || res.data || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <div className="card">
        <div className="card-header" style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Immutable Security Audit Trail ({logs.length})
          </h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.85rem 1.25rem' }}>Timestamp</th>
                <th style={{ padding: '0.85rem 1rem' }}>Action</th>
                <th style={{ padding: '0.85rem 1rem' }}>Resource</th>
                <th style={{ padding: '0.85rem 1rem' }}>User / IP</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading audit events from PostgreSQL...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No security events recorded.
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id}>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {new Date(l.createdAt || l.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge blue">{l.action}</span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{l.resource || l.entityName || 'System'}</td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                      {l.user?.email || l.userId || 'system'} &bull;{' '}
                      <span style={{ color: 'var(--text-muted)' }}>{l.ipAddress || '127.0.0.1'}</span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {JSON.stringify(l.details || {}).slice(0, 40)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
