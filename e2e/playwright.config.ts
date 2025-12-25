import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never', outputFolder: './playwright-report' }],
    ['list'],
  ],
  timeout: 60000,

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Main test project
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Start both frontend and backend before tests
  webServer: [
    {
      command: 'cd apps/api && bun run dev',
      cwd: '..',
      url: 'http://localhost:3001/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: {
        DATABASE_URL: process.env.E2E_DATABASE_URL || 'postgresql://e2e:e2e@localhost:5432/jobmatch_e2e',
        BETTER_AUTH_SECRET: 'e2e-test-secret-at-least-32-characters-long-here',
        BETTER_AUTH_URL: 'http://localhost:3001',
        OPENROUTER_API_KEY: 'mock-key-for-e2e-tests',
        FRONTEND_URL: 'http://localhost:3000',
        PORT: '3001',
      },
    },
    {
      command: 'cd apps/web && bun run dev',
      cwd: '..',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: {
        NEXT_PUBLIC_API_URL: 'http://localhost:3001',
      },
    },
  ],

  globalSetup: './global-setup.ts',
  globalTeardown: './global-teardown.ts',
});
