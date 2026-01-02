/**
 * Navigation E2E Tests
 *
 * Tests for navigation between pages, sidebar, and bottom nav.
 */

import { test, expect } from '../fixtures/auth';
import { test as baseTest, expect as baseExpect } from '@playwright/test';
import { DashboardPage, ComparePage, LandingPage } from '../pages';

test.describe('Navigation', () => {
  test.describe('Authenticated - Sidebar Navigation', () => {
    test('should navigate through all main pages via sidebar', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.goto();
      await dashboardPage.waitForReady();

      // Dashboard -> Analyze
      await dashboardPage.navigateToAnalyze();
      await expect(page).toHaveURL(/\/analyze/);

      // Analyze -> History
      await page.getByRole('link', { name: /history/i }).click();
      await expect(page).toHaveURL(/\/history/);

      // History -> Compare
      await page.getByRole('link', { name: /compare/i }).click();
      await expect(page).toHaveURL(/\/compare/);

      // Compare -> Settings
      await page.getByRole('link', { name: /settings/i }).click();
      await expect(page).toHaveURL(/\/settings/);

      // Settings -> Dashboard
      await page.getByRole('link', { name: /dashboard/i }).click();
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });

  test.describe('Compare Page', () => {
    test('should display coming soon message', async ({ page }) => {
      const comparePage = new ComparePage(page);
      await comparePage.goto();
      await comparePage.waitForReady();

      expect(await comparePage.isComingSoonVisible()).toBe(true);
    });

    test('should display page title', async ({ page }) => {
      const comparePage = new ComparePage(page);
      await comparePage.goto();
      await comparePage.waitForReady();

      const title = await comparePage.getPageTitle();
      expect(title?.toLowerCase()).toContain('compare');
    });

    test('should have link to create new analysis', async ({ page }) => {
      const comparePage = new ComparePage(page);
      await comparePage.goto();
      await comparePage.waitForReady();

      await expect(comparePage.createAnalysisLink).toBeVisible();
    });

    test('should navigate to analyze from compare page', async ({ page }) => {
      const comparePage = new ComparePage(page);
      await comparePage.goto();
      await comparePage.waitForReady();

      await comparePage.clickCreateAnalysis();
      await expect(page).toHaveURL(/\/analyze/);
    });

    test('should have link to view history', async ({ page }) => {
      const comparePage = new ComparePage(page);
      await comparePage.goto();
      await comparePage.waitForReady();

      await expect(comparePage.viewHistoryLink).toBeVisible();
    });

    test('should navigate to history from compare page', async ({ page }) => {
      const comparePage = new ComparePage(page);
      await comparePage.goto();
      await comparePage.waitForReady();

      await comparePage.clickViewHistory();
      await expect(page).toHaveURL(/\/history/);
    });
  });

  test.describe('User Menu Navigation', () => {
    test('should show user menu on authenticated pages', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      const userMenu = page.getByTestId('user-menu');
      await expect(userMenu).toBeVisible();
    });

    test('should open user menu dropdown', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      const userMenuButton = page.getByTestId('user-menu-button');
      await userMenuButton.click();

      const signOutButton = page.getByTestId('sign-out-button');
      await expect(signOutButton).toBeVisible();
    });

    test('should navigate to history from user menu', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      const userMenuButton = page.getByTestId('user-menu-button');
      await userMenuButton.click();

      const historyLink = page.getByRole('link', { name: /history/i });
      await historyLink.click();
      await expect(page).toHaveURL(/\/history/);
    });

    test('should navigate to settings from user menu', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      const userMenuButton = page.getByTestId('user-menu-button');
      await userMenuButton.click();

      const settingsLink = page.getByRole('link', { name: /settings/i });
      await settingsLink.click();
      await expect(page).toHaveURL(/\/settings/);
    });
  });
});

// Use base test (not auth fixture) for unauthenticated tests
baseTest.describe('Navigation - Unauthenticated', () => {
  baseTest('should show landing page for root URL', async ({ page }) => {
    const landingPage = new LandingPage(page);
    await landingPage.goto();

    // Should show landing page elements
    baseExpect(await landingPage.isHeroVisible()).toBe(true);
    await baseExpect(landingPage.getStartedButton).toBeVisible();
  });

  baseTest('should redirect protected routes to login', async ({ page }) => {
    const protectedRoutes = ['/dashboard', '/analyze', '/history', '/settings', '/compare'];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await baseExpect(page).toHaveURL(/\/login/);
    }
  });
});

// Use auth fixture for mobile tests (still needs authentication)
test.describe('Navigation - Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone X viewport

  test('should show bottom navigation on mobile', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Bottom nav should be visible on mobile
    const bottomNav = page.locator('nav').filter({ has: page.getByRole('link', { name: /dashboard/i }) }).last();
    await expect(bottomNav).toBeVisible();
  });
});
