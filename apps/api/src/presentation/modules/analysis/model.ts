/**
 * Analysis Module Models (Elysia Validation Schemas)
 */

import { t } from 'elysia';
import { FILE_CONSTRAINTS, JOB_DESCRIPTION_CONSTRAINTS } from '../../../types';

export namespace AnalysisModel {
  // Request schema
  export const requestBody = t.Object({
    resume: t.File({
      maxSize: FILE_CONSTRAINTS.MAX_SIZE,
      type: FILE_CONSTRAINTS.ALLOWED_TYPES as unknown as string[],
    }),
    jobDescription: t.String({
      minLength: JOB_DESCRIPTION_CONSTRAINTS.MIN_LENGTH,
      maxLength: JOB_DESCRIPTION_CONSTRAINTS.MAX_LENGTH,
    }),
  });

  // Key findings schema
  export const keyFindings = t.Object({
    strengths: t.Array(t.String()),
    gaps: t.Array(t.String()),
    suggestions: t.Array(t.String()),
  });

  // Analysis result schema
  export const analysisResult = t.Object({
    id: t.Optional(t.String()),
    score: t.Number({ minimum: 0, maximum: 100 }),
    explanation: t.String(),
    keyFindings: keyFindings,
    processingTime: t.Number(),
  });

  // Success response schema
  export const successResponse = t.Object({
    success: t.Literal(true),
    data: analysisResult,
  });

  // Error detail schema
  export const errorDetail = t.Object({
    code: t.String(),
    message: t.String(),
    details: t.Optional(t.Unknown()),
    requestId: t.Optional(t.String()),
  });

  // Error response schema
  export const errorResponse = t.Object({
    success: t.Literal(false),
    error: errorDetail,
  });
}
