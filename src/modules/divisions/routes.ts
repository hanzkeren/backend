import { Router } from 'express';
import divisionController from './controllers';
import { authenticateToken, requireAdmin } from '@/middleware/auth';
import { validateRequest, validateQuery, validateParams } from '@/middleware/validation';
import {
  createDivisionSchema,
  updateDivisionSchema,
  divisionQuerySchema,
  divisionIdParamSchema,
  reorderDivisionsSchema,
} from './validation';

const router = Router();

/**
 * @route GET /divisions
 * @desc Get all divisions with pagination and filtering
 * @access Public
 */
router.get('/',
  validateQuery(divisionQuerySchema),
  divisionController.getAllDivisions
);

/**
 * @route GET /divisions/active
 * @desc Get active divisions only
 * @access Public
 */
router.get('/active',
  divisionController.getActiveDivisions
);

/**
 * @route POST /divisions
 * @desc Create a new division
 * @access Private (Admin only)
 */
router.post('/',
  authenticateToken,
  requireAdmin,
  validateRequest(createDivisionSchema),
  divisionController.createDivision
);

/**
 * @route PUT /divisions/reorder
 * @desc Reorder divisions
 * @access Private (Admin only)
 */
router.put('/reorder',
  authenticateToken,
  requireAdmin,
  validateRequest(reorderDivisionsSchema),
  divisionController.reorderDivisions
);

/**
 * @route GET /divisions/:id
 * @desc Get division by ID
 * @access Public
 */
router.get('/:id',
  validateParams(divisionIdParamSchema),
  divisionController.getDivisionById
);

/**
 * @route GET /divisions/:id/statistics
 * @desc Get division statistics
 * @access Public
 */
router.get('/:id/statistics',
  validateParams(divisionIdParamSchema),
  divisionController.getDivisionStatistics
);

/**
 * @route PUT /divisions/:id
 * @desc Update division
 * @access Private (Admin only)
 */
router.put('/:id',
  authenticateToken,
  requireAdmin,
  validateParams(divisionIdParamSchema),
  validateRequest(updateDivisionSchema),
  divisionController.updateDivision
);

/**
 * @route DELETE /divisions/:id
 * @desc Delete division
 * @access Private (Admin only)
 */
router.delete('/:id',
  authenticateToken,
  requireAdmin,
  validateParams(divisionIdParamSchema),
  divisionController.deleteDivision
);

/**
 * @route POST /divisions/:id/activate
 * @desc Activate division
 * @access Private (Admin only)
 */
router.post('/:id/activate',
  authenticateToken,
  requireAdmin,
  validateParams(divisionIdParamSchema),
  divisionController.activateDivision
);

/**
 * @route POST /divisions/:id/deactivate
 * @desc Deactivate division
 * @access Private (Admin only)
 */
router.post('/:id/deactivate',
  authenticateToken,
  requireAdmin,
  validateParams(divisionIdParamSchema),
  divisionController.deactivateDivision
);

export default router;