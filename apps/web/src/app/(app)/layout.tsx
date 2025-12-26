'use client';

import { useSession } from '@/lib/auth-client';
import { AppLayout } from '@/components/layout/app-layout';

/**
 * Authenticated Layout
 *
 * This layout wraps all protected routes in the (app) group.
 * Server-side protection is handled by middleware.ts.
 * This component provides loading state during hydration.
 */
export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();

  // Show loading state while checking auth (during hydration)
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

  // Middleware handles redirect, but prevent flash during client hydration
  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary-200 dark:border-primary-800 rounded-full animate-spin border-t-primary-600 dark:border-t-primary-400" />
          <p className="text-foreground-secondary">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}
