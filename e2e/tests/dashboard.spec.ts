/**
 * Dashboard E2E Tests
 *
 * Tests for the authenticated user dashboard.
 */

import { test, expect } from '../fixtures/auth';
import { test as baseTest, expect as baseExpect } from '@playwright/test';
import { DashboardPage } from '../pages';

test.describe('Dashboard', () => {
  test.describe('Authenticated User', () => {
    test('should display welcome message', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.goto();
      await dashboardPage.waitForReady();

      const welcomeText = await dashboardPage.getWelcomeText();
      expect(welcomeText?.toLowerCase()).toMatch(/welcome|dashboard/);
    });

    test('should display New Analysis button', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.goto();
      await dashboardPage.waitForReady();

      await expect(dashboardPage.newAnalysisButton).toBeVisible();
    });

    test('should navigate to analyze page when clicking New Analysis', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.goto();
      await dashboardPage.waitForReady();

      await dashboardPage.clickNewAnalysis();
      await expect(page).toHaveURL(/\/analyze/);
    });

    test('should display stats cards or empty state', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.goto();
      await dashboardPage.waitForReady();

      // Either stats are shown or empty state
      const statsVisible = await dashboardPage.totalAnalysesCard.isVisible().catch(() => false);
      const emptyVisible = await dashboardPage.isEmptyStateVisible().catch(() => false);

      expect(statsVisible || emptyVisible).toBe(true);
    });

    test('should navigate to history via sidebar', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.goto();
      await dashboardPage.waitForReady();

      await dashboardPage.navigateToHistory();
      await expect(page).toHaveURL(/\/history/);
    });

    test('should navigate to settings via sidebar', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.goto();
      await dashboardPage.waitForReady();

      await dashboardPage.navigateToSettings();
      await expect(page).toHaveURL(/\/settings/);
    });

    test('should navigate to analyze via sidebar', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.goto();
      await dashboardPage.waitForReady();

      await dashboardPage.navigateToAnalyze();
      await expect(page).toHaveURL(/\/analyze/);
    });

    test('should navigate to compare via sidebar', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.goto();
      await dashboardPage.waitForReady();

      await dashboardPage.navigateToCompare();
      await expect(page).toHaveURL(/\/compare/);
    });
  });
});

// Use base test (not auth fixture) for unauthenticated tests
baseTest.describe('Dashboard - Unauthenticated', () => {
  baseTest('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await baseExpect(page).toHaveURL(/\/login/);
  });
});
