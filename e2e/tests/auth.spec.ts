/**
 * Authentication E2E Tests
 *
 * Tests for user registration, login, logout, and session management.
 */

import { test, expect } from '@playwright/test';
import { LoginPage, RegisterPage, HomePage, DashboardPage } from '../pages';

// Fresh test user for registration tests
const FRESH_USER = {
  name: 'New User',
  email: `newuser-${Date.now()}@example.com`,
  password: 'NewPassword123!',
};

test.describe('Authentication', () => {
  test.describe('Registration', () => {
    test('should register a new user successfully', async ({ page }) => {
      const registerPage = new RegisterPage(page);
      await registerPage.goto();
      await registerPage.waitForReady();

      await registerPage.register(
        FRESH_USER.name,
        FRESH_USER.email,
        FRESH_USER.password
      );

      // Should redirect to dashboard after successful registration (auto-login)
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should show error for duplicate email', async ({ page }) => {
      const registerPage = new RegisterPage(page);
      await registerPage.goto();
      await registerPage.waitForReady();

      // Use the seeded test user email
      await registerPage.register(
        'Duplicate User',
        'e2e-test@example.com', // Already exists
        'AnotherPassword123!'
      );

      // Should show error message
      const errorMessage = await registerPage.getErrorMessage();
      expect(errorMessage).toBeTruthy();
      expect(errorMessage?.toLowerCase()).toContain('email');
    });

    test('should navigate to login page', async ({ page }) => {
      const registerPage = new RegisterPage(page);
      await registerPage.goto();
      await registerPage.waitForReady();

      await registerPage.goToLogin();

      await expect(page).toHaveURL(/\/login$/);
    });
  });

  test.describe('Login', () => {
    test('should login with valid credentials', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.waitForReady();

      await loginPage.loginAndWaitForRedirect(
        'e2e-test@example.com',
        'TestPassword123!'
      );

      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should show error for invalid credentials', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.waitForReady();

      await loginPage.login('invalid@example.com', 'WrongPassword123!');

      // Wait for error to appear
      await page.waitForTimeout(1000);

      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage).toBeTruthy();
    });

    test('should show error for wrong password', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.waitForReady();

      await loginPage.login('e2e-test@example.com', 'WrongPassword!');

      await page.waitForTimeout(1000);

      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage).toBeTruthy();
    });

    test('should navigate to register page', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.waitForReady();

      await loginPage.goToRegister();

      await expect(page).toHaveURL(/\/register$/);
    });
  });

  test.describe('Session Management', () => {
    test('should redirect unauthenticated users to login from dashboard', async ({ page }) => {
      // Clear any existing storage state
      await page.context().clearCookies();

      // Try to access protected page
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login$/);
    });

    test('should redirect unauthenticated users from history to login', async ({ page }) => {
      await page.context().clearCookies();

      await page.goto('/history');

      await expect(page).toHaveURL(/\/login$/);
    });

    test('should show landing page for unauthenticated users on root', async ({ page }) => {
      await page.context().clearCookies();

      await page.goto('/');

      // Should stay on landing page (not redirect to login)
      await expect(page).toHaveURL('/');
      // Landing page should have Get Started button
      await expect(page.getByRole('link', { name: /get started/i })).toBeVisible();
    });
  });

  test.describe('Logout', () => {
    test('should logout successfully', async ({ page }) => {
      const loginPage = new LoginPage(page);
      const dashboardPage = new DashboardPage(page);

      // Login first
      await loginPage.goto();
      await loginPage.loginAndWaitForRedirect(
        'e2e-test@example.com',
        'TestPassword123!'
      );

      // Verify we're on dashboard
      await expect(page).toHaveURL(/\/dashboard/);

      // Logout via user menu
      await dashboardPage.signOut();

      // Should be on login page
      await expect(page).toHaveURL(/\/login$/);
    });

    test('should not access protected pages after logout', async ({ page }) => {
      const loginPage = new LoginPage(page);
      const dashboardPage = new DashboardPage(page);

      // Login first
      await loginPage.goto();
      await loginPage.loginAndWaitForRedirect(
        'e2e-test@example.com',
        'TestPassword123!'
      );

      // Logout
      await dashboardPage.signOut();

      // Try to access dashboard
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login$/);
    });
  });
});
