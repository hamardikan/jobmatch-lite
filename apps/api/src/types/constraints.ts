/**
 * File and input constraints
 */

export const FILE_CONSTRAINTS = {
  /** Maximum file size in bytes (5MB) */
  MAX_SIZE: 5 * 1024 * 1024,
  /** Allowed MIME types */
  ALLOWED_TYPES: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ] as const,
  /** Allowed file extensions */
  ALLOWED_EXTENSIONS: ['.pdf', '.docx'] as const,
} as const;

export const JOB_DESCRIPTION_CONSTRAINTS = {
  /** Minimum length in characters */
  MIN_LENGTH: 100,
  /** Maximum length in characters */
  MAX_LENGTH: 10000,
} as const;

export const RATE_LIMITS = {
  /** Analyze endpoint: requests per minute */
  ANALYZE: 10,
  /** Generate PDF endpoint: requests per minute */
  GENERATE_PDF: 5,
} as const;
