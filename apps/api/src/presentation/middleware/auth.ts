/**
 * Authentication Middleware
 *
 * Provides:
 * - Better-auth handler mounting at /api/auth/*
 * - Elysia macro for protecting routes with { auth: true }
 */

import { Elysia } from 'elysia';
import { auth, type User, type Session } from '@/infrastructure/auth';

/**
 * Auth middleware that:
 * 1. Mounts better-auth routes at /api/auth/*
 * 2. Provides { auth: true } macro for protected routes
 */
export const authMiddleware = new Elysia({ name: 'auth' })
  // Mount better-auth handler for all auth routes
  .mount('/api/auth', auth.handler)

  // Add macro for protecting routes
  .macro({
    auth: {
      /**
       * When auth: true is set on a route, this resolver runs first.
       * If no valid session, returns 401.
       * If valid, injects user and session into handler context.
       */
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({
          headers: new Headers(headers),
        });

        if (!session) {
          return status(401, {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required',
            },
          });
        }

        return {
          user: session.user as User,
          session: session.session as Session,
        };
      },
    },
  });

// Type helper for routes that use auth: true
export type AuthContext = {
  user: User;
  session: Session;
};
