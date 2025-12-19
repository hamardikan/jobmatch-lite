'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { UserMenu } from '@/components/user-menu';

interface AnalysisItem {
  id: string;
  resumeFilename: string;
  jobDescriptionPreview: string;
  score: number;
  explanation: string;
  keyFindings: {
    strengths: string[];
    gaps: string[];
    suggestions: string[];
  };
  processingTime: number;
  createdAt: string;
}

interface HistoryResponse {
  success: boolean;
  data: {
    items: AnalysisItem[];
    total: number;
    limit: number;
    offset: number;
  };
}

function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600 bg-green-50';
  if (score >= 75) return 'text-blue-600 bg-blue-50';
  if (score >= 60) return 'text-yellow-600 bg-yellow-50';
  if (score >= 40) return 'text-orange-600 bg-orange-50';
  return 'text-red-600 bg-red-50';
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Moderate';
  if (score >= 40) return 'Weak';
  return 'Poor';
}

export default function HistoryPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    try {
      const response = await fetch(`${apiUrl}/api/history`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch history');
      }

      const data: HistoryResponse = await response.json();
      setAnalyses(data.data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
      return;
    }

    if (session) {
      fetchHistory();
    }
  }, [session, isPending, router, fetchHistory]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this analysis?')) return;

    setDeletingId(id);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    try {
      const response = await fetch(`${apiUrl}/api/history/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete analysis');
      }

      setAnalyses(analyses.filter((a) => a.id !== id));
      if (selectedAnalysis?.id === id) {
        setSelectedAnalysis(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  if (isPending || (isLoading && session)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-200 rounded-full animate-spin border-t-primary-600" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">JobMatch Lite</h1>
                  <p className="text-sm text-slate-500">Analysis History</p>
                </div>
              </a>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Your Analysis History</h2>
          <a
            href="/"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            New Analysis
          </a>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {analyses.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <svg
              className="w-16 h-16 text-slate-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No analyses yet</h3>
            <p className="text-slate-500 mb-6">
              Start by uploading your resume and a job description to see how well they match.
            </p>
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Start Your First Analysis
            </a>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Analysis List */}
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${
                    selectedAnalysis?.id === analysis.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => setSelectedAnalysis(analysis)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(analysis.score)}`}
                        >
                          {analysis.score}% - {getScoreLabel(analysis.score)}
                        </span>
                      </div>
                      <h3 className="font-medium text-slate-900 truncate">
                        {analysis.resumeFilename}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                        {analysis.jobDescriptionPreview}...
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(analysis.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(analysis.id);
                      }}
                      disabled={deletingId === analysis.id}
                      className="ml-2 p-2 text-slate-400 hover:text-red-600 disabled:opacity-50"
                    >
                      {deletingId === analysis.id ? (
                        <div className="w-4 h-4 border-2 border-current rounded-full animate-spin border-t-transparent" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Analysis Detail */}
            <div className="lg:sticky lg:top-8">
              {selectedAnalysis ? (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Analysis Details</h3>

                  <div className="mb-6">
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-semibold ${getScoreColor(selectedAnalysis.score)}`}
                    >
                      {selectedAnalysis.score}% Match
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium text-slate-900 mb-2">Summary</h4>
                    <p className="text-slate-600">{selectedAnalysis.explanation}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-green-700 mb-2">Strengths</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedAnalysis.keyFindings.strengths.map((s, i) => (
                          <li key={i} className="text-sm text-slate-600">
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-red-700 mb-2">Gaps</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedAnalysis.keyFindings.gaps.map((g, i) => (
                          <li key={i} className="text-sm text-slate-600">
                            {g}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-blue-700 mb-2">Suggestions</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedAnalysis.keyFindings.suggestions.map((s, i) => (
                          <li key={i} className="text-sm text-slate-600">
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                  <svg
                    className="w-12 h-12 text-slate-300 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <p className="text-slate-500">Select an analysis to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
