/**
 * History E2E Tests
 *
 * Tests for analysis history listing, viewing details, and deletion.
 */

import { test, expect } from '../fixtures/auth';
import { HistoryPage, HomePage } from '../pages';
import { mockOpenRouterAPI } from '../utils/api-mock';

// Sample job description for creating analysis
const JOB_DESCRIPTION = `
We are looking for a Senior Software Engineer to join our team.

Requirements:
- 5+ years of experience with TypeScript and React
- Strong understanding of modern JavaScript frameworks
- Experience with Node.js and RESTful APIs
- Excellent problem-solving skills
- Bachelor's degree in Computer Science or related field
`;

test.describe('Analysis History', () => {
  test.describe('Empty State', () => {
    test('should show empty state when no history', async ({ page }) => {
      const historyPage = new HistoryPage(page);
      await historyPage.goto();
      await historyPage.waitForReady();

      // If empty, should show empty state
      const isEmpty = await historyPage.isEmpty();
      if (isEmpty) {
        await expect(historyPage.emptyState).toBeVisible();
        await expect(historyPage.emptyState).toContainText('No analyses yet');
      }
    });

    test('should navigate to new analysis from empty state', async ({ page }) => {
      const historyPage = new HistoryPage(page);
      await historyPage.goto();
      await historyPage.waitForReady();

      const isEmpty = await historyPage.isEmpty();
      if (isEmpty) {
        await historyPage.startFirstAnalysis();
        await expect(page).toHaveURL('/');
      }
    });
  });

  test.describe('List Display', () => {
    test.beforeEach(async ({ page }) => {
      // Mock API and create an analysis first
      await mockOpenRouterAPI(page);

      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.waitForReady();
      await homePage.startAnalysis(JOB_DESCRIPTION);
      await homePage.waitForResult();
    });

    test('should display analysis items in history', async ({ page }) => {
      const historyPage = new HistoryPage(page);
      await historyPage.goto();
      await historyPage.waitForReady();

      const itemCount = await historyPage.getItemCount();
      expect(itemCount).toBeGreaterThan(0);
    });

    test('should show score badge on each item', async ({ page }) => {
      const historyPage = new HistoryPage(page);
      await historyPage.goto();
      await historyPage.waitForReady();

      const scoreBadge = historyPage.getScoreBadge(0);
      await expect(scoreBadge).toBeVisible();

      const scoreText = await scoreBadge.textContent();
      expect(scoreText).toMatch(/\d+%/);
    });
  });

  test.describe('Detail View', () => {
    test.beforeEach(async ({ page }) => {
      await mockOpenRouterAPI(page);

      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.waitForReady();
      await homePage.startAnalysis(JOB_DESCRIPTION);
      await homePage.waitForResult();
    });

    test('should show details when item selected', async ({ page }) => {
      const historyPage = new HistoryPage(page);
      await historyPage.goto();
      await historyPage.waitForReady();

      await historyPage.selectItem(0);

      await expect(historyPage.detailPanel).toBeVisible();
    });

    test('should display score in detail panel', async ({ page }) => {
      const historyPage = new HistoryPage(page);
      await historyPage.goto();
      await historyPage.waitForReady();

      await historyPage.selectItem(0);

      const score = await historyPage.getDetailScore();
      expect(score).toMatch(/\d+% Match/);
    });

    test('should display key findings in detail panel', async ({ page }) => {
      const historyPage = new HistoryPage(page);
      await historyPage.goto();
      await historyPage.waitForReady();

      await historyPage.selectItem(0);

      // Check sections exist
      const strengthsSection = historyPage.getDetailStrengths();
      await expect(strengthsSection).toBeVisible();
    });
  });

  test.describe('Deletion', () => {
    test.beforeEach(async ({ page }) => {
      await mockOpenRouterAPI(page);

      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.waitForReady();
      await homePage.startAnalysis(JOB_DESCRIPTION);
      await homePage.waitForResult();
    });

    test('should delete analysis from history', async ({ page }) => {
      const historyPage = new HistoryPage(page);
      await historyPage.goto();
      await historyPage.waitForReady();

      const initialCount = await historyPage.getItemCount();
      expect(initialCount).toBeGreaterThan(0);

      await historyPage.deleteItem(0);

      // Either count decreased or empty state shown
      const newCount = await historyPage.getItemCount();
      const isEmpty = await historyPage.isEmpty();

      expect(newCount === initialCount - 1 || isEmpty).toBeTruthy();
    });

    test('should clear detail panel when selected item deleted', async ({ page }) => {
      const historyPage = new HistoryPage(page);
      await historyPage.goto();
      await historyPage.waitForReady();

      // Select first item
      await historyPage.selectItem(0);
      await expect(historyPage.detailPanel).toBeVisible();

      // Delete the selected item
      await historyPage.deleteItem(0);

      // Detail panel should be hidden or show placeholder
      const isEmpty = await historyPage.isEmpty();
      if (!isEmpty) {
        await expect(historyPage.detailPanel).not.toBeVisible();
      }
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to new analysis', async ({ page }) => {
      const historyPage = new HistoryPage(page);
      await historyPage.goto();
      await historyPage.waitForReady();

      await historyPage.goToNewAnalysis();

      await expect(page).toHaveURL('/');
    });
  });
});
