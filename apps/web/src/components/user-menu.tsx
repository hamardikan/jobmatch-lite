'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import { ChevronDown, History, Settings, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (isPending) {
    return (
      <div className="w-8 h-8 rounded-full bg-background-secondary animate-pulse" />
    );
  }

  if (!session?.user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  const initials = session.user.name?.[0]?.toUpperCase() || session.user.email[0].toUpperCase();

  return (
    <div className="relative" data-testid="user-menu">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded-lg',
          'hover:bg-background-secondary',
          'transition-colors duration-200'
        )}
        data-testid="user-menu-button"
      >
        <div className="w-8 h-8 rounded-full bg-primary-900 dark:bg-primary-100 flex items-center justify-center text-white dark:text-primary-900 text-sm font-medium">
          {initials}
        </div>
        <span className="text-sm font-medium text-foreground hidden sm:block max-w-[120px] truncate">
          {session.user.name || session.user.email}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-foreground-muted transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-card rounded-xl shadow-strong border border-border py-1 z-50 animate-slide-down">
            {/* User info */}
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-medium text-foreground truncate">
                {session.user.name || 'User'}
              </p>
              <p className="text-xs text-foreground-muted truncate">
                {session.user.email}
              </p>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground-secondary hover:bg-background-secondary hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                href="/history"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground-secondary hover:bg-background-secondary hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <History className="w-4 h-4" />
                Analysis History
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground-secondary hover:bg-background-secondary hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </div>

            {/* Sign out */}
            <div className="border-t border-border py-1">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-danger-600 dark:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-700/10 transition-colors"
                data-testid="sign-out-button"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
