import { Router } from 'express';
import userController from './controllers';
import { authenticateToken, requireAdmin, requireSuperAdmin } from '@/middleware/auth';
import { validateRequest, validateQuery, validateParams } from '@/middleware/validation';
import {
  createUserSchema,
  updateUserSchema,
  updateUserPasswordSchema,
  userQuerySchema,
  userIdParamSchema,
} from './validation';

const router = Router();

/**
 * @route GET /users
 * @desc Get all users with pagination and filtering
 * @access Private (Admin only)
 */
router.get('/',
  authenticateToken,
  requireAdmin,
  validateQuery(userQuerySchema),
  userController.getAllUsers
);

/**
 * @route GET /users/statistics
 * @desc Get user statistics
 * @access Private (Admin only)
 */
router.get('/statistics',
  authenticateToken,
  requireAdmin,
  userController.getUserStatistics
);

/**
 * @route GET /users/:id
 * @desc Get user by ID
 * @access Private (Admin or user owner)
 */
router.get('/:id',
  authenticateToken,
  validateParams(userIdParamSchema),
  userController.getUserById
);

/**
 * @route POST /users
 * @desc Create a new user
 * @access Private (Admin only)
 */
router.post('/',
  authenticateToken,
  requireAdmin,
  validateRequest(createUserSchema),
  userController.createUser
);

/**
 * @route PUT /users/:id
 * @desc Update user
 * @access Private (Admin or user owner)
 */
router.put('/:id',
  authenticateToken,
  validateParams(userIdParamSchema),
  validateRequest(updateUserSchema),
  userController.updateUser
);

/**
 * @route DELETE /users/:id
 * @desc Delete user
 * @access Private (Admin only)
 */
router.delete('/:id',
  authenticateToken,
  requireAdmin,
  validateParams(userIdParamSchema),
  userController.deleteUser
);

/**
 * @route POST /users/:id/activate
 * @desc Activate user
 * @access Private (Admin only)
 */
router.post('/:id/activate',
  authenticateToken,
  requireAdmin,
  validateParams(userIdParamSchema),
  userController.activateUser
);

/**
 * @route POST /users/:id/deactivate
 * @desc Deactivate user
 * @access Private (Admin only)
 */
router.post('/:id/deactivate',
  authenticateToken,
  requireAdmin,
  validateParams(userIdParamSchema),
  userController.deactivateUser
);

/**
 * @route PUT /users/:id/password
 * @desc Update user password
 * @access Private (Admin only)
 */
router.put('/:id/password',
  authenticateToken,
  requireAdmin,
  validateParams(userIdParamSchema),
  validateRequest(updateUserPasswordSchema),
  userController.updateUserPassword
);

/**
 * @route POST /users/:id/verify-email
 * @desc Verify user email
 * @access Private (Admin only)
 */
router.post('/:id/verify-email',
  authenticateToken,
  requireAdmin,
  validateParams(userIdParamSchema),
  userController.verifyUserEmail
);

export default router;