/**
 * Analyze Resume Use Case
 *
 * Orchestrates the resume analysis flow:
 * 1. Validate inputs
 * 2. Parse resume file
 * 3. Call AI analyzer
 * 4. Return structured results
 * 5. Optionally save to history (if userId provided)
 */

import { JOB_DESCRIPTION_CONSTRAINTS } from '../types';
import type { AnalysisResult } from '../types';
import { AppError } from '../shared/errors';
import type { FileParserPort } from './ports/file-parser.port';
import type { AIAnalyzerPort } from './ports/ai-analyzer.port';
import type { AnalysisRepositoryPort } from './ports/repository.port';
import { MatchScore } from '../domain/analysis/value-objects/match-score';
import { KeyFindingsVO } from '../domain/analysis/value-objects/key-findings';

export interface AnalyzeOptions {
  userId?: string;
  filename?: string;
}

export interface AnalysisResultWithId extends AnalysisResult {
  id?: string;
}

export class AnalyzeResumeUseCase {
  constructor(
    private readonly fileParser: FileParserPort,
    private readonly aiAnalyzer: AIAnalyzerPort,
    private readonly analysisRepository?: AnalysisRepositoryPort
  ) {}

  async execute(
    file: File,
    jobDescription: string,
    options: AnalyzeOptions = {}
  ): Promise<AnalysisResultWithId> {
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

    const result: AnalysisResultWithId = {
      score: score.value,
      explanation: aiResult.explanation,
      keyFindings: keyFindings.toPlainObject(),
      processingTime,
    };

    // Save to history if userId is provided
    if (options.userId && this.analysisRepository) {
      const saved = await this.analysisRepository.save({
        userId: options.userId,
        resumeFilename: options.filename || file.name || 'resume',
        jobDescriptionPreview: jobDescription.slice(0, 200),
        score: result.score,
        explanation: result.explanation,
        keyFindings: result.keyFindings,
        processingTime: result.processingTime,
        // Job application tracker fields
        jobTitle: aiResult.jobDetails.jobTitle,
        companyName: aiResult.jobDetails.companyName,
        location: aiResult.jobDetails.location,
        fullJobDescription: jobDescription,
        applicationStatus: 'saved',
      });
      result.id = saved.id;
    }

    return result;
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
