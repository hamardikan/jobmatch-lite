/**
 * Analyze Resume Use Case
 *
 * Orchestrates the resume analysis flow:
 * 1. Validate inputs
 * 2. Parse resume file
 * 3. Call AI analyzer
 * 4. Return structured results
 */

import { JOB_DESCRIPTION_CONSTRAINTS } from '@jobmatch/shared';
import type { AnalysisResult } from '@jobmatch/shared';
import { AppError } from '@/shared/errors';
import type { FileParserPort } from '@/application/ports/file-parser.port';
import type { AIAnalyzerPort } from '@/application/ports/ai-analyzer.port';
import { MatchScore } from '@/domain/analysis/value-objects/match-score';
import { KeyFindingsVO } from '@/domain/analysis/value-objects/key-findings';

export class AnalyzeResumeUseCase {
  constructor(
    private readonly fileParser: FileParserPort,
    private readonly aiAnalyzer: AIAnalyzerPort
  ) {}

  async execute(file: File, jobDescription: string): Promise<AnalysisResult> {
    const startTime = performance.now();

    // Validate job description
    this.validateJobDescription(jobDescription);

    // Parse resume file
    const parsedFile = await this.fileParser.parse(file);

    // Analyze with AI
    const aiResult = await this.aiAnalyzer.analyze({
      resumeText: parsedFile.text,
      jobDescription,
    });

    // Create domain value objects to validate/normalize results
    const score = MatchScore.create(aiResult.score);
    const keyFindings = KeyFindingsVO.create(aiResult.keyFindings);

    const processingTime = Math.round(performance.now() - startTime);

    return {
      score: score.value,
      explanation: aiResult.explanation,
      keyFindings: keyFindings.toPlainObject(),
      processingTime,
    };
  }

  private validateJobDescription(jobDescription: string): void {
    const trimmed = jobDescription.trim();

    if (!trimmed) {
      throw AppError.validation('Job description is required', {
        field: 'jobDescription',
        reason: 'empty',
      });
    }

    if (trimmed.length < JOB_DESCRIPTION_CONSTRAINTS.MIN_LENGTH) {
      throw AppError.validation(
        `Job description must be at least ${JOB_DESCRIPTION_CONSTRAINTS.MIN_LENGTH} characters`,
        {
          field: 'jobDescription',
          minLength: JOB_DESCRIPTION_CONSTRAINTS.MIN_LENGTH,
          actualLength: trimmed.length,
        }
      );
    }

    if (trimmed.length > JOB_DESCRIPTION_CONSTRAINTS.MAX_LENGTH) {
      throw AppError.validation(
        `Job description must not exceed ${JOB_DESCRIPTION_CONSTRAINTS.MAX_LENGTH} characters`,
        {
          field: 'jobDescription',
          maxLength: JOB_DESCRIPTION_CONSTRAINTS.MAX_LENGTH,
          actualLength: trimmed.length,
        }
      );
    }
  }
}
