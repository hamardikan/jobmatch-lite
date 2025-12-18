/**
 * Report Module Controller
 */

import { Elysia } from 'elysia';
import { ReportModel } from './model';
import { GenerateReportUseCase } from '@/application/generate-report.usecase';

const useCase = new GenerateReportUseCase();

export const reportModule = new Elysia({ prefix: '/api' }).post(
  '/generate-pdf',
  async ({ body, set }) => {
    const html = useCase.execute(body);

    // For V1, return HTML that can be converted to PDF on client
    // In production, this could use Puppeteer with @sparticuz/chromium
    set.headers['Content-Type'] = 'text/html';
    return html;
  },
  {
    body: ReportModel.requestBody,
    detail: {
      tags: ['Reports'],
      summary: 'Generate PDF report from analysis results',
      description: `
        Generates a downloadable PDF report from the analysis results.
        Returns HTML that can be printed to PDF on the client side.
      `,
    },
  }
);
