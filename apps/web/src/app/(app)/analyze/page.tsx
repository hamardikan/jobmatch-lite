'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { JOB_DESCRIPTION_CONSTRAINTS } from '@/types';
import { JobDescriptionPane } from '@/components/job-description-pane';
import { ResumeUploader } from '@/components/resume-uploader';
import { MatchResultCard } from '@/components/match-result-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMatchAnalysis } from '@/hooks/use-match-analysis';
import { FileSearch, Loader2 } from 'lucide-react';

export default function AnalyzePage() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const { state, analyze, reset, isLoading, isSuccess, result } = useMatchAnalysis();

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

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          New Analysis
        </h1>
        <p className="text-foreground-secondary mt-1">
          Upload your resume and paste a job description to see how well they match.
        </p>
      </motion.div>

      {isSuccess && result ? (
        <MatchResultCard result={result} onReset={handleReset} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Split Pane Layout */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Pane - Job Description */}
            <Card>
              <CardContent className="p-6">
                <JobDescriptionPane
                  value={jobDescription}
                  onChange={setJobDescription}
                  disabled={isLoading}
                />
              </CardContent>
            </Card>

            {/* Right Pane - Resume Upload */}
            <Card>
              <CardContent className="p-6">
                <ResumeUploader
                  file={resumeFile}
                  onFileChange={setResumeFile}
                  disabled={isLoading}
                />
              </CardContent>
            </Card>
          </div>

          {/* Loading State */}
          {state.status === 'loading' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8"
            >
              <Card variant="elevated">
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center" data-testid="loading-indicator">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-primary-100 dark:border-primary-800 rounded-full" />
                      <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin" />
                    </div>
                    <p className="mt-6 text-lg font-medium text-foreground">{state.step}</p>
                    <p className="mt-2 text-sm text-foreground-muted">This usually takes 5-10 seconds</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Error State */}
          {state.status === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8"
            >
              <Card className="border-danger-500/50 bg-danger-50 dark:bg-danger-700/10">
                <CardContent className="py-8 text-center" data-testid="error-state">
                  <p className="text-danger-600 dark:text-danger-500 font-medium">{state.error}</p>
                  <Button
                    onClick={reset}
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                    data-testid="try-again-button"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Analyze Button */}
          {state.status !== 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-8 flex flex-col items-center"
            >
              <Button
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                size="xl"
                className="min-w-[200px]"
              >
                <FileSearch className="w-5 h-5 mr-2" />
                Analyze Match
              </Button>

              {/* Helper Text */}
              {!canAnalyze && state.status !== 'error' && (
                <p className="mt-4 text-center text-sm text-foreground-muted" data-testid="helper-text">
                  {!resumeFile && !isValidJobDescription
                    ? 'Upload your resume and paste the job description to get started'
                    : !resumeFile
                    ? 'Upload your resume to continue'
                    : 'Add more content to the job description (minimum 100 characters)'}
                </p>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
