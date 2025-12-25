/**
 * Report Module Controller
 *
 * Generates PDF reports from analysis results using Puppeteer
 * with @sparticuz/chromium for serverless compatibility.
 */

import { Elysia } from 'elysia';
import { ReportModel } from './model';
import { GenerateReportUseCase } from '@/application/generate-report.usecase';
import { generatePdfFromHtml } from '@/infrastructure/pdf/puppeteer.adapter';
import { AppError } from '@/shared/errors';

const useCase = new GenerateReportUseCase();

export const reportModule = new Elysia({ prefix: '/api' }).post(
  '/generate-pdf',
  async ({ body, set }) => {
    try {
      // Generate HTML from analysis results
      const html = useCase.execute(body);

      // Convert HTML to PDF using Puppeteer
      const pdfBuffer = await generatePdfFromHtml(html);

      // Set response headers for PDF download
      set.headers['Content-Type'] = 'application/pdf';
      set.headers['Content-Disposition'] = `attachment; filename="JobMatch-Report-${Date.now()}.pdf"`;
      set.headers['Content-Length'] = pdfBuffer.length.toString();

      return pdfBuffer;
    } catch (error) {
      console.error('PDF generation error:', error);
      throw AppError.pdfGenerationError();
    }
  },
  {
    body: ReportModel.requestBody,
    detail: {
      tags: ['Reports'],
      summary: 'Generate PDF report from analysis results',
      description: `
        Generates a downloadable PDF report from the analysis results.
        Uses Puppeteer with @sparticuz/chromium to render HTML to PDF server-side.
        Returns the PDF file as a binary download.
      `,
    },
  }
);
