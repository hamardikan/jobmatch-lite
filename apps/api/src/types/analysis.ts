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
  /** Match score from the analysis (0-100) */
  score: number;
  /** Detailed explanation from the analysis */
  explanation: string;
  /** Key findings from the analysis */
  keyFindings: KeyFindings;
  /** Job title being applied for (optional) */
  jobTitle?: string;
  /** Company name (optional) */
  companyName?: string;
  /** Candidate's name for the report (optional) */
  candidateName?: string;
  /** When the analysis was performed */
  analyzedAt?: string;
}
