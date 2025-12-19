/**
 * History Module Models
 *
 * Validation schemas for history API endpoints.
 */

import { t } from 'elysia';

export namespace HistoryModel {
  // Query parameters for list endpoint
  export const listQuery = t.Object({
    limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 })),
    offset: t.Optional(t.Numeric({ minimum: 0, default: 0 })),
  });
  export type ListQuery = typeof listQuery.static;

  // Path parameter for single analysis
  export const idParam = t.Object({
    id: t.String({ format: 'uuid' }),
  });
  export type IdParam = typeof idParam.static;

  // Single analysis response
  export const analysisItem = t.Object({
    id: t.String(),
    resumeFilename: t.String(),
    jobDescriptionPreview: t.String(),
    score: t.Number(),
    explanation: t.String(),
    keyFindings: t.Object({
      strengths: t.Array(t.String()),
      gaps: t.Array(t.String()),
      suggestions: t.Array(t.String()),
    }),
    processingTime: t.Number(),
    createdAt: t.String(),
  });
  export type AnalysisItem = typeof analysisItem.static;

  // List response
  export const listResponse = t.Object({
    success: t.Literal(true),
    data: t.Object({
      items: t.Array(analysisItem),
      total: t.Number(),
      limit: t.Number(),
      offset: t.Number(),
    }),
  });
  export type ListResponse = typeof listResponse.static;

  // Single item response
  export const singleResponse = t.Object({
    success: t.Literal(true),
    data: analysisItem,
  });
  export type SingleResponse = typeof singleResponse.static;

  // Delete response
  export const deleteResponse = t.Object({
    success: t.Literal(true),
    data: t.Object({
      deleted: t.Boolean(),
    }),
  });
  export type DeleteResponse = typeof deleteResponse.static;
}
