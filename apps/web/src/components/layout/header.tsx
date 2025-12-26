'use client';

import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LinkButton } from '@/components/ui/link-button';
import { UserMenu } from '@/components/user-menu';
import { FileText, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
  onMenuClick?: () => void;
  showMobileMenu?: boolean;
}

export function Header({ className, onMenuClick, showMobileMenu = true }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header
      className={cn(
        'sticky top-0 z-30 h-16',
        'bg-card/80 backdrop-blur-md',
        'border-b border-border',
        className
      )}
    >
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {showMobileMenu && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 -ml-2 text-foreground-secondary hover:text-foreground"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Logo - only show on mobile or when sidebar is hidden */}
          <Link href={session ? '/dashboard' : '/'} className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 bg-primary-900 dark:bg-primary-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white dark:text-primary-900" />
            </div>
            <span className="font-bold text-foreground">JobMatch</span>
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {session ? (
            <UserMenu />
          ) : (
            <div className="flex items-center gap-2">
              <LinkButton href="/login" variant="ghost" size="sm">
                Sign in
              </LinkButton>
              <LinkButton href="/register" size="sm">
                Get Started
              </LinkButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Simplified header for landing page
export function LandingHeader({ className }: { className?: string }) {
  const { data: session } = useSession();

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'bg-background/80 backdrop-blur-md',
        'border-b border-border/50',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-900 dark:bg-primary-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white dark:text-primary-900" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">JobMatch Lite</h1>
            </div>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {session ? (
              <LinkButton href="/dashboard" size="sm">
                Dashboard
              </LinkButton>
            ) : (
              <div className="flex items-center gap-2">
                <LinkButton href="/login" variant="ghost" size="sm">
                  Sign in
                </LinkButton>
                <LinkButton href="/register" size="sm">
                  Get Started
                </LinkButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
