import { Router } from 'express';
import authController from './controllers';
import { validateRequest } from '@/middleware/validation';
import { authenticateToken } from '@/middleware/auth';
import {
  signupSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './validation';

const router = Router();

/**
 * @route POST /auth/signup
 * @desc Register a new user
 * @access Public
 */
router.post('/signup', validateRequest(signupSchema), authController.signup);

/**
 * @route POST /auth/login
 * @desc Authenticate user and get tokens
 * @access Public
 */
router.post('/login', validateRequest(loginSchema), authController.login);

/**
 * @route POST /auth/refresh
 * @desc Refresh access token
 * @access Public
 */
router.post('/refresh', validateRequest(refreshTokenSchema), authController.refreshToken);

/**
 * @route POST /auth/logout
 * @desc Logout user (revoke refresh token)
 * @access Public
 */
router.post('/logout', authController.logout);

/**
 * @route POST /auth/logout-all
 * @desc Logout from all devices
 * @access Private
 */
router.post('/logout-all', authenticateToken, authController.logoutAll);

/**
 * @route GET /auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', authenticateToken, authController.getProfile);

/**
 * @route PUT /auth/me
 * @desc Update current user profile
 * @access Private
 */
router.put('/me',
  authenticateToken,
  validateRequest(updateProfileSchema),
  authController.updateProfile
);

/**
 * @route PUT /auth/change-password
 * @desc Change user password
 * @access Private
 */
router.put('/change-password',
  authenticateToken,
  validateRequest(changePasswordSchema),
  authController.changePassword
);

/**
 * @route POST /auth/verify-email
 * @desc Verify user email
 * @access Public
 */
router.post('/verify-email',
  validateRequest(verifyEmailSchema),
  authController.verifyEmail
);

/**
 * @route POST /auth/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post('/forgot-password',
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword
);

/**
 * @route POST /auth/reset-password
 * @desc Reset password with token
 * @access Public
 */
router.post('/reset-password',
  validateRequest(resetPasswordSchema),
  authController.resetPassword
);

export default router;