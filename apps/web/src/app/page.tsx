'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { JOB_DESCRIPTION_CONSTRAINTS } from '@/types';
import { JobDescriptionPane } from '@/components/job-description-pane';
import { ResumeUploader } from '@/components/resume-uploader';
import { MatchResultCard } from '@/components/match-result-card';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/user-menu';
import { useMatchAnalysis } from '@/hooks/use-match-analysis';
import { useSession } from '@/lib/auth-client';

export default function HomePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const { state, analyze, reset, isLoading, isSuccess, result } = useMatchAnalysis();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  const isValidJobDescription =
    jobDescription.length >= JOB_DESCRIPTION_CONSTRAINTS.MIN_LENGTH &&
    jobDescription.length <= JOB_DESCRIPTION_CONSTRAINTS.MAX_LENGTH;

  const canAnalyze = resumeFile && isValidJobDescription && !isLoading;

  const handleAnalyze = useCallback(async () => {
    if (!resumeFile || !isValidJobDescription) return;

    try {
      await analyze(resumeFile, jobDescription);
    } catch (error) {
      // Error is handled by the hook
    }
  }, [resumeFile, isValidJobDescription, jobDescription, analyze]);

  const handleReset = useCallback(() => {
    setJobDescription('');
    setResumeFile(null);
    reset();
  }, [reset]);

  // Show loading state while checking auth
  if (isPending) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-200 rounded-full animate-spin border-t-primary-600" />
      </div>
    );
  }

  // Don't render if not authenticated (redirect will happen)
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
                <p className="text-sm text-slate-500">AI-powered resume matching</p>
              </div>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {isSuccess && result ? (
          <MatchResultCard result={result} onReset={handleReset} />
        ) : (
          <>
            {/* Split Pane Layout */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left Pane - Job Description */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <JobDescriptionPane
                  value={jobDescription}
                  onChange={setJobDescription}
                  disabled={isLoading}
                />
              </div>

              {/* Right Pane - Resume Upload */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <ResumeUploader
                  file={resumeFile}
                  onFileChange={setResumeFile}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Loading State */}
            {state.status === 'loading' && (
              <div className="mt-8 flex flex-col items-center justify-center py-12" data-testid="loading-indicator">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary-200 rounded-full animate-spin border-t-primary-600" />
                </div>
                <p className="mt-4 text-lg font-medium text-slate-900">{state.step}</p>
                <p className="text-sm text-slate-500">This usually takes 5-10 seconds</p>
              </div>
            )}

            {/* Error State */}
            {state.status === 'error' && (
              <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-center" data-testid="error-state">
                <p className="text-red-600">{state.error}</p>
                <Button
                  onClick={reset}
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  data-testid="try-again-button"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Analyze Button */}
            {state.status !== 'loading' && (
              <div className="mt-8 flex justify-center">
                <Button
                  onClick={handleAnalyze}
                  disabled={!canAnalyze}
                  size="lg"
                  className="px-8"
                >
                  Check Resume Match
                </Button>
              </div>
            )}

            {/* Helper Text */}
            {!canAnalyze && !isLoading && state.status !== 'error' && (
              <p className="mt-4 text-center text-sm text-slate-500" data-testid="helper-text">
                {!resumeFile && !isValidJobDescription
                  ? 'Upload your resume and paste the job description to get started'
                  : !resumeFile
                  ? 'Upload your resume to continue'
                  : 'Add more content to the job description (minimum 100 characters)'}
              </p>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-sm text-slate-500">
        <p>Built with Next.js, ElysiaJS, and OpenRouter AI</p>
      </footer>
    </div>
  );
}
