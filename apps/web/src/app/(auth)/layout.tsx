'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';

/**
 * Auth Layout
 *
 * Wraps login/register pages. Redirects authenticated users to dashboard.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Check if user is authenticated (session has user data)
  const isAuthenticated = session?.user?.id;

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (!isPending && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isPending, router]);

  // Show loading state while checking auth
  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary-200 dark:border-primary-800 rounded-full animate-spin border-t-primary-600 dark:border-t-primary-400" />
          <p className="text-foreground-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, show redirecting (the useEffect will handle actual redirect)
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary-200 dark:border-primary-800 rounded-full animate-spin border-t-primary-600 dark:border-t-primary-400" />
          <p className="text-foreground-secondary">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
