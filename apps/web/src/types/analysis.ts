/**
 * Analysis result types from resume-job matching
 */

export interface KeyFindings {
  /** Candidate strengths matching the job requirements */
  strengths: string[];
  /** Gaps or missing qualifications */
  gaps: string[];
  /** Suggestions for improving the application */
  suggestions: string[];
}

export interface AnalysisResult {
  /** Analysis ID (from database) */
  id?: string;
  /** Match score from 0-100 */
  score: number;
  /** Detailed explanation of the match analysis */
  explanation: string;
  /** Key findings from the analysis */
  keyFindings: KeyFindings;
  /** Processing time in milliseconds */
  processingTime: number;
}

export interface GeneratePdfRequest {
  /** Analysis ID to generate PDF for */
  analysisId: string;
}
