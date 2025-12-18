/**
 * Report Module Models (Elysia Validation Schemas)
 */

import { t } from 'elysia';

export namespace ReportModel {
  // Key findings schema
  export const keyFindings = t.Object({
    strengths: t.Array(t.String()),
    gaps: t.Array(t.String()),
    suggestions: t.Array(t.String()),
  });

  // Request body schema
  export const requestBody = t.Object({
    score: t.Number({ minimum: 0, maximum: 100 }),
    explanation: t.String(),
    keyFindings: keyFindings,
    jobTitle: t.Optional(t.String({ maxLength: 200 })),
    companyName: t.Optional(t.String({ maxLength: 200 })),
    candidateName: t.Optional(t.String({ maxLength: 200 })),
    analyzedAt: t.Optional(t.String()),
  });
}
