import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import {
  Users,
  UserPlus,
  Search,
  Building2,
  MapPin,
  Laptop,
  Briefcase,
  Filter,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { AddEmployeeModal } from '../../components/modals/AddEmployeeModal';

export function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedDept, setSelectedDept] = useState(searchParams.get('departmentId') || '');
  const [selectedWorkMode, setSelectedWorkMode] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) setSearch(q);
    const dept = searchParams.get('departmentId');
    if (dept !== null) setSelectedDept(dept);
  }, [searchParams]);

  // Load departments for filter dropdown
  useEffect(() => {
    api.get('/departments')
      .then((res) => {
        const list = res.data?.departments || res.data || [];
        setDepartments(Array.isArray(list) ? list : []);
      })
      .catch((err) => console.error('Failed to load departments:', err));
  }, []);

  const loadEmployees = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', 25);
      if (search) params.set('search', search);
      if (selectedDept) params.set('departmentId', selectedDept);
      if (selectedWorkMode) params.set('workMode', selectedWorkMode);
      if (selectedLocation) params.set('location', selectedLocation);
      if (selectedStatus !== '') params.set('isActive', selectedStatus === 'active');

      const res = await api.get(`/employees?${params.toString()}`);
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.employees || []);
      setEmployees(list);
      const paginationData = res?.pagination || res?.data?.pagination;
      if (paginationData) {
        setPagination(paginationData);
      } else {
        setPagination({ page: 1, limit: 25, total: list.length, totalPages: Math.ceil(list.length / 25) || 1 });
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEmployees(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedDept, selectedWorkMode, selectedLocation, selectedStatus]);

  const getWorkModeBadge = (mode) => {
    switch (mode) {
      case 'REMOTE':
        return <span className="status-pill status-purple"><Laptop size={12} /> Remote</span>;
      case 'OFFICE':
        return <span className="status-pill status-green"><Building2 size={12} /> Office</span>;
      case 'HYBRID':
      default:
        return <span className="status-pill status-blue"><Briefcase size={12} /> Hybrid</span>;
    }
  };

  const getInitials = (first, last) => {
    return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase() || 'EM';
  };

  return (
    <div className="people-directory-page">
      {/* HEADER SECTION */}
      <div className="directory-header-row">
        <div>
          <h1 className="directory-page-title">Team Members Directory</h1>
          <p className="directory-page-sub">
            Manage Odoo engineering squads, design teams, operations, and IT workforce allocations.
          </p>
        </div>
        <div className="directory-actions">
          <button
            className="btn-pill-primary"
            id="btn-add-team-member"
            onClick={() => setShowModal(true)}
          >
            <UserPlus size={16} />
            <span>Add Team Member</span>
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="directory-toolbar-card">
        <div className="toolbar-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, employee ID (ODOO-xxxx)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch('')}>
              &times;
            </button>
          )}
        </div>

        <div className="toolbar-filter-group">
          {/* Department / Squad */}
          <div className="toolbar-select-wrapper">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="toolbar-select"
            >
              <option value="">All Squads & Depts</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Work Mode */}
          <div className="toolbar-select-wrapper">
            <select
              value={selectedWorkMode}
              onChange={(e) => setSelectedWorkMode(e.target.value)}
              className="toolbar-select"
            >
              <option value="">All Work Modes</option>
              <option value="HYBRID">Hybrid</option>
              <option value="REMOTE">Remote</option>
              <option value="OFFICE">In-Office</option>
            </select>
          </div>

          {/* Location */}
          <div className="toolbar-select-wrapper">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="toolbar-select"
            >
              <option value="">All Locations</option>
              <option value="Coimbatore">Coimbatore (HQ)</option>
              <option value="Chennai">Chennai</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Remote">Remote (India)</option>
            </select>
          </div>

          {/* Status */}
          <div className="toolbar-select-wrapper">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="toolbar-select"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Members</option>
              <option value="inactive">Inactive / On Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* MAIN DATA TABLE */}
      <div className="directory-table-card">
        <div className="table-responsive">
          <table className="data-table" id="team-members-table">
            <thead>
              <tr>
                <th style={{ width: '28%' }}>Team Member</th>
                <th style={{ width: '20%' }}>Designation</th>
                <th style={{ width: '16%' }}>Squad / Dept</th>
                <th style={{ width: '12%' }}>Work Mode</th>
                <th style={{ width: '12%' }}>Location</th>
                <th style={{ width: '12%', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="table-loading-cell">
                    <div className="loading-spinner-wrap">
                      <div className="spinner-dots"></div>
                      <span>Loading team members from PostgreSQL...</span>
                    </div>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-empty-cell">
                    <Users size={36} className="empty-icon" />
                    <p className="empty-title">No team members match the criteria</p>
                    <p className="empty-sub">Try changing your search terms or filter selection.</p>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const skills = Array.isArray(emp.skills) ? emp.skills : [];
                  const designation = emp.jobPosition?.title || emp.jobTitle || 'Software Engineer';
                  const deptName = emp.department?.name || 'Engineering';

                  return (
                    <tr
                      key={emp.id}
                      className="clickable-row"
                      onClick={() => navigate(`/employees/${emp.id}`)}
                    >
                      <td>
                        <div className="member-profile-cell">
                          <div className="member-avatar-box">
                            {getInitials(emp.firstName, emp.lastName)}
                          </div>
                          <div className="member-name-info">
                            <span className="member-full-name">
                              {emp.firstName} {emp.lastName}
                            </span>
                            <span className="member-meta-id">
                              {emp.employeeNum} • {emp.workEmail}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="designation-cell">
                          <span className="designation-title">{designation}</span>
                          {skills.length > 0 && (
                            <div className="skills-chip-row">
                              {skills.slice(0, 2).map((sk, idx) => (
                                <span key={idx} className="skill-mini-chip">
                                  {sk}
                                </span>
                              ))}
                              {skills.length > 2 && (
                                <span className="skill-more-chip">+{skills.length - 2}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className="dept-badge">{deptName}</span>
                      </td>

                      <td>{getWorkModeBadge(emp.workMode)}</td>

                      <td>
                        <div className="location-cell">
                          <MapPin size={13} className="loc-icon" />
                          <span>{emp.location || 'Coimbatore'}</span>
                        </div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <span className={`status-badge-pill ${emp.isActive ? 'active' : 'inactive'}`}>
                          <span className="status-dot"></span>
                          {emp.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {!isLoading && employees.length > 0 && (
          <div className="directory-pagination-bar">
            <span className="pagination-summary">
              Showing <strong>{employees.length}</strong> of <strong>{pagination.total || employees.length}</strong> team members
            </span>

            <div className="pagination-buttons">
              <button
                className="pagination-btn"
                disabled={pagination.page <= 1}
                onClick={() => loadEmployees(pagination.page - 1)}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>
              <span className="pagination-current-page">
                Page {pagination.page} of {pagination.totalPages || 1}
              </span>
              <button
                className="pagination-btn"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => loadEmployees(pagination.page + 1)}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <AddEmployeeModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadEmployees(1);
          }}
        />
      )}
    </div>
  );
}
