import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authRateLimiter } from '../middleware/rate-limit.middleware.js';
import {
  loginSchema,
  registerSchema,
  requestPasswordResetSchema,
  confirmPasswordResetSchema,
  changePasswordSchema,
} from '../validators/auth.validator.js';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.get('/me', authenticate, authController.me);
router.post('/logout', authController.logout);
router.post('/logout-all', authenticate, authController.logoutAll);
router.get('/sessions', authenticate, authController.getSessions);
router.delete('/sessions/:id', authenticate, authController.revokeSession);
router.post('/password-reset/request', authRateLimiter, validate(requestPasswordResetSchema), authController.requestPasswordReset);
router.post('/password-reset/confirm', authRateLimiter, validate(confirmPasswordResetSchema), authController.confirmPasswordReset);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

export default router;
