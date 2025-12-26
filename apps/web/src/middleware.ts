import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for Authentication
 *
 * Since cookies are set by a different origin (API server), we cannot
 * access them in server-side middleware. Instead, we do minimal checks
 * here and rely on client-side auth guards in the app.
 *
 * The client-side auth (useSession hook) will redirect unauthenticated
 * users when components mount.
 */

// Routes that should redirect to dashboard if already authenticated
// We can check this client-side, so middleware just passes through
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // For auth routes, check if there's a session cookie hint
  // This is just a UX optimization - real auth check happens client-side
  const isAuthRoute = authRoutes.some((route) => pathname === route);

  if (isAuthRoute) {
    // Check for any auth-related cookie as a hint
    // The actual session validation happens on the API side
    const hasSessionHint = request.cookies.has('better-auth.session_token');

    if (hasSessionHint) {
      // User might be logged in, redirect to dashboard
      // If session is invalid, client-side will redirect back
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // For all other routes (including protected), let them through
  // Client-side auth guards will handle unauthenticated users
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled by backend)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files with extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
