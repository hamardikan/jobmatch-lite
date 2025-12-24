/**
 * API Mocking Utilities
 *
 * Route interception for external APIs in E2E tests.
 */

import { Page, Route } from '@playwright/test';

export interface MockAnalysisResult {
  score: number;
  explanation: string;
  keyFindings: {
    strengths: string[];
    gaps: string[];
    suggestions: string[];
  };
}

const defaultMockResult: MockAnalysisResult = {
  score: 85,
  explanation: 'Good match for the position. Your technical skills align well with the job requirements, and your experience demonstrates relevant expertise.',
  keyFindings: {
    strengths: [
      'Strong experience with TypeScript and React',
      'Demonstrated leadership in past projects',
      'Excellent problem-solving skills',
    ],
    gaps: [
      'Limited experience with Kubernetes',
      'No mentioned experience with GraphQL',
    ],
    suggestions: [
      'Consider adding cloud certification',
      'Highlight more quantifiable achievements',
      'Add specific metrics from past projects',
    ],
  },
};

/**
 * Mock OpenRouter API responses
 *
 * Intercepts calls to OpenRouter and returns mock analysis results.
 */
export async function mockOpenRouterAPI(
  page: Page,
  result: Partial<MockAnalysisResult> = {}
): Promise<void> {
  const mockResult = { ...defaultMockResult, ...result };

  await page.route('**/openrouter.ai/api/**', async (route: Route) => {
    // Simulate some processing time
    await new Promise((resolve) => setTimeout(resolve, 500));

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'mock-response-id',
        object: 'chat.completion',
        created: Date.now(),
        model: 'mock-model',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: JSON.stringify({
                score: mockResult.score,
                explanation: mockResult.explanation,
                strengths: mockResult.keyFindings.strengths,
                gaps: mockResult.keyFindings.gaps,
                suggestions: mockResult.keyFindings.suggestions,
              }),
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 200,
          total_tokens: 300,
        },
      }),
    });
  });
}

/**
 * Mock OpenRouter API to return an error
 */
export async function mockOpenRouterError(page: Page): Promise<void> {
  await page.route('**/openrouter.ai/api/**', async (route: Route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        error: {
          message: 'AI service temporarily unavailable',
          type: 'server_error',
          code: 'service_unavailable',
        },
      }),
    });
  });
}

/**
 * Mock OpenRouter API with a timeout
 */
export async function mockOpenRouterTimeout(page: Page): Promise<void> {
  await page.route('**/openrouter.ai/api/**', async (route: Route) => {
    // Wait longer than the typical timeout
    await new Promise((resolve) => setTimeout(resolve, 120000));
    await route.abort('timedout');
  });
}

/**
 * Mock OpenRouter API with specific score
 */
export async function mockOpenRouterWithScore(
  page: Page,
  score: number
): Promise<void> {
  const label =
    score >= 90 ? 'Excellent' :
    score >= 75 ? 'Good' :
    score >= 60 ? 'Moderate' :
    score >= 40 ? 'Weak' : 'Poor';

  await mockOpenRouterAPI(page, {
    score,
    explanation: `${label} match for the position with a score of ${score}%.`,
  });
}
