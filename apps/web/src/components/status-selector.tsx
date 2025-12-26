'use client';

import { useState } from 'react';
import { Check, ChevronDown, Bookmark, Send, Phone, XCircle, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ApplicationStatus } from './ui/badge';

interface StatusOption {
  value: ApplicationStatus;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const statusOptions: StatusOption[] = [
  { value: 'saved', label: 'Saved', icon: <Bookmark className="w-4 h-4" />, color: 'text-gray-600' },
  { value: 'applied', label: 'Applied', icon: <Send className="w-4 h-4" />, color: 'text-blue-600' },
  { value: 'interviewing', label: 'Interviewing', icon: <Phone className="w-4 h-4" />, color: 'text-amber-600' },
  { value: 'rejected', label: 'Rejected', icon: <XCircle className="w-4 h-4" />, color: 'text-red-600' },
  { value: 'offer', label: 'Offer', icon: <Trophy className="w-4 h-4" />, color: 'text-green-600' },
];

interface StatusSelectorProps {
  value: ApplicationStatus;
  onChange: (status: ApplicationStatus) => void;
  disabled?: boolean;
  className?: string;
}

export function StatusSelector({ value, onChange, disabled, className }: StatusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentOption = statusOptions.find((opt) => opt.value === value) || statusOptions[0];

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
          'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
          'hover:bg-gray-50 dark:hover:bg-gray-750',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          disabled && 'opacity-50 cursor-not-allowed',
          currentOption.color
        )}
      >
        {currentOption.icon}
        <span>{currentOption.label}</span>
        <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 mt-1 w-full min-w-[160px] py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-2 text-sm',
                  'hover:bg-gray-50 dark:hover:bg-gray-750',
                  option.color,
                  option.value === value && 'bg-gray-50 dark:bg-gray-750'
                )}
              >
                {option.icon}
                <span className="flex-1 text-left">{option.label}</span>
                {option.value === value && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
