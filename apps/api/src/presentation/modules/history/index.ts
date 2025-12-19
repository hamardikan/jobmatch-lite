/**
 * History Module Controller
 *
 * API endpoints for managing analysis history.
 */

import { Elysia } from 'elysia';
import { HistoryModel } from './model';
import { analysisRepository } from '@/infrastructure/repositories/analysis.repository';
import { AppError } from '@/shared/errors';
import { getAuthSession, type AuthContext } from '@/presentation/middleware/auth';

export const historyModule = new Elysia({ prefix: '/api/history' })
  // Guard to require authentication
  .guard({
    async beforeHandle({ request: { headers }, set }) {
      const authContext = await getAuthSession(headers);
      if (!authContext) {
        set.status = 401;
        throw AppError.unauthorized();
      }
    },
  })
  .resolve(async ({ request: { headers } }) => {
    const authContext = (await getAuthSession(headers)) as AuthContext;
    return { user: authContext.user, session: authContext.session };
  })

  // List user's analysis history
  .get(
    '/',
    async ({ user, query }) => {
      const limit = query.limit ?? 20;
      const offset = query.offset ?? 0;

      const [items, total] = await Promise.all([
        analysisRepository.findByUserId(user.id, { limit, offset }),
        analysisRepository.countByUserId(user.id),
      ]);

      return {
        success: true as const,
        data: {
          items: items.map((item) => ({
            id: item.id,
            resumeFilename: item.resumeFilename,
            jobDescriptionPreview: item.jobDescriptionPreview,
            score: item.score,
            explanation: item.explanation,
            keyFindings: item.keyFindings,
            processingTime: item.processingTime,
            createdAt: item.createdAt.toISOString(),
          })),
          total,
          limit,
          offset,
        },
      };
    },
    {
      query: HistoryModel.listQuery,
      response: {
        200: HistoryModel.listResponse,
      },
      detail: {
        tags: ['History'],
        summary: 'List analysis history',
        description: 'Get paginated list of past resume analyses for the authenticated user.',
      },
    }
  )

  // Get single analysis by ID
  .get(
    '/:id',
    async ({ user, params }) => {
      const analysis = await analysisRepository.findByIdAndUserId(
        params.id,
        user.id
      );

      if (!analysis) {
        throw AppError.notFound('Analysis not found');
      }

      return {
        success: true as const,
        data: {
          id: analysis.id,
          resumeFilename: analysis.resumeFilename,
          jobDescriptionPreview: analysis.jobDescriptionPreview,
          score: analysis.score,
          explanation: analysis.explanation,
          keyFindings: analysis.keyFindings,
          processingTime: analysis.processingTime,
          createdAt: analysis.createdAt.toISOString(),
        },
      };
    },
    {
      params: HistoryModel.idParam,
      response: {
        200: HistoryModel.singleResponse,
      },
      detail: {
        tags: ['History'],
        summary: 'Get analysis details',
        description: 'Get full details of a specific analysis by ID.',
      },
    }
  )

  // Delete analysis by ID
  .delete(
    '/:id',
    async ({ user, params }) => {
      const deleted = await analysisRepository.deleteByIdAndUserId(
        params.id,
        user.id
      );

      if (!deleted) {
        throw AppError.notFound('Analysis not found');
      }

      return {
        success: true as const,
        data: {
          deleted: true,
        },
      };
    },
    {
      params: HistoryModel.idParam,
      response: {
        200: HistoryModel.deleteResponse,
      },
      detail: {
        tags: ['History'],
        summary: 'Delete analysis',
        description: 'Delete a specific analysis from history.',
      },
    }
  );
