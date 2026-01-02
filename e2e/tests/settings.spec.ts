/**
 * Settings Page E2E Tests
 *
 * Tests for the user settings page.
 */

import { test, expect } from '../fixtures/auth';
import { test as baseTest, expect as baseExpect } from '@playwright/test';
import { SettingsPage } from '../pages';

test.describe('Settings Page', () => {
  test.describe('Authenticated User', () => {
    test('should display settings page title', async ({ page }) => {
      const settingsPage = new SettingsPage(page);
      await settingsPage.goto();
      await settingsPage.waitForReady();

      await expect(settingsPage.pageTitle).toBeVisible();
    });

    test('should display all three tabs', async ({ page }) => {
      const settingsPage = new SettingsPage(page);
      await settingsPage.goto();
      await settingsPage.waitForReady();

      await expect(settingsPage.profileTab).toBeVisible();
      await expect(settingsPage.notificationsTab).toBeVisible();
      await expect(settingsPage.accountTab).toBeVisible();
    });

    test('should show profile tab content by default', async ({ page }) => {
      const settingsPage = new SettingsPage(page);
      await settingsPage.goto();
      await settingsPage.waitForReady();

      expect(await settingsPage.isProfileTabActive()).toBe(true);
    });

    test('should display user email in profile tab', async ({ page }) => {
      const settingsPage = new SettingsPage(page);
      await settingsPage.goto();
      await settingsPage.waitForReady();

      const email = await settingsPage.getCurrentEmail();
      expect(email).toBeTruthy();
      expect(email).toContain('@');
    });

    test('should switch to notifications tab', async ({ page }) => {
      const settingsPage = new SettingsPage(page);
      await settingsPage.goto();
      await settingsPage.waitForReady();

      await settingsPage.switchToNotificationsTab();
      expect(await settingsPage.isNotificationsTabActive()).toBe(true);
    });

    test('should display theme toggle in notifications tab', async ({ page }) => {
      const settingsPage = new SettingsPage(page);
      await settingsPage.goto();
      await settingsPage.waitForReady();

      await settingsPage.switchToNotificationsTab();
      // Theme toggle should be visible somewhere on the page
      const themeSection = page.locator('text=Theme');
      await expect(themeSection).toBeVisible();
    });

    test('should switch to account tab', async ({ page }) => {
      const settingsPage = new SettingsPage(page);
      await settingsPage.goto();
      await settingsPage.waitForReady();

      await settingsPage.switchToAccountTab();
      expect(await settingsPage.isAccountTabActive()).toBe(true);
    });

    test('should display change password button in account tab', async ({ page }) => {
      const settingsPage = new SettingsPage(page);
      await settingsPage.goto();
      await settingsPage.waitForReady();

      await settingsPage.switchToAccountTab();
      await expect(settingsPage.changePasswordButton).toBeVisible();
    });

    test('should display sign out button in account tab', async ({ page }) => {
      const settingsPage = new SettingsPage(page);
      await settingsPage.goto();
      await settingsPage.waitForReady();

      await settingsPage.switchToAccountTab();
      await expect(settingsPage.signOutButton).toBeVisible();
    });

    test('should display delete account button in account tab', async ({ page }) => {
      const settingsPage = new SettingsPage(page);
      await settingsPage.goto();
      await settingsPage.waitForReady();

      await settingsPage.switchToAccountTab();
      await expect(settingsPage.deleteAccountButton).toBeVisible();
    });

    test('should display export data button in account tab', async ({ page }) => {
      const settingsPage = new SettingsPage(page);
      await settingsPage.goto();
      await settingsPage.waitForReady();

      await settingsPage.switchToAccountTab();
      await expect(settingsPage.exportDataButton).toBeVisible();
    });
  });
});

// Use base test (not auth fixture) for unauthenticated tests
baseTest.describe('Settings Page - Unauthenticated', () => {
  baseTest('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/settings');
    await baseExpect(page).toHaveURL(/\/login/);
  });
});
