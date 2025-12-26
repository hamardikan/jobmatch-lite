/**
 * History Module Controller
 *
 * API endpoints for managing analysis history.
 */

import { Elysia } from 'elysia';
import { HistoryModel } from './model';
import { analysisRepository } from '../../../infrastructure/repositories/analysis.repository';
import { AppError } from '../../../shared/errors';
import { getAuthSession, type AuthContext } from '../../middleware/auth';

export const historyModule = new Elysia({ prefix: '/api/history' })
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

  // List user's analysis history with search/filter
  .get(
    '/',
    async ({ user, query }) => {
      const limit = query.limit ?? 20;
      const offset = query.offset ?? 0;
      const searchOptions = {
        q: query.q,
        status: query.status,
        limit,
        offset,
      };

      const [items, total] = await Promise.all([
        analysisRepository.searchByUserId(user.id, searchOptions),
        analysisRepository.countByUserIdWithFilters(user.id, searchOptions),
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
            // Job tracker fields
            jobTitle: item.jobTitle,
            companyName: item.companyName,
            location: item.location,
            applicationStatus: item.applicationStatus as 'saved' | 'applied' | 'interviewing' | 'rejected' | 'offer',
            dateApplied: item.dateApplied?.toISOString() ?? null,
            followUpDate: item.followUpDate?.toISOString() ?? null,
            updatedAt: item.updatedAt?.toISOString() ?? null,
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
        description: 'Get paginated list of past resume analyses with optional search and status filter.',
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
          // Job tracker fields
          jobTitle: analysis.jobTitle,
          companyName: analysis.companyName,
          location: analysis.location,
          applicationStatus: analysis.applicationStatus as 'saved' | 'applied' | 'interviewing' | 'rejected' | 'offer',
          dateApplied: analysis.dateApplied?.toISOString() ?? null,
          followUpDate: analysis.followUpDate?.toISOString() ?? null,
          updatedAt: analysis.updatedAt?.toISOString() ?? null,
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

  // Update application status
  .patch(
    '/:id',
    async ({ user, params, body }) => {
      // Auto-set dateApplied when changing to "applied" status
      const dateApplied = body.status === 'applied' ? new Date() : undefined;
      const followUpDate = body.followUpDate ? new Date(body.followUpDate) : undefined;

      const updated = await analysisRepository.updateByIdAndUserId(
        params.id,
        user.id,
        {
          applicationStatus: body.status,
          dateApplied,
          followUpDate,
        }
      );

      if (!updated) {
        throw AppError.notFound('Analysis not found');
      }

      return {
        success: true as const,
        data: {
          id: updated.id,
          resumeFilename: updated.resumeFilename,
          jobDescriptionPreview: updated.jobDescriptionPreview,
          score: updated.score,
          explanation: updated.explanation,
          keyFindings: updated.keyFindings,
          processingTime: updated.processingTime,
          createdAt: updated.createdAt.toISOString(),
          jobTitle: updated.jobTitle,
          companyName: updated.companyName,
          location: updated.location,
          applicationStatus: updated.applicationStatus as 'saved' | 'applied' | 'interviewing' | 'rejected' | 'offer',
          dateApplied: updated.dateApplied?.toISOString() ?? null,
          followUpDate: updated.followUpDate?.toISOString() ?? null,
          updatedAt: updated.updatedAt?.toISOString() ?? null,
        },
      };
    },
    {
      params: HistoryModel.idParam,
      body: HistoryModel.updateStatusBody,
      response: {
        200: HistoryModel.updateResponse,
      },
      detail: {
        tags: ['History'],
        summary: 'Update application status',
        description: 'Update the application status and follow-up date for a specific analysis.',
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
