/**
 * API response and error types
 */

/** All possible error codes from the API */
export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_PARSE_ERROR: 'FILE_PARSE_ERROR',
  EMPTY_CONTENT: 'EMPTY_CONTENT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  PDF_GENERATION_ERROR: 'PDF_GENERATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/** Error detail structure */
export interface ApiError {
  /** Machine-readable error code */
  code: ErrorCode;
  /** Human-readable error message */
  message: string;
  /** Additional error context */
  details?: Record<string, unknown>;
  /** Request ID for debugging (on 500 errors) */
  requestId?: string;
}

/** Success response wrapper */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/** Error response wrapper */
export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}

/** Union type for all API responses */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/** Health check response */
export interface HealthResponse {
  /** Overall service health status */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** API version */
  version: string;
  /** Current server timestamp */
  timestamp: string;
  /** Status of dependent services */
  services?: {
    openRouter?: 'connected' | 'disconnected';
    puppeteer?: 'ready' | 'unavailable';
  };
  /** Service uptime in seconds */
  uptime?: number;
}
