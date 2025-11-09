import { Request, Response, NextFunction } from 'express';
import authService from '@/modules/auth/services';
import { AuthRequest } from '@/modules/auth/controllers';

/**
 * Middleware to authenticate JWT token
 */
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
      return;
    }

    const payload = authService.verifyAccessToken(token);
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';

    res.status(401).json({
      success: false,
      message: errorMessage,
    });
  }
};

/**
 * Middleware to check if user has required role
 */
export const requireRole = (roles: string | string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to require admin role (admin or superadmin)
 */
export const requireAdmin = requireRole(['admin', 'superadmin']);

/**
 * Middleware to require superadmin role
 */
export const requireSuperAdmin = requireRole('superadmin');

/**
 * Middleware to require user role (any authenticated user)
 */
export const requireUser = requireRole(['user', 'admin', 'superadmin']);

/**
 * Middleware to check if user owns the resource or is admin
 */
export const requireOwnershipOrAdmin = (getUserId: (req: Request) => number | Promise<number>) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      // Admins and superadmins can access any resource
      if (req.user.role === 'admin' || req.user.role === 'superadmin') {
        next();
        return;
      }

      // Check if user owns the resource
      const resourceUserId = await getUserId(req);

      if (req.user.userId !== resourceUserId) {
        res.status(403).json({
          success: false,
          message: 'Access denied: You can only access your own resources',
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error checking resource ownership',
      });
    }
  };
};

/**
 * Middleware to optionally authenticate (doesn't fail if no token provided)
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token) {
      const payload = authService.verifyAccessToken(token);
      req.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };
    }

    next();
  } catch (error) {
    // Continue without authentication for optional routes
    next();
  }
};

/**
 * Middleware to validate refresh token
 */
export const validateRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
      return;
    }

    authService.verifyRefreshToken(refreshToken);
    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid refresh token';

    res.status(401).json({
      success: false,
      message: errorMessage,
    });
  }
};

export default {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireSuperAdmin,
  requireUser,
  requireOwnershipOrAdmin,
  optionalAuth,
  validateRefreshToken,
};