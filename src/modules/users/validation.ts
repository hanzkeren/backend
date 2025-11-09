import Joi from 'joi';

/**
 * Validation schema for creating a user
 */
export const createUserSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};\':"\\|,.<>\\/?])'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password must be less than 128 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required',
    }),
  firstName: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'First name must be at least 1 character long',
      'string.max': 'First name must be less than 100 characters long',
      'any.required': 'First name is required',
    }),
  lastName: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'Last name must be at least 1 character long',
      'string.max': 'Last name must be less than 100 characters long',
      'any.required': 'Last name is required',
    }),
  role: Joi.string()
    .valid('user', 'admin', 'superadmin')
    .optional()
    .default('user')
    .messages({
      'any.only': 'Role must be one of: user, admin, superadmin',
    }),
});

/**
 * Validation schema for updating a user
 */
export const updateUserSchema = Joi.object({
  firstName: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .optional()
    .messages({
      'string.min': 'First name must be at least 1 character long',
      'string.max': 'First name must be less than 100 characters long',
    }),
  lastName: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .optional()
    .messages({
      'string.min': 'Last name must be at least 1 character long',
      'string.max': 'Last name must be less than 100 characters long',
    }),
  role: Joi.string()
    .valid('user', 'admin', 'superadmin')
    .optional()
    .messages({
      'any.only': 'Role must be one of: user, admin, superadmin',
    }),
  isActive: Joi.boolean()
    .optional(),
  emailVerified: Joi.boolean()
    .optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

/**
 * Validation schema for updating user password (admin)
 */
export const updateUserPasswordSchema = Joi.object({
  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};\':"\\|,.<>\\/?])'))
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters long',
      'string.max': 'New password must be less than 128 characters long',
      'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'New password is required',
    }),
});

/**
 * Validation schema for user query parameters
 */
export const userQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1',
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit must be at most 100',
    }),
  search: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Search term must be less than 100 characters long',
    }),
  role: Joi.string()
    .valid('user', 'admin', 'superadmin')
    .optional()
    .messages({
      'any.only': 'Role filter must be one of: user, admin, superadmin',
    }),
  isActive: Joi.boolean()
    .optional(),
  emailVerified: Joi.boolean()
    .optional(),
  sortBy: Joi.string()
    .valid('id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'emailVerified', 'createdAt', 'updatedAt', 'lastLogin')
    .optional()
    .default('createdAt')
    .messages({
      'any.only': 'Sort field must be one of: id, email, firstName, lastName, role, isActive, emailVerified, createdAt, updatedAt, lastLogin',
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc',
    }),
});

/**
 * Validation schema for user ID parameter
 */
export const userIdParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be a positive number',
      'any.required': 'User ID is required',
    }),
});

export default {
  createUserSchema,
  updateUserSchema,
  updateUserPasswordSchema,
  userQuerySchema,
  userIdParamSchema,
};