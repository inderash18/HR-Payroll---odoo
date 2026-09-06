import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  LayoutGrid,
  Users,
  Building,
  Clock,
  CalendarDays,
  Landmark,
  FileSpreadsheet,
  UserCheck,
  Layers,
  Shield,
  FileText,
  KeyRound,
  User,
  ArrowRight,
  Loader2,
  DollarSign,
  Award,
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

export default function GlobalSearch() {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [employeeResults, setEmployeeResults] = useState([]);
  const [departmentResults, setDepartmentResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Define searchable navigation pages based on user roles
  const pages = useMemo(() => {
    const list = [
      {
        id: 'page-dashboard',
        title: 'Dashboard',
        subtitle: 'KPI overview, attendance summary & statistics',
        path: '/dashboard',
        category: 'Pages',
        icon: LayoutGrid,
        keywords: ['home', 'overview', 'analytics', 'kpi', 'metrics', 'stats'],
        roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'HR_MANAGER', 'PAYROLL_MANAGER', 'FINANCE_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE', 'AUDITOR'],
      },
      {
        id: 'page-employees',
        title: 'Workforce Directory',
        subtitle: 'Browse all company employees & roster',
        path: '/employees',
        category: 'Pages',
        icon: Users,
        keywords: ['employees', 'staff', 'team', 'roster', 'directory', 'people', 'members'],
        roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'AUDITOR'],
      },
      {
        id: 'page-departments',
        title: 'Departments & Squads',
        subtitle: 'Organizational hierarchy and team units',
        path: '/departments',
        category: 'Pages',
        icon: Building,
        keywords: ['departments', 'teams', 'squads', 'units', 'divisions', 'groups'],
        roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'HR_MANAGER', 'AUDITOR'],
      },
      {
        id: 'page-attendance',
        title: 'Attendance & Time Tracking',
        subtitle: 'Daily clock-in, clock-out logs & roster health',
        path: '/attendance',
        category: 'Pages',
        icon: Clock,
        keywords: ['attendance', 'clock in', 'clock out', 'timesheet', 'check in', 'present', 'absent'],
        roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE', 'AUDITOR'],
      },
      {
        id: 'page-leaves',
        title: 'Leave & Time Off Management',
        subtitle: 'Apply for leaves, view balances & manage approvals',
        path: '/leaves',
        category: 'Pages',
        icon: CalendarDays,
        keywords: ['leave', 'vacation', 'time off', 'holiday', 'sick leave', 'casual leave', 'wfh', 'approval'],
        roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE', 'AUDITOR'],
      },
      {
        id: 'page-payroll',
        title: 'Payroll Batches & Payruns',
        subtitle: 'Execute salary computations and payout runs',
        path: '/payroll',
        category: 'Pages',
        icon: Landmark,
        keywords: ['payroll', 'salary', 'payrun', 'wages', 'compensation', 'disbursement', 'payout'],
        roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'PAYROLL_MANAGER', 'HR_PAYROLL_MANAGER', 'FINANCE_MANAGER', 'AUDITOR'],
      },
      {
        id: 'page-payslips',
        title: 'Payslip Statements',
        subtitle: 'View, download and export itemized payslips',
        path: '/payslips',
        category: 'Pages',
        icon: FileSpreadsheet,
        keywords: ['payslip', 'salary slip', 'earnings', 'deductions', 'tax', 'statement', 'pdf'],
        roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'PAYROLL_MANAGER', 'EMPLOYEE', 'AUDITOR'],
      },
      {
        id: 'page-contracts',
        title: 'Employment Contracts',
        subtitle: 'Manage salary structures, wages & active contracts',
        path: '/contracts',
        category: 'Pages',
        icon: DollarSign,
        keywords: ['contracts', 'agreement', 'wage', 'terms', 'compensation'],
        roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'PAYROLL_MANAGER', 'HR_MANAGER', 'AUDITOR'],
      },
      {
        id: 'page-schedules',
        title: 'Working Schedules',
        subtitle: 'Configure weekly shift hours & break rules',
        path: '/schedules',
        category: 'Pages',
        icon: Clock,
        keywords: ['schedule', 'shifts', 'working hours', 'timing', 'breaks'],
        roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'HR_MANAGER', 'AUDITOR'],
      },
      {
        id: 'page-users',
        title: 'User Roles & Access Control',
        subtitle: 'Manage system accounts and security permissions',
        path: '/users',
        category: 'Pages',
        icon: UserCheck,
        keywords: ['users', 'roles', 'permissions', 'rbac', 'access', 'accounts', 'passwords'],
        roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN'],
      },
      {
        id: 'page-audit',
        title: 'Audit & Security Logs',
        subtitle: 'Immutable record of system activities & events',
        path: '/audit-logs',
        category: 'Pages',
        icon: Shield,
        keywords: ['audit', 'logs', 'activity', 'security', 'events', 'trail', 'history'],
        roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'AUDITOR'],
      },
      {
        id: 'page-profile',
        title: 'User Profile & Documents',
        subtitle: 'View your employment details & uploaded files',
        path: '/profile',
        category: 'Pages',
        icon: User,
        keywords: ['profile', 'account', 'me', 'personal details', 'bank', 'documents', 'avatar'],
        roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'HR_MANAGER', 'PAYROLL_MANAGER', 'FINANCE_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE', 'AUDITOR'],
      },
      {
        id: 'page-security',
        title: 'Account Security & Sessions',
        subtitle: 'Change password & manage active login devices',
        path: '/profile/security',
        category: 'Pages',
        icon: KeyRound,
        keywords: ['security', 'password', 'sessions', 'devices', 'auth', '2fa'],
        roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'HR_MANAGER', 'PAYROLL_MANAGER', 'FINANCE_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE', 'AUDITOR'],
      },
    ];

    const currentRole = user?.role || 'EMPLOYEE';
    return list.filter((p) => !p.roles || p.roles.includes(currentRole));
  }, [user]);

  // Filter local pages
  const matchingPages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pages.slice(0, 6); // show first 6 popular pages when empty
    return pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [pages, query]);

  // Live query for backend database records (Employees & Departments)
  useEffect(() => {
    const q = query.trim();
    if (!q || q.length < 2) {
      setEmployeeResults([]);
      setDepartmentResults([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const [empRes, deptRes] = await Promise.allSettled([
          api.get(`/employees?search=${encodeURIComponent(q)}&take=5`),
          api.get(`/departments?search=${encodeURIComponent(q)}&take=4`),
        ]);

        if (isMounted) {
          if (empRes.status === 'fulfilled') {
            const data = empRes.value.data?.employees || empRes.value.data?.data || empRes.value.data || [];
            setEmployeeResults(Array.isArray(data) ? data.slice(0, 5) : []);
          }
          if (deptRes.status === 'fulfilled') {
            const data = deptRes.value.data?.departments || deptRes.value.data?.data || deptRes.value.data || [];
            setDepartmentResults(Array.isArray(data) ? data.slice(0, 4) : []);
          }
        }
      } catch (e) {
        console.error('Search query error:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }, 180);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query]);

  // Flattened items list for keyboard arrow navigation
  const allItems = useMemo(() => {
    const list = [];
    matchingPages.forEach((p) => list.push({ type: 'page', data: p }));
    employeeResults.forEach((e) => list.push({ type: 'employee', data: e }));
    departmentResults.forEach((d) => list.push({ type: 'department', data: d }));
    return list;
  }, [matchingPages, employeeResults, departmentResults]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, allItems.length]);

  // Keyboard shortcut listener (Ctrl+K or /)
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === '/' && document.activeElement !== inputRef.current && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    if (!item) return;
    setIsOpen(false);
    setQuery('');

    if (item.type === 'page') {
      navigate(item.data.path);
    } else if (item.type === 'employee') {
      navigate(`/employees?search=${encodeURIComponent(item.data.employeeNum || item.data.workEmail || item.data.firstName)}`);
    } else if (item.type === 'department') {
      navigate(`/departments`);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < allItems.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : allItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        handleSelect(allItems[selectedIndex]);
      } else if (matchingPages.length > 0) {
        handleSelect({ type: 'page', data: matchingPages[0] });
      }
    }
  };

  let globalIndexCounter = -1;

  return (
    <div className="relative w-full max-w-[420px]" ref={containerRef}>
      {/* Search Input Box */}
      <div
        className={`search-pill-box flex items-center gap-2.5 px-3.5 py-2 rounded-full border transition-all duration-200 ${
          isOpen
            ? 'bg-[var(--surface)] border-[var(--primary)] shadow-[0_0_0_3px_rgba(139,79,103,0.18)]'
            : 'bg-[var(--surface-soft)] border-[var(--border)] hover:border-[var(--border-strong)]'
        }`}
      >
        <Search size={16} className="text-[var(--text-muted)] shrink-0" />
        <input
          ref={inputRef}
          type="text"
          id="topbar-global-search"
          placeholder="Search across Odoo... (Ctrl + K)"
          autoComplete="off"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleInputKeyDown}
          className="w-full bg-transparent border-none outline-none text-xs md:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)]"
        />
        {isLoading ? (
          <Loader2 size={14} className="animate-spin text-[var(--primary)] shrink-0" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-transparent border-none cursor-pointer p-0.5"
          >
            <X size={14} />
          </button>
        ) : (
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-semibold text-[var(--text-muted)] bg-[var(--surface)] border border-[var(--border)] px-1.5 py-0.5 rounded shadow-2xs">
            ⌘K
          </kbd>
        )}
      </div>

      {/* Dropdown Results Modal */}
      {isOpen && (
        <div
          className="absolute left-0 right-0 mt-2 bg-[var(--surface)] border border-[var(--border-strong)] rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[480px] flex flex-col animate-in fade-in zoom-in-95 duration-150"
          style={{ minWidth: '340px' }}
        >
          <div className="overflow-y-auto p-2 divide-y divide-[var(--border)]">
            {/* 1. Pages & Tools */}
            {matchingPages.length > 0 && (
              <div className="py-1">
                <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                  {query.trim() ? 'Matching Pages & Modules' : 'Quick Jump'}
                </div>
                <div className="flex flex-col gap-0.5">
                  {matchingPages.map((page) => {
                    globalIndexCounter++;
                    const isSelected = selectedIndex === globalIndexCounter;
                    const Icon = page.icon || LayoutGrid;

                    return (
                      <button
                        key={page.id}
                        type="button"
                        onClick={() => handleSelect({ type: 'page', data: page })}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer border-none ${
                          isSelected
                            ? 'bg-[var(--primary-soft)] text-[var(--primary)] font-semibold'
                            : 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-soft)] text-[var(--text-secondary)]'
                          }`}>
                            <Icon size={15} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate">{page.title}</div>
                            <div className="text-[11px] text-[var(--text-muted)] truncate">{page.subtitle}</div>
                          </div>
                        </div>
                        <ArrowRight size={13} className="text-[var(--text-muted)] shrink-0 ml-2 opacity-60" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Employee Database Records */}
            {employeeResults.length > 0 && (
              <div className="py-1">
                <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                  Employees ({employeeResults.length})
                </div>
                <div className="flex flex-col gap-0.5">
                  {employeeResults.map((emp) => {
                    globalIndexCounter++;
                    const isSelected = selectedIndex === globalIndexCounter;
                    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee';
                    const deptName = emp.department?.name || 'General';

                    return (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => handleSelect({ type: 'employee', data: emp })}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer border-none ${
                          isSelected
                            ? 'bg-[var(--primary-soft)] text-[var(--primary)] font-semibold'
                            : 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-[var(--primary)] text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {emp.firstName ? emp.firstName[0].toUpperCase() : 'E'}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[var(--text-primary)] truncate flex items-center gap-2">
                              <span>{fullName}</span>
                              {emp.employeeNum && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--surface-soft)] text-[var(--text-muted)] border border-[var(--border)]">
                                  {emp.employeeNum}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[var(--text-muted)] truncate">
                              {emp.workEmail || deptName}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-soft)] text-[var(--text-secondary)] shrink-0 ml-2">
                          {deptName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Department Records */}
            {departmentResults.length > 0 && (
              <div className="py-1">
                <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                  Departments ({departmentResults.length})
                </div>
                <div className="flex flex-col gap-0.5">
                  {departmentResults.map((dept) => {
                    globalIndexCounter++;
                    const isSelected = selectedIndex === globalIndexCounter;

                    return (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => handleSelect({ type: 'department', data: dept })}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer border-none ${
                          isSelected
                            ? 'bg-[var(--primary-soft)] text-[var(--primary)] font-semibold'
                            : 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-[var(--surface-soft)] text-[var(--primary)] flex items-center justify-center shrink-0">
                            <Building size={14} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[var(--text-primary)] truncate">{dept.name}</div>
                            <div className="text-[11px] text-[var(--text-muted)] truncate">Code: {dept.code}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-soft)] text-[var(--text-muted)] shrink-0 ml-2">
                          Department
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {allItems.length === 0 && !isLoading && (
              <div className="p-6 text-center text-[var(--text-muted)]">
                <Search size={24} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold">No results found for &ldquo;{query}&rdquo;</p>
                <p className="text-[11px] mt-1">Try searching for an employee name, employee number, department, or module.</p>
              </div>
            )}
          </div>

          {/* Footer bar */}
          <div className="bg-[var(--surface-soft)] px-3 py-1.5 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <div className="flex items-center gap-3">
              <span>↑↓ Navigate</span>
              <span>↵ Open</span>
              <span>ESC Close</span>
            </div>
            <span className="font-semibold text-[var(--primary)]">Odoo Global Search</span>
          </div>
        </div>
      )}
    </div>
  );
}
