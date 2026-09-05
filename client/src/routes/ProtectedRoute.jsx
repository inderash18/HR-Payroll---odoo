import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission as checkRolePermission } from '../config/permissions';

export function ProtectedRoute({ allowedRoles = [], requiredPermissions = [], children }) {
  const { user, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-main)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            PeoplePay360
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Verifying secure session &amp; role permissions...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !hasRole(...allowedRoles)) {
    return <Navigate to="/forbidden" replace />;
  }

  if (requiredPermissions.length > 0) {
    const hasAll = requiredPermissions.every((perm) => checkRolePermission(user.role, perm));
    if (!hasAll) {
      return <Navigate to="/forbidden" replace />;
    }
  }

  return children || <Outlet />;
}

export function RoleRoute({ allowedRoles = [], requiredPermissions = [], children }) {
  const { user, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !hasRole(...allowedRoles)) {
    return <Navigate to="/forbidden" replace />;
  }

  if (requiredPermissions.length > 0) {
    const hasAll = requiredPermissions.every((perm) => checkRolePermission(user.role, perm));
    if (!hasAll) {
      return <Navigate to="/forbidden" replace />;
    }
  }

  return children;
}

export const RoleProtectedRoute = RoleRoute;

