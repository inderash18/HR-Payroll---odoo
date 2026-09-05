import { ROLES } from '../config/constants.js';
import { hasPermission, ROLE_PERMISSIONS } from '../config/permissions.js';
import { errorResponse } from '../utils/response.js';
import { prisma } from '../repositories/prisma.js';

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return errorResponse(res, 'Authentication required for role verification', 401, null, 'UNAUTHENTICATED');
    }

    // SUPER_ADMIN and ORGANIZATION_ADMIN / ADMIN bypass role list
    if (req.user.role === ROLES.SUPER_ADMIN || req.user.role === ROLES.ORGANIZATION_ADMIN || req.user.role === ROLES.ADMIN) {
      return next();
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied: Required roles [${allowedRoles.join(', ')}], Current role: ${req.user.role}`,
        403,
        null,
        'FORBIDDEN'
      );
    }

    next();
  };
}

export function requirePermission(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return errorResponse(res, 'Authentication required for permission verification', 401, null, 'UNAUTHENTICATED');
    }

    // Super admin & org admin have universal access
    if (req.user.role === ROLES.SUPER_ADMIN || req.user.role === ROLES.ORGANIZATION_ADMIN || req.user.role === ROLES.ADMIN) {
      return next();
    }

    const userRole = req.user.role;
    const hasAll = requiredPermissions.every((perm) => hasPermission(userRole, perm));

    if (!hasAll) {
      return errorResponse(
        res,
        `Access denied: Missing required permission(s): [${requiredPermissions.join(', ')}]`,
        403,
        null,
        'FORBIDDEN_PERMISSION'
      );
    }

    next();
  };
}

export function validateTenant(req, res, next) {
  if (!req.user) {
    return errorResponse(res, 'Authentication required', 401, null, 'UNAUTHENTICATED');
  }

  // Super admin can access cross-tenant if explicitly provided, otherwise default to org
  if (req.user.role === ROLES.SUPER_ADMIN) {
    return next();
  }

  const headerOrgId = req.headers['x-organization-id'];
  if (headerOrgId && headerOrgId !== req.user.organizationId) {
    return errorResponse(
      res,
      'Cross-tenant access prohibited',
      403,
      null,
      'TENANT_MISMATCH'
    );
  }

  next();
}

export function enforceAuditorReadOnly(req, res, next) {
  if (req.user && req.user.role === ROLES.AUDITOR) {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      // Only allow export actions for auditor
      if (req.path.includes('/export')) {
        return next();
      }
      return errorResponse(
        res,
        'Auditor role has strictly read-only access. Modification is prohibited.',
        403,
        null,
        'AUDITOR_READ_ONLY'
      );
    }
  }
  next();
}
