import rateLimit from 'express-rate-limit';
import { errorResponse } from '../utils/response.js';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, 'Too many login or auth attempts. Please try again later.', 429, null, 'RATE_LIMIT_EXCEEDED');
  },
});

export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 300, // Limit each IP to 300 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, 'Too many requests. Please slow down.', 429, null, 'RATE_LIMIT_EXCEEDED');
  },
});
