/**
 * History Module Models
 *
 * Validation schemas for history API endpoints.
 */

import { t } from 'elysia';

export namespace HistoryModel {
  // Application status enum
  export const applicationStatus = t.Union([
    t.Literal('saved'),
    t.Literal('applied'),
    t.Literal('interviewing'),
    t.Literal('rejected'),
    t.Literal('offer'),
  ]);
  export type ApplicationStatus = typeof applicationStatus.static;

  // Query parameters for list endpoint with search/filter
  export const listQuery = t.Object({
    limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 })),
    offset: t.Optional(t.Numeric({ minimum: 0, default: 0 })),
    q: t.Optional(t.String({ description: 'Search across job title, company, resume filename, and job description' })),
    status: t.Optional(applicationStatus),
  });
  export type ListQuery = typeof listQuery.static;

  // Path parameter for single analysis
  export const idParam = t.Object({
    id: t.String({ format: 'uuid' }),
  });
  export type IdParam = typeof idParam.static;

  // Update status request body
  export const updateStatusBody = t.Object({
    status: applicationStatus,
    followUpDate: t.Optional(t.Nullable(t.String({ format: 'date-time' }))),
  });
  export type UpdateStatusBody = typeof updateStatusBody.static;

  // Single analysis response (with job tracker fields)
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
    // Job tracker fields
    jobTitle: t.Nullable(t.String()),
    companyName: t.Nullable(t.String()),
    location: t.Nullable(t.String()),
    applicationStatus: applicationStatus,
    dateApplied: t.Nullable(t.String()),
    followUpDate: t.Nullable(t.String()),
    updatedAt: t.Nullable(t.String()),
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

  // Update status response
  export const updateResponse = t.Object({
    success: t.Literal(true),
    data: analysisItem,
  });
  export type UpdateResponse = typeof updateResponse.static;
}
