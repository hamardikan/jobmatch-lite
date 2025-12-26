/**
 * OpenRouter AI Adapter
 *
 * Implements AIAnalyzerPort using OpenRouter API
 */

import { AppError } from '../../shared/errors';
import type {
  AIAnalyzerPort,
  AnalysisInput,
  AnalysisOutput,
} from '../../application/ports/ai-analyzer.port';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-2.0-flash-001';
const TIMEOUT_MS = 30000;

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface AIAnalysisResponse {
  score: number;
  explanation: string;
  keyFindings: {
    strengths: string[];
    gaps: string[];
    suggestions: string[];
  };
  jobDetails: {
    jobTitle: string | null;
    companyName: string | null;
    location: string | null;
  };
}

export class OpenRouterAdapter implements AIAnalyzerPort {
  constructor(
    private readonly apiKey: string,
    private readonly model: string = DEFAULT_MODEL
  ) {}

  async analyze(input: AnalysisInput): Promise<AnalysisOutput> {
    const prompt = this.buildPrompt(input);

    try {
      const response = await this.callOpenRouter(prompt);
      return this.parseResponse(response);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof Error && error.message === 'timeout') {
        throw AppError.timeout();
      }

      throw AppError.aiServiceError({
        service: 'OpenRouter',
        reason: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private buildPrompt(input: AnalysisInput): string {
    return `You are an expert HR analyst. Analyze how well this resume matches the job description.

RESUME:
${input.resumeText}

JOB DESCRIPTION:
${input.jobDescription}

Respond ONLY with a valid JSON object (no markdown, no explanation) in this exact format:
{
  "score": <number 0-100>,
  "explanation": "<detailed explanation of the match>",
  "keyFindings": {
    "strengths": ["<strength 1>", "<strength 2>", ...],
    "gaps": ["<gap 1>", "<gap 2>", ...],
    "suggestions": ["<suggestion 1>", "<suggestion 2>", ...]
  },
  "jobDetails": {
    "jobTitle": "<extracted job title or null if not found>",
    "companyName": "<extracted company name or null if not found>",
    "location": "<extracted work location or null if not found>"
  }
}

Score guidelines:
- 0-39: Poor match, major gaps in required skills
- 40-59: Fair match, some relevant experience but significant gaps
- 60-79: Good match, meets most requirements
- 80-100: Excellent match, strong alignment with requirements

Job Details extraction:
- Extract the exact job title/position name from the job description
- Extract the company or organization name
- Extract work location (city, remote, hybrid, etc.) if mentioned
- Use null for any field that cannot be determined`;
  }

  private async callOpenRouter(prompt: string): Promise<OpenRouterResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://jobmatch-lite.vercel.app',
          'X-Title': 'JobMatch Lite',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 1000,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw AppError.aiServiceError({
          service: 'OpenRouter',
          status: response.status,
          statusText: response.statusText,
        });
      }

      return (await response.json()) as OpenRouterResponse;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('timeout');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private parseResponse(response: OpenRouterResponse): AnalysisOutput {
    const content = response?.choices?.[0]?.message?.content;

    if (!content) {
      throw AppError.aiServiceError({
        service: 'OpenRouter',
        reason: 'Empty response from AI',
      });
    }

    // Strip markdown code blocks if present
    let jsonString = content.trim();
    if (jsonString.startsWith('```')) {
      jsonString = jsonString
        .replace(/^```json?\n?/, '')
        .replace(/\n?```$/, '');
    }

    let parsed: AIAnalysisResponse;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      throw AppError.aiServiceError({
        service: 'OpenRouter',
        reason: 'Invalid JSON response from AI',
        response: content.substring(0, 200),
      });
    }

    // Validate response structure
    if (
      typeof parsed.score !== 'number' ||
      typeof parsed.explanation !== 'string' ||
      !parsed.keyFindings ||
      !Array.isArray(parsed.keyFindings.strengths) ||
      !Array.isArray(parsed.keyFindings.gaps) ||
      !Array.isArray(parsed.keyFindings.suggestions)
    ) {
      throw AppError.aiServiceError({
        service: 'OpenRouter',
        reason: 'Malformed response structure',
      });
    }

    // Clamp score to valid range
    const score = Math.max(0, Math.min(100, Math.round(parsed.score)));

    // Extract job details with fallbacks
    const jobDetails = parsed.jobDetails || {};

    return {
      score,
      explanation: parsed.explanation,
      keyFindings: {
        strengths: parsed.keyFindings.strengths.filter((s) => typeof s === 'string'),
        gaps: parsed.keyFindings.gaps.filter((s) => typeof s === 'string'),
        suggestions: parsed.keyFindings.suggestions.filter((s) => typeof s === 'string'),
      },
      jobDetails: {
        jobTitle: typeof jobDetails.jobTitle === 'string' ? jobDetails.jobTitle : null,
        companyName: typeof jobDetails.companyName === 'string' ? jobDetails.companyName : null,
        location: typeof jobDetails.location === 'string' ? jobDetails.location : null,
      },
    };
  }
}
