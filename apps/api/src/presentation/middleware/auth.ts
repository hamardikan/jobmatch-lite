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
          secure: true, // Always secure for cross-origin
          sameSite: 'none', // Required for cross-origin cookies
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
          secure: true, // Always secure for cross-origin
          sameSite: 'none', // Required for cross-origin cookies
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

    // Clear the session cookie with proper cross-origin settings
    cookie['better-auth.session_token'].set({
      value: '',
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: 0, // Expire immediately
    });

    return { success: true };
  })

  // Social sign-in endpoint (initiates OAuth flow) - POST for Better Auth client
  .post('/api/auth/sign-in/social', async ({ request }) => {
    try {
      // Delegate to Better Auth's handler which sets state cookies properly
      return auth.handler(request);
    } catch (error) {
      console.error('Social sign-in error:', error);
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : 'Social sign in failed' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  })

  // Google OAuth callback - delegate to Better Auth handler
  .get('/api/auth/callback/google', async ({ request }) => {
    const frontendURL = process.env.FRONTEND_URL || 'https://jobmatch-web-mauve.vercel.app';

    try {
      // Use Better Auth's built-in handler for OAuth callback
      const response = await auth.handler(request);

      // Get cookies from Better Auth response
      const setCookie = response.headers.get('set-cookie');

      // If Better Auth returned a redirect
      if (response.status >= 300 && response.status < 400) {
        let location = response.headers.get('location');

        // If redirect is to a relative path (like /dashboard), prepend frontend URL
        if (location && !location.startsWith('http')) {
          location = `${frontendURL}${location.startsWith('/') ? '' : '/'}${location}`;
        }

        // Create redirect response with cookies
        return new Response(null, {
          status: 302,
          headers: {
            'Location': location || `${frontendURL}/dashboard`,
            ...(setCookie ? { 'Set-Cookie': setCookie } : {}),
          },
        });
      }

      // If response is an error redirect from Better Auth
      const responseText = await response.text();
      if (responseText.includes('error') || response.url?.includes('error')) {
        console.error('Better Auth OAuth error:', responseText);
        return new Response(null, {
          status: 302,
          headers: {
            'Location': `${frontendURL}/login?error=oauth_failed`,
          },
        });
      }

      // Success - redirect to dashboard with session cookie
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `${frontendURL}/dashboard`,
          ...(setCookie ? { 'Set-Cookie': setCookie } : {}),
        },
      });
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `${frontendURL}/login?error=oauth_failed`,
        },
      });
    }
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
