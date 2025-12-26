'use client';

import { useState, useRef, useEffect } from 'react';
import { Pencil, Loader2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditableFieldProps {
  value: string | null;
  placeholder?: string;
  onSave: (value: string | null) => Promise<void>;
  className?: string;
  inputClassName?: string;
  icon?: React.ReactNode;
}

export function EditableField({
  value,
  placeholder = 'Click to add...',
  onSave,
  className,
  inputClassName,
  icon,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset edit value when value prop changes
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value || '');
    }
  }, [value, isEditing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    const newValue = editValue.trim() || null;

    // No change, just exit edit mode
    if (newValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(newValue);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value || '');
      setIsEditing(false);
      setError(null);
    }
  };

  const handleBlur = () => {
    // Small delay to allow click events to register
    setTimeout(() => {
      if (isEditing && !isSaving) {
        handleSave();
      }
    }, 150);
  };

  if (isEditing) {
    return (
      <div className={cn('relative', className)}>
        <div className="flex items-center gap-2">
          {icon && <span className="text-foreground-muted shrink-0">{icon}</span>}
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            disabled={isSaving}
            placeholder={placeholder}
            className={cn(
              'flex-1 bg-background border border-primary-500 rounded px-2 py-1 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-primary-500',
              'disabled:opacity-50',
              inputClassName
            )}
          />
          {isSaving && (
            <Loader2 className="w-4 h-4 text-primary-500 animate-spin shrink-0" />
          )}
        </div>
        {error && (
          <p className="text-xs text-danger-500 mt-1">{error}</p>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className={cn(
        'group flex items-center gap-2 text-left w-full',
        'hover:bg-background-secondary rounded px-2 py-1 -mx-2 -my-1 transition-colors',
        className
      )}
    >
      {icon && <span className="text-foreground-muted shrink-0">{icon}</span>}
      <span className={cn(
        'flex-1 truncate',
        !value && 'text-foreground-muted italic'
      )}>
        {value || placeholder}
      </span>
      <Pencil className="w-3.5 h-3.5 text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </button>
  );
}
