import { ROLES } from '../config/constants.js';
import { hasPermission } from '../config/permissions.js';

export function sendForbidden(res, message = 'You do not have permission to perform this action') {
  return res.status(403).json({
    success: false,
    message,
    error: {
      code: 'FORBIDDEN',
    },
  });
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: { code: 'UNAUTHENTICATED' },
      });
    }

    if (req.user.role === ROLES.SUPER_ADMIN || req.user.role === ROLES.ORGANIZATION_ADMIN || req.user.role === ROLES.ADMIN) {
      return next();
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return sendForbidden(res, 'You do not have permission to perform this action');
    }

    next();
  };
}

export function requirePermission(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: { code: 'UNAUTHENTICATED' },
      });
    }

    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    const userRole = req.user.role;
    const hasAll = requiredPermissions.every((perm) => hasPermission(userRole, perm));

    if (!hasAll) {
      return sendForbidden(res, 'You do not have permission to perform this action');
    }

    next();
  };
}

export function requireAnyPermission(...permissions) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: { code: 'UNAUTHENTICATED' },
      });
    }

    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    const userRole = req.user.role;
    const hasAny = permissions.some((perm) => hasPermission(userRole, perm));

    if (!hasAny) {
      return sendForbidden(res, 'You do not have permission to perform this action');
    }

    next();
  };
}

export function validateTenant(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: { code: 'UNAUTHENTICATED' },
    });
  }

  if (req.user.role === ROLES.SUPER_ADMIN) {
    return next();
  }

  const headerOrgId = req.headers['x-organization-id'];
  if (headerOrgId && headerOrgId !== req.user.organizationId) {
    return sendForbidden(res, 'Cross-tenant access prohibited');
  }

  next();
}

export function enforceAuditorReadOnly(req, res, next) {
  if (req.user && req.user.role === ROLES.AUDITOR) {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      if (req.path.includes('/export')) {
        return next();
      }
      return sendForbidden(res, 'Auditor role has strictly read-only access. Modification is prohibited.');
    }
  }
  next();
}

