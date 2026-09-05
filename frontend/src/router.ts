/**
 * PeoplePay360 SPA History Router
 * Provides HTML5 History API (pushState, replaceState, popstate) routing,
 * deep linking, role-aware protected routes, and browser Back/Forward integration.
 */

import { Role } from './api/types';

export interface RouteMatch {
  path: string;
  tab: string;
  params: Record<string, string>;
  query: Record<string, string>;
}

export type RouteListener = (match: RouteMatch) => void;

interface RouteDefinition {
  pattern: RegExp;
  paramNames: string[];
  tab: string;
  allowedRoles?: Role[];
}

class Router {
  private routes: RouteDefinition[] = [];
  private listeners: Set<RouteListener> = new Set();
  private currentMatch: RouteMatch | null = null;
  private returnUrl: string | null = null;

  constructor() {
    // Listen for browser Back and Forward navigation events
    window.addEventListener('popstate', () => {
      this.handleLocationChange(window.location.pathname, window.location.search, false);
    });

    // Intercept standard data-link anchor clicks for smooth SPA navigation
    document.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('a[data-link]') as HTMLAnchorElement | null;
      if (target && target.href && target.origin === window.location.origin) {
        e.preventDefault();
        const path = target.pathname + target.search;
        this.navigate(path);
      }
    });
  }

  /**
   * Register a route pattern.
   * e.g. /employees/:id -> regex with param extraction
   */
  public register(pathPattern: string, tab: string, allowedRoles?: Role[]): void {
    const paramNames: string[] = [];
    const regexPattern = pathPattern
      .replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
        paramNames.push(name);
        return '([^/]+)';
      })
      .replace(/\*/g, '.*');

    this.routes.push({
      pattern: new RegExp(`^${regexPattern}$`),
      paramNames,
      tab,
      allowedRoles,
    });
  }

  /**
   * Subscribe to route transitions.
   */
  public subscribe(listener: RouteListener): () => void {
    this.listeners.add(listener);
    if (this.currentMatch) {
      listener(this.currentMatch);
    }
    return () => this.listeners.delete(listener);
  }

  /**
   * Navigate to a new route.
   * Normal page navigation uses history.pushState (options.replace = false).
   * Auth transitions and root redirects use options.replace = true.
   */
  public navigate(to: string, options?: { replace?: boolean }): void {
    const url = new URL(to, window.location.origin);
    const pathname = url.pathname;
    const search = url.search;

    if (options?.replace) {
      window.history.replaceState({}, '', pathname + search);
    } else {
      // Normal navigation PUSHES to browser history stack
      window.history.pushState({}, '', pathname + search);
    }

    this.handleLocationChange(pathname, search, true);
  }

  /**
   * Handle navigation back / forward.
   */
  public back(): void {
    window.history.back();
  }

  public forward(): void {
    window.history.forward();
  }

  /**
   * Parse current location and dispatch to listeners.
   */
  public handleLocationChange(pathname: string, search: string = '', isPush: boolean = false): RouteMatch {
    const query = this.parseQuery(search);

    // Canonical redirect for empty path
    if (pathname === '' || pathname === '/') {
      pathname = '/dashboard';
      if (!isPush) {
        window.history.replaceState({}, '', '/dashboard');
      }
    }

    // Role dashboard aliases
    if (pathname === '/admin/dashboard' || pathname === '/hr/dashboard' || pathname === '/employee/dashboard') {
      pathname = '/dashboard';
    } else if (pathname === '/payroll/dashboard') {
      pathname = '/payroll';
    }

    let match: RouteMatch = {
      path: pathname,
      tab: '404',
      params: {},
      query,
    };

    for (const route of this.routes) {
      const matchResult = pathname.match(route.pattern);
      if (matchResult) {
        const params: Record<string, string> = {};
        route.paramNames.forEach((name, index) => {
          params[name] = matchResult[index + 1];
        });

        match = {
          path: pathname,
          tab: route.tab,
          params,
          query,
        };
        break;
      }
    }

    this.currentMatch = match;
    this.listeners.forEach((listener) => listener(match));
    return match;
  }

  public getCurrentMatch(): RouteMatch {
    if (!this.currentMatch) {
      return this.handleLocationChange(window.location.pathname, window.location.search, false);
    }
    return this.currentMatch;
  }

  public setReturnUrl(url: string | null): void {
    // Sanitize: only internal paths allowed
    if (url && url.startsWith('/') && !url.startsWith('//')) {
      this.returnUrl = url;
    } else {
      this.returnUrl = null;
    }
  }

  public getReturnUrl(): string | null {
    return this.returnUrl;
  }

  private parseQuery(search: string): Record<string, string> {
    const params: Record<string, string> = {};
    if (!search) return params;
    const urlParams = new URLSearchParams(search);
    urlParams.forEach((val, key) => {
      params[key] = val;
    });
    return params;
  }
}

export const router = new Router();

// Define application routes
router.register('/login', 'login');
router.register('/dashboard', 'dashboard');
router.register('/employees', 'employees');
router.register('/employees/:id', 'employee-detail');
router.register('/departments', 'departments');
router.register('/contracts', 'contracts');
router.register('/schedules', 'schedules');
router.register('/attendance', 'attendance');
router.register('/leaves', 'leaves');
router.register('/payroll', 'payroll');
router.register('/payroll/payruns/:id', 'payrun-detail');
router.register('/payslips', 'payslips');
router.register('/payslips/:id', 'payslip-detail');
router.register('/users', 'users');
router.register('/audit', 'audit');
router.register('/security', 'security');
router.register('/sessions', 'sessions');
router.register('/profile', 'profile');
router.register('/settings', 'settings');
router.register('/403', '403');
router.register('/404', '404');
