import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

/**
 * Custom AppError class for operational errors
 */
export class CustomError extends Error implements AppError {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle validation errors from Sequelize
 */
const handleSequelizeValidationError = (err: any): CustomError => {
  const errors = err.errors.map((error: any) => ({
    field: error.path,
    message: error.message,
  }));

  const message = 'Validation failed';
  return new CustomError(message, 400);
};

/**
 * Handle duplicate field errors from Sequelize
 */
const handleSequelizeUniqueConstraintError = (err: any): CustomError => {
  const field = err.errors[0]?.path || 'field';
  const value = err.errors[0]?.value || 'value';
  const message = `Duplicate ${field}: ${value}. Please use another value.`;
  return new CustomError(message, 400);
};

/**
 * Handle foreign key constraint errors from Sequelize
 */
const handleSequelizeForeignKeyConstraintError = (err: any): CustomError => {
  const message = 'Invalid reference. The specified resource does not exist.';
  return new CustomError(message, 400);
};

/**
 * Handle JWT errors
 */
const handleJWTError = (): CustomError => {
  return new CustomError('Invalid token. Please log in again.', 401);
};

const handleJWTExpiredError = (): CustomError => {
  return new CustomError('Your token has expired. Please log in again.', 401);
};

/**
 * Send error response in development
 */
const sendErrorDev = (err: AppError, res: Response): void => {
  res.status(err.statusCode || 500).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/**
 * Send error response in production
 */
const sendErrorProd = (err: AppError, res: Response): void => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong!',
    });
  }
};

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (err.name === 'SequelizeValidationError') {
      error = handleSequelizeValidationError(err);
    } else if (err.name === 'SequelizeUniqueConstraintError') {
      error = handleSequelizeUniqueConstraintError(err);
    } else if (err.name === 'SequelizeForeignKeyConstraintError') {
      error = handleSequelizeForeignKeyConstraintError(err);
    } else if (err.name === 'JsonWebTokenError') {
      error = handleJWTError();
    } else if (err.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    } else if (err.name === 'CastError') {
      error = new CustomError('Invalid ID format', 400);
    }

    sendErrorProd(error, res);
  }
};

/**
 * Handle unhandled promise rejections
 */
export const handleUnhandledRejections = (): void => {
  process.on('unhandledRejection', (err: Error) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
  });
};

/**
 * Handle uncaught exceptions
 */
export const handleUncaughtExceptions = (): void => {
  process.on('uncaughtException', (err: Error) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
  });
};

/**
 * 404 Not Found middleware
 */
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const err = new CustomError(`Can't find ${req.originalUrl} on this server!`, 404);
  next(err);
};

/**
 * Async error wrapper for catching async errors
 */
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default {
  CustomError,
  errorHandler,
  notFound,
  catchAsync,
  handleUnhandledRejections,
  handleUncaughtExceptions,
};