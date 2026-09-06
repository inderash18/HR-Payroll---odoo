import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Users,
  Building,
  Clock,
  CalendarDays,
  Landmark,
  FileSpreadsheet,
  DollarSign,
  UserCheck,
  Shield,
  User,
  KeyRound,
  Layers,
  FileText,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDebounce } from './useDebounce';
import { searchService } from '../services/searchService';

const RECENT_SEARCHES_KEY = 'odoo_recent_searches';

export function useGlobalSearch() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [apiGroups, setApiGroups] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);

  const inputRef = useRef(null);
  const mobileInputRef = useRef(null);
  const containerRef = useRef(null);

  const debouncedQuery = useDebounce(query, 280);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const saveRecentSearch = useCallback((term) => {
    if (!term || term.trim().length < 2) return;
    try {
      const trimmed = term.trim();
      const updated = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  }, [recentSearches]);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (e) {
      // ignore
    }
  }, []);

  // System navigation pages based on user roles
  const pages = useMemo(() => {
    const list = [
      {
        id: 'page-dashboard',
        title: 'Dashboard',
        subtitle: 'KPI overview, attendance summary & statistics',
        path: '/dashboard',
        icon: LayoutGrid,
        keywords: ['home', 'overview', 'analytics', 'kpi', 'metrics', 'stats'],
        roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'HR_MANAGER', 'PAYROLL_MANAGER', 'FINANCE_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE', 'AUDITOR'],
      },
      {
        id: 'page-employees',
        title: 'Workforce Directory',
        subtitle: 'Browse all company employees & roster',
        path: '/employees',
        icon: Users,
        keywords: ['employees', 'staff', 'team', 'roster', 'directory', 'people', 'members'],
        roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'AUDITOR'],
      },
      {
        id: 'page-departments',
        title: 'Departments & Squads',
        subtitle: 'Organizational hierarchy and team units',
        path: '/departments',
        icon: Building,
        keywords: ['departments', 'teams', 'squads', 'units', 'divisions', 'groups'],
        roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'HR_MANAGER', 'AUDITOR'],
      },
      {
        id: 'page-attendance',
        title: 'Attendance & Time Tracking',
        subtitle: 'Daily clock-in, clock-out logs & roster health',
        path: '/attendance',
        icon: Clock,
        keywords: ['attendance', 'clock in', 'clock out', 'timesheet', 'check in', 'present', 'absent'],
        roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE', 'AUDITOR'],
      },
      {
        id: 'page-leaves',
        title: 'Leave & Time Off Management',
        subtitle: 'Apply for leaves, view balances & manage approvals',
        path: '/leaves',
        icon: CalendarDays,
        keywords: ['leave', 'vacation', 'time off', 'holiday', 'sick leave', 'casual leave', 'wfh', 'approval'],
        roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE', 'AUDITOR'],
      },
      {
        id: 'page-payroll',
        title: 'Payroll Batches & Payruns',
        subtitle: 'Execute salary computations and payout runs',
        path: '/payroll',
        icon: Landmark,
        keywords: ['payroll', 'salary', 'payrun', 'wages', 'compensation', 'disbursement', 'payout'],
        roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'PAYROLL_MANAGER', 'HR_PAYROLL_MANAGER', 'FINANCE_MANAGER', 'AUDITOR'],
      },
      {
        id: 'page-payslips',
        title: 'Payslip Statements',
        subtitle: 'View, download and export itemized payslips',
        path: '/payslips',
        icon: FileSpreadsheet,
        keywords: ['payslip', 'salary slip', 'earnings', 'deductions', 'tax', 'statement', 'pdf'],
        roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'PAYROLL_MANAGER', 'EMPLOYEE', 'AUDITOR'],
      },
      {
        id: 'page-contracts',
        title: 'Employment Contracts',
        subtitle: 'Manage salary structures, wages & active contracts',
        path: '/contracts',
        icon: DollarSign,
        keywords: ['contracts', 'agreement', 'wage', 'terms', 'compensation'],
        roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'PAYROLL_MANAGER', 'HR_MANAGER', 'AUDITOR'],
      },
      {
        id: 'page-schedules',
        title: 'Working Schedules',
        subtitle: 'Configure weekly shift hours & break rules',
        path: '/schedules',
        icon: Clock,
        keywords: ['schedule', 'shifts', 'working hours', 'timing', 'breaks'],
        roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'HR_MANAGER', 'AUDITOR'],
      },
      {
        id: 'page-users',
        title: 'User Roles & Access Control',
        subtitle: 'Manage system accounts and security permissions',
        path: '/users',
        icon: UserCheck,
        keywords: ['users', 'roles', 'permissions', 'rbac', 'access', 'accounts', 'passwords'],
        roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN'],
      },
      {
        id: 'page-audit',
        title: 'Audit & Security Logs',
        subtitle: 'Immutable record of system activities & events',
        path: '/audit-logs',
        icon: Shield,
        keywords: ['audit', 'logs', 'activity', 'security', 'events', 'trail', 'history'],
        roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'AUDITOR'],
      },
      {
        id: 'page-profile',
        title: 'User Profile & Documents',
        subtitle: 'View your employment details & uploaded files',
        path: '/profile',
        icon: User,
        keywords: ['profile', 'account', 'me', 'personal details', 'bank', 'documents', 'avatar'],
        roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'HR_MANAGER', 'PAYROLL_MANAGER', 'FINANCE_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE', 'AUDITOR'],
      },
      {
        id: 'page-security',
        title: 'Account Security & Sessions',
        subtitle: 'Change password & manage active login devices',
        path: '/profile/security',
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
    if (!q) return pages.slice(0, 5);
    return pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [pages, query]);

  // Fetch API results with debounce
  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!q || q.length < 2) {
      setApiGroups([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    searchService
      .globalSearch(q, 6)
      .then((data) => {
        if (isMounted) {
          setApiGroups(data.groups || []);
        }
      })
      .catch((err) => {
        console.error('Global search error:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  // Build combined groups
  const allGroups = useMemo(() => {
    const groups = [];

    if (matchingPages.length > 0) {
      groups.push({
        type: 'pages',
        label: query.trim() ? 'Pages & Modules' : 'Quick Jump',
        results: matchingPages.map((p) => ({
          id: p.id,
          type: 'page',
          title: p.title,
          subtitle: p.subtitle,
          icon: p.icon,
          route: p.path,
        })),
      });
    }

    if (apiGroups && apiGroups.length > 0) {
      apiGroups.forEach((g) => {
        if (g.results && g.results.length > 0) {
          groups.push(g);
        }
      });
    }

    return groups;
  }, [matchingPages, apiGroups, query]);

  // Flattened list for keyboard navigation
  const flatItems = useMemo(() => {
    const items = [];
    allGroups.forEach((g) => {
      g.results.forEach((r) => {
        items.push({ ...r, groupType: g.type });
      });
    });
    return items;
  }, [allGroups]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, flatItems.length]);

  // Global keyboard shortcut listener (Ctrl+K or Cmd+K or /)
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      } else if (
        e.key === '/' &&
        document.activeElement !== inputRef.current &&
        document.activeElement !== mobileInputRef.current &&
        !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
      ) {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setIsMobileOpen(false);
        inputRef.current?.blur();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close desktop dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Select / Navigate action
  const handleSelect = useCallback(
    (item) => {
      if (!item) return;
      if (query.trim()) {
        saveRecentSearch(query.trim());
      }
      setIsOpen(false);
      setIsMobileOpen(false);
      setQuery('');

      if (item.route) {
        navigate(item.route);
      } else if (item.type === 'employee') {
        navigate(`/employees?search=${encodeURIComponent(item.badge || item.title)}`);
      } else if (item.type === 'department') {
        navigate('/departments');
      } else if (item.type === 'payrun') {
        navigate('/payroll');
      } else if (item.type === 'payslip') {
        navigate('/payslips');
      } else if (item.type === 'leave') {
        navigate('/leaves');
      } else if (item.type === 'page' && item.path) {
        navigate(item.path);
      }
    },
    [navigate, query, saveRecentSearch]
  );

  // Keydown handler for input
  const handleInputKeyDown = useCallback(
    (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < flatItems.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : flatItems.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flatItems[selectedIndex]) {
          handleSelect(flatItems[selectedIndex]);
        }
      }
    },
    [flatItems, selectedIndex, handleSelect]
  );

  return {
    query,
    setQuery,
    isOpen,
    setIsOpen,
    isMobileOpen,
    setIsMobileOpen,
    selectedIndex,
    setSelectedIndex,
    isLoading,
    allGroups,
    flatItems,
    recentSearches,
    saveRecentSearch,
    clearRecentSearches,
    handleSelect,
    handleInputKeyDown,
    inputRef,
    mobileInputRef,
    containerRef,
  };
}
