'use client';

import { Textarea } from '@/components/ui/textarea';
import { JOB_DESCRIPTION_CONSTRAINTS } from '@/types';

interface JobDescriptionPaneProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function JobDescriptionPane({
  value,
  onChange,
  disabled,
}: JobDescriptionPaneProps) {
  const charCount = value.length;
  const minLength = JOB_DESCRIPTION_CONSTRAINTS.MIN_LENGTH;
  const maxLength = JOB_DESCRIPTION_CONSTRAINTS.MAX_LENGTH;
  const isValid = charCount >= minLength && charCount <= maxLength;
  const isTooShort = charCount > 0 && charCount < minLength;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-foreground">Job Description</h2>
        <span
          className={`text-sm ${
            isTooShort
              ? 'text-warning-600 dark:text-warning-500'
              : isValid
              ? 'text-success-600 dark:text-success-500'
              : 'text-foreground-muted'
          }`}
        >
          {charCount.toLocaleString()} / {minLength.toLocaleString()}+ chars
        </span>
      </div>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the job description here...

Include the full job posting with requirements, responsibilities, and preferred qualifications for best results."
        disabled={disabled}
        className="flex-1 min-h-[300px] lg:min-h-[400px]"
        error={isTooShort ? `Minimum ${minLength} characters required` : undefined}
        showCount
        maxLength={maxLength}
      />
    </div>
  );
}
