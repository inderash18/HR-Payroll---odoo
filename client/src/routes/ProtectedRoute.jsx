import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FullScreenLoader } from '../components/common/FullScreenLoader';
import { getRoleDashboardPath } from '../config/navigation.config';
import { hasPermission as checkRolePermission } from '../config/permissions';

export function ProtectedRoute({ allowedRoles = [], requiredPermissions = [], children }) {
  const { user, isAuthenticated, isInitializing, hasRole } = useAuth();

  if (isInitializing) {
    return <FullScreenLoader message="Verifying secure session & role permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !hasRole(...allowedRoles)) {
    // Authenticated user accessed an unauthorized URL:
    // Do NOT send them to /login. Send them to their own role dashboard.
    const userDashboard = getRoleDashboardPath(user?.role);
    return <Navigate to={userDashboard || '/forbidden'} replace />;
  }

  if (requiredPermissions.length > 0) {
    const hasAll = requiredPermissions.every((perm) => checkRolePermission(user?.role, perm));
    if (!hasAll) {
      return <Navigate to="/forbidden" replace />;
    }
  }

  return children || <Outlet />;
}

export function RoleRoute({ allowedRoles = [], requiredPermissions = [], children }) {
  const { user, isAuthenticated, isInitializing, hasRole } = useAuth();

  if (isInitializing) {
    return <FullScreenLoader message="Checking authorization..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !hasRole(...allowedRoles)) {
    // Authenticated user accessed an unauthorized route:
    // Do NOT send to /login. Redirect to their own dashboard.
    const userDashboard = getRoleDashboardPath(user?.role);
    return <Navigate to={userDashboard || '/forbidden'} replace />;
  }

  if (requiredPermissions.length > 0) {
    const hasAll = requiredPermissions.every((perm) => checkRolePermission(user?.role, perm));
    if (!hasAll) {
      return <Navigate to="/forbidden" replace />;
    }
  }

  return children || <Outlet />;
}

export const RoleProtectedRoute = RoleRoute;

