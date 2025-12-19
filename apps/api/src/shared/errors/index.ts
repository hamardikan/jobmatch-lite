/**
 * Application errors
 */

import { ErrorCode } from '@jobmatch/shared';

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }

  static validation(message: string, details?: Record<string, unknown>): AppError {
    return new AppError(ErrorCode.VALIDATION_ERROR, message, 400, details);
  }

  static invalidFileType(details?: Record<string, unknown>): AppError {
    return new AppError(
      ErrorCode.INVALID_FILE_TYPE,
      'Unsupported file type. Please upload a PDF or DOCX file.',
      400,
      details
    );
  }

  static fileTooLarge(details?: Record<string, unknown>): AppError {
    return new AppError(
      ErrorCode.FILE_TOO_LARGE,
      'File size exceeds the 5MB limit',
      400,
      details
    );
  }

  static fileParseError(details?: Record<string, unknown>): AppError {
    return new AppError(
      ErrorCode.FILE_PARSE_ERROR,
      'Unable to parse the uploaded file. The file may be corrupted or password-protected.',
      422,
      details
    );
  }

  static emptyContent(): AppError {
    return new AppError(
      ErrorCode.EMPTY_CONTENT,
      'No text content could be extracted from the resume',
      422,
      { reason: 'File appears to be empty or contains only images' }
    );
  }

  static aiServiceError(details?: Record<string, unknown>): AppError {
    return new AppError(
      ErrorCode.AI_SERVICE_ERROR,
      'Unable to connect to AI analysis service. Please try again.',
      502,
      details
    );
  }

  static timeout(): AppError {
    return new AppError(
      ErrorCode.TIMEOUT,
      'The analysis request timed out. Please try again.',
      504
    );
  }

  static rateLimitExceeded(retryAfter: number): AppError {
    return new AppError(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      'Too many requests. Please try again later.',
      429,
      { retryAfter }
    );
  }

  static internal(message = 'An unexpected error occurred. Please try again later.'): AppError {
    return new AppError(ErrorCode.INTERNAL_ERROR, message, 500);
  }

  static pdfGenerationError(): AppError {
    return new AppError(
      ErrorCode.PDF_GENERATION_ERROR,
      'Failed to generate PDF report. Please try again.',
      500
    );
  }

  static unauthorized(message = 'Authentication required'): AppError {
    return new AppError(ErrorCode.UNAUTHORIZED, message, 401);
  }

  static notFound(message = 'Resource not found'): AppError {
    return new AppError(ErrorCode.NOT_FOUND, message, 404);
  }
}
