/**
 * Analysis E2E Tests
 *
 * Tests for resume upload, job description input, and analysis flow.
 */

import { test, expect } from '../fixtures/auth';
import { HomePage } from '../pages';
import { mockOpenRouterAPI, mockOpenRouterError, mockOpenRouterWithScore } from '../utils/api-mock';
import * as path from 'path';

// Sample job description that meets minimum length requirement (100 chars)
const VALID_JOB_DESCRIPTION = `
We are looking for a Senior Software Engineer to join our team.

Requirements:
- 5+ years of experience with TypeScript and React
- Strong understanding of modern JavaScript frameworks
- Experience with Node.js and RESTful APIs
- Excellent problem-solving skills
- Bachelor's degree in Computer Science or related field

Nice to have:
- Experience with Kubernetes and Docker
- Knowledge of GraphQL
- AWS or cloud platform experience
`;

const SHORT_JOB_DESCRIPTION = 'Looking for a developer'; // Too short

test.describe('Analysis Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the OpenRouter API for all tests
    await mockOpenRouterAPI(page);
  });

  test.describe('Input Validation', () => {
    test('should show helper text when no inputs provided', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.waitForReady();

      const helperText = await homePage.getHelperText();
      expect(helperText).toContain('Upload your resume');
    });

    test('should disable analyze button when job description is too short', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.waitForReady();

      // Upload resume
      await homePage.uploadSampleResume();

      // Fill with short job description
      await homePage.fillJobDescription(SHORT_JOB_DESCRIPTION);

      // Button should be disabled
      const isEnabled = await homePage.isAnalyzeButtonEnabled();
      expect(isEnabled).toBe(false);

      // Helper text should mention job description
      const helperText = await homePage.getHelperText();
      expect(helperText?.toLowerCase()).toContain('job description');
    });

    test('should disable analyze button when no resume uploaded', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.waitForReady();

      // Fill valid job description but no resume
      await homePage.fillJobDescription(VALID_JOB_DESCRIPTION);

      const isEnabled = await homePage.isAnalyzeButtonEnabled();
      expect(isEnabled).toBe(false);
    });

    test('should enable analyze button when all inputs valid', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.waitForReady();

      await homePage.uploadSampleResume();
      await homePage.fillJobDescription(VALID_JOB_DESCRIPTION);

      const isEnabled = await homePage.isAnalyzeButtonEnabled();
      expect(isEnabled).toBe(true);
    });
  });

  test.describe('File Upload', () => {
    test('should upload PDF file successfully', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.waitForReady();

      await homePage.uploadSampleResume();

      const fileName = await homePage.getUploadedFileName();
      expect(fileName).toBeTruthy();
      expect(fileName).toContain('.pdf');
    });

    test('should show error for invalid file type', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.waitForReady();

      // Create a temporary invalid file (using a text file as example)
      const invalidFilePath = path.join(__dirname, '..', 'fixtures', 'resumes', 'invalid.txt');

      // Try to upload invalid file
      await homePage.uploadResume(invalidFilePath);

      // Should show error
      const error = await homePage.getUploadError();
      expect(error).toBeTruthy();
    });

    test('should allow removing uploaded file', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.waitForReady();

      await homePage.uploadSampleResume();

      // Verify file is uploaded
      const fileNameBefore = await homePage.getUploadedFileName();
      expect(fileNameBefore).toBeTruthy();

      // Remove file
      await homePage.removeFile();

      // Verify file is removed (uploaded file name should not be visible)
      const isVisible = await homePage.uploadedFileName.isVisible();
      expect(isVisible).toBe(false);
    });
  });

  test.describe('Analysis Execution', () => {
    test('should complete analysis successfully', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.waitForReady();

      await homePage.uploadSampleResume();
      await homePage.fillJobDescription(VALID_JOB_DESCRIPTION);
      await homePage.clickAnalyze();

      // Wait for result
      await homePage.waitForResult();

      // Verify result card is visible
      await expect(homePage.resultCard).toBeVisible();
    });

    test('should show loading state during analysis', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.waitForReady();

      await homePage.uploadSampleResume();
      await homePage.fillJobDescription(VALID_JOB_DESCRIPTION);
      await homePage.clickAnalyze();

      // Check loading indicator appears
      await homePage.waitForLoading();
      await expect(homePage.loadingIndicator).toBeVisible();
    });

    test('should display score in result card', async ({ page }) => {
      await mockOpenRouterWithScore(page, 85);

      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.waitForReady();

      await homePage.startAnalysis(VALID_JOB_DESCRIPTION);
      await homePage.waitForResult();

      const score = await homePage.getScore();
      expect(score).toContain('85');
    });

    test('should display key findings in result', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.waitForReady();

      await homePage.startAnalysis(VALID_JOB_DESCRIPTION);
      await homePage.waitForResult();

      // Check that findings are displayed
      const strengthsCount = await homePage.getStrengthsCount();
      expect(strengthsCount).toBeGreaterThan(0);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API error gracefully', async ({ page }) => {
      // Override with error mock
      await mockOpenRouterError(page);

      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.waitForReady();

      await homePage.uploadSampleResume();
      await homePage.fillJobDescription(VALID_JOB_DESCRIPTION);
      await homePage.clickAnalyze();

      // Wait for error state
      await homePage.waitForError();
      await expect(homePage.errorState).toBeVisible();
      await expect(homePage.tryAgainButton).toBeVisible();
    });

    test('should allow retry after error', async ({ page }) => {
      await mockOpenRouterError(page);

      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.waitForReady();

      await homePage.uploadSampleResume();
      await homePage.fillJobDescription(VALID_JOB_DESCRIPTION);
      await homePage.clickAnalyze();

      await homePage.waitForError();

      // Click try again
      await homePage.tryAgainButton.click();

      // Error state should be cleared
      await expect(homePage.errorState).not.toBeVisible();
    });
  });

  test.describe('Reset Flow', () => {
    test('should reset and allow new analysis', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.waitForReady();

      await homePage.startAnalysis(VALID_JOB_DESCRIPTION);
      await homePage.waitForResult();

      // Reset
      await homePage.resetAnalysis();

      // Verify we're back to input state
      await expect(homePage.resumeUploader).toBeVisible();
      await expect(homePage.resultCard).not.toBeVisible();
    });
  });
});
