import { useAuth } from '../contexts/AuthContext';
import { hasPermission as checkRolePermission } from '../config/permissions';

export function usePermission() {
  const { user } = useAuth();

  const hasPermission = (permission) => {
    if (!user || !user.role) return false;
    return checkRolePermission(user.role, permission);
  };

  const hasAnyPermission = (...permissions) => {
    if (!user || !user.role) return false;
    return permissions.some((perm) => checkRolePermission(user.role, perm));
  };

  const hasAllPermissions = (...permissions) => {
    if (!user || !user.role) return false;
    return permissions.every((perm) => checkRolePermission(user.role, perm));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    role: user?.role,
    user,
  };
}
