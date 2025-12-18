/**
 * Analysis Module Controller
 */

import { Elysia } from 'elysia';
import { AnalysisModel } from './model';
import { AnalyzeResumeUseCase } from '@/application/analyze-resume.usecase';
import { FileParserAdapter } from '@/infrastructure/parsing/file-parser.adapter';
import { OpenRouterAdapter } from '@/infrastructure/ai/openrouter.adapter';

// Create dependencies
const createUseCase = () => {
  const fileParser = new FileParserAdapter();
  const aiAnalyzer = new OpenRouterAdapter(
    process.env.OPENROUTER_API_KEY || ''
  );
  return new AnalyzeResumeUseCase(fileParser, aiAnalyzer);
};

export const analysisModule = new Elysia({ prefix: '/api' }).post(
  '/analyze',
  async ({ body }) => {
    const useCase = createUseCase();
    const result = await useCase.execute(body.resume, body.jobDescription);

    return {
      success: true as const,
      data: result,
    };
  },
  {
    body: AnalysisModel.requestBody,
    response: {
      200: AnalysisModel.successResponse,
    },
    detail: {
      tags: ['Analysis'],
      summary: 'Analyze resume against job description',
      description: `
        Parses the uploaded resume file, extracts text content, and uses AI to
        analyze how well the resume matches the provided job description.
      `,
    },
  }
);
