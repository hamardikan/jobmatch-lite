import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind CSS support
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format file size to human readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get score category and color
 */
export function getScoreCategory(score: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (score >= 80) {
    return { label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
  }
  if (score >= 60) {
    return { label: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
  }
  if (score >= 40) {
    return { label: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
  }
  return { label: 'Poor', color: 'text-red-600', bgColor: 'bg-red-100' };
}
