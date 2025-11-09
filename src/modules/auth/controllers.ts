import { Request, Response, NextFunction } from 'express';
import authService from './services';
import { User } from '@/models';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
  };
}

export interface SignupRequest extends Request {
  body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  };
}

export interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

export interface RefreshTokenRequest extends Request {
  body: {
    refreshToken: string;
  };
}

export interface ChangePasswordRequest extends AuthRequest {
  body: {
    currentPassword: string;
    newPassword: string;
  };
}

class AuthController {
  /**
   * Register a new user
   * POST /auth/signup
   */
  public async signup(req: SignupRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, firstName, lastName } = req.body;

      const user = await authService.signup({
        email,
        password,
        firstName,
        lastName,
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email for verification.',
        data: {
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Authenticate user and return tokens
   * POST /auth/login
   */
  public async login(req: LoginRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const { user, tokens } = await authService.login({
        email,
        password,
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  public async refreshToken(req: RefreshTokenRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      const tokens = await authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   * POST /auth/logout
   */
  public async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.body.refreshToken;

      if (refreshToken) {
        authService.logout(refreshToken);
      }

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   * GET /auth/me
   */
  public async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.status(200).json({
        success: true,
        data: {
          user: user.toJSON(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   * PUT /auth/me
   */
  public async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { firstName, lastName } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Update user fields
      if (firstName) user.firstName = firstName.trim();
      if (lastName) user.lastName = lastName.trim();

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: user.toJSON(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change user password
   * PUT /auth/change-password
   */
  public async changePassword(req: ChangePasswordRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      await authService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout from all devices
   * POST /auth/logout-all
   */
  public async logoutAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      // Revoke all refresh tokens for this user
      authService.revokeAllUserRefreshTokens(userId);

      res.status(200).json({
        success: true,
        message: 'Logged out from all devices successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify email (placeholder - implement email verification logic)
   * POST /auth/verify-email
   */
  public async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;

      // TODO: Implement email verification logic
      // This would involve:
      // 1. Verify the email verification token
      // 2. Update user's emailVerified status to true
      // 3. Remove the verification token

      res.status(200).json({
        success: true,
        message: 'Email verification feature not yet implemented',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request password reset (placeholder - implement password reset logic)
   * POST /auth/forgot-password
   */
  public async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      // TODO: Implement password reset logic
      // This would involve:
      // 1. Generate password reset token
      // 2. Send reset email to user
      // 3. Store token with expiration

      res.status(200).json({
        success: true,
        message: 'Password reset feature not yet implemented',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password (placeholder - implement password reset logic)
   * POST /auth/reset-password
   */
  public async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      // TODO: Implement password reset logic
      // This would involve:
      // 1. Verify reset token
      // 2. Update user password
      // 3. Remove reset token

      res.status(200).json({
        success: true,
        message: 'Password reset feature not yet implemented',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();