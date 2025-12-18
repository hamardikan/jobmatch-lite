'use client';

import { useState, useCallback } from 'react';
import type { AnalysisResult } from '@jobmatch/shared';
import { analyzeResume } from '@/lib/api-client';

export type AnalysisState =
  | { status: 'idle' }
  | { status: 'loading'; step: string }
  | { status: 'success'; result: AnalysisResult }
  | { status: 'error'; error: string };

export function useMatchAnalysis() {
  const [state, setState] = useState<AnalysisState>({ status: 'idle' });

  const analyze = useCallback(async (resume: File, jobDescription: string) => {
    setState({ status: 'loading', step: 'Parsing resume...' });

    try {
      // Simulate step progression for better UX
      setTimeout(() => {
        setState(prev =>
          prev.status === 'loading'
            ? { status: 'loading', step: 'Analyzing with AI...' }
            : prev
        );
      }, 1000);

      const result = await analyzeResume(resume, jobDescription);

      setState({ status: 'success', result });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Analysis failed';
      setState({ status: 'error', error: message });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: 'idle' });
  }, []);

  return {
    state,
    analyze,
    reset,
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
    result: state.status === 'success' ? state.result : null,
    error: state.status === 'error' ? state.error : null,
  };
}
