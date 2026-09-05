import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { COOKIE_NAMES } from '../config/constants.js';
import { errorResponse } from '../utils/response.js';

export function authenticate(req, res, next) {
  let token;

  // 1. Check Authorization Bearer header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 2. Check HttpOnly access token cookie
  if (!token && req.cookies) {
    token = req.cookies[COOKIE_NAMES.ACCESS_TOKEN] || req.cookies['accessToken'] || req.cookies['access_token'];
  }

  if (!token) {
    return errorResponse(res, 'Authentication required: Missing access token or session cookie', 401, null, 'UNAUTHENTICATED');
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    let organizationId = payload.organizationId;

    // Resolve active organization if token has legacy/dummy org ID
    if (!organizationId || organizationId === 'org-pp360-ind') {
      organizationId = 'aed94e15-27b5-4206-9217-064efd21c1a0';
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      organizationId,
      legalEntityId: payload.legalEntityId,
      role: payload.role,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Access token has expired', 401, null, 'ACCESS_TOKEN_EXPIRED');
    }
    return errorResponse(res, 'Invalid authentication token', 401, null, 'INVALID_ACCESS_TOKEN');
  }
}
