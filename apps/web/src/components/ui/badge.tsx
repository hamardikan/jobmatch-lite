'use client';

import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-100',
    success: 'bg-success-100 text-success-700 dark:bg-success-700/20 dark:text-success-500',
    warning: 'bg-warning-100 text-warning-700 dark:bg-warning-700/20 dark:text-warning-500',
    danger: 'bg-danger-100 text-danger-700 dark:bg-danger-700/20 dark:text-danger-500',
    info: 'bg-accent-100 text-accent-700 dark:bg-accent-700/20 dark:text-accent-400',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

// Score-specific badge
interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ScoreBadge({ score, size = 'md', showLabel = true, className }: ScoreBadgeProps) {
  const getScoreInfo = (score: number) => {
    if (score >= 90) return { label: 'Excellent', variant: 'success' as const };
    if (score >= 75) return { label: 'Good', variant: 'info' as const };
    if (score >= 60) return { label: 'Moderate', variant: 'warning' as const };
    if (score >= 40) return { label: 'Needs Work', variant: 'warning' as const };
    return { label: 'Poor', variant: 'danger' as const };
  };

  const { label, variant } = getScoreInfo(score);

  return (
    <Badge variant={variant} size={size} className={className}>
      {score}%{showLabel && ` ${label}`}
    </Badge>
  );
}

// Application status badge
export type ApplicationStatus = 'saved' | 'applied' | 'interviewing' | 'rejected' | 'offer';

interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig: Record<ApplicationStatus, { label: string; variant: BadgeProps['variant'] }> = {
  saved: { label: 'Saved', variant: 'default' },
  applied: { label: 'Applied', variant: 'info' },
  interviewing: { label: 'Interviewing', variant: 'warning' },
  rejected: { label: 'Rejected', variant: 'danger' },
  offer: { label: 'Offer', variant: 'success' },
};

export function StatusBadge({ status, size = 'sm', className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.saved;

  return (
    <Badge variant={config.variant} size={size} className={className}>
      {config.label}
    </Badge>
  );
}
