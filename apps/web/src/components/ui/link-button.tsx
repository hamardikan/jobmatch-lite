'use client';

import Link, { type LinkProps } from 'next/link';
import { cn } from '@/lib/utils';

interface LinkButtonProps extends LinkProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children: React.ReactNode;
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: LinkButtonProps) {
  const baseStyles = cn(
    'inline-flex items-center justify-center font-medium',
    'transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'rounded-lg select-none'
  );

  const variants = {
    primary: cn(
      'bg-primary-900 text-white',
      'hover:bg-primary-800 active:bg-primary-950',
      'focus-visible:ring-primary-500',
      'dark:bg-primary-100 dark:text-primary-900',
      'dark:hover:bg-primary-200 dark:active:bg-primary-50'
    ),
    secondary: cn(
      'bg-background-secondary text-foreground',
      'hover:bg-primary-100 active:bg-primary-200',
      'border border-border hover:border-border-hover',
      'focus-visible:ring-primary-500',
      'dark:hover:bg-primary-800/50 dark:active:bg-primary-800'
    ),
    ghost: cn(
      'text-foreground-secondary',
      'hover:bg-background-secondary hover:text-foreground',
      'focus-visible:ring-primary-500'
    ),
    outline: cn(
      'border-2 border-primary-900 text-primary-900',
      'hover:bg-primary-900 hover:text-white',
      'active:bg-primary-950',
      'focus-visible:ring-primary-500',
      'dark:border-primary-100 dark:text-primary-100',
      'dark:hover:bg-primary-100 dark:hover:text-primary-900'
    ),
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-12 px-6 text-base gap-2',
    xl: 'h-14 px-8 text-lg gap-2.5',
  };

  return (
    <Link
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </Link>
  );
}
