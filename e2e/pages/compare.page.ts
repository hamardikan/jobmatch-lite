/**
 * Compare Page Object
 *
 * Page object for the job comparison page (Coming Soon).
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class ComparePage extends BasePage {
  // Page header
  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;

  // Coming soon state
  readonly comingSoonMessage: Locator;
  readonly comingSoonIcon: Locator;
  readonly featureDescription: Locator;

  // Action links
  readonly createAnalysisLink: Locator;
  readonly viewHistoryLink: Locator;

  // Preview cards
  readonly previewCards: Locator;

  constructor(page: Page) {
    super(page);

    // Page header
    this.pageTitle = page.getByRole('heading', { level: 1 }).filter({ hasText: /compare/i });
    this.pageSubtitle = page.locator('p').filter({ hasText: /compare multiple/i }).first();

    // Coming soon state
    this.comingSoonMessage = page.getByRole('heading', { level: 2 }).filter({ hasText: /coming soon/i });
    this.comingSoonIcon = page.locator('svg').filter({ hasText: /compare/i }).first();
    this.featureDescription = page.locator('p').filter({ hasText: /side by side/i }).first();

    // Action links
    this.createAnalysisLink = page.getByRole('link', { name: /create.*analysis|new analysis/i });
    this.viewHistoryLink = page.getByRole('link', { name: /view history|history/i });

    // Preview cards
    this.previewCards = page.locator('[class*="opacity"]').filter({ hasText: /add job/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/compare');
  }

  async waitForReady(): Promise<void> {
    await this.pageTitle.waitFor({ state: 'visible' });
  }

  /**
   * Check if coming soon message is visible
   */
  async isComingSoonVisible(): Promise<boolean> {
    return this.comingSoonMessage.isVisible();
  }

  /**
   * Check if feature is under development
   */
  async isUnderDevelopment(): Promise<boolean> {
    const text = await this.page.locator('text=under development').isVisible();
    return text;
  }

  /**
   * Get page title text
   */
  async getPageTitle(): Promise<string | null> {
    return this.pageTitle.textContent();
  }

  /**
   * Click Create Analysis link
   */
  async clickCreateAnalysis(): Promise<void> {
    await this.createAnalysisLink.click();
    await this.page.waitForURL('**/analyze');
  }

  /**
   * Click View History link
   */
  async clickViewHistory(): Promise<void> {
    await this.viewHistoryLink.click();
    await this.page.waitForURL('**/history');
  }

  /**
   * Get the number of preview cards
   */
  async getPreviewCardsCount(): Promise<number> {
    return this.previewCards.count();
  }

  /**
   * Check if the page is showing the placeholder state
   */
  async isPlaceholderState(): Promise<boolean> {
    const comingSoon = await this.isComingSoonVisible();
    const createLink = await this.createAnalysisLink.isVisible();
    return comingSoon && createLink;
  }
}
