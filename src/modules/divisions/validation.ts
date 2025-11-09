import Joi from 'joi';

/**
 * Validation schema for creating a division
 */
export const createDivisionSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'Division name must be at least 1 character long',
      'string.max': 'Division name must be less than 100 characters long',
      'any.required': 'Division name is required',
    }),
  description: Joi.string()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description must be less than 1000 characters long',
    }),
  sortOrder: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.base': 'Sort order must be a number',
      'number.integer': 'Sort order must be an integer',
      'number.min': 'Sort order must be at least 0',
    }),
  isActive: Joi.boolean()
    .optional()
    .default(true)
    .messages({
      'boolean.base': 'Is active must be a boolean',
    }),
});

/**
 * Validation schema for updating a division
 */
export const updateDivisionSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .optional()
    .messages({
      'string.min': 'Division name must be at least 1 character long',
      'string.max': 'Division name must be less than 100 characters long',
    }),
  description: Joi.string()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description must be less than 1000 characters long',
    }),
  sortOrder: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Sort order must be a number',
      'number.integer': 'Sort order must be an integer',
      'number.min': 'Sort order must be at least 0',
    }),
  isActive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Is active must be a boolean',
    }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

/**
 * Validation schema for division query parameters
 */
export const divisionQuerySchema = Joi.object({
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
  isActive: Joi.boolean()
    .optional(),
  sortBy: Joi.string()
    .valid('id', 'name', 'description', 'sortOrder', 'isActive', 'createdAt', 'updatedAt')
    .optional()
    .default('sortOrder')
    .messages({
      'any.only': 'Sort field must be one of: id, name, description, sortOrder, isActive, createdAt, updatedAt',
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('asc')
    .messages({
      'any.only': 'Sort order must be either asc or desc',
    }),
});

/**
 * Validation schema for division ID parameter
 */
export const divisionIdParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Division ID must be a number',
      'number.integer': 'Division ID must be an integer',
      'number.positive': 'Division ID must be a positive number',
      'any.required': 'Division ID is required',
    }),
});

/**
 * Validation schema for reordering divisions
 */
export const reorderDivisionsSchema = Joi.object({
  divisions: Joi.array()
    .items(
      Joi.object({
        id: Joi.number()
          .integer()
          .positive()
          .required()
          .messages({
            'number.base': 'Division ID must be a number',
            'number.integer': 'Division ID must be an integer',
            'number.positive': 'Division ID must be a positive number',
            'any.required': 'Division ID is required',
          }),
        sortOrder: Joi.number()
          .integer()
          .min(0)
          .required()
          .messages({
            'number.base': 'Sort order must be a number',
            'number.integer': 'Sort order must be an integer',
            'number.min': 'Sort order must be at least 0',
            'any.required': 'Sort order is required',
          }),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one division must be provided',
      'any.required': 'Divisions array is required',
    }),
});

export default {
  createDivisionSchema,
  updateDivisionSchema,
  divisionQuerySchema,
  divisionIdParamSchema,
  reorderDivisionsSchema,
};