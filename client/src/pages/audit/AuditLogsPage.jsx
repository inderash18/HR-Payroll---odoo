import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../api/client';
import { ShieldAlert } from 'lucide-react';
import { LocalTableSearch } from '../../components/search/LocalTableSearch';

export function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
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

  const filteredLogs = useMemo(() => {
    if (!search.trim()) return logs;
    const q = search.trim().toLowerCase();
    return logs.filter((l) => {
      const action = (l.action || '').toLowerCase();
      const resource = (l.resource || l.entityName || '').toLowerCase();
      const userStr = (l.user?.email || l.userId || '').toLowerCase();
      const ip = (l.ipAddress || '').toLowerCase();
      return action.includes(q) || resource.includes(q) || userStr.includes(q) || ip.includes(q);
    });
  }, [logs, search]);

  return (
    <div>
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
              Immutable Security Audit Trail ({filteredLogs.length})
            </h2>
            <LocalTableSearch
              value={search}
              onChange={setSearch}
              placeholder="Search activity, user, or action..."
              id="search-audit-logs"
            />
          </div>
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
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No security events found matching search.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((l) => (
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
