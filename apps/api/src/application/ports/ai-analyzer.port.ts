/**
 * Port for AI analysis
 */

import type { KeyFindings } from '@jobmatch/shared';

export interface AnalysisInput {
  /** Resume text content */
  resumeText: string;
  /** Job description */
  jobDescription: string;
}

export interface AnalysisOutput {
  /** Match score 0-100 */
  score: number;
  /** Detailed explanation */
  explanation: string;
  /** Key findings */
  keyFindings: KeyFindings;
}

export interface AIAnalyzerPort {
  /**
   * Analyze resume against job description
   * @param input - Resume text and job description
   * @returns Analysis results
   * @throws AppError if AI service fails
   */
  analyze(input: AnalysisInput): Promise<AnalysisOutput>;
}
