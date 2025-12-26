/**
 * Dashboard Page Object
 *
 * Page object for the authenticated user dashboard.
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  // Header
  readonly welcomeMessage: Locator;
  readonly newAnalysisButton: Locator;

  // Stats cards
  readonly statsCards: Locator;
  readonly totalAnalysesCard: Locator;
  readonly averageScoreCard: Locator;
  readonly bestMatchCard: Locator;

  // Recent analyses section
  readonly recentAnalysesSection: Locator;
  readonly recentAnalysesList: Locator;
  readonly emptyState: Locator;
  readonly viewAllLink: Locator;

  // Navigation
  readonly sidebarNav: Locator;
  readonly analyzeNavItem: Locator;
  readonly historyNavItem: Locator;
  readonly settingsNavItem: Locator;
  readonly compareNavItem: Locator;

  constructor(page: Page) {
    super(page);

    // Header
    this.welcomeMessage = page.getByRole('heading', { level: 1 }).filter({ hasText: /welcome|dashboard/i });
    this.newAnalysisButton = page.getByRole('link', { name: /new analysis/i });

    // Stats cards
    this.statsCards = page.locator('[class*="grid"]').first().locator('> div');
    this.totalAnalysesCard = page.locator('text=Total Analyses').locator('..');
    this.averageScoreCard = page.locator('text=Average Score').locator('..');
    this.bestMatchCard = page.locator('text=Best Match').locator('..');

    // Recent analyses section
    this.recentAnalysesSection = page.locator('section, div').filter({ hasText: /recent analyses/i }).first();
    this.recentAnalysesList = page.getByTestId('recent-analyses-list');
    this.emptyState = page.getByTestId('empty-state');
    this.viewAllLink = page.getByRole('link', { name: /view all|see all/i });

    // Navigation
    this.sidebarNav = page.locator('nav, aside').filter({ hasText: /dashboard/i }).first();
    this.analyzeNavItem = page.getByRole('link', { name: /^analyze$|new analysis/i });
    this.historyNavItem = page.getByRole('link', { name: /history/i });
    this.settingsNavItem = page.getByRole('link', { name: /settings/i });
    this.compareNavItem = page.getByRole('link', { name: /compare/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/dashboard');
  }

  async waitForReady(): Promise<void> {
    await this.welcomeMessage.waitFor({ state: 'visible' });
  }

  /**
   * Click the New Analysis button
   */
  async clickNewAnalysis(): Promise<void> {
    await this.newAnalysisButton.click();
    await this.page.waitForURL('**/analyze');
  }

  /**
   * Get the stats from the dashboard
   */
  async getStats(): Promise<{ total: string | null; average: string | null; best: string | null }> {
    const total = await this.totalAnalysesCard.locator('[class*="text-2xl"], [class*="text-3xl"]').first().textContent();
    const average = await this.averageScoreCard.locator('[class*="text-2xl"], [class*="text-3xl"]').first().textContent();
    const best = await this.bestMatchCard.locator('[class*="text-2xl"], [class*="text-3xl"]').first().textContent();
    return { total, average, best };
  }

  /**
   * Check if empty state is shown
   */
  async isEmptyStateVisible(): Promise<boolean> {
    return this.emptyState.isVisible();
  }

  /**
   * Click View All link to navigate to history
   */
  async clickViewAll(): Promise<void> {
    await this.viewAllLink.click();
    await this.page.waitForURL('**/history');
  }

  /**
   * Navigate to Analyze page via sidebar
   */
  async navigateToAnalyze(): Promise<void> {
    await this.analyzeNavItem.click();
    await this.page.waitForURL('**/analyze');
  }

  /**
   * Navigate to History page via sidebar
   */
  async navigateToHistory(): Promise<void> {
    await this.historyNavItem.click();
    await this.page.waitForURL('**/history');
  }

  /**
   * Navigate to Settings page via sidebar
   */
  async navigateToSettings(): Promise<void> {
    await this.settingsNavItem.click();
    await this.page.waitForURL('**/settings');
  }

  /**
   * Navigate to Compare page via sidebar
   */
  async navigateToCompare(): Promise<void> {
    await this.compareNavItem.click();
    await this.page.waitForURL('**/compare');
  }

  /**
   * Get the welcome message text
   */
  async getWelcomeText(): Promise<string | null> {
    return this.welcomeMessage.textContent();
  }

  /**
   * Get count of recent analyses shown
   */
  async getRecentAnalysesCount(): Promise<number> {
    if (await this.isEmptyStateVisible()) {
      return 0;
    }
    return this.recentAnalysesList.locator('> div, > li').count();
  }
}
