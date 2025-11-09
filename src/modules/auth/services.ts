import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@/models';
import { Op } from 'sequelize';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

class AuthService {
  private readonly saltRounds = 12;
  private readonly accessTokenExpiry = process.env.JWT_EXPIRE || '15m';
  private readonly refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRE || '7d';

  // In production, use Redis or a database for refresh token storage
  private refreshTokens = new Set<string>();

  /**
   * Hash a password using bcrypt
   */
  public async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Compare a password with its hash
   */
  public async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate JWT tokens for a user
   */
  public generateTokens(user: User): AuthTokens {
    const payload: Omit<JWTPayload, 'type'> = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(
      { ...payload, type: 'access' },
      process.env.JWT_SECRET!,
      { expiresIn: this.accessTokenExpiry }
    );

    const refreshToken = jwt.sign(
      { ...payload, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: this.refreshTokenExpiry }
    );

    // Store refresh token (in production, use Redis)
    this.refreshTokens.add(refreshToken);

    return { accessToken, refreshToken };
  }

  /**
   * Verify and decode JWT token
   */
  public verifyToken(token: string, secret: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, secret) as JWTPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Verify access token
   */
  public verifyAccessToken(token: string): JWTPayload {
    const payload = this.verifyToken(token, process.env.JWT_SECRET!);
    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }
    return payload;
  }

  /**
   * Verify refresh token
   */
  public verifyRefreshToken(token: string): JWTPayload {
    const payload = this.verifyToken(token, process.env.JWT_REFRESH_SECRET!);
    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    // Check if refresh token is still valid (stored in memory/Redis)
    if (!this.refreshTokens.has(token)) {
      throw new Error('Refresh token revoked');
    }

    return payload;
  }

  /**
   * Revoke a refresh token
   */
  public revokeRefreshToken(token: string): void {
    this.refreshTokens.delete(token);
  }

  /**
   * Revoke all refresh tokens for a user
   */
  public revokeAllUserRefreshTokens(userId: number): void {
    // In production, you would filter by user ID from stored tokens
    // For now, we'll clear all tokens (simplified approach)
    this.refreshTokens.clear();
  }

  /**
   * Refresh access token using refresh token
   */
  public async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const payload = this.verifyRefreshToken(refreshToken);

    // Get the user from database to ensure they still exist and are active
    const user = await User.findByPk(payload.userId);
    if (!user || !user.isActive) {
      this.revokeRefreshToken(refreshToken);
      throw new Error('User not found or inactive');
    }

    // Revoke old refresh token and generate new tokens
    this.revokeRefreshToken(refreshToken);
    return this.generateTokens(user);
  }

  /**
   * Register a new user
   */
  public async signup(signupData: SignupData): Promise<User> {
    const { email, password, firstName, lastName } = signupData;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email: email.toLowerCase() },
        ],
      },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Validate password strength
    this.validatePassword(password);

    // Hash the password
    const hashedPassword = await this.hashPassword(password);

    // Create the user
    const user = await User.create({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: 'user', // Default role
      isActive: true,
      emailVerified: false, // Email verification should be implemented separately
    });

    // Remove password from response
    const userResponse = user.toJSON();
    return userResponse as User;
  }

  /**
   * Authenticate user and generate tokens
   */
  public async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const { email, password } = credentials;

    // Find user by email
    const user = await User.findOne({
      where: {
        email: email.toLowerCase().trim(),
        isActive: true,
      },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Update last login
    await user.updateLastLogin();

    // Remove password from response
    const userResponse = user.toJSON();
    return { user: userResponse as User, tokens };
  }

  /**
   * Logout user by revoking refresh token
   */
  public logout(refreshToken: string): void {
    this.revokeRefreshToken(refreshToken);
  }

  /**
   * Validate password strength
   */
  private validatePassword(password: string): void {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      throw new Error('Password must be less than 128 characters long');
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    // Check for at least one number
    if (!/\d/.test(password)) {
      throw new Error('Password must contain at least one number');
    }

    // Check for at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      throw new Error('Password must contain at least one special character');
    }
  }

  /**
   * Change user password
   */
  public async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password
    this.validatePassword(newPassword);

    // Check if new password is different from current
    const isSamePassword = await this.comparePassword(newPassword, user.password);
    if (isSamePassword) {
      throw new Error('New password must be different from current password');
    }

    // Hash and update password
    const hashedNewPassword = await this.hashPassword(newPassword);
    await user.update({ password: hashedNewPassword });

    // Revoke all refresh tokens for this user
    this.revokeAllUserRefreshTokens(userId);
  }
}

export default new AuthService();