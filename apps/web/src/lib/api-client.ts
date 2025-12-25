/**
 * API Client for JobMatch Lite Backend
 */

import type { AnalysisResult, ApiResponse, GeneratePdfRequest } from '@jobmatch/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Analyze resume against job description
 */
export async function analyzeResume(
  resume: File,
  jobDescription: string
): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('resume', resume);
  formData.append('jobDescription', jobDescription);

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  // Handle 401 - redirect to login
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Authentication required');
  }

  // Try to parse as JSON, handle errors gracefully
  let data: ApiResponse<AnalysisResult>;
  try {
    data = await response.json();
  } catch {
    throw new Error('Server error. Please try again.');
  }

  if (!data.success) {
    throw new Error(data.error.message);
  }

  return data.data;
}

/**
 * Generate and download PDF report
 * Returns a Blob containing the PDF file
 */
export async function downloadPdfReport(
  request: GeneratePdfRequest
): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/generate-pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
    credentials: 'include',
  });

  if (!response.ok) {
    // Try to parse error message if JSON
    try {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate PDF');
    } catch {
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }

  return response.blob();
}

/**
 * Check API health
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();
    return data.status === 'healthy';
  } catch {
    return false;
  }
}
