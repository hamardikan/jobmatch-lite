/**
 * Port for AI analysis
 */

import type { KeyFindings } from '../../types';

export interface AnalysisInput {
  /** Resume text content */
  resumeText: string;
  /** Job description */
  jobDescription: string;
}

export interface JobDetails {
  /** Extracted job title */
  jobTitle: string | null;
  /** Extracted company name */
  companyName: string | null;
  /** Extracted work location */
  location: string | null;
}

export interface AnalysisOutput {
  /** Match score 0-100 */
  score: number;
  /** Detailed explanation */
  explanation: string;
  /** Key findings */
  keyFindings: KeyFindings;
  /** Extracted job details */
  jobDetails: JobDetails;
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
