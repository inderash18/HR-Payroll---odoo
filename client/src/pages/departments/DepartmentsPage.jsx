import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../api/client';
import { Plus } from 'lucide-react';
import { LocalTableSearch } from '../../components/search/LocalTableSearch';

export function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ code: '', name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/departments');
      setDepartments(res.data?.departments || res.data || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredDepartments = useMemo(() => {
    if (!search.trim()) return departments;
    const q = search.trim().toLowerCase();
    return departments.filter(
      (d) =>
        d.name?.toLowerCase().includes(q) ||
        d.code?.toLowerCase().includes(q)
    );
  }, [departments, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await api.post('/departments', formData);
      setShowModal(false);
      setFormData({ code: '', name: '' });
      loadData();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to create department');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="card">
        <div
          className="card-header"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
              Departments ({filteredDepartments.length})
            </h2>
            <LocalTableSearch
              value={search}
              onChange={setSearch}
              placeholder="Search departments..."
              id="search-departments"
            />
          </div>
          <button
            className="btn-pill-primary"
            id="btn-add-dept-header"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} />
            <span>Add Department</span>
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.85rem 1.25rem' }}>Code</th>
                <th style={{ padding: '0.85rem 1rem' }}>Department Name</th>
                <th style={{ padding: '0.85rem 1rem' }}>Staff Count</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="4" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading departments from PostgreSQL...
                  </td>
                </tr>
              ) : filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No departments found matching your search.
                  </td>
                </tr>
              ) : (
                filteredDepartments.map((d) => (
                  <tr key={d.id}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>{d.code}</td>
                    <td style={{ padding: '1rem' }}>{d.name}</td>
                    <td style={{ padding: '1rem' }}>{d._count?.employees || d.employeeCount || 0} Members</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className="badge green">ACTIVE</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Create New Department</h3>
              <button className="modal-close-btn" onClick={() => { setShowModal(false); setErrorMessage(null); }}>
                &times;
              </button>
            </div>
            {errorMessage && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1rem', marginTop: '1rem' }}>
                {errorMessage}
              </div>
            )}
            <form onSubmit={handleCreate}>
              <div className="modal-form-group">
                <label>Department Code</label>
                <input
                  type="text"
                  required
                  placeholder="ENG"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="modal-form-group">
                <label>Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="Engineering & Technology"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-pill-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pill-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
