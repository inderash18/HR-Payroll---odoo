import { ROLES } from '../config/constants.js';
import { errorResponse } from '../utils/response.js';

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return errorResponse(res, 'User authentication required for role verification', 401, null, 'UNAUTHENTICATED');
    }

    // ADMIN has universal access
    if (req.user.role === ROLES.ADMIN) {
      return next();
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied: Required roles: [${allowedRoles.join(', ')}], Current role: ${req.user.role}`,
        403,
        null,
        'FORBIDDEN'
      );
    }

    next();
  };
}
