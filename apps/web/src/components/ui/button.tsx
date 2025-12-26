'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles = cn(
      'inline-flex items-center justify-center font-medium',
      'transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:pointer-events-none',
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
      danger: cn(
        'bg-danger-500 text-white',
        'hover:bg-danger-600 active:bg-danger-700',
        'focus-visible:ring-danger-500'
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
      icon: 'h-10 w-10',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
