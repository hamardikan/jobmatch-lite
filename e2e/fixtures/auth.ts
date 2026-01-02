/**
 * Auth Fixtures
 *
 * Test fixtures for authenticated sessions.
 * Performs login on-demand to avoid globalSetup timing issues.
 */

import { test as base, Page } from '@playwright/test';

// Test user credentials (same as global-setup.ts)
export const TEST_USER = {
  name: 'Test User',
  email: 'e2e-test@example.com',
  password: 'TestPassword123!',
};

/**
 * Login helper function
 */
async function performLogin(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 15000 });
}

/**
 * Extended test with authenticated user context
 * Automatically logs in before each test
 */
export const test = base.extend<{ authenticatedPage: Page }>({
  page: async ({ page }, use) => {
    // Login before the test
    await performLogin(page, TEST_USER.email, TEST_USER.password);
    // Provide the authenticated page to the test
    await use(page);
  },
});

export { expect } from '@playwright/test';
