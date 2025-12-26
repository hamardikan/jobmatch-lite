/**
 * Report Module Models
 *
 * Request/response schemas for PDF report generation.
 */

import { t } from 'elysia';

export namespace ReportModel {
  export const generateRequest = t.Object({
    analysisId: t.String({ minLength: 1 }),
  });

  export type GenerateRequest = typeof generateRequest.static;
}
