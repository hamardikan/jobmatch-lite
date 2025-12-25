/**
 * Authentication Middleware
 *
 * Provides:
 * - Better-auth handler mounting at /api/auth/*
 * - Elysia macro for protecting routes with { auth: true }
 */

import { Elysia } from 'elysia';
import { auth, type User, type Session } from '../../infrastructure/auth';
import { db, session as sessionTable, user as userTable } from '../../infrastructure/db';
import { eq, and, gt } from 'drizzle-orm';

/**
 * Auth context injected into protected routes
 */
export interface AuthContext {
  user: User;
  session: Session;
  [key: string]: unknown;
}

/**
 * Helper to get session from request headers
 * Uses direct database lookup as workaround for Better Auth drizzle adapter issue
 */
export async function getAuthSession(
  headers: Headers | Record<string, string | undefined>
): Promise<AuthContext | null> {
  const headerObj = headers instanceof Headers ? headers : new Headers(headers as Record<string, string>);
  const cookieHeader = headerObj.get('cookie');

  if (!cookieHeader) {
    return null;
  }

  // Parse cookie to get session token
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [key, ...val] = c.trim().split('=');
      return [key, val.join('=')];
    })
  );

  const token = cookies['better-auth.session_token'];
  if (!token) {
    return null;
  }

  // Direct database lookup
  const now = new Date();
  const [sessionData] = await db
    .select()
    .from(sessionTable)
    .where(and(
      eq(sessionTable.token, token),
      gt(sessionTable.expiresAt, now)
    ));

  if (!sessionData) {
    return null;
  }

  const [userData] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, sessionData.userId));

  if (!userData) {
    return null;
  }

  return {
    user: userData as User,
    session: sessionData as Session,
  };
}

/**
 * Auth middleware that:
 * 1. Mounts better-auth routes at /api/auth/*
 * 2. Provides { auth: true } macro for protected routes
 */
export const authMiddleware = new Elysia({ name: 'auth' })
  // Sign up endpoint
  .post('/api/auth/sign-up/email', async ({ body, set, cookie }) => {
    try {
      const { email, password, name } = body as { email: string; password: string; name: string };
      const result = await auth.api.signUpEmail({
        body: { email, password, name },
      });

      // Set session cookie on sign-up (auto-login)
      if (result && 'token' in result) {
        cookie['better-auth.session_token'].set({
          value: result.token as string,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
      }

      return result;
    } catch (error) {
      set.status = 400;
      return { error: error instanceof Error ? error.message : 'Sign up failed' };
    }
  })

  // Sign in endpoint
  .post('/api/auth/sign-in/email', async ({ body, set, cookie }) => {
    try {
      const { email, password } = body as { email: string; password: string };
      const result = await auth.api.signInEmail({
        body: { email, password },
      });

      // Set session cookie
      if (result && 'token' in result) {
        cookie['better-auth.session_token'].set({
          value: result.token as string,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
      }

      return result;
    } catch (error) {
      set.status = 401;
      return { error: error instanceof Error ? error.message : 'Sign in failed' };
    }
  })

  // Get session endpoint
  .get('/api/auth/get-session', async ({ request }) => {
    const authContext = await getAuthSession(request.headers);
    if (!authContext) {
      return { session: null, user: null };
    }
    return { session: authContext.session, user: authContext.user };
  })

  // Sign out endpoint
  .post('/api/auth/sign-out', async ({ request, cookie }) => {
    await auth.api.signOut({
      headers: request.headers,
    });

    // Clear the session cookie
    cookie['better-auth.session_token'].remove();

    return { success: true };
  })

  // Add macro for protecting routes
  .macro({
    auth: {
      /**
       * When auth: true is set on a route, this resolver runs first.
       * If no valid session, returns 401.
       * If valid, injects user and session into handler context.
       */
      async resolve({ status, request: { headers } }) {
        const authContext = await getAuthSession(headers);

        if (!authContext) {
          return status(401, {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required',
            },
          });
        }

        return authContext;
      },
    },
  });
