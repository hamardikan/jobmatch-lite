/**
 * History Page Object
 *
 * Page object for the analysis history page.
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class HistoryPage extends BasePage {
  readonly heading: Locator;
  readonly newAnalysisButton: Locator;
  readonly emptyState: Locator;
  readonly analysisItems: Locator;
  readonly detailPanel: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: /your analysis history/i });
    this.newAnalysisButton = page.getByRole('link', { name: /new analysis/i });
    this.emptyState = page.getByTestId('empty-state');
    this.analysisItems = page.getByTestId('analysis-item');
    this.detailPanel = page.getByTestId('detail-panel');
    this.errorMessage = page.locator('.bg-red-50');
  }

  async goto(): Promise<void> {
    await this.page.goto('/history');
  }

  async waitForReady(): Promise<void> {
    await this.heading.waitFor({ state: 'visible' });
  }

  /**
   * Check if the history is empty
   */
  async isEmpty(): Promise<boolean> {
    return this.emptyState.isVisible();
  }

  /**
   * Get the number of analysis items in the list
   */
  async getItemCount(): Promise<number> {
    return this.analysisItems.count();
  }

  /**
   * Get a specific analysis item by index
   */
  getItem(index: number): Locator {
    return this.analysisItems.nth(index);
  }

  /**
   * Click on an analysis item to view details
   */
  async selectItem(index: number): Promise<void> {
    await this.getItem(index).click();
    await this.detailPanel.waitFor({ state: 'visible' });
  }

  /**
   * Get the score badge from an analysis item
   */
  getScoreBadge(index: number): Locator {
    return this.getItem(index).getByTestId('score-badge');
  }

  /**
   * Get the delete button from an analysis item
   */
  getDeleteButton(index: number): Locator {
    return this.getItem(index).getByTestId('delete-button');
  }

  /**
   * Delete an analysis item by index
   */
  async deleteItem(index: number): Promise<void> {
    const itemCount = await this.getItemCount();

    // Set up dialog handler to accept the confirmation
    this.page.once('dialog', dialog => dialog.accept());

    await this.getDeleteButton(index).click();

    // Wait for item to be removed (or the page to update)
    if (itemCount > 1) {
      await this.page.waitForFunction(
        (expectedCount) => {
          return document.querySelectorAll('[data-testid="analysis-item"]').length === expectedCount;
        },
        itemCount - 1
      );
    } else {
      await this.emptyState.waitFor({ state: 'visible' });
    }
  }

  /**
   * Get the score text from an item
   */
  async getItemScore(index: number): Promise<string | null> {
    const badge = this.getScoreBadge(index);
    if (await badge.isVisible()) {
      return badge.textContent();
    }
    return null;
  }

  /**
   * Check if the detail panel is visible
   */
  async isDetailPanelVisible(): Promise<boolean> {
    return this.detailPanel.isVisible();
  }

  /**
   * Get the detail panel score
   */
  async getDetailScore(): Promise<string | null> {
    const scoreElement = this.detailPanel.locator('text=/\\d+% Match/');
    if (await scoreElement.isVisible()) {
      return scoreElement.textContent();
    }
    return null;
  }

  /**
   * Get detail panel sections
   */
  getDetailStrengths(): Locator {
    return this.detailPanel.locator('text=Strengths').locator('..').locator('ul');
  }

  getDetailGaps(): Locator {
    return this.detailPanel.locator('text=Gaps').locator('..').locator('ul');
  }

  getDetailSuggestions(): Locator {
    return this.detailPanel.locator('text=Suggestions').locator('..').locator('ul');
  }

  /**
   * Navigate to new analysis
   */
  async goToNewAnalysis(): Promise<void> {
    await this.newAnalysisButton.click();
    await this.page.waitForURL('**/analyze');
  }

  /**
   * Navigate from empty state to start first analysis
   */
  async startFirstAnalysis(): Promise<void> {
    const startButton = this.emptyState.getByRole('link', { name: /start your first analysis/i });
    await startButton.click();
    await this.page.waitForURL('**/analyze');
  }
}
