import { authService } from '../services/auth.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { COOKIE_NAMES } from '../config/constants.js';

function setAuthCookies(res, { accessToken, refreshToken }) {
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

function clearAuthCookies(res) {
  const isProd = process.env.NODE_ENV === 'production';

  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  });

  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  });
}

export const authController = {
  async register(req, res, next) {
    try {
      const result = await authService.registerOrganization(req.body);
      setAuthCookies(res, result);
      return successResponse(res, result.user, 'Organization registered successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };
      const result = await authService.login(req.body, meta);
      setAuthCookies(res, result);
      return successResponse(res, result.user, 'Login successful');
    } catch (err) {
      next(err);
    }
  },

  async refresh(req, res, next) {
    try {
      const rawRefreshToken = req.body?.refreshToken || req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN];
      if (!rawRefreshToken) {
        return errorResponse(res, 'No active refresh session found', 401, null, 'UNAUTHENTICATED');
      }

      const meta = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };

      const result = await authService.refreshTokens(rawRefreshToken, meta);
      setAuthCookies(res, result);
      return successResponse(res, result.user, 'Token refreshed successfully');
    } catch (err) {
      clearAuthCookies(res);
      next(err);
    }
  },

  async me(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);
      return successResponse(res, user, 'Current user profile');
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      const rawRefreshToken = req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN];
      await authService.logout(rawRefreshToken);
      clearAuthCookies(res);
      return successResponse(res, null, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  },

  async logoutAll(req, res, next) {
    try {
      await authService.logoutAll(req.user.id);
      clearAuthCookies(res);
      return successResponse(res, null, 'Logged out from all devices');
    } catch (err) {
      next(err);
    }
  },

  async getSessions(req, res, next) {
    try {
      const currentToken = req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN];
      const sessions = await authService.getUserSessions(req.user.id, currentToken);
      return successResponse(res, sessions, 'Active user sessions');
    } catch (err) {
      next(err);
    }
  },

  async revokeSession(req, res, next) {
    try {
      const result = await authService.revokeSession(req.user.id, req.params.id);
      return successResponse(res, result, 'Session revoked');
    } catch (err) {
      next(err);
    }
  },

  async changePassword(req, res, next) {
    try {
      const result = await authService.changePassword(req.user.id, req.body);
      clearAuthCookies(res);
      return successResponse(res, result, 'Password changed successfully');
    } catch (err) {
      next(err);
    }
  },

  async requestPasswordReset(req, res, next) {
    try {
      const result = await authService.requestPasswordReset(req.body);
      return successResponse(res, result, 'Password reset requested');
    } catch (err) {
      next(err);
    }
  },

  async confirmPasswordReset(req, res, next) {
    try {
      const result = await authService.confirmPasswordReset(req.body);
      return successResponse(res, result, 'Password reset confirmed');
    } catch (err) {
      next(err);
    }
  },
};
