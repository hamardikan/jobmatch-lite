'use client';

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string | boolean;
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, showCount, maxLength, value, ...props }, ref) => {
    const charCount = typeof value === 'string' ? value.length : 0;
    const hasError = !!error;

    return (
      <div className="w-full relative">
        <textarea
          ref={ref}
          className={cn(
            'flex min-h-[160px] w-full rounded-lg px-4 py-3',
            'bg-card text-foreground text-sm',
            'border border-border',
            'placeholder:text-foreground-muted',
            'transition-colors duration-200',
            'hover:border-border-hover',
            'focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'resize-y',
            hasError && 'border-danger-500 focus:ring-danger-500/20 focus:border-danger-500',
            showCount && maxLength && 'pb-8',
            className
          )}
          value={value}
          maxLength={maxLength}
          {...props}
        />
        {showCount && maxLength && (
          <div className="absolute bottom-3 right-4 text-xs text-foreground-muted pointer-events-none">
            <span className={charCount > maxLength * 0.9 ? 'text-warning-500' : ''}>
              {charCount.toLocaleString()}
            </span>
            {' / '}
            {maxLength.toLocaleString()}
          </div>
        )}
        {typeof error === 'string' && error && (
          <p className="mt-1.5 text-sm text-danger-500">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
