import { User } from '@/models';
import { Op } from 'sequelize';
import authService from '@/modules/auth/services';

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'user' | 'admin' | 'superadmin';
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  role?: 'user' | 'admin' | 'superadmin';
  isActive?: boolean;
  emailVerified?: boolean;
}

export interface UserQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedUsersResponse {
  users: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

class UserService {
  /**
   * Get all users with pagination and filtering
   */
  public async getAllUsers(queryOptions: UserQueryOptions): Promise<PaginatedUsersResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isActive,
      emailVerified,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryOptions;

    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};

    if (search) {
      whereClause[Op.or] = [
        {
          email: {
            [Op.iLike]: `%${search}%`,
          },
        },
        {
          firstName: {
            [Op.iLike]: `%${search}%`,
          },
        },
        {
          lastName: {
            [Op.iLike]: `%${search}%`,
          },
        },
      ];
    }

    if (role) {
      whereClause.role = role;
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    if (emailVerified !== undefined) {
      whereClause.emailVerified = emailVerified;
    }

    // Build order clause
    const orderClause: any[] = [];
    if (sortBy) {
      orderClause.push([sortBy, sortOrder.toUpperCase()]);
    } else {
      orderClause.push(['createdAt', 'DESC']);
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit.toString()),
      offset: offset,
      order: orderClause,
    });

    const totalPages = Math.ceil(count / limit);

    return {
      users: users.map(user => user.toJSON() as User),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get user by ID
   */
  public async getUserById(id: number): Promise<User | null> {
    const user = await User.findByPk(id);
    return user ? (user.toJSON() as User) : null;
  }

  /**
   * Create a new user (admin function)
   */
  public async createUser(userData: CreateUserDto): Promise<User> {
    const { email, password, firstName, lastName, role = 'user' } = userData;

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

    // Hash the password
    const hashedPassword = await authService.hashPassword(password);

    // Create the user
    const user = await User.create({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role,
      isActive: true,
      emailVerified: false,
    });

    // Remove password from response
    const userResponse = user.toJSON();
    return userResponse as User;
  }

  /**
   * Update user
   */
  public async updateUser(id: number, updateData: UpdateUserDto): Promise<User | null> {
    const user = await User.findByPk(id);
    if (!user) {
      return null;
    }

    // Update allowed fields
    if (updateData.firstName !== undefined) {
      user.firstName = updateData.firstName.trim();
    }
    if (updateData.lastName !== undefined) {
      user.lastName = updateData.lastName.trim();
    }
    if (updateData.role !== undefined) {
      user.role = updateData.role;
    }
    if (updateData.isActive !== undefined) {
      user.isActive = updateData.isActive;
    }
    if (updateData.emailVerified !== undefined) {
      user.emailVerified = updateData.emailVerified;
    }

    await user.save();

    const userResponse = user.toJSON();
    return userResponse as User;
  }

  /**
   * Delete user
   */
  public async deleteUser(id: number): Promise<boolean> {
    const user = await User.findByPk(id);
    if (!user) {
      return false;
    }

    await user.destroy();
    return true;
  }

  /**
   * Deactivate user (soft delete)
   */
  public async deactivateUser(id: number): Promise<User | null> {
    const user = await User.findByPk(id);
    if (!user) {
      return null;
    }

    user.isActive = false;
    await user.save();

    const userResponse = user.toJSON();
    return userResponse as User;
  }

  /**
   * Activate user
   */
  public async activateUser(id: number): Promise<User | null> {
    const user = await User.findByPk(id);
    if (!user) {
      return null;
    }

    user.isActive = true;
    await user.save();

    const userResponse = user.toJSON();
    return userResponse as User;
  }

  /**
   * Get user statistics
   */
  public async getUserStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    verifiedUsers: number;
    unverifiedUsers: number;
    usersByRole: { [key: string]: number };
  }> {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      verifiedUsers,
      unverifiedUsers,
      usersByRole,
    ] = await Promise.all([
      User.count(),
      User.count({ where: { isActive: true } }),
      User.count({ where: { isActive: false } }),
      User.count({ where: { emailVerified: true } }),
      User.count({ where: { emailVerified: false } }),
      User.findAll({
        attributes: [
          'role',
          [User.sequelize!.fn('COUNT', User.sequelize!.col('id')), 'count'],
        ],
        group: ['role'],
        raw: true,
      }),
    ]);

    const roleStats: { [key: string]: number } = {};
    (usersByRole as any[]).forEach((item: any) => {
      roleStats[item.role] = parseInt(item.count);
    });

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      verifiedUsers,
      unverifiedUsers,
      usersByRole: roleStats,
    };
  }

  /**
   * Update user password (admin function)
   */
  public async updateUserPassword(id: number, newPassword: string): Promise<void> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Hash the new password
    const hashedPassword = await authService.hashPassword(newPassword);

    // Update password
    await user.update({ password: hashedPassword });

    // Revoke all refresh tokens for this user
    authService.revokeAllUserRefreshTokens(id);
  }

  /**
   * Verify user email
   */
  public async verifyUserEmail(id: number): Promise<User | null> {
    const user = await User.findByPk(id);
    if (!user) {
      return null;
    }

    user.emailVerified = true;
    await user.save();

    const userResponse = user.toJSON();
    return userResponse as User;
  }
}

export default new UserService();