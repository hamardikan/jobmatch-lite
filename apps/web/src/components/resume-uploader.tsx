'use client';

import { useCallback, useState, useRef } from 'react';
import { cn, formatFileSize } from '@/lib/utils';
import { FILE_CONSTRAINTS } from '@jobmatch/shared';

interface ResumeUploaderProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
}

export function ResumeUploader({
  file,
  onFileChange,
  disabled,
}: ResumeUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!FILE_CONSTRAINTS.ALLOWED_TYPES.includes(file.type as any)) {
      return 'Please upload a PDF or DOCX file';
    }
    if (file.size > FILE_CONSTRAINTS.MAX_SIZE) {
      return `File size must be under ${formatFileSize(FILE_CONSTRAINTS.MAX_SIZE)}`;
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      onFileChange(file);
    },
    [validateFile, onFileChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFile(droppedFile);
      }
    },
    [disabled, handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFile(selectedFile);
      }
    },
    [handleFile]
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  const handleRemove = useCallback(() => {
    onFileChange(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [onFileChange]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-900">Resume</h2>
        <span className="text-sm text-slate-500">PDF or DOCX, max 5MB</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {file ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-green-200 bg-green-50 rounded-xl">
          <div className="w-16 h-16 mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="font-medium text-slate-900 mb-1">{file.name}</p>
          <p className="text-sm text-slate-500 mb-4">{formatFileSize(file.size)}</p>
          <button
            onClick={handleRemove}
            disabled={disabled}
            className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            Remove file
          </button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors',
            isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="w-16 h-16 mb-4 bg-slate-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <p className="font-medium text-slate-900 mb-1">
            Drop your resume here or click to browse
          </p>
          <p className="text-sm text-slate-500">PDF or DOCX files only</p>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
