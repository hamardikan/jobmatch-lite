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
  });

  const data: ApiResponse<AnalysisResult> = await response.json();

  if (!data.success) {
    throw new Error(data.error.message);
  }

  return data.data;
}

/**
 * Generate PDF report HTML
 */
export async function generatePdfHtml(
  request: GeneratePdfRequest
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/generate-pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to generate PDF');
  }

  return response.text();
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
