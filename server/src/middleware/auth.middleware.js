import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { COOKIE_NAMES } from '../config/constants.js';
import { authService } from '../services/auth.service.js';
import { setAuthCookies } from '../controllers/auth.controller.js';
import { errorResponse } from '../utils/response.js';

export async function authenticate(req, res, next) {
  let token;

  // 1. Check Authorization Bearer header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 2. Check HttpOnly access token cookie
  if (!token && (req.cookies || req.signedCookies)) {
    const cookies = { ...(req.cookies || {}), ...(req.signedCookies || {}) };
    token =
      cookies[COOKIE_NAMES.ACCESS_TOKEN] ||
      cookies['odoo_access_token'] ||
      cookies['accessToken'] ||
      cookies['access_token'];
  }

  const rawRefreshToken =
    req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN] ||
    req.cookies?.['odoo_refresh_token'] ||
    req.signedCookies?.[COOKIE_NAMES.REFRESH_TOKEN] ||
    req.signedCookies?.['odoo_refresh_token'] ||
    req.body?.refreshToken;

  // Helper to attempt refresh token recovery
  const tryRefreshSession = async () => {
    if (!rawRefreshToken) return false;
    try {
      const meta = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };
      const result = await authService.refreshTokens(rawRefreshToken, meta);
      setAuthCookies(res, result);
      let organizationId = result.user.organization?.id || result.user.organizationId;
      if (!organizationId || organizationId === 'org-odoo-ind' || organizationId === 'org-pp360-ind') {
        organizationId = 'aed94e15-27b5-4206-9217-064efd21c1a0';
      }
      req.user = {
        id: result.user.id,
        email: result.user.email,
        organizationId,
        role: result.user.role,
      };
      return true;
    } catch (err) {
      return false;
    }
  };

  if (!token) {
    const refreshed = await tryRefreshSession();
    if (refreshed) return next();
    return errorResponse(res, 'Authentication required: Missing access token or session cookie', 401, null, 'UNAUTHENTICATED');
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    let organizationId = payload.organizationId;

    // Resolve active organization if token has dummy org ID
    if (!organizationId || organizationId === 'org-odoo-ind' || organizationId === 'org-pp360-ind') {
      organizationId = 'aed94e15-27b5-4206-9217-064efd21c1a0';
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      organizationId,
      legalEntityId: payload.legalEntityId,
      role: payload.role,
    };
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      const refreshed = await tryRefreshSession();
      if (refreshed) return next();
      return errorResponse(res, 'Access token has expired', 401, null, 'ACCESS_TOKEN_EXPIRED');
    }
    return errorResponse(res, 'Invalid authentication token', 401, null, 'INVALID_ACCESS_TOKEN');
  }
}

