/**
 * Error Handler Middleware
 */

import { Elysia } from 'elysia';
import { AppError } from '../../shared/errors';
import { ErrorCode } from '../../types';

export const errorHandler = new Elysia({ name: 'error-handler' }).onError(
  ({ code, error, set }) => {
    // Handle AppError instances
    if (error instanceof AppError) {
      set.status = error.statusCode;
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      };
    }

    // Handle Elysia validation errors
    if (code === 'VALIDATION') {
      set.status = 400;
      return {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Validation failed',
          details: {
            errors: error.message,
          },
        },
      };
    }

    // Handle not found
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Resource not found',
        },
      };
    }

    // Handle unknown errors
    console.error('Unhandled error:', error);
    set.status = 500;
    return {
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'An unexpected error occurred. Please try again later.',
        requestId: crypto.randomUUID(),
      },
    };
  }
);
