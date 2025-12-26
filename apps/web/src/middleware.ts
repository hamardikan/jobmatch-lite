import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for Authentication
 *
 * Provides server-side protection for routes before page rendering.
 * This prevents the flash of protected content for unauthenticated users.
 */

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/analyze', '/history', '/settings', '/compare'];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for Better Auth session cookie
  // Better Auth uses 'better-auth.session_token' for session tracking
  const sessionCookie = request.cookies.get('better-auth.session_token');
  const hasSession = !!sessionCookie?.value;

  // Check if accessing a protected route
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if accessing auth routes (login/register)
  const isAuthRoute = authRoutes.some((route) => pathname === route);

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing auth routes with active session
  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

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
