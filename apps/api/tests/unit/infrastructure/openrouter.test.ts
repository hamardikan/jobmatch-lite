import { describe, expect, it, beforeEach, mock } from 'bun:test';
import { OpenRouterAdapter } from '@/infrastructure/ai/openrouter.adapter';

describe('OpenRouterAdapter', () => {
  let adapter: OpenRouterAdapter;

  beforeEach(() => {
    adapter = new OpenRouterAdapter('test-api-key');
  });

  describe('analyze', () => {
    it('should return analysis results with score, explanation, and keyFindings', async () => {
      // Mock the fetch function
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                score: 85,
                explanation: 'Strong match for the position',
                keyFindings: {
                  strengths: ['React experience', 'TypeScript skills'],
                  gaps: ['No GraphQL experience'],
                  suggestions: ['Consider learning GraphQL'],
                },
              }),
            },
          },
        ],
      };

      globalThis.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)
      );

      const result = await adapter.analyze({
        resumeText: 'Experienced React developer with 5 years of experience',
        jobDescription: 'Looking for a senior frontend developer with React',
      });

      expect(result.score).toBe(85);
      expect(result.explanation).toBe('Strong match for the position');
      expect(result.keyFindings.strengths).toContain('React experience');
      expect(result.keyFindings.gaps).toContain('No GraphQL experience');
      expect(result.keyFindings.suggestions).toContain('Consider learning GraphQL');
    });

    it('should throw error when API call fails', async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        } as Response)
      );

      await expect(
        adapter.analyze({
          resumeText: 'Test resume',
          jobDescription: 'Test job',
        })
      ).rejects.toThrow();
    });

    it('should throw error when response is malformed', async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ invalid: 'response' }),
        } as Response)
      );

      await expect(
        adapter.analyze({
          resumeText: 'Test resume',
          jobDescription: 'Test job',
        })
      ).rejects.toThrow();
    });

    it('should handle timeout', async () => {
      globalThis.fetch = mock(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('timeout')), 100);
          })
      );

      await expect(
        adapter.analyze({
          resumeText: 'Test resume',
          jobDescription: 'Test job',
        })
      ).rejects.toThrow();
    });
  });

  describe('parseAIResponse', () => {
    it('should handle JSON wrapped in markdown code blocks', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: '```json\n{"score": 75, "explanation": "Good match", "keyFindings": {"strengths": [], "gaps": [], "suggestions": []}}\n```',
            },
          },
        ],
      };

      globalThis.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)
      );

      const result = await adapter.analyze({
        resumeText: 'Test',
        jobDescription: 'Test',
      });

      expect(result.score).toBe(75);
    });
  });
});
