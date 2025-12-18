import { describe, expect, it, beforeEach, mock } from 'bun:test';
import { AnalyzeResumeUseCase } from '@/application/analyze-resume.usecase';
import type { FileParserPort, ParsedFile } from '@/application/ports/file-parser.port';
import type { AIAnalyzerPort, AnalysisOutput } from '@/application/ports/ai-analyzer.port';
import { AppError } from '@/shared/errors';
import { ErrorCode } from '@jobmatch/shared';

// Mock implementations
class MockFileParser implements FileParserPort {
  parseResult: ParsedFile = {
    text: 'Mock resume text',
    filename: 'resume.pdf',
    mimeType: 'application/pdf',
  };
  shouldThrow: Error | null = null;

  async parse(_file: File): Promise<ParsedFile> {
    if (this.shouldThrow) throw this.shouldThrow;
    return this.parseResult;
  }

  supports(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  }
}

class MockAIAnalyzer implements AIAnalyzerPort {
  analyzeResult: AnalysisOutput = {
    score: 85,
    explanation: 'Strong match',
    keyFindings: {
      strengths: ['React experience'],
      gaps: ['No GraphQL'],
      suggestions: ['Learn GraphQL'],
    },
  };
  shouldThrow: Error | null = null;

  async analyze(): Promise<AnalysisOutput> {
    if (this.shouldThrow) throw this.shouldThrow;
    return this.analyzeResult;
  }
}

describe('AnalyzeResumeUseCase', () => {
  let useCase: AnalyzeResumeUseCase;
  let mockParser: MockFileParser;
  let mockAnalyzer: MockAIAnalyzer;

  beforeEach(() => {
    mockParser = new MockFileParser();
    mockAnalyzer = new MockAIAnalyzer();
    useCase = new AnalyzeResumeUseCase(mockParser, mockAnalyzer);
  });

  describe('execute', () => {
    it('should return analysis result with score, explanation, and keyFindings', async () => {
      const file = new File(['test'], 'resume.pdf', { type: 'application/pdf' });
      const jobDescription = 'Looking for a React developer with 5 years experience';

      const result = await useCase.execute(file, jobDescription);

      expect(result.score).toBe(85);
      expect(result.explanation).toBe('Strong match');
      expect(result.keyFindings.strengths).toContain('React experience');
      expect(result.keyFindings.gaps).toContain('No GraphQL');
      expect(result.keyFindings.suggestions).toContain('Learn GraphQL');
      expect(typeof result.processingTime).toBe('number');
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });

    it('should throw validation error for empty job description', async () => {
      const file = new File(['test'], 'resume.pdf', { type: 'application/pdf' });

      await expect(useCase.execute(file, '')).rejects.toThrow(AppError);
      await expect(useCase.execute(file, '')).rejects.toMatchObject({
        code: ErrorCode.VALIDATION_ERROR,
      });
    });

    it('should throw validation error for short job description', async () => {
      const file = new File(['test'], 'resume.pdf', { type: 'application/pdf' });
      const shortDescription = 'a'.repeat(50); // Less than 100 chars

      await expect(useCase.execute(file, shortDescription)).rejects.toThrow(AppError);
      await expect(useCase.execute(file, shortDescription)).rejects.toMatchObject({
        code: ErrorCode.VALIDATION_ERROR,
      });
    });

    it('should throw validation error for too long job description', async () => {
      const file = new File(['test'], 'resume.pdf', { type: 'application/pdf' });
      const longDescription = 'a'.repeat(15000); // More than 10000 chars

      await expect(useCase.execute(file, longDescription)).rejects.toThrow(AppError);
      await expect(useCase.execute(file, longDescription)).rejects.toMatchObject({
        code: ErrorCode.VALIDATION_ERROR,
      });
    });

    it('should propagate file parsing errors', async () => {
      const file = new File(['test'], 'resume.pdf', { type: 'application/pdf' });
      const jobDescription = 'a'.repeat(150);
      mockParser.shouldThrow = AppError.fileParseError();

      await expect(useCase.execute(file, jobDescription)).rejects.toThrow(AppError);
      await expect(useCase.execute(file, jobDescription)).rejects.toMatchObject({
        code: ErrorCode.FILE_PARSE_ERROR,
      });
    });

    it('should propagate AI service errors', async () => {
      const file = new File(['test'], 'resume.pdf', { type: 'application/pdf' });
      const jobDescription = 'a'.repeat(150);
      mockAnalyzer.shouldThrow = AppError.aiServiceError();

      await expect(useCase.execute(file, jobDescription)).rejects.toThrow(AppError);
      await expect(useCase.execute(file, jobDescription)).rejects.toMatchObject({
        code: ErrorCode.AI_SERVICE_ERROR,
      });
    });

    it('should track processing time accurately', async () => {
      const file = new File(['test'], 'resume.pdf', { type: 'application/pdf' });
      const jobDescription = 'a'.repeat(150);

      const start = Date.now();
      const result = await useCase.execute(file, jobDescription);
      const elapsed = Date.now() - start;

      // Processing time should be within reasonable bounds
      expect(result.processingTime).toBeLessThanOrEqual(elapsed + 100);
    });
  });
});
