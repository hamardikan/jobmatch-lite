'use client';

import { useCallback, useState, useRef } from 'react';
import { cn, formatFileSize } from '@/lib/utils';
import { FILE_CONSTRAINTS } from '@/types';
import { Upload, CheckCircle, X, FileText } from 'lucide-react';

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
    if (!FILE_CONSTRAINTS.ALLOWED_TYPES.includes(file.type as typeof FILE_CONSTRAINTS.ALLOWED_TYPES[number])) {
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
    <div className="flex flex-col h-full" data-testid="resume-uploader">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-foreground">Resume</h2>
        <span className="text-sm text-foreground-muted">PDF or DOCX, max 5MB</span>
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
        <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-success-500/50 bg-success-50 dark:bg-success-700/10 rounded-xl min-h-[200px]">
          <div className="w-16 h-16 mb-4 bg-success-100 dark:bg-success-700/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-success-600 dark:text-success-500" />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-foreground-secondary" />
            <p className="font-medium text-foreground" data-testid="uploaded-file-name">
              {file.name}
            </p>
          </div>
          <p className="text-sm text-foreground-secondary mb-4">{formatFileSize(file.size)}</p>
          <button
            onClick={handleRemove}
            disabled={disabled}
            className="flex items-center gap-1.5 text-sm text-danger-600 dark:text-danger-500 hover:text-danger-700 dark:hover:text-danger-400 disabled:opacity-50 transition-colors"
          >
            <X className="w-4 h-4" />
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
            'flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all min-h-[200px]',
            isDragging
              ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
              : 'border-border hover:border-border-hover hover:bg-background-secondary',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="w-16 h-16 mb-4 bg-background-secondary rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-foreground-muted" />
          </div>
          <p className="font-medium text-foreground mb-1 text-center">
            Drop your resume here or click to browse
          </p>
          <p className="text-sm text-foreground-muted text-center">PDF or DOCX files only</p>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-danger-500" data-testid="upload-error">
          {error}
        </p>
      )}
    </div>
  );
}
