/**
 * API Client for JobMatch Lite Backend
 */

import type { AnalysisResult, ApiResponse, GeneratePdfRequest, KeyFindings } from '@/types';

export type ApplicationStatus = 'saved' | 'applied' | 'interviewing' | 'rejected' | 'offer';

export interface HistoryItem {
  id: string;
  resumeFilename: string;
  jobDescriptionPreview: string;
  score: number;
  explanation: string;
  keyFindings: KeyFindings;
  processingTime: number;
  createdAt: string;
  // Job tracker fields
  jobTitle: string | null;
  companyName: string | null;
  location: string | null;
  applicationStatus: ApplicationStatus;
  dateApplied: string | null;
  followUpDate: string | null;
  updatedAt: string | null;
}

export interface HistoryResponse {
  items: HistoryItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface SearchHistoryOptions {
  q?: string;
  status?: ApplicationStatus;
  limit?: number;
  offset?: number;
}

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

/**
 * Get user profile
 */
export async function getUserProfile(): Promise<{ id: string; name: string; email: string }> {
  const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
    method: 'GET',
    credentials: 'include',
  });

  if (response.status === 401) {
    throw new Error('Authentication required');
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to get profile');
  }

  return data.data;
}

/**
 * Update user profile
 */
export async function updateUserProfile(name: string): Promise<{ id: string; name: string; email: string }> {
  const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
    credentials: 'include',
  });

  if (response.status === 401) {
    throw new Error('Authentication required');
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to update profile');
  }

  return data.data;
}

/**
 * Change password
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/user/password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currentPassword, newPassword }),
    credentials: 'include',
  });

  if (response.status === 401) {
    throw new Error('Authentication required');
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to change password');
  }
}

/**
 * Get analysis history with search and filters
 */
export async function getHistory(options: SearchHistoryOptions = {}): Promise<HistoryResponse> {
  const { q, status, limit = 50, offset = 0 } = options;
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  if (q) params.set('q', q);
  if (status) params.set('status', status);

  const response = await fetch(
    `${API_BASE_URL}/api/history?${params.toString()}`,
    {
      method: 'GET',
      credentials: 'include',
    }
  );

  if (response.status === 401) {
    throw new Error('Authentication required');
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to get history');
  }

  return data.data;
}

export interface UpdateApplicationData {
  status?: ApplicationStatus;
  jobTitle?: string | null;
  companyName?: string | null;
  location?: string | null;
  followUpDate?: string | null;
}

/**
 * Update application (status, job details, follow-up date)
 */
export async function updateApplication(
  id: string,
  data: UpdateApplicationData
): Promise<HistoryItem> {
  const response = await fetch(`${API_BASE_URL}/api/history/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (response.status === 401) {
    throw new Error('Authentication required');
  }

  if (response.status === 404) {
    throw new Error('Analysis not found');
  }

  const jsonData = await response.json();
  if (!jsonData.success) {
    throw new Error(jsonData.error?.message || 'Failed to update');
  }

  return jsonData.data;
}

/**
 * Update application status (convenience wrapper)
 */
export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
  followUpDate?: string | null
): Promise<HistoryItem> {
  return updateApplication(id, { status, followUpDate });
}

/**
 * Get single analysis by ID
 */
export async function getAnalysisById(id: string): Promise<HistoryItem> {
  const response = await fetch(`${API_BASE_URL}/api/history/${id}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (response.status === 401) {
    throw new Error('Authentication required');
  }

  if (response.status === 404) {
    throw new Error('Analysis not found');
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to get analysis');
  }

  return data.data;
}
