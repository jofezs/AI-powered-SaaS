import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ApiResponse } from '../types';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

const handleCastError = (err: mongoose.Error.CastError): AppError =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateKeyError = (err: { keyValue: Record<string, unknown> }): AppError => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(
    `${field.charAt(0).toUpperCase() + field.slice(1)} already in use`,
    409
  );
};

const handleValidationError = (err: mongoose.Error.ValidationError): AppError => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(`Validation failed: ${messages.join('. ')}`, 400);
};

const handleJWTError = (): AppError =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = (): AppError =>
  new AppError('Your session has expired. Please log in again.', 401);

export const errorHandler = (
  err: Error & {
    statusCode?: number;
    code?: number;
    keyValue?: Record<string, unknown>;
  },
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = { ...err, message: err.message };

  if (err instanceof mongoose.Error.CastError) {
    error = handleCastError(err);
  } else if (err.code === 11000 && err.keyValue) {
    error = handleDuplicateKeyError(err as { keyValue: Record<string, unknown> });
  } else if (err instanceof mongoose.Error.ValidationError) {
    error = handleValidationError(err);
  } else if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  } else if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  const statusCode = (error as AppError).statusCode ?? 500;
  const isProduction = process.env.NODE_ENV === 'production';

  const message =
    statusCode === 500 && isProduction
      ? 'Something went wrong. Please try again later.'
      : error.message;

  const response: ApiResponse = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};