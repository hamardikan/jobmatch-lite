/**
 * Home Page Object
 *
 * Page object for the main analysis page.
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import * as path from 'path';

export class HomePage extends BasePage {
  // Job description
  readonly jobDescriptionTextarea: Locator;

  // Resume uploader
  readonly resumeUploader: Locator;
  readonly fileInput: Locator;
  readonly uploadedFileName: Locator;
  readonly uploadError: Locator;
  readonly removeFileButton: Locator;

  // Analysis
  readonly analyzeButton: Locator;
  readonly loadingIndicator: Locator;
  readonly errorState: Locator;
  readonly tryAgainButton: Locator;
  readonly helperText: Locator;

  // Result card
  readonly resultCard: Locator;
  readonly scoreDisplay: Locator;
  readonly strengthsList: Locator;
  readonly gapsList: Locator;
  readonly suggestionsList: Locator;
  readonly tryAnotherButton: Locator;
  readonly downloadReportButton: Locator;

  constructor(page: Page) {
    super(page);

    // Job description
    this.jobDescriptionTextarea = page.getByRole('textbox', { name: /job description/i });

    // Resume uploader
    this.resumeUploader = page.getByTestId('resume-uploader');
    this.fileInput = page.locator('input[type="file"]');
    this.uploadedFileName = page.getByTestId('uploaded-file-name');
    this.uploadError = page.getByTestId('upload-error');
    this.removeFileButton = page.getByRole('button', { name: /remove file/i });

    // Analysis
    this.analyzeButton = page.getByRole('button', { name: /analyze match/i });
    this.loadingIndicator = page.getByTestId('loading-indicator');
    this.errorState = page.getByTestId('error-state');
    this.tryAgainButton = page.getByTestId('try-again-button');
    this.helperText = page.getByTestId('helper-text');

    // Result card
    this.resultCard = page.getByTestId('result-card');
    this.scoreDisplay = page.getByTestId('score-display');
    this.strengthsList = page.getByTestId('strengths-list');
    this.gapsList = page.getByTestId('gaps-list');
    this.suggestionsList = page.getByTestId('suggestions-list');
    this.tryAnotherButton = page.getByRole('button', { name: /try another/i });
    this.downloadReportButton = page.getByRole('button', { name: /download report/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/analyze');
  }

  async waitForReady(): Promise<void> {
    await this.resumeUploader.waitFor({ state: 'visible' });
  }

  /**
   * Fill the job description textarea
   */
  async fillJobDescription(text: string): Promise<void> {
    await this.jobDescriptionTextarea.fill(text);
  }

  /**
   * Upload a resume file
   */
  async uploadResume(filePath: string): Promise<void> {
    await this.fileInput.setInputFiles(filePath);
  }

  /**
   * Upload the sample resume from fixtures
   */
  async uploadSampleResume(): Promise<void> {
    const fixturePath = path.join(__dirname, '..', 'fixtures', 'resumes', 'sample-resume.pdf');
    await this.uploadResume(fixturePath);
  }

  /**
   * Remove the uploaded file
   */
  async removeFile(): Promise<void> {
    await this.removeFileButton.click();
  }

  /**
   * Click the analyze button
   */
  async clickAnalyze(): Promise<void> {
    await this.analyzeButton.click();
  }

  /**
   * Fill form and start analysis
   */
  async startAnalysis(jobDescription: string, resumePath?: string): Promise<void> {
    await this.fillJobDescription(jobDescription);
    if (resumePath) {
      await this.uploadResume(resumePath);
    } else {
      await this.uploadSampleResume();
    }
    await this.clickAnalyze();
  }

  /**
   * Wait for analysis to complete (result card visible)
   */
  async waitForResult(timeout = 30000): Promise<void> {
    await this.resultCard.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for loading indicator
   */
  async waitForLoading(): Promise<void> {
    await this.loadingIndicator.waitFor({ state: 'visible' });
  }

  /**
   * Wait for error state
   */
  async waitForError(): Promise<void> {
    await this.errorState.waitFor({ state: 'visible' });
  }

  /**
   * Check if analyze button is enabled
   */
  async isAnalyzeButtonEnabled(): Promise<boolean> {
    return this.analyzeButton.isEnabled();
  }

  /**
   * Get the helper text content
   */
  async getHelperText(): Promise<string | null> {
    if (await this.helperText.isVisible()) {
      return this.helperText.textContent();
    }
    return null;
  }

  /**
   * Get the uploaded file name
   */
  async getUploadedFileName(): Promise<string | null> {
    if (await this.uploadedFileName.isVisible()) {
      return this.uploadedFileName.textContent();
    }
    return null;
  }

  /**
   * Get the upload error message
   */
  async getUploadError(): Promise<string | null> {
    if (await this.uploadError.isVisible()) {
      return this.uploadError.textContent();
    }
    return null;
  }

  /**
   * Reset the analysis and start fresh
   */
  async resetAnalysis(): Promise<void> {
    await this.tryAnotherButton.click();
    await this.resumeUploader.waitFor({ state: 'visible' });
  }

  /**
   * Get the score from the result card
   */
  async getScore(): Promise<string | null> {
    if (await this.scoreDisplay.isVisible()) {
      return this.scoreDisplay.textContent();
    }
    return null;
  }

  /**
   * Get strengths count from results
   */
  async getStrengthsCount(): Promise<number> {
    if (await this.strengthsList.isVisible()) {
      return this.strengthsList.locator('li').count();
    }
    return 0;
  }

  /**
   * Get gaps count from results
   */
  async getGapsCount(): Promise<number> {
    if (await this.gapsList.isVisible()) {
      return this.gapsList.locator('li').count();
    }
    return 0;
  }

  /**
   * Get suggestions count from results
   */
  async getSuggestionsCount(): Promise<number> {
    if (await this.suggestionsList.isVisible()) {
      return this.suggestionsList.locator('li').count();
    }
    return 0;
  }
}
