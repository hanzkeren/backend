import { Request, Response, NextFunction } from 'express';
import userService from './services';
import { AuthRequest } from '@/modules/auth/controllers';
import { catchAsync } from '@/middleware/errorHandler';

export interface GetAllUsersQuery extends Request {
  query: {
    page?: string;
    limit?: string;
    search?: string;
    role?: string;
    isActive?: string;
    emailVerified?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}

export interface CreateUserRequest extends Request {
  body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'user' | 'admin' | 'superadmin';
  };
}

export interface UpdateUserRequest extends Request {
  params: { id: string };
  body: {
    firstName?: string;
    lastName?: string;
    role?: 'user' | 'admin' | 'superadmin';
    isActive?: boolean;
    emailVerified?: boolean;
  };
}

export interface UpdatePasswordRequest extends Request {
  params: { id: string };
  body: {
    newPassword: string;
  };
}

class UserController {
  /**
   * Get all users (admin only)
   * GET /users
   */
  public getAllUsers = catchAsync(async (req: GetAllUsersQuery, res: Response) => {
    const queryOptions = {
      page: req.query.page ? parseInt(req.query.page) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      search: req.query.search,
      role: req.query.role,
      isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
      emailVerified: req.query.emailVerified ? req.query.emailVerified === 'true' : undefined,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };

    const result = await userService.getAllUsers(queryOptions);

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: result,
    });
  });

  /**
   * Get user by ID (admin or owner)
   * GET /users/:id
   */
  public getUserById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    const user = await userService.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: { user },
    });
  });

  /**
   * Create a new user (admin only)
   * POST /users
   */
  public createUser = catchAsync(async (req: CreateUserRequest, res: Response) => {
    const userData = req.body;

    const user = await userService.createUser(userData);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user },
    });
  });

  /**
   * Update user (admin or owner)
   * PUT /users/:id
   */
  public updateUser = catchAsync(async (req: UpdateUserRequest, res: Response) => {
    const { id } = req.params;
    const userId = parseInt(id);
    const updateData = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    const user = await userService.updateUser(userId, updateData);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user },
    });
  });

  /**
   * Delete user (admin only)
   * DELETE /users/:id
   */
  public deleteUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    const deleted = await userService.deleteUser(userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  });

  /**
   * Deactivate user (admin only)
   * POST /users/:id/deactivate
   */
  public deactivateUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    const user = await userService.deactivateUser(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      data: { user },
    });
  });

  /**
   * Activate user (admin only)
   * POST /users/:id/activate
   */
  public activateUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    const user = await userService.activateUser(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User activated successfully',
      data: { user },
    });
  });

  /**
   * Update user password (admin only)
   * PUT /users/:id/password
   */
  public updateUserPassword = catchAsync(async (req: UpdatePasswordRequest, res: Response) => {
    const { id } = req.params;
    const userId = parseInt(id);
    const { newPassword } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    await userService.updateUserPassword(userId, newPassword);

    res.status(200).json({
      success: true,
      message: 'User password updated successfully',
    });
  });

  /**
   * Verify user email (admin only)
   * POST /users/:id/verify-email
   */
  public verifyUserEmail = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    const user = await userService.verifyUserEmail(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User email verified successfully',
      data: { user },
    });
  });

  /**
   * Get user statistics (admin only)
   * GET /users/statistics
   */
  public getUserStatistics = catchAsync(async (req: Request, res: Response) => {
    const statistics = await userService.getUserStatistics();

    res.status(200).json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: statistics,
    });
  });
}

export default new UserController();