/**
 * Analysis Module Controller
 */

import { Elysia } from 'elysia';
import { AnalysisModel } from './model';
import { AnalyzeResumeUseCase } from '../../../application/analyze-resume.usecase';
import { FileParserAdapter } from '../../../infrastructure/parsing/file-parser.adapter';
import { OpenRouterAdapter } from '../../../infrastructure/ai/openrouter.adapter';
import { analysisRepository } from '../../../infrastructure/repositories/analysis.repository';
import { getAuthSession, type AuthContext } from '../../middleware/auth';
import { AppError } from '../../../shared/errors';

// Create dependencies
const createUseCase = () => {
  const fileParser = new FileParserAdapter();
  const aiAnalyzer = new OpenRouterAdapter(
    process.env.OPENROUTER_API_KEY || ''
  );
  return new AnalyzeResumeUseCase(fileParser, aiAnalyzer, analysisRepository);
};

export const analysisModule = new Elysia({ prefix: '/api' })
  // Guard to require authentication and inject user context
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
    '/analyze',
    async ({ body, user }) => {
      const useCase = createUseCase();
      const result = await useCase.execute(body.resume, body.jobDescription, {
        userId: user.id,
        filename: body.resume.name,
      });

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
        Requires authentication. Results are saved to user's history.
      `,
      },
    }
  );
