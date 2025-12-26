/**
 * Report Module Controller
 *
 * Handles PDF report generation from analysis results.
 */

import { Elysia } from 'elysia';
import { ReportModel } from './model';
import { pdfGenerator } from '../../../infrastructure/pdf';
import { analysisRepository } from '../../../infrastructure/repositories/analysis.repository';
import { AppError } from '../../../shared/errors';
import { getAuthSession, type AuthContext } from '../../middleware/auth';

export const reportModule = new Elysia({ prefix: '/api' })
  // Guard to require authentication
  .guard({
    async beforeHandle({ request: { headers }, set }) {
      const authContext = await getAuthSession(headers);
      if (!authContext) {
        set.status = 401;
        return {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        };
      }
    },
  })
  .resolve(async ({ request: { headers } }) => {
    const authContext = (await getAuthSession(headers)) as AuthContext;
    return { user: authContext.user, session: authContext.session };
  })
  .post(
    '/generate-pdf',
    async ({ body, user, set }) => {
      // Get the analysis from the database
      const analysis = await analysisRepository.findByIdAndUserId(
        body.analysisId,
        user.id
      );

      if (!analysis) {
        throw AppError.notFound('Analysis not found');
      }

      // Generate the PDF
      const pdfBuffer = await pdfGenerator.generateReport({
        score: analysis.score,
        explanation: analysis.explanation,
        keyFindings: analysis.keyFindings,
        processingTime: analysis.processingTime,
      });

      // Return as PDF binary
      set.headers['Content-Type'] = 'application/pdf';
      set.headers['Content-Disposition'] = `attachment; filename="analysis-report-${analysis.id}.pdf"`;

      return pdfBuffer;
    },
    {
      body: ReportModel.generateRequest,
      detail: {
        tags: ['Report'],
        summary: 'Generate PDF report',
        description: 'Generates a PDF report from an analysis result. Requires authentication.',
      },
    }
  );
