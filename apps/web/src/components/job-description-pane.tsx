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
        <h2 className="text-lg font-semibold text-slate-900">Job Description</h2>
        <span
          className={`text-sm ${
            isTooShort
              ? 'text-amber-600'
              : isValid
              ? 'text-green-600'
              : 'text-slate-500'
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
        className="flex-1 h-[400px]"
        error={isTooShort ? `Minimum ${minLength} characters required` : undefined}
      />

      {charCount > maxLength && (
        <p className="mt-1 text-sm text-red-500">
          Maximum {maxLength.toLocaleString()} characters exceeded
        </p>
      )}
    </div>
  );
}
